import { THEMES, loadScene } from './registry/themes';

await Promise.all(THEMES.map((t) => loadScene(t.id)));
