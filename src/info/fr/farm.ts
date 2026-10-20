import type { InfoPack } from '../types';

const info: InfoPack = {
  cow: {
    about:
      'La vache est un gros animal de la ferme, très paisible, qui nous donne du lait. Les vaches aiment rester ensemble dans un groupe appelé troupeau.',
    facts: [
      'Le museau de chaque vache a son propre dessin de petites bosses et de lignes, comme tes empreintes digitales.',
      'Les vaches mâchent leur nourriture deux fois\u00a0: elles font remonter l’herbe de leur ventre pour la mâcher encore.',
      'Le bébé de la vache s’appelle le veau, et il sait marcher dès le jour de sa naissance.',
    ],
  },
  pig: {
    about:
      'Le cochon est un animal de la ferme très malin, avec un nez rond qu’on appelle le groin. Les cochons adorent se rouler dans la boue, qui les garde au frais quand il fait chaud.',
    facts: [
      'Les cochons sont très intelligents et peuvent apprendre des tours, comme les chiens.',
      'Le groin du cochon est parfait pour flairer la nourriture cachée sous la terre.',
      'La maman cochon grogne doucement pour appeler ses porcelets quand c’est l’heure de la tétée.',
    ],
  },
  sheep: {
    about:
      'Le mouton est un animal de la ferme tout doux, avec un manteau de laine bien moelleux. Les moutons restent serrés les uns contre les autres, dans un groupe appelé troupeau.',
    facts: [
      'Le bébé du mouton s’appelle l’agneau, et il reconnaît sa maman à son bêlement.',
      'Les moutons peuvent se souvenir de la tête de 50 autres moutons pendant environ deux ans.',
      'Les moutons se font tondre environ une fois par an, et leur laine sert à fabriquer des choses comme des chaussettes et des bonnets.',
    ],
  },
  horse: {
    about:
      'Le cheval est un animal fort et rapide, dont la crinière et la queue flottent au vent. On monte à cheval depuis des milliers d’années.',
    facts: [
      'Les chevaux peuvent faire la sieste debout, car leurs jambes peuvent se bloquer.',
      'Le bébé du cheval s’appelle le poulain, et il peut se tenir debout environ une heure après sa naissance.',
      'Les yeux du cheval sont sur les côtés de sa tête, alors il voit presque tout autour de lui.',
    ],
  },
  chicken: {
    about:
      'La poule est un gentil oiseau de la ferme qui pond des œufs. Ses bébés, tout duveteux, s’appellent des poussins.',
    facts: [
      'Les poussins peuvent déjà piauler pour parler à leur maman quand ils sont encore dans l’œuf.',
      'Il y a plus de poules et de poulets dans le monde que de n’importe quel autre oiseau.',
      'Une poule peut pondre jusqu’à environ un œuf par jour.',
    ],
  },
  duck: {
    about:
      'Le canard est un oiseau d’eau aux pattes plates et palmées, qui lui servent de pagaies. Ses plumes sont imperméables, alors il reste au sec même quand il nage.',
    facts: [
      'Le grand «\u00a0coin-coin\u00a0» que tu entends vient surtout des canes, les canards femelles, tandis que les mâles ont une petite voix plus douce et enrouée.',
      'Les canards peuvent dormir un œil ouvert, pour monter la garde.',
      'Les bébés canards, qu’on appelle canetons, savent nager peu après leur sortie de l’œuf.',
    ],
  },
  goat: {
    about:
      'La chèvre est un animal de la ferme curieux et plein d’énergie, qui adore explorer. Beaucoup de chèvres ont une petite barbichette sous le menton.',
    facts: [
      'Le bébé de la chèvre s’appelle un chevreau, et en anglais, il porte le même nom qu’un enfant\u00a0!',
      'Les chèvres sont d’excellentes grimpeuses, et certaines grimpent même aux arbres pour grignoter les feuilles.',
      'Le milieu noir de l’œil de la chèvre a la forme d’un rectangle couché.',
    ],
  },
  dog: {
    about:
      'Le chien est un animal fidèle et affectueux, et l’un des plus vieux amis des humains. À la ferme, les chiens aident à rassembler les moutons et les vaches.',
    facts: [
      'Le chien a un si bon flair qu’il peut sentir des choses que nous ne sentons pas du tout.',
      'Les chiots naissent les yeux fermés et les ouvrent vers l’âge de deux semaines.',
      'Les chiens se rafraîchissent en haletant, et ils transpirent un peu par les pattes.',
    ],
  },
  cat: {
    about:
      'Le chat est un animal tout doux et curieux, avec de longues moustaches et un corps très souple. Les chats ronronnent souvent quand ils se sentent heureux et bien au chaud.',
    facts: [
      'Les chats peuvent dormir environ 12 à 16 heures par jour.',
      'La langue du chat est râpeuse comme du papier de verre, ce qui l’aide à brosser et nettoyer son pelage.',
      'Les chats voient bien mieux que nous dans la pénombre.',
    ],
  },
  rooster: {
    about:
      'Le coq est le mâle de la poule, avec sur la tête une couronne rouge qu’on appelle la crête. Il est célèbre pour son cocorico bien sonore.',
    facts: [
      'Quand le coq trouve un bon petit morceau, il appelle les poules pour le partager.',
      'Les coqs chantent le matin, mais ils peuvent aussi chanter à n’importe quelle heure de la journée.',
      'Les morceaux de peau rouge qui pendent sous le bec du coq s’appellent les barbillons.',
    ],
  },
  turkey: {
    about:
      'La dinde est un gros oiseau qui vient à l’origine d’Amérique du Nord. Pour se faire admirer, le mâle, appelé dindon, gonfle ses plumes et ouvre sa queue en éventail.',
    facts: [
      'Quand il est tout excité, la tête du dindon peut devenir rouge, blanche ou bleue.',
      'Le fameux glouglou vient des dindons, et on peut l’entendre de très loin.',
      'Les dindes sauvages peuvent voler sur de courtes distances, et la nuit, elles dorment perchées dans les arbres.',
    ],
  },
  goose: {
    about:
      'L’oie est un grand oiseau d’eau au long cou, qui pousse des cris très puissants. Les oies font de bonnes gardiennes\u00a0: elles crient quand des inconnus approchent.',
    facts: [
      'Les oies sauvages volent ensemble en forme de V, ce qui les aide à économiser leurs forces pendant les longs voyages.',
      'Les bébés de l’oie s’appellent des oisons, et ils suivent leurs parents partout.',
      'Les oies restent souvent avec le même compagnon toute leur vie.',
    ],
  },
  donkey: {
    about:
      'L’âne est un cousin du cheval, fort et gentil, avec de longues oreilles toutes douces. Les ânes s’appellent entre eux avec un grand «\u00a0hi-han\u00a0».',
    facts: [
      'Les ânes se font de très bons amis, et ils sont plus heureux quand ils ont un copain.',
      'Les grandes oreilles de l’âne l’aident à entendre les bruits lointains et à rester au frais quand il fait chaud.',
      'Le poil tout doux de l’âne n’est pas imperméable, alors les ânes aiment avoir un abri bien sec quand il pleut.',
    ],
  },
  rabbit: {
    about:
      'Le lapin est un animal doux et duveteux, avec de longues oreilles et un petit nez qui remue sans arrêt. Les lapins sautillent sur leurs puissantes pattes arrière.',
    facts: [
      'Quand un lapin est très content, il peut faire un bond en se tortillant dans les airs\u00a0: on appelle ça un binky.',
      'Les dents de devant du lapin n’arrêtent jamais de pousser, alors il les use en mâchant beaucoup de foin.',
      'Les lapins sauvages vivent ensemble dans de grandes maisons sous la terre, qu’on appelle des garennes.',
    ],
  },
  alpaca: {
    about:
      'L’alpaga est un animal doux et tout duveteux qui vient des montagnes d’Amérique du Sud. Avec sa laine douce et chaude, on fabrique des vêtements douillets.',
    facts: [
      'Les alpagas fredonnent doucement pour se parler.',
      'Les alpagas sont des cousins des chameaux, mais ils n’ont pas de bosse.',
      'Le bébé alpaga s’appelle un cria, et il naît généralement pendant la journée.',
    ],
  },
  mouse: {
    about:
      'La souris est un tout petit animal rapide, aux oreilles rondes et à la longue queue. Les souris se servent de leurs moustaches pour trouver leur chemin dans le noir.',
    facts: [
      'Les souris se chantent de petites chansons, mais elles sont trop aiguës pour que nos oreilles les entendent.',
      'Une souris peut se faufiler dans un trou à peu près aussi large qu’un crayon.',
      'Les souris construisent des nids douillets avec des choses toutes douces, comme de l’herbe, du duvet et du papier.',
    ],
  },
  bee: {
    about:
      'L’abeille est un insecte travailleur qui bourdonne, avec des rayures toutes duveteuses. Les abeilles transportent une poussière de fleur, appelée pollen, de fleur en fleur, ce qui aide les plantes à faire des fruits et des graines.',
    facts: [
      'Les abeilles à miel dansent en se trémoussant pour indiquer à leurs copines où trouver des fleurs.',
      'L’abeille a cinq yeux\u00a0: deux gros, et trois tout petits sur le dessus de la tête.',
      'Les abeilles à miel fabriquent le miel à partir d’un jus sucré des fleurs, appelé nectar.',
    ],
  },
};

export default info;
