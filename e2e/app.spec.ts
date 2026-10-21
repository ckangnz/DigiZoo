import { expect, test, type Page } from '@playwright/test';

interface StickerState {
  id: string;
  animalId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
}

interface DebugHandle {
  useStore: {
    getState: () => {
      stickers: StickerState[];
      selectedId: string | null;
      walkingId: string | null;
      night: boolean;
      themeId: string;
    };
  };
  useCamera: { getState: () => { t: { s: number } } };
  centerOn: (x: number, y: number) => void;
}

declare global {
  interface Window {
    __digizoo: DebugHandle;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    Object.assign(window, { __DIGIZOO_SILENT__: true, __spoken: spoken });
    if ('speechSynthesis' in window)
      speechSynthesis.speak = (u: SpeechSynthesisUtterance) => {
        if (u.text.trim()) spoken.push(u.text);
      };
  });
});

const state = (page: Page) => page.evaluate(() => window.__digizoo.useStore.getState());
const cameraScale = (page: Page) => page.evaluate(() => window.__digizoo.useCamera.getState().t.s);

async function openWorld(page: Page, name = 'Safari') {
  await page.goto('/?debug');
  await page.locator('.world-card', { hasText: name }).click();
  await expect(page.locator('.picker')).toHaveCount(0);
  await expect(page.locator('[data-sticker]').first()).toBeVisible();
}

async function stickerCenter(page: Page, id: string) {
  const box = await page.locator(`[data-sticker="${id}"]`).boundingBox();
  if (!box) throw new Error(`sticker ${id} not visible`);
  return { x: box.x + box.width / 2, y: box.y + box.height * 0.55 };
}

