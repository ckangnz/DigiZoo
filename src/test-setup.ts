import { ANIMALS, loadArt } from './registry/animals';
import { THEMES, loadScene } from './registry/themes';

await Promise.all([...THEMES.map((t) => loadScene(t.id)), loadArt(ANIMALS.map((a) => a.id))]);
