import type { InfoPack } from '../types';

const info: InfoPack = {
  sun: {
    about:
      'El Sol es una estrella, la estrella más cercana a la Tierra. Es una bola gigante de gas muy caliente y brillante que nos da luz y calor.',
    facts: [
      'El Sol es tan grande que dentro de él cabrían más de un millón de Tierras.',
      'La luz del Sol tarda unos 8 minutos en viajar desde el Sol hasta la Tierra.',
      'Las demás estrellas se ven diminutas porque están muchísimo más lejos que el Sol.',
    ],
  },
  mercury: {
    about:
      'Mercurio es el planeta más pequeño y el más cercano al Sol. Es un mundo rocoso lleno de cráteres, solo un poco más grande que nuestra Luna.',
    facts: [
      'Mercurio da vueltas alrededor del Sol más rápido que ningún otro planeta, así que su año dura solo 88 días de la Tierra.',
      'Como casi no tiene aire que guarde el calor, sus días son calurosísimos y sus noches, heladas.',
      'Mercurio no tiene lunas ni anillos.',
    ],
  },
  venus: {
    about:
      'Venus es el segundo planeta desde el Sol y tiene casi el mismo tamaño que la Tierra. Su aire espeso atrapa el calor como una manta, y por eso es el planeta más caliente.',
    facts: [
      '¡Venus gira tan despacio que dar una vuelta sobre sí mismo le lleva más tiempo que dar toda la vuelta al Sol!',
      'Gira al revés que la Tierra, así que en Venus el Sol sale por el oeste.',
      'Venus es el planeta más brillante de nuestro cielo, y mucha gente lo llama la estrella de la mañana o la estrella de la tarde.',
    ],
  },
  earth: {
    about:
      'La Tierra es nuestro hogar, el tercer planeta desde el Sol. Es el único planeta que conocemos con seres vivos, desde hormiguitas hasta ballenas gigantes.',
    facts: [
      'Los océanos cubren la mayor parte de la Tierra, así que desde el espacio parece una gran canica azul.',
      'La Tierra da una vuelta sobre sí misma cada día, y por eso tenemos el día y la noche.',
      'La Tierra tarda un año entero en dar toda la vuelta alrededor del Sol.',
    ],
  },
  mars: {
    about:
      'Marte es el cuarto planeta desde el Sol. Lo llaman el planeta rojo, porque su suelo está cubierto de un polvo rojo como el óxido.',
    facts: [
      '¡Marte tiene el volcán más alto que conocemos, el monte Olimpo, más del doble de alto que el monte Everest!',
      'Marte tiene dos lunas pequeñas, llamadas Fobos y Deimos.',
      'Los científicos han enviado robots exploradores, llamados rovers, para que recorran Marte.',
    ],
  },
  jupiter: {
    about:
      'Júpiter es el planeta más grande de nuestro sistema solar. Es una bola gigante de gas con rayas de colores y una tormenta enorme llamada la Gran Mancha Roja.',
    facts: [
      'Júpiter es tan grande que dentro de él cabrían más de mil Tierras.',
      'Gira más rápido que cualquier otro planeta, así que allí un día dura solo unas 10 horas.',
      'Su luna Ganimedes es la más grande de nuestro sistema solar, incluso más grande que el planeta Mercurio.',
    ],
  },
  saturn: {
    about:
      'Saturno es el sexto planeta desde el Sol y el segundo más grande. Es una bola gigante de gas, famosa por sus preciosos anillos.',
    facts: [
      '¡Saturno es tan ligero para su tamaño que podría flotar en una bañera gigante llena de agua!',
      'Sus anillos están hechos de hielo y roca, desde motitas diminutas hasta trozos tan grandes como una casa.',
      'Saturno tiene más lunas que cualquier otro planeta, y ya se han encontrado cientos.',
    ],
  },
  uranus: {
    about:
      'Urano es el séptimo planeta desde el Sol. Es un gigante helado de color verde azulado que está inclinado de lado, como una pelota que rueda alrededor del Sol.',
    facts: [
      'Como está tan inclinado, cada estación en Urano dura unos 21 años.',
      'Un gas llamado metano le da a Urano su color verde azulado.',
      'Urano fue el primer planeta descubierto mirando por un telescopio.',
    ],
  },
  neptune: {
    about:
      'Neptuno es el octavo planeta y el más lejano del Sol. Es un gigante azul y frío, con los vientos más rápidos de todos los planetas.',
    facts: [
      'Neptuno tarda unos 165 años en dar una sola vuelta alrededor del Sol.',
      'Neptuno fue el primer planeta que se descubrió usando las matemáticas, y no solo mirando el cielo.',
      'Solo una nave espacial, llamada Voyager 2, ha visitado Neptuno.',
    ],
  },
  pluto: {
    about:
      'Plutón es un planeta enano que está muy lejos, más allá de Neptuno. Es un mundo pequeño y helado, más pequeño incluso que nuestra Luna.',
    facts: [
      '¡Plutón tiene una mancha grande y brillante con forma de corazón!',
      'El nombre de Plutón lo eligió una niña inglesa de 11 años llamada Venetia.',
      'Antes, a Plutón lo llamaban el noveno planeta, pero ahora los científicos dicen que es un planeta enano.',
    ],
  },
  moon: {
    about:
      'La Luna es la vecina más cercana de la Tierra en el espacio, y viaja alrededor de nuestro planeta. Brilla porque la luz del Sol rebota en ella.',
    facts: [
      'En 1969, Neil Armstrong fue la primera persona que caminó sobre la Luna.',
      'Como no hay viento ni lluvia que las borren, las huellas en la Luna pueden durar muchísimo tiempo.',
      'Parece que la Luna cambia de forma, pero lo que pasa es que vemos un trozo más grande o más pequeño de su lado iluminado por el Sol.',
    ],
  },
  rocket: {
    about:
      'El cohete es una máquina muy potente que lleva a los astronautas y a las naves espaciales hasta el espacio. Sube a toda velocidad empujando gas caliente hacia abajo por sus motores.',
    facts: [
      'De camino al espacio, un cohete grande puede ir muchas veces más rápido que un avión a reacción.',
      'Los cohetes llevan su propio oxígeno, así que sus motores siguen funcionando en el espacio, donde no hay aire.',
      'Los cohetes grandes se construyen por partes, llamadas etapas, que se sueltan cuando se les acaba el combustible.',
    ],
  },
  astronaut: {
    about:
      'Un astronauta es una persona que viaja al espacio. Muchos astronautas viven y trabajan durante meses en una estación espacial, muy por encima de la Tierra.',
    facts: [
      '¡En el espacio, los astronautas crecen un poquito, y luego vuelven a encogerse cuando regresan a la Tierra!',
      'En una estación espacial, los astronautas duermen en sacos de dormir sujetos a la pared, para no salir flotando.',
      'Desde una estación espacial, los astronautas pueden ver unos 16 amaneceres y 16 atardeceres cada día.',
    ],
  },
  ufo: {
    about:
      'OVNI son las iniciales de objeto volador no identificado, es decir, algo en el cielo que nadie ha podido explicar todavía. En los cuentos, suelen ser platillos voladores con extraterrestres simpáticos dentro.',
    facts: [
      'Nadie ha encontrado nunca un platillo volador de verdad, pero los científicos están escuchando por si llegan señales del espacio.',
      'Casi todos los ovnis acaban siendo aviones, globos, pájaros o incluso el brillante planeta Venus.',
      'Los científicos han descubierto miles de planetas alrededor de otras estrellas, y buscan señales de vida.',
    ],
  },
  comet: {
    about:
      'Un cometa es como una bola de nieve gigante y sucia, hecha de hielo, polvo y roca. Cuando se acerca al Sol, le crece una cola larga y brillante.',
    facts: [
      'La cola de un cometa puede estirarse millones de kilómetros por el espacio.',
      'Su cola siempre apunta en dirección contraria al Sol, incluso cuando el cometa se aleja de él.',
      'El cometa Halley vuelve más o menos cada 76 años, y su próxima visita será en 2061.',
    ],
  },
};

export default info;
