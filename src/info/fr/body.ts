import type { InfoPack } from '../types';

const info: InfoPack = {
  heart: {
    about:
      'Ton cœur est un muscle très fort, dans ta poitrine, qui envoie le sang dans tout ton corps. Il est à peu près gros comme ton poing.',
    facts: [
      'Ton cœur bat environ 100\u00a0000 fois par jour, même quand tu dors profondément.',
      'Quand le médecin écoute avec son stéthoscope, ton cœur fait boum-boum, boum-boum.',
      'Courir, sauter et danser font battre ton cœur plus vite et l’aident à rester fort.',
    ],
  },
  brain: {
    about:
      'Ton cerveau est le chef de ton corps, bien à l’abri dans ta tête. Il t’aide à penser, à apprendre, à te souvenir, à ressentir et à bouger.',
    facts: [
      'Ton cerveau est tout plissé, et tous ces plis permettent de faire tenir beaucoup de cerveau dans ta tête.',
      'Le côté gauche de ton cerveau fait bouger le côté droit de ton corps, et le côté droit fait bouger le côté gauche.',
      'Une bonne nuit de sommeil aide ton cerveau à se souvenir de ce que tu as appris dans la journée.',
    ],
  },
  lungs: {
    about:
      'Tes deux poumons se remplissent d’air comme des ballons chaque fois que tu inspires. Ils font passer dans ton sang l’oxygène, la partie de l’air dont ton corps a besoin.',
    facts: [
      'Ton poumon gauche est un peu plus petit que le droit, pour laisser de la place à ton cœur.',
      'Tu inspires et tu expires plus de 20\u00a0000 fois par jour, même pendant ton sommeil.',
      'Dans ton nez, de tout petits poils et un liquide collant appelé mucus attrapent la poussière avant qu’elle n’arrive à tes poumons.',
    ],
  },
  stomach: {
    about:
      'Ton estomac est une poche élastique dans ton ventre, qui écrase les aliments que tu avales. Il les mélange avec des jus spéciaux jusqu’à ce qu’ils deviennent liquides, comme une soupe épaisse.',
    facts: [
      'Les gargouillis de ton ventre viennent de ton estomac et de tes intestins qui poussent la nourriture, les jus et l’air.',
      'Ton estomac peut s’étirer pour contenir un grand repas, puis il redevient tout petit quand il est vide.',
      'Bien mâcher tes aliments aide beaucoup ton estomac à faire son travail.',
    ],
  },
  liver: {
    about:
      'Ton foie se trouve sous tes côtes, du côté droit de ton corps. Il nettoie ton sang et met de côté l’énergie de tes repas pour plus tard.',
    facts: [
      'Ton foie sait très bien se réparer\u00a0: il peut même repousser si on en enlève un morceau.',
      'Ton foie a des centaines de missions différentes, ce qui en fait l’une des parties les plus occupées de ton corps.',
      'Ton foie fabrique un jus jaune-vert, appelé bile, qui aide ton corps à digérer les aliments gras.',
    ],
  },
  kidneys: {
    about:
      'Tu as deux reins, bien rangés près de ton dos, de chaque côté, juste sous tes côtes. Ils nettoient ton sang et transforment l’eau en trop et les déchets en pipi.',
    facts: [
      'En anglais, les haricots rouges s’appellent «\u00a0haricots-reins\u00a0», parce qu’ils ont exactement la forme de tes reins.',
      'Tes reins nettoient tout ton sang environ 40 fois par jour.',
      'Boire beaucoup d’eau aide tes reins à bien travailler, et ton pipi reste d’un jaune très clair.',
    ],
  },
  intestines: {
    about:
      'Tes intestins sont de longs tuyaux tout mous, enroulés dans ton ventre. Quand ton estomac a écrasé ta nourriture, ils en absorbent toutes les bonnes choses pour ton corps.',
    facts: [
      'Tes intestins sont bien plus longs que toi, alors ils se replient bien sagement pour tenir dans ton ventre.',
      'Des milliers de milliards de tout petits microbes amis vivent dans tes intestins et aident à digérer ta nourriture.',
      'Les fruits, les légumes et beaucoup d’eau aident la nourriture à bien avancer dans tes intestins.',
    ],
  },
  bladder: {
    about:
      'Ta vessie est une petite poche élastique, tout en bas de ton ventre. Elle garde ton pipi jusqu’au moment où tu vas aux toilettes.',
    facts: [
      'Quand ta vessie commence à être pleine, elle prévient ton cerveau qu’il est temps d’aller aux toilettes.',
      'Ton pipi est fabriqué par tes reins, puis il descend dans ta vessie par deux petits tuyaux tout fins.',
      'Quand tu sors des toilettes, te laver les mains avec du savon fait partir les microbes.',
    ],
  },
  bone: {
    about:
      'Les os sont les parties dures et solides à l’intérieur de toi, qui te tiennent debout et t’aident à bouger. Les os sont vivants, alors ils grandissent en même temps que toi.',
    facts: [
      'Un bébé qui vient de naître a environ 300 os, et certains se soudent petit à petit pendant qu’il grandit.',
      'L’os de ta cuisse est le plus long et le plus solide de ton corps.',
      'Le lait, le fromage et les yaourts, et aussi courir et sauter beaucoup, aident tes os à devenir solides.',
    ],
  },
  tooth: {
    about:
      'Tes dents t’aident à croquer et à mâcher, à bien parler et à faire de grands sourires. Chaque dent a des racines qui la tiennent bien fort dans ta mâchoire.',
    facts: [
      'Tes 20 dents de lait tombent une par une, pour laisser la place à 32 dents d’adulte au maximum.',
      'La couche blanche et brillante qui recouvre la dent s’appelle l’émail, et c’est la chose la plus dure de ton corps.',
      'Te brosser les dents deux fois par jour, pendant deux minutes à chaque fois, les garde propres et solides.',
    ],
  },
  eye: {
    about:
      'Tes yeux te permettent de voir les couleurs, les formes et tout ce qui t’entoure. Ils envoient des messages à ton cerveau, qui comprend ce que tu regardes.',
    facts: [
      'Ta pupille, le point noir au milieu de ton œil, grandit quand il fait sombre pour laisser entrer plus de lumière.',
      'La partie colorée de ton œil s’appelle l’iris, et son dessin est aussi unique qu’une empreinte digitale.',
      'Chaque fois que tu clignes des yeux, tes paupières les recouvrent de larmes pour les garder propres et humides.',
    ],
  },
  'red-blood-cell': {
    about:
      'Les globules rouges sont de minuscules cellules qui donnent à ton sang sa couleur rouge. Ils transportent l’oxygène, la partie de l’air dont tu as besoin, de tes poumons jusque dans tout ton corps.',
    facts: [
      'Il y a des millions de globules rouges dans une seule petite goutte de sang.',
      'Les globules rouges sont fabriqués à l’intérieur de tes os, dans une partie molle au centre, appelée moelle osseuse.',
      'Chaque globule rouge file à travers ton corps pendant environ quatre mois, avant qu’un nouveau prenne sa place.',
    ],
  },
};

export default info;