async function tapAt(page: Page, x: number, y: number) {
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  if (touch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function selectAnimal(page: Page, animalId: string): Promise<string> {
  const st = (await state(page)).stickers.find((s) => s.animalId === animalId);
  if (!st) throw new Error(`no ${animalId} on the map`);
  const p = await stickerCenter(page, st.id);
  await tapAt(page, p.x, p.y);
  await expect.poll(async () => (await state(page)).selectedId).toBe(st.id);
  await expect(page.locator('.toolbar')).toBeVisible();
  return st.id;
}

const tool = (page: Page, label: string) => page.locator(`.toolbar [aria-label="${label}"]`);

test('first launch shows the world picker, then opens a world with starter animals', async ({
  page,
}) => {
  await page.goto('/?debug');
  await expect(page.locator('.picker')).toBeVisible();
  await expect(page.locator('.world-card')).toHaveCount(11);
  await page.locator('.world-card', { hasText: 'Farm' }).click();
  const s = await state(page);
  expect(s.themeId).toBe('farm');
  expect(s.stickers.length).toBeGreaterThan(5);
  await expect(page.locator('[data-sticker]')).toHaveCount(s.stickers.length);
});

test('selecting a sticker shows every action', async ({ page }) => {
  await openWorld(page);
  await selectAnimal(page, 'lion');
  for (const label of [
    'Play sound',
    'Walk',
    'Flip',
    'Duplicate',
    'Bring forward',
    'Send backward',
    'Delete',
  ]) {
    await expect(tool(page, label)).toBeVisible();
  }
});

test('dragging a sticker moves it and the position survives a reload', async ({ page }) => {
  await openWorld(page);
  const id = await selectAnimal(page, 'lion');
  const before = (await state(page)).stickers.find((s) => s.id === id)!;
  const p = await stickerCenter(page, id);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(p.x + i * 12, p.y - i * 4);
  await page.mouse.up();
  const after = (await state(page)).stickers.find((s) => s.id === id)!;
  expect(after.x).toBeGreaterThan(before.x + 40);
  expect(after.y).toBeLessThan(before.y - 10);
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.locator('.picker')).toHaveCount(0);
  const reloaded = (await state(page)).stickers.find((s) => s.id === id)!;
  expect(reloaded.x).toBeCloseTo(after.x, 0);
  expect(reloaded.y).toBeCloseTo(after.y, 0);
});

test('only one animal walks at a time', async ({ page }) => {
  await openWorld(page);
  const lion = await selectAnimal(page, 'lion');
  const startX = (await state(page)).stickers.find((s) => s.id === lion)!.x;
  await tool(page, 'Walk').dispatchEvent('click');
  await expect.poll(async () => (await state(page)).walkingId).toBe(lion);
  await expect(page.locator('.walker')).toHaveCount(1);
  await expect
    .poll(async () => Math.abs((await state(page)).stickers.find((s) => s.id === lion)!.x - startX))
    .toBeGreaterThan(20);
  await page.locator('[data-sticker]').first().waitFor();
  const zebra = await selectAnimal(page, 'zebra');
  await tool(page, 'Walk').dispatchEvent('click');
  await expect.poll(async () => (await state(page)).walkingId).toBe(zebra);
  await expect(page.locator('.walker')).toHaveCount(1);
  await expect(page.locator(`[data-sticker="${lion}"] .walker`)).toHaveCount(0);
  await tool(page, 'Stop walking').dispatchEvent('click');
  await expect.poll(async () => (await state(page)).walkingId).toBeNull();
  await expect(page.locator('.walker')).toHaveCount(0);
});

test('a walking animal turns around and stays on screen', async ({ page }) => {
  test.slow();
  await openWorld(page);
  const lion = await selectAnimal(page, 'lion');
  await tool(page, 'Walk').dispatchEvent('click');
  const xs: number[] = [];
  const flips = new Set<boolean>();
  const viewport = page.viewportSize()!;
  const deadline = Date.now() + 25_000;
  while ((flips.size < 2 || xs.length < 8) && Date.now() < deadline) {
    await page.waitForTimeout(400);
    const st = (await state(page)).stickers.find((s) => s.id === lion)!;
    xs.push(st.x);
    flips.add(st.flipX);
    const box = (await page.locator(`[data-sticker="${lion}"]`).boundingBox())!;
    const centre = box.x + box.width / 2;
    expect(centre).toBeGreaterThan(0);
    expect(centre).toBeLessThan(viewport.width);
  }
  expect(flips.size).toBe(2);
  expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(30);
});

test('flip, duplicate, reorder, delete and undo', async ({ page }) => {
  await openWorld(page);
  const id = await selectAnimal(page, 'hippo');
  const count = (await state(page)).stickers.length;
  const initial = (await state(page)).stickers.find((s) => s.id === id)!;

  await tool(page, 'Flip').dispatchEvent('click');
  const flipped = (await state(page)).stickers.find((s) => s.id === id)!;
  expect(flipped.flipX).toBe(!initial.flipX);

  await tool(page, 'Duplicate').dispatchEvent('click');
  expect((await state(page)).stickers.length).toBe(count + 1);
  const copyId = (await state(page)).selectedId!;
  expect(copyId).not.toBe(id);

  const order = () => state(page).then((s) => s.stickers.map((x) => x.id));
  const beforeIndex = (await order()).indexOf(copyId);
  await tool(page, 'Send backward').dispatchEvent('click');
  expect((await order()).indexOf(copyId)).toBe(beforeIndex - 1);
  await tool(page, 'Bring forward').dispatchEvent('click');
  expect((await order()).indexOf(copyId)).toBe(beforeIndex);

  await tool(page, 'Delete').dispatchEvent('click');
  expect((await state(page)).stickers.length).toBe(count);
  await expect(page.locator('.toolbar')).toHaveCount(0);

  await page.locator('[aria-label="Undo"]').click();
  expect((await state(page)).stickers.length).toBe(count + 1);
});

test('start over needs a press-and-hold, then empties or restores the map', async ({ page }) => {
  await openWorld(page);
  const starters = (await state(page)).stickers.length;
  await page.locator('[aria-label="Start over"]').click();
  const empty = page.locator('.hold', { hasText: 'Empty map' });
  await empty.click();
  expect((await state(page)).stickers.length).toBe(starters);
  const box = (await empty.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1400);
  await page.mouse.up();
  await expect(page.locator('.dialog')).toHaveCount(0);
  expect((await state(page)).stickers.length).toBe(0);

  await page.locator('[aria-label="Start over"]').click();
  const starter = page.locator('.hold', { hasText: 'Starter set' });
  const sb = (await starter.boundingBox())!;
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1400);
  await page.mouse.up();
  expect((await state(page)).stickers.length).toBe(starters);
});

test('day and night toggle is remembered', async ({ page }) => {
  await openWorld(page);
  await page.locator('.daynight').click();
  expect((await state(page)).night).toBe(true);
  await expect(page.locator('.scene-night.on').first()).toBeAttached();
  await page.reload();
  expect((await state(page)).night).toBe(true);
});

