import type { InfoPack } from '../types';

const info: InfoPack = {
  camel: {
    about:
      'Le chameau est un grand animal du désert, très robuste. Sa bosse est remplie de graisse, pas d’eau, et elle lui donne de l’énergie quand la nourriture se fait rare.',
    facts: [
      'Un chameau très assoiffé peut boire environ 100 litres d’eau en seulement 10 minutes.',
      'Les chameaux ont deux rangées de longs cils, et ils peuvent fermer leurs narines pour empêcher le sable d’entrer.',
      'Le chameau à une bosse s’appelle le dromadaire, et celui à deux bosses, le chameau de Bactriane.',
    ],
  },
  'fennec-fox': {
    about:
      'Le fennec est le plus petit renard du monde, mais il a des oreilles géantes. Il vit dans les déserts de sable d’Afrique du Nord.',
    facts: [
      'Ses immenses oreilles l’aident à entendre les petites bêtes qui bougent sous le sable, et à évacuer la chaleur pour rester au frais.',
      'Sous ses pattes, une fourrure épaisse fait comme des chaussons et les protège du sable brûlant.',
      'Les fennecs dorment dans des terriers bien frais pendant la chaleur du jour, et sortent la nuit.',
    ],
  },
  lizard: {
    about:
      'Le lézard est un reptile couvert d’écailles, avec quatre pattes et une longue queue. Beaucoup de lézards vivent dans les déserts chauds et secs, et adorent se chauffer au soleil.',
    facts: [
      'Beaucoup de lézards peuvent laisser tomber leur queue pour échapper au danger, puis il leur en repousse une nouvelle.',
      'Il existe des milliers de sortes de lézards, des minuscules geckos jusqu’aux énormes dragons de Komodo.',
      'Certains lézards sentent les odeurs de l’air en sortant vite leur langue.',
    ],
  },
  scorpion: {
    about:
      'Le scorpion est un cousin des araignées, avec huit pattes, deux grosses pinces et une longue queue recourbée. Beaucoup de scorpions vivent dans les déserts.',
    facts: [
      'Sous une lumière spéciale, qu’on appelle lumière ultraviolette, les scorpions brillent d’un bleu-vert éclatant\u00a0!',
      'Les bébés scorpions se promènent sur le dos de leur maman tant qu’ils sont petits.',
      'Les scorpions vivent sur la Terre depuis bien avant les dinosaures.',
    ],
  },
  tortoise: {
    about:
      'La tortue terrestre est un reptile lent et paisible, avec une carapace dure et bombée. Elle vit sur la terre ferme, alors que la plupart des autres tortues passent beaucoup de temps dans l’eau.',
    facts: [
      'Certaines tortues terrestres peuvent vivre plus de 100 ans\u00a0!',
      'La carapace de la tortue est soudée à sa colonne vertébrale et à ses côtes\u00a0: elle ne peut donc jamais en sortir.',
      'Les tortues du désert creusent des terriers profonds pour rester au frais en été et bien au chaud en hiver.',
    ],
  },
  roadrunner: {
    about:
      'Le géocoucou est un oiseau du désert très rapide, de la famille des coucous. Il sait voler, mais il préfère de loin courir.',
    facts: [
      'Ses empreintes ressemblent à la lettre X, parce qu’il a deux doigts tournés vers l’avant et deux vers l’arrière.',
      'Les matins frais, il ébouriffe les plumes de son dos et laisse le soleil réchauffer sa peau foncée.',
      'Le géocoucou peut filer au sol à environ 30 kilomètres à l’heure.',
    ],
  },
  vulture: {
    about:
      'Le vautour est un grand oiseau aux larges ailes, avec une tête presque sans plumes. Les vautours sont les éboueurs de la nature\u00a0: ils gardent la terre propre et saine.',
    facts: [
      'En anglais, un groupe de vautours qui tournoient dans le ciel s’appelle une «\u00a0bouilloire\u00a0»\u00a0!',
      'Les vautours peuvent planer pendant des heures sur l’air chaud qui monte, presque sans battre des ailes.',
      'Beaucoup de vautours ont des yeux super perçants et repèrent leur nourriture de très haut dans le ciel.',
    ],
  },
  coyote: {
    about:
      'Le coyote est un cousin sauvage et malin du chien et du loup. Il peut s’installer presque partout, des déserts brûlants jusqu’aux villes animées.',
    facts: [
      'Les coyotes hurlent, jappent et aboient pour parler à leur famille\u00a0: on les surnomme parfois les chiens chanteurs.',
      'Chez les coyotes, la maman et le papa s’occupent tous les deux des petits.',
      'Quand il court, le coyote garde sa queue touffue vers le bas, alors que les chiens la tiennent souvent levée.',
    ],
  },
  jackrabbit: {
    about:
      'Le lièvre de Californie a de très longues pattes et des oreilles géantes, parfaites pour la vie dans le désert. Il ressemble à un lapin, mais c’est en réalité un lièvre.',
    facts: [
      'Contrairement aux bébés lapins, les bébés lièvres naissent avec des poils et les yeux ouverts.',
      'Ses immenses oreilles l’aident à rester au frais en laissant s’échapper la chaleur.',
      'Le lièvre de Californie peut filer à toute allure en zigzaguant de droite à gauche.',
    ],
  },
  'horned-lizard': {
    about:
      'Le lézard cornu est un petit lézard plat et piquant qui vit dans les terres sèches d’Amérique du Nord. Il porte sur la tête une couronne de petites cornes.',
    facts: [
      'Certains lézards cornus boivent la pluie qui coule dans de minuscules rigoles entre leurs écailles, jusqu’à leur bouche\u00a0!',
      'On l’appelle parfois crapaud cornu, mais c’est bien un lézard.',
      'Il peut se gonfler comme un ballon piquant pour paraître plus gros.',
    ],
  },
  oryx: {
    about:
      'L’oryx d’Arabie est une antilope blanche aux cornes très longues et droites. Il vit dans les déserts chauds et secs d’Arabie.',
    facts: [
      'De profil, ses deux longues cornes peuvent sembler n’en faire qu’une, comme celle d’une licorne\u00a0!',
      'Son pelage blanc renvoie la chaleur du soleil, ce qui l’aide à rester au frais.',
      'L’oryx peut rester longtemps sans boire, car il trouve de l’eau dans les plantes et dans la rosée du matin.',
    ],
  },
  jerboa: {
    about:
      'La gerboise est un tout petit animal qui saute sur ses longues pattes arrière, comme un mini kangourou. Elle vit dans les déserts d’Afrique et d’Asie.',
    facts: [
      'D’un seul grand bond, la gerboise peut sauter plusieurs fois la longueur de son corps.',
      'Sa longue queue l’aide à garder l’équilibre quand elle saute.',
      'Certaines gerboises bouchent l’entrée de leur terrier pour empêcher l’air chaud de la journée d’entrer.',
    ],
  },
  'dung-beetle': {
    about:
      'Le scarabée bousier est un scarabée très travailleur qui fait le ménage en ramassant les crottes des animaux. Beaucoup de bousiers en font une boule qu’ils poussent en marchant à reculons.',
    facts: [
      'La nuit, certains bousiers se guident grâce à la lueur de la Voie lactée pour rouler leur boule bien droit.',
      'Pour leur taille, certains bousiers font partie des insectes les plus forts de la Terre.',
      'En enterrant les crottes dans le sol, les bousiers nourrissent la terre, ce qui aide les plantes à pousser.',
    ],
  },
};

export default info;
