import type { InfoPack } from '../types';

const info: InfoPack = {
  sun: {
    about:
      'Le Soleil est une étoile, l’étoile la plus proche de la Terre. C’est une boule géante de gaz très chaud et brillant, qui nous donne lumière et chaleur.',
    facts: [
      'Le Soleil est si gros que plus d’un million de Terres pourraient tenir dedans.',
      'La lumière du Soleil met environ 8 minutes pour faire tout le voyage jusqu’à la Terre.',
      'Les autres étoiles paraissent minuscules parce qu’elles sont beaucoup, beaucoup plus loin que le Soleil.',
    ],
  },
  mercury: {
    about:
      'Mercure est la plus petite planète, et la plus proche du Soleil. C’est un monde de roche couvert de cratères, à peine plus grand que notre Lune.',
    facts: [
      'Mercure file autour du Soleil plus vite que toutes les autres planètes\u00a0: une année là-bas ne dure que 88 jours terrestres.',
      'Comme il n’y a presque pas d’air pour garder la chaleur, ses journées sont brûlantes et ses nuits glaciales.',
      'Mercure n’a ni lune ni anneaux.',
    ],
  },
  venus: {
    about:
      'Vénus est la deuxième planète à partir du Soleil, et elle est presque aussi grosse que la Terre. Son air épais garde la chaleur comme une couverture, ce qui en fait la planète la plus chaude.',
    facts: [
      'Vénus tourne si lentement sur elle-même qu’un seul tour lui prend plus de temps qu’un voyage complet autour du Soleil\u00a0!',
      'Elle tourne dans le sens inverse de la Terre\u00a0: sur Vénus, le Soleil se lève donc à l’ouest.',
      'Vénus est la planète la plus brillante de notre ciel, et on l’appelle souvent l’étoile du matin ou l’étoile du soir.',
    ],
  },
  earth: {
    about:
      'La Terre est notre maison, la troisième planète à partir du Soleil. C’est la seule planète que nous connaissons où il y a des êtres vivants, des minuscules fourmis jusqu’aux baleines géantes.',
    facts: [
      'Les océans couvrent la plus grande partie de la Terre, alors vue de l’espace, elle ressemble à une grosse bille bleue.',
      'La Terre fait un tour sur elle-même chaque jour, et c’est pour ça qu’il y a le jour et la nuit.',
      'Il faut une année entière à la Terre pour faire tout le tour du Soleil.',
    ],
  },
  mars: {
    about:
      'Mars est la quatrième planète à partir du Soleil. On l’appelle la planète rouge, parce que son sol est couvert d’une poussière rouge comme de la rouille.',
    facts: [
      'Sur Mars se trouve le plus haut volcan que l’on connaisse, Olympus Mons, plus de deux fois plus haut que l’Everest\u00a0!',
      'Mars a deux petites lunes, qui s’appellent Phobos et Déimos.',
      'Les scientifiques ont envoyé des robots explorateurs, appelés rovers, pour rouler sur Mars.',
    ],
  },
  jupiter: {
    about:
      'Jupiter est la plus grosse planète de notre système solaire. C’est une boule de gaz géante avec des bandes colorées et une immense tempête qu’on appelle la Grande Tache rouge.',
    facts: [
      'Jupiter est si grosse que plus de mille Terres pourraient tenir dedans.',
      'Elle tourne sur elle-même plus vite que toutes les autres planètes\u00a0: une journée y dure seulement 10 heures environ.',
      'Sa lune Ganymède est la plus grosse lune de notre système solaire, encore plus grosse que la planète Mercure.',
    ],
  },
  saturn: {
    about:
      'Saturne est la sixième planète à partir du Soleil, et la deuxième plus grosse. C’est une boule de gaz géante, célèbre pour ses magnifiques anneaux.',
    facts: [
      'Saturne est si légère pour sa taille qu’elle pourrait flotter dans une baignoire géante remplie d’eau\u00a0!',
      'Ses anneaux sont faits de glace et de roche, des minuscules grains jusqu’aux blocs aussi gros qu’une maison.',
      'Saturne a plus de lunes que n’importe quelle autre planète\u00a0: on en a déjà trouvé des centaines.',
    ],
  },
  uranus: {
    about:
      'Uranus est la septième planète à partir du Soleil. C’est une géante glacée, bleu-vert, couchée sur le côté, comme une balle qui roulerait autour du Soleil.',
    facts: [
      'Comme elle est couchée sur le côté, chaque saison sur Uranus dure environ 21 ans.',
      'Un gaz appelé méthane donne à Uranus sa couleur bleu-vert.',
      'Uranus a été la toute première planète découverte en regardant dans un télescope.',
    ],
  },
  neptune: {
    about:
      'Neptune est la huitième planète, et la plus éloignée du Soleil. C’est une géante bleue et froide, où soufflent les vents les plus rapides de toutes les planètes.',
    facts: [
      'Il faut environ 165 ans à Neptune pour faire une seule fois le tour du Soleil.',
      'Neptune a été la première planète découverte grâce aux mathématiques, et pas seulement en observant le ciel.',
      'Neptune n’a été visitée que par un seul engin spatial, appelé Voyager 2.',
    ],
  },
  pluto: {
    about:
      'Pluton est une planète naine, très loin, au-delà de Neptune. C’est un petit monde glacé, encore plus petit que notre Lune.',
    facts: [
      'Sur Pluton, il y a une grande tache claire en forme de cœur\u00a0!',
      'C’est une petite Anglaise de 11 ans, appelée Venetia, qui a donné son nom à Pluton.',
      'Avant, on appelait Pluton la neuvième planète, mais aujourd’hui, les scientifiques disent que c’est une planète naine.',
    ],
  },
  moon: {
    about:
      'La Lune est la plus proche voisine de la Terre dans l’espace, et elle tourne autour de notre planète. Elle brille parce que la lumière du Soleil rebondit sur elle.',
    facts: [
      'En 1969, Neil Armstrong est devenu le premier homme à marcher sur la Lune.',
      'Comme il n’y a ni vent ni pluie pour les effacer, les traces de pas sur la Lune peuvent rester très, très longtemps.',
      'La Lune semble changer de forme, mais en fait, nous voyons simplement une partie plus ou moins grande de son côté éclairé par le Soleil.',
    ],
  },
  rocket: {
    about:
      'La fusée est une machine très puissante qui emporte des astronautes et des engins spatiaux jusque dans l’espace. Elle file vers le haut en poussant vers le bas les gaz brûlants qui sortent de ses moteurs.',
    facts: [
      'En route vers l’espace, une grosse fusée peut aller plusieurs fois plus vite qu’un avion à réaction.',
      'Les fusées emportent leur propre oxygène, alors leurs moteurs continuent de marcher dans l’espace, où il n’y a pas d’air.',
      'Les grosses fusées sont construites en plusieurs parties, appelées étages, qui se détachent quand leur carburant est épuisé.',
    ],
  },
  astronaut: {
    about:
      'L’astronaute est une personne qui voyage dans l’espace. Beaucoup d’astronautes vivent et travaillent pendant des mois dans une station spatiale, très haut au-dessus de la Terre.',
    facts: [
      'Dans l’espace, les astronautes grandissent un peu, puis rapetissent en rentrant sur Terre\u00a0!',
      'Dans une station spatiale, les astronautes dorment dans des sacs de couchage attachés au mur, pour ne pas flotter partout.',
      'Depuis une station spatiale, les astronautes peuvent voir environ 16 levers et 16 couchers de soleil chaque jour.',
    ],
  },
  ufo: {
    about:
      'OVNI veut dire objet volant non identifié\u00a0: c’est quelque chose dans le ciel que personne ne sait encore expliquer. Dans les histoires, ce sont souvent des soucoupes volantes avec de gentils extraterrestres à bord.',
    facts: [
      'Personne n’a jamais trouvé de vraie soucoupe volante, mais des scientifiques guettent des signaux venus de l’espace.',
      'La plupart des OVNI sont en fait des avions, des ballons, des oiseaux, ou même la brillante planète Vénus.',
      'Les scientifiques ont trouvé des milliers de planètes autour d’autres étoiles, et ils y cherchent des signes de vie.',
    ],
  },
  comet: {
    about:
      'La comète est comme une énorme boule de neige sale, faite de glace, de poussière et de roche. Quand elle s’approche du Soleil, il lui pousse une longue queue lumineuse.',
    facts: [
      'La queue d’une comète peut s’étirer sur des millions de kilomètres dans l’espace.',
      'Sa queue est toujours tournée à l’opposé du Soleil, même quand la comète s’en éloigne.',
      'La comète de Halley revient environ tous les 76 ans, et sa prochaine visite aura lieu en 2061.',
    ],
  },
};

export default info;
