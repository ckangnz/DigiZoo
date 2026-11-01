import { DEFAULT_THEME, hasTheme, loadScene } from './registry/themes';
import { loadPrefs } from './store/persist';

void loadScene(loadPrefs(hasTheme).themeId ?? DEFAULT_THEME)
  .catch(() => undefined)
  .finally(() => import('./boot'));
