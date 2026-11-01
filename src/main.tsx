import { animalsIn, getAnimal, loadArt } from './registry/animals';
import { DEFAULT_THEME, hasTheme, loadScene } from './registry/themes';
import { loadPrefs, loadScene as loadSaved } from './store/persist';

const theme = loadPrefs(hasTheme).themeId ?? DEFAULT_THEME;
const art = new Set(['lion', ...animalsIn(theme).map((a) => a.id)]);
for (const s of loadSaved(theme, (id) => !!getAnimal(id)) ?? []) art.add(s.animalId);

void Promise.all([loadScene(theme), loadArt(art)])
  .catch(() => undefined)
  .finally(() => import('./boot'));
