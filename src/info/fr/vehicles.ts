import type { InfoPack } from '../types';

const info: InfoPack = {
  'police-car': {
    about:
      'La voiture de police est une voiture spéciale que conduisent les policiers pour aider à protéger tout le monde. Avec ses gyrophares et sa sirène bien bruyante, elle demande aux autres conducteurs de la laisser passer.',
    facts: [
      'Certaines équipes de police ont même des voitures de sport ultrarapides\u00a0!',
      'Les voitures de police ne se ressemblent pas partout dans le monde\u00a0: certaines sont noires et blanches, d’autres ont des carreaux bleus et jaunes.',
      'Grâce à la radio de la voiture, les policiers peuvent se parler et savoir où l’on a besoin d’aide.',
    ],
  },
  ambulance: {
    about:
      'L’ambulance emmène très vite à l’hôpital les personnes qui ont besoin d’un médecin. À l’intérieur, c’est comme un petit hôpital sur roues.',
    facts: [
      'Sur le capot, le mot ambulance est souvent écrit à l’envers, comme dans un miroir, pour que les conducteurs qui sont devant puissent le lire dans leur rétroviseur.',
      'Les ambulanciers conduisent l’ambulance et prennent soin des gens pendant le trajet.',
      'Certaines ambulances savent voler\u00a0: les ambulances aériennes sont des hélicoptères ou des avions qui vont chercher les gens très loin.',
    ],
  },
  'fire-truck': {
    about:
      'Le camion de pompiers transporte les pompiers, qui éteignent les incendies et viennent en aide aux gens. Il est rempli d’échelles, de longs tuyaux et d’outils bien pratiques.',
    facts: [
      'Une pompe très puissante pousse l’eau dans les tuyaux si fort qu’elle peut jaillir plus haut qu’une maison.',
      'Beaucoup de camions de pompiers ont une grande échelle qui s’allonge, de plus en plus, pour atteindre les fenêtres tout en haut.',
      'Autrefois, c’étaient des chevaux qui tiraient les voitures des pompiers dans les rues.',
    ],
  },
  'school-bus': {
    about:
      'Le bus scolaire emmène les enfants à l’école le matin, puis il les ramène à la maison. Son chauffeur fait monter les enfants aux arrêts, tout au long du trajet.',
    facts: [
      'Aux États-Unis et au Canada, les bus scolaires sont peints en jaune vif, pour que tout le monde les voie bien.',
      'Ces bus jaunes ont un petit panneau stop qui se déplie sur le côté, pour que les voitures attendent pendant que les enfants montent et descendent.',
      'Un grand bus scolaire peut transporter environ 70 enfants.',
    ],
  },
  taxi: {
    about:
      'Le taxi est une voiture avec un chauffeur, qui emmène les gens là où ils veulent aller. À la fin de la course, les passagers paient leur trajet.',
    facts: [
      'Pour conduire un des célèbres taxis noirs de Londres, il faut apprendre des milliers de rues par cœur et réussir un examen très difficile.',
      'Le mot taxi vient de taximètre, une petite machine qui calcule le prix de chaque course.',
      'À New York, les fameux taxis sont jaune vif, alors on les repère très facilement.',
    ],
  },
  'garbage-truck': {
    about:
      'Le camion-poubelle et les éboueurs passent de rue en rue pour vider les poubelles et emporter les déchets. Ils nous aident à garder nos villes propres et bien rangées.',
    facts: [
      'À l’intérieur, une machine écrase les déchets bien à plat, pour que le camion puisse en emporter beaucoup, beaucoup plus.',
      'Certains camions-poubelles ramassent les déchets à recycler, comme les bouteilles, les canettes et le papier, pour qu’on en fasse de nouveaux objets.',
      'Un camion-poubelle peut vider les poubelles de centaines de maisons en une seule journée.',
    ],
  },
  tractor: {
    about:
      'Le tracteur est une machine agricole très forte, qui tire de lourdes charges comme des remorques et des charrues. Les agriculteurs s’en servent pour faire pousser la nourriture que nous mangeons.',
    facts: [
      'Certains tracteurs savent se conduire tout seuls, grâce aux signaux de satellites qui tournent tout là-haut dans l’espace.',
      'Beaucoup de tracteurs ont d’énormes roues arrière, avec de gros crampons qui s’agrippent à la terre molle et boueuse.',
      'Les tout premiers tracteurs marchaient à la vapeur, comme les vieux trains à vapeur.',
    ],
  },
  digger: {
    about:
      'La pelleteuse, ou pelle mécanique, est une grosse machine avec un long bras et un godet qui creuse comme une grande cuillère. Elle fait des trous pour les maisons, les routes et les tuyaux.',
    facts: [
      'Le haut de la pelleteuse, là où le conducteur est assis, peut faire un tour complet sur lui-même.',
      'Le bras de la pelleteuse est poussé par de l’huile qui circule dans des tuyaux, ce qui le rend assez fort pour soulever de gros rochers.',
      'Beaucoup de pelleteuses roulent sur des chenilles au lieu de roues, pour ne pas s’enfoncer dans la boue molle.',
    ],
  },
  'dump-truck': {
    about:
      'Le camion-benne transporte de lourdes charges, comme du sable, de la terre et des cailloux. Une fois arrivé, l’arrière se soulève, et tout le chargement glisse dehors.',
    facts: [
      'Les plus gros camions-bennes ont des roues plus hautes qu’une grande personne, et le conducteur doit monter un escalier pour y entrer\u00a0!',
      'Les camions-bennes travaillent souvent avec les pelleteuses\u00a0: la pelleteuse remplit le camion, et le camion emporte le chargement.',
      'On l’appelle camion-benne à cause de sa grande caisse, la benne, qui bascule pour vider le chargement.',
    ],
  },
  train: {
    about:
      'Le train est une file de wagons qui roule sur des rails, souvent tirée par une machine appelée locomotive. Un seul train peut transporter des centaines de personnes à la fois.',
    facts: [
      'Les trains à vapeur chauffent de l’eau jusqu’à ce qu’elle devienne de la vapeur, qui fait tourner les roues et s’échappe en panaches par la cheminée.',
      'Les trains les plus rapides d’aujourd’hui, comme le TGV, peuvent filer à plus de 300 kilomètres à l’heure.',
      'Les premiers trains à vapeur ont été construits en Grande-Bretagne il y a plus de 200 ans.',
    ],
  },
  airplane: {
    about:
      'L’avion est une machine volante avec des ailes, qui emmène les gens très haut dans le ciel. Le pilote est aux commandes dans le cockpit, tout à l’avant.',
    facts: [
      'Les gros avions de ligne volent à environ 10 kilomètres de haut, plus haut que la plus haute montagne de la Terre.',
      'Une hélice qui tourne ou un moteur à réaction fait avancer l’avion, et l’air qui file autour de ses ailes le soulève.',
      'Le tout premier vol des frères Wright, en 1903, n’a duré que 12 secondes.',
    ],
  },
  helicopter: {
    about:
      'L’hélicoptère est une machine volante avec de longues pales qui tournent sur le dessus. Il peut monter tout droit, rester immobile dans les airs, et même voler en arrière.',
    facts: [
      'Sur la plupart des hélicoptères, de petites pales qui tournent sur la queue l’empêchent de pivoter sur lui-même comme une toupie.',
      'Les hélicoptères savent se poser dans de petits espaces, alors ils peuvent aller chercher des gens en montagne, sur des îles et sur des bateaux.',
      'Il y a plus de 500 ans, l’artiste Léonard de Vinci a dessiné une machine volante qui ressemblait un peu à un hélicoptère.',
    ],
  },
  motorbike: {
    about:
      'La moto, c’est comme un vélo avec un moteur, alors pas besoin de pédaler. Les motards portent un casque solide pour bien protéger leur tête.',
    facts: [
      'Pendant les courses, les pilotes se penchent tellement dans les virages que des protections spéciales sur leurs genoux frottent par terre.',
      'Pour aller plus vite, le motard tourne la poignée droite du guidon.',
      'L’une des premières motos, construite en Allemagne il y a environ 140 ans, avait des roues et un cadre en bois.',
    ],
  },
  bicycle: {
    about:
      'Le vélo est une machine à deux roues qui avance quand on appuie sur les pédales. Son moteur, ce sont tes jambes, alors il n’a jamais besoin d’essence.',
    facts: [
      'Les tout premiers vélos n’avaient pas de pédales\u00a0: on avançait en poussant avec ses pieds, exactement comme sur une draisienne.',
      'Quand tu appuies sur les pédales, une chaîne fait tourner la roue arrière, et c’est parti.',
      'Aux Pays-Bas, il y a plus de vélos que d’habitants\u00a0!',
    ],
  },
  boat: {
    about:
      'Ce bateau est un remorqueur\u00a0: petit mais très costaud, il aide les gros navires à entrer dans les ports animés et à en sortir.',
    facts: [
      'Les remorqueurs sont si forts qu’ils peuvent pousser et tirer des navires bien plus gros qu’eux.',
      'Les remorqueurs ont souvent de vieux pneus ou d’épais boudins en caoutchouc sur les côtés, qui servent de pare-chocs tout doux.',
      'Le capitaine dirige le remorqueur depuis la timonerie, une petite pièce en hauteur avec des fenêtres tout autour.',
    ],
  },
};

export default info;