test('zoom buttons zoom in, out and back to the whole map', async ({ page }) => {
  await openWorld(page);
  const base = await cameraScale(page);
  await page.locator('[aria-label="Zoom in"]').click();
  await expect.poll(() => cameraScale(page)).toBeGreaterThan(base * 1.3);
  await page.locator('[aria-label="Zoom out"]').click();
  await expect.poll(() => cameraScale(page)).toBeLessThan(base * 1.2);
  await page.locator('[aria-label="Zoom in"]').click();
  await page.locator('[aria-label="Show whole map"]').click();
  await expect.poll(() => cameraScale(page)).toBeCloseTo(base, 3);
});

test('the side panel searches and adds stickers in every style', async ({ page }) => {
  await openWorld(page);
  const count = (await state(page)).stickers.length;
  await page.locator('.fab').click({ force: true });
  await expect(page.locator('.panel.open')).toBeVisible();
  await page.locator('.search input').fill('penguin-that-does-not-exist');
  await expect(page.locator('.empty')).toBeVisible();
  await page.locator('.search input').fill('octopus');
  const row = page.locator('.animal-row', { hasText: 'Octopus' });
  await expect(row).toBeVisible();
  await expect(row.locator('.tile')).toHaveCount(3);
  await row.locator('.tile', { hasText: 'Painted' }).click();
  await expect.poll(async () => (await state(page)).stickers.length).toBe(count + 1);
  const added = (await state(page)).stickers.at(-1)!;
  expect(added.animalId).toBe('octopus');
});

test.describe('multi-touch', () => {
  test.use({ hasTouch: true });

  test('pinch zooms the map and pinch-rotates a sticker', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'needs CDP touch events');
    await openWorld(page);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: string, pts: [number, number][]) =>
      cdp.send('Input.dispatchTouchEvent', {
        type: type as 'touchStart',
        touchPoints: pts.map(([x, y], id) => ({ x, y, id })),
      });
    const pinch = async (
      a0: [number, number],
      b0: [number, number],
      a1: [number, number],
      b1: [number, number],
    ) => {
      await touch('touchStart', [a0]);
      await touch('touchStart', [a0, b0]);
      for (let i = 1; i <= 12; i++) {
        const k = i / 12;
        await touch('touchMove', [
          [a0[0] + (a1[0] - a0[0]) * k, a0[1] + (a1[1] - a0[1]) * k],
          [b0[0] + (b1[0] - b0[0]) * k, b0[1] + (b1[1] - b0[1]) * k],
        ]);
      }
      await touch('touchEnd', [a1]);
      await touch('touchEnd', []);
    };

    const base = await cameraScale(page);
    await pinch([500, 700], [700, 700], [400, 700], [800, 700]);
    await expect.poll(() => cameraScale(page)).toBeGreaterThan(base * 1.6);

    await page.locator('[aria-label="Show whole map"]').click();
    await expect.poll(() => cameraScale(page)).toBeCloseTo(base, 3);
    const lion = (await state(page)).stickers.find((s) => s.animalId === 'lion')!;
    const p = await stickerCenter(page, lion.id);
    await pinch([p.x - 20, p.y], [p.x + 20, p.y], [p.x - 40, p.y - 25], [p.x + 40, p.y + 25]);
    const after = (await state(page)).stickers.find((s) => s.id === lion.id)!;
    expect(after.scale).toBeGreaterThan(1.6);
    expect(Math.abs(after.rotation)).toBeGreaterThan(15);
  });
});

test('feeding makes meat-eaters happy with meat and sad with carrots', async ({ page }) => {
  await openWorld(page);
  await selectAnimal(page, 'lion');
  await tool(page, 'Feed').dispatchEvent('click');
  await expect(page.locator('.food-tray')).toBeVisible();
  await page.locator('.food-btn[aria-label="Feed Meat"]').dispatchEvent('click');
  await expect(page.locator('.fx-feed.happy')).toHaveCount(1);
  await expect(page.locator('.sticker-body.anim-happy')).toHaveCount(1);
  await expect(page.locator('.food-tray')).toHaveCount(0);
  await expect(page.locator('.toolbar.resting')).toHaveCount(1);
  await page.waitForTimeout(2600);
  await expect(page.locator('.toolbar.resting')).toHaveCount(0);
  await tool(page, 'Feed').dispatchEvent('click');
  await page.locator('.food-btn[aria-label="Feed Carrot"]').dispatchEvent('click');
  await expect(page.locator('.fx-feed.sad')).toHaveCount(1);
  await expect(page.locator('.sticker-body.anim-sad')).toHaveCount(1);
});

