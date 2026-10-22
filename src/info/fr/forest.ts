import type { InfoPack } from '../types';

const info: InfoPack = {
  deer: {
    about:
      'Le cerf est un animal doux et gracieux qui vit dans les forêts et les prairies. Les mâles ont de grands bois sur la tête, mais les femelles, les biches, n’en ont pas.',
    facts: [
      'Le bébé du cerf et de la biche, qu’on appelle le faon, a des taches blanches qui l’aident à se cacher parmi les feuilles.',
      'Chaque année, le cerf perd ses bois, et de tout nouveaux bois repoussent.',
      'Les cerfs sautent très bien, et beaucoup peuvent bondir par-dessus une clôture plus haute qu’une grande personne.',
    ],
  },
  fox: {
    about:
      'Le renard roux est un cousin sauvage du chien, très malin, avec une queue touffue et des oreilles pointues. Les renards vivent dans les forêts, dans les champs et même en ville.',
    facts: [
      'Le renard a l’ouïe si fine qu’il entend les plus petits bruits sous la neige.',
      'Quand il se roule en boule pour dormir, le renard s’enveloppe dans sa queue touffue, comme dans une couverture bien chaude.',
      'Les bébés renards, qu’on appelle renardeaux, adorent jouer et faire des roulades ensemble devant leur terrier.',
    ],
  },
  bear: {
    about:
      'L’ours brun est un grand animal très fort, au pelage épais et hirsute. Il vit dans les forêts et les montagnes, et il a un flair formidable.',
    facts: [
      'Beaucoup d’ours font un long somme pendant l’hiver, dans une tanière douillette où naissent de tout petits oursons.',
      'Les ours se dressent souvent sur leurs pattes arrière pour mieux voir et bien renifler.',
      'Les ours bruns nagent bien, et certains sont très doués pour attraper des poissons dans les rivières.',
    ],
  },
  squirrel: {
    about:
      'L’écureuil est un petit animal vif et toujours occupé, avec une grande queue touffue qui l’aide à garder l’équilibre. Il grimpe aux arbres et saute de branche en branche.',
    facts: [
      'Les écureuils enterrent des noisettes et des glands pour plus tard, et ceux qu’ils oublient peuvent devenir de nouveaux arbres\u00a0!',
      'Les écureuils peuvent descendre des arbres la tête la première, en faisant pivoter leurs pattes arrière.',
      'Le nid de l’écureuil, qu’on appelle une hotte, est fait de brindilles et de feuilles, tout en haut d’un arbre.',
    ],
  },
  hedgehog: {
    about:
      'Le hérisson est un petit animal couvert de milliers de piquants bien raides. Quand il est inquiet, il se roule en une boule bien serrée et toute piquante.',
    facts: [
      'Les bébés hérissons s’appellent des hérissonneaux, et leurs premiers piquants sont blancs et tout mous.',
      'Les hérissons reniflent et grognent comme de petits cochons, et en anglais, leur nom veut d’ailleurs dire «\u00a0cochon des haies\u00a0».',
      'L’hiver, les hérissons se roulent en boule dans un nid de feuilles bien douillet, et ils dorment jusqu’au printemps.',
    ],
  },
  raccoon: {
    about:
      'Le raton laveur est un animal très malin, avec un masque noir autour des yeux et une queue touffue à anneaux. Les ratons laveurs sont surtout actifs la nuit.',
    facts: [
      'Les pattes avant du raton laveur sont comme de petites mains, et il sait même ouvrir des couvercles et de simples loquets.',
      'Les ratons laveurs trempent parfois leur nourriture dans l’eau avant de la manger, comme s’ils la lavaient\u00a0: c’est de là que vient leur nom.',
      'Les bébés ratons laveurs poussent de petits gazouillis et de petits cris aigus pour parler à leur maman.',
    ],
  },
  wolf: {
    about:
      'Le loup gris est le plus grand animal sauvage de la famille des chiens. Les loups vivent ensemble en familles, qu’on appelle des meutes.',
    facts: [
      'Les loups hurlent pour parler à leur meute, et on peut entendre un hurlement très loin à travers la forêt.',
      'Toute la meute aide à s’occuper des louveteaux, et les grands jouent même avec eux.',
      'Nos chiens descendent de loups qui vivaient il y a très, très longtemps, alors chiens et loups sont de proches cousins.',
    ],
  },
  badger: {
    about:
      'Le blaireau est un animal fort et poilu, avec une tête rayée de noir et de blanc. Les blaireaux creusent de grandes maisons sous la terre, qu’on appelle des blaireautières.',
    facts: [
      'Les blaireaux gardent leur maison bien rangée, et ils rapportent de l’herbe fraîche et des feuilles pour se faire des lits douillets.',
      'Certaines blaireautières servent à des familles de blaireaux depuis cent ans, ou même plus.',
      'Les blaireaux sortent la nuit, et grâce à leur odorat extraordinaire, ils trouvent des vers et des petites bêtes.',
    ],
  },
  beaver: {
    about:
      'Le castor est un gros animal poilu, avec une queue plate en forme de pagaie. Les castors sont de grands bâtisseurs\u00a0: ils construisent des barrages de branches et de boue en travers des ruisseaux.',
    facts: [
      'Les grandes dents de devant du castor sont orange et très solides, et elles n’arrêtent jamais de pousser.',
      'Les castors construisent des maisons douillettes, appelées huttes, avec des portes secrètes cachées sous l’eau.',
      'Pour avertir sa famille, le castor tape sur l’eau avec sa queue, dans un grand plouf bien sonore.',
    ],
  },
  moose: {
    about:
      'L’élan est le plus grand animal de la famille des cerfs, avec de longues pattes et un gros nez tombant. Il vit dans les forêts froides du Nord.',
    facts: [
      'Les élans nagent très bien, et ils peuvent même plonger sous l’eau pour brouter des plantes.',
      'D’un bout à l’autre, les bois d’un élan mâle peuvent mesurer autant qu’une grande personne.',
      'Le morceau de peau et de poils qui pend sous le menton de l’élan s’appelle la cloche.',
    ],
  },
  skunk: {
    about:
      'La mouffette est un animal noir et blanc, avec une grosse queue toute touffue. Elle peut lancer un jet qui sent très, très mauvais pour dire aux autres de rester loin.',
    facts: [
      'Avant de lancer son jet, la mouffette tape des pattes et lève la queue, et certaines font même le poirier sur les pattes de devant\u00a0!',
      'Les bébés mouffettes suivent leur maman en file indienne quand ils partent en exploration.',
      'Les mouffettes creusent avec les longues griffes de leurs pattes avant pour trouver des scarabées et d’autres petites bêtes à manger.',
    ],
  },
};

export default info;
