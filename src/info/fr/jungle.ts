import type { InfoPack } from '../types';

const info: InfoPack = {
  tiger: {
    about:
      'Le tigre est le plus grand félin du monde. Son pelage orange à rayures foncées l’aide à se cacher parmi les arbres et les hautes herbes.',
    facts: [
      'Contrairement à beaucoup de félins, les tigres adorent l’eau et sont d’excellents nageurs.',
      'Les tigres ont une tache blanche à l’arrière de chaque oreille.',
      'Les petits tigres restent avec leur maman pendant environ deux ans, le temps d’apprendre à se débrouiller tout seuls.',
    ],
  },
  monkey: {
    about:
      'Les singes sont des animaux malins et joueurs qui adorent grimper et sauter d’arbre en arbre. Il en existe de toutes sortes, et beaucoup vivent dans des forêts chaudes et feuillues.',
    facts: [
      'Certains singes peuvent se suspendre aux branches par la queue, comme s’ils avaient une main en plus.',
      'Les singes se nettoient le pelage les uns les autres, pour rester propres et pour montrer qu’ils sont amis.',
      'La plupart des singes ont une queue, mais les grands singes, comme les gorilles et les chimpanzés, n’en ont pas.',
    ],
  },
  snake: {
    about:
      'Les serpents sont de longs reptiles couverts d’écailles, sans pattes. Ils glissent sur le sol en ondulant leur corps souple.',
    facts: [
      'Pour sentir les odeurs dans l’air, le serpent sort et rentre sa langue fourchue.',
      'En grandissant, le serpent se tortille pour sortir de sa vieille peau, souvent d’un seul morceau.',
      'Les serpents ne peuvent pas cligner des yeux, car ils n’ont pas de paupières\u00a0: ils dorment même les yeux ouverts.',
    ],
  },
  parrot: {
    about:
      'Les perroquets sont des oiseaux malins et colorés, au bec solide et crochu. Beaucoup vivent en bandes bruyantes dans les forêts chaudes du monde entier.',
    facts: [
      'Certains perroquets peuvent apprendre à imiter des mots et des bruits de tous les jours, comme un sifflement ou une sonnette.',
      'Beaucoup de perroquets tiennent leur nourriture dans une patte, comme toi tu tiens ton goûter dans ta main.',
      'Les grands perroquets, comme les aras, peuvent vivre plus de 50 ans.',
    ],
  },
  peacock: {
    about:
      'Le paon mâle porte de longues plumes bleues et vertes qui scintillent. Pour se faire admirer, il les déploie comme un immense éventail.',
    facts: [
      'La femelle du paon s’appelle la paonne, et ses bébés, les paonneaux.',
      'Les paons savent voler, et la nuit, ils dorment tout en haut des arbres.',
      'Le paon est l’oiseau national de l’Inde.',
    ],
  },
  crocodile: {
    about:
      'Le crocodile est un grand reptile à la peau bosselée couverte d’écailles, avec une longue queue puissante. Il aime s’allonger au soleil sur les berges des rivières pour se réchauffer.',
    facts: [
      'La maman crocodile porte délicatement ses bébés jusqu’à l’eau dans sa gueule.',
      'Quand un crocodile perd une dent, une nouvelle repousse à sa place, encore et encore.',
      'Les crocodiles ont des cousins très anciens qui vivaient en même temps que les dinosaures.',
    ],
  },
  orangutan: {
    about:
      'L’orang-outan est un grand singe aux longs poils orange et ébouriffés. Il passe presque toute sa vie tout en haut des arbres des forêts tropicales d’Asie.',
    facts: [
      'Quand il pleut, les orangs-outans tiennent parfois de grandes feuilles au-dessus de leur tête, comme des parapluies.',
      'En malais, le mot orang-outan veut dire homme de la forêt.',
      'Chaque soir, l’orang-outan se construit un nouveau nid de feuilles pour dormir, tout en haut des arbres.',
    ],
  },
  tapir: {
    about:
      'Le tapir est un animal paisible au nez court et souple, comme une petite trompe. Le tapir de Malaisie a l’air de porter une couverture blanche sur le dos.',
    facts: [
      'Les bébés tapirs sont couverts de rayures et de taches\u00a0: on dirait de petites pastèques sur pattes\u00a0!',
      'Les tapirs sont des cousins des chevaux et des rhinocéros, même s’ils ressemblent un peu à des cochons.',
      'Quand il nage, le tapir peut se servir de son nez souple comme d’un tuba.',
    ],
  },
  hornbill: {
    about:
      'Le calao est un oiseau au bec énorme et recourbé. Le calao bicorne porte aussi, sur le dessus du bec, un casque jaune vif.',
    facts: [
      'La maman calao s’enferme dans son nid, au creux d’un arbre, en murant l’entrée, et le papa lui passe à manger par une toute petite fente.',
      'Les calaos ont de longs cils, ce qui est très rare chez les oiseaux.',
      'Les calaos aident de nouveaux arbres à pousser en semant les graines des fruits qu’ils mangent.',
    ],
  },
  pangolin: {
    about:
      'Le pangolin est un animal timide couvert d’écailles dures, comme une pomme de pin qui marche. Pour se protéger, il peut se rouler en boule bien serrée.',
    facts: [
      'Le bébé pangolin se balade sur la queue de sa maman.',
      'Les pangolins sont les seuls mammifères couverts d’écailles.',
      'Les pangolins n’ont pas de dents, et ils gobent les fourmis avec leur longue langue collante.',
    ],
  },
  'red-panda': {
    about:
      'Le panda roux est un animal au pelage brun-roux, avec une longue queue rayée. Il vit dans les forêts des montagnes d’Asie et adore manger du bambou.',
    facts: [
      'Le panda roux s’enroule dans sa grosse queue touffue comme dans une couverture douillette pour rester au chaud.',
      'Les pandas roux ont un os spécial au poignet qui fonctionne comme un pouce pour les aider à tenir le bambou.',
      'Les pandas roux ne sont pas des ours, et ce ne sont pas de proches cousins des pandas géants.',
    ],
  },
  bat: {
    about:
      'Les chauves-souris sont des animaux à fourrure qui ont des ailes, et ce sont les seuls mammifères qui savent vraiment voler. La plupart dorment le jour et se réveillent la nuit.',
    facts: [
      'Les chauves-souris dorment la tête en bas, bien accrochées par les pattes.',
      'L’aile d’une chauve-souris est en fait une main, avec de longs doigts fins reliés par une peau élastique.',
      'Beaucoup de chauves-souris trouvent leur chemin dans le noir en poussant de petits cris et en écoutant leur écho.',
    ],
  },
  mongoose: {
    about:
      'La mangouste est un petit animal rapide au corps allongé et à la queue touffue. Il en existe de nombreuses sortes, et la plupart vivent en Afrique et en Asie.',
    facts: [
      'Certaines mangoustes cassent les œufs en les lançant en arrière, entre leurs pattes, contre un rocher.',
      'Le suricate est une sorte de mangouste\u00a0: ce sont donc de proches cousins.',
      'Une histoire célèbre parle d’une petite mangouste très courageuse, appelée Rikki-tikki-tavi.',
    ],
  },
  gibbon: {
    about:
      'Le gibbon est un petit singe aux très longs bras. Il se balance de branche en branche, tout en haut des forêts d’Asie.',
    facts: [
      'Chez beaucoup de gibbons, le papa et la maman chantent ensemble, très fort, tôt le matin.',
      'Quand il marche par terre, le gibbon lève ses longs bras bien haut pour garder l’équilibre.',
      'Comme les grands singes, les gibbons n’ont pas de queue, contrairement à la plupart des autres singes.',
    ],
  },
};

export default info;