test('planets have no feed button and move instead of walking', async ({ page }) => {
  await openWorld(page, 'Space');
  const jupiter = await selectAnimal(page, 'jupiter');
  await expect(tool(page, 'Feed')).toHaveCount(0);
  await tool(page, 'Move').dispatchEvent('click');
  await expect.poll(async () => (await state(page)).walkingId).toBe(jupiter);
});

test('tapping the sun makes it react', async ({ page }) => {
  await openWorld(page);
  const sun = page.locator('[data-interactive="sun"]');
  await expect(sun).toHaveCount(1);
  await page.evaluate(() => window.__digizoo.centerOn(2950, 320));
  await page.waitForTimeout(500);
  const box = (await sun.boundingBox())!;
  await tapAt(page, box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('[data-interactive="sun"].act')).toHaveCount(1);
});

test('switching to Korean translates the app and remembers it', async ({ page }) => {
  await openWorld(page);
  await page.locator('[aria-label="Settings"]').click();
  await page.locator('.toggle-row', { hasText: 'Language' }).click();
  await page.locator('.lang-btn', { hasText: '한국어' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.locator('.theme-pill span')).not.toHaveText('Safari');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

test('the info button tells you about the sticker', async ({ page }) => {
  await openWorld(page);
  await selectAnimal(page, 'lion');
  await tool(page, 'About Lion').dispatchEvent('click');
  const card = page.locator('.info-card');
  await expect(card).toBeVisible();
  await expect(card.locator('h2')).toHaveText('Lion');
  await expect(card.locator('.info-facts li')).toHaveCount(3);
  await expect(card.locator('.info-food')).toContainText('Meat');
  await card.locator('.dialog-close').click();
  await expect(card).toHaveCount(0);
});

test('the matching game can be played to the end', async ({ page }) => {
  await openWorld(page);
  await page.locator('[aria-label="Matching game"]').click();
  await expect(page.locator('.game')).toBeVisible();
  await page.locator('.seg button', { hasText: '3 × 3' }).click();
  await expect(page.locator('.card')).toHaveCount(9);
  await expect(page.locator('.card.card-star')).toHaveCount(1);
  const ids = await page
    .locator('.card[data-card]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-card')!));
  const pairs = new Map<string, number[]>();
  ids.forEach((id, i) => pairs.set(id, [...(pairs.get(id) ?? []), i]));
  expect([...pairs.values()].every((p) => p.length === 2)).toBe(true);
  for (const [a, b] of pairs.values()) {
    await page.locator('.card[data-card]').nth(a).click();
    await page.locator('.card[data-card]').nth(b).click();
  }
  await expect(page.locator('.card.matched')).toHaveCount(8);
  await expect(page.locator('.game-win')).toBeVisible();
  await expect(page.locator('.game-win')).toContainText('4 moves');
  await page.locator('.game-win button', { hasText: 'Back to the map' }).click();
  await expect(page.locator('.game')).toHaveCount(0);
});

test('names are still spoken when sounds are off', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'needs speechSynthesis');
  await openWorld(page);
  await page.locator('[aria-label="Settings"]').click();
  await page.locator('.toggle-row', { hasText: 'Sounds' }).click();
  await page.locator('[aria-label="Settings"]').click();
  await selectAnimal(page, 'lion');
  await tool(page, 'Play sound').dispatchEvent('click');
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken))
    .toContain('Lion');
});

test('the install guide shows steps for this device', async ({ page }) => {
  await page.goto('/?debug');
  await page.locator('.picker-install').click();
  const card = page.locator('.install-card');
  await expect(card).toBeVisible();
  await expect(card.locator('.install-tabs button.on')).toHaveCount(1);
  expect(await card.locator('.install-steps li').count()).toBeGreaterThanOrEqual(2);
  await card.locator('.install-tabs button', { hasText: 'Android' }).click();
  await expect(card.locator('.install-steps li').nth(1)).toContainText('⋮');
  await card.locator('.dialog-close').click();
  await expect(card).toHaveCount(0);
});
