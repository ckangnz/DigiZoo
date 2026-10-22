import type { InfoPack } from '../types';

const info: InfoPack = {
  koala: {
    about:
      'Der Koala ist ein pelziges Tier aus Australien, das hoch oben in Eukalyptusbäumen lebt. Manche nennen ihn Koalabär, aber er ist gar kein Bär.',
    facts: [
      'Ein Koalababy, das man Joey nennt, ist bei der Geburt so klein wie ein Gummibärchen und wächst im Beutel seiner Mama.',
      'Koalas haben Fingerabdrücke, die deinen sehr ähnlich sehen.',
      'Koalas schlafen etwa 18 Stunden am Tag oder sogar noch länger, hoch oben in ihren Bäumen.',
    ],
  },
  kangaroo: {
    about:
      'Das Känguru ist ein großes, hüpfendes Tier aus Australien mit kräftigen Hinterbeinen und einem langen Schwanz. Eine Kängurumama trägt ihr Baby, das man Joey nennt, in ihrem Beutel.',
    facts: [
      'Ein Rotes Riesenkänguru kann mit einem einzigen Sprung etwa 8 Meter weit hüpfen.',
      'Wenn es sich langsam bewegt, benutzt ein Känguru seinen kräftigen Schwanz wie ein fünftes Bein.',
      'In Australien nennt man eine Gruppe von Kängurus einen Mob.',
    ],
  },
  kiwi: {
    about:
      'Der Kiwi ist ein flauschiger Vogel aus Neuseeland, der nicht fliegen kann und ungefähr so groß ist wie ein Huhn. Die Menschen in Neuseeland werden oft Kiwis genannt, nach diesem Vogel.',
    facts: [
      'Der Kiwi ist der einzige Vogel mit Nasenlöchern an der Schnabelspitze, perfekt, um Würmer zu erschnüffeln.',
      'Ein Kiwi ist nachts unterwegs und hat Schnurrhaare wie eine Katze, mit denen er sich vorantastet.',
      'Für ihre Größe legt eine Kiwimama eines der größten Eier aller Vögel auf der Welt.',
    ],
  },
  kakapo: {
    about:
      'Der Kakapo ist ein großer, grüner Papagei aus Neuseeland, der nicht fliegen kann. Er ist der schwerste Papagei der Welt und hat ein Gesicht, das ein bisschen an eine Eule erinnert.',
    facts: [
      'Kakapos sind tolle Kletterer und benutzen ihre Flügel wie einen Fallschirm, um von den Bäumen herunterzuschweben.',
      'Kakapo bedeutet in der Sprache der Māori Nachtpapagei, denn dieser Papagei ist nachts unterwegs.',
      'Freundliche Menschen kümmern sich um jeden einzelnen Kakapo, und die meisten Kakapos haben sogar einen eigenen Namen.',
    ],
  },
  weta: {
    about:
      'Wetas sind große, kräftige Insekten aus Neuseeland und sehen ein bisschen aus wie riesige Grillen. Die größten Arten heißen Riesenwetas und gehören zu den schwersten Insekten der Welt.',
    facts: [
      'Wetas haben ihre Ohren an den Vorderbeinen, direkt unter den Knien.',
      'Um sich zu schützen, heben Wetas ihre stacheligen Hinterbeine hoch und machen ein kratzendes Geräusch.',
      'Wetas haben keine Flügel und kommen nachts heraus, um Futter zu suchen.',
    ],
  },
  platypus: {
    about:
      'Das Schnabeltier ist ein pelziges Tier aus Australien, mit einem Schnabel wie eine Ente und einem flachen Schwanz wie ein Biber. Es ist ein Säugetier, aber es legt Eier.',
    facts: [
      'Unter Wasser schließt das Schnabeltier Augen, Ohren und Nase und findet sein Futter, indem es mit seinem erstaunlichen Schnabel tastet.',
      'Eine Schnabeltiermama legt ihre Eier in einer Erdhöhle, und ihre Babys lecken Milch von ihrem pelzigen Bauch.',
      'Ein Schnabeltier speichert Fett in seinem flachen Schwanz, wie ein Pausenbrot für später.',
    ],
  },
  wombat: {
    about:
      'Der Wombat ist ein stämmiges, pelziges Tier aus Australien mit kurzen, kräftigen Beinen. Er ist ein Meister im Graben und lebt in Höhlen unter der Erde.',
    facts: [
      'Wombats machen Häufchen, die aussehen wie kleine Würfel, und von keinem anderen Tier kennt man so etwas!',
      'Der Beutel einer Wombatmama öffnet sich nach hinten zu den Hinterbeinen, damit beim Graben keine Erde hineinfällt.',
      'Ein Wombat hat einen superharten Po, mit dem er den Eingang zu seiner Höhle wie mit einer Tür verschließen kann.',
    ],
  },
  emu: {
    about:
      'Der Emu ist ein sehr großer Vogel aus Australien, der nicht fliegen kann. Nach dem Strauß ist er der zweitgrößte Vogel der Welt.',
    facts: [
      'Der Emupapa brütet die dunkelgrünen Eier etwa acht Wochen lang aus und kümmert sich danach um die Küken.',
      'Auf ihren langen, kräftigen Beinen können Emus etwa 50 Kilometer pro Stunde schnell rennen.',
      'Emus haben zwei Arten von Augenlidern: eines zum Blinzeln und eines, das den Staub abhält.',
    ],
  },
  echidna: {
    about:
      'Der Ameisenigel ist ein stacheliges Tier aus Australien mit einer langen, dünnen Schnauze. Wie das Schnabeltier ist er ein Säugetier, das Eier legt.',
    facts: [
      'Ein Ameisenigelbaby schlüpft aus einem winzigen Ei, das im Beutel seiner Mama liegt.',
      'Ein Ameisenigel hat keine Zähne, deshalb schlürft er Ameisen und Termiten mit seiner langen, klebrigen Zunge auf.',
      'Wenn er sich verstecken will, rollt sich ein Ameisenigel zu einer stacheligen Kugel zusammen oder gräbt sich in die Erde ein.',
    ],
  },
  cockatoo: {
    about:
      'Der Gelbhaubenkakadu ist ein großer, weißer Papagei aus Australien mit einer Haube aus gelben Federn auf dem Kopf. Er ist laut, verspielt und sehr schlau.',
    facts: [
      'Ein Kakadu namens Snowball wurde als Tänzer berühmt: Er nickte zur Musik mit dem Kopf und stampfte im Takt.',
      'Wenn ein Kakadu aufgeregt ist, stellt er seine gelbe Haube auf wie einen Fächer.',
      'Wenn ein Schwarm frisst, halten einige Kakadus von den Bäumen aus Wache und kreischen laut, wenn Gefahr droht.',
    ],
  },
  kookaburra: {
    about:
      'Der Kookaburra ist ein großer, braun und weiß gefiederter Vogel aus Australien. Sein Ruf klingt genau so, als würde jemand laut lachen, deshalb heißt er auch Lachender Hans.',
    facts: [
      'Kookaburras lachen oft früh am Morgen und am Abend, deshalb nennt man sie in Australien auch die Uhr des Buschlands.',
      'Ältere Geschwister bleiben oft zu Hause und helfen ihren Eltern, die neuen Küken zu füttern.',
      'Der Kookaburra ist einer der größten Eisvögel der Welt, und er fängt sein Futter meistens an Land.',
    ],
  },
  tuatara: {
    about:
      'Die Brückenechse ist ein stacheliges Reptil aus Neuseeland. Sie sieht aus wie eine Echse, ist aber trotz ihres Namens keine, und ihre Familie gibt es schon seit der Zeit der Dinosaurier.',
    facts: [
      'Eine Brückenechse hat ein winziges drittes Auge oben auf dem Kopf, das beim Großwerden von Schuppen bedeckt wird.',
      'Ihr Māori-Name Tuatara bedeutet Zacken auf dem Rücken, denn sie hat einen stacheligen Kamm.',
      'Brückenechsen wachsen sehr langsam und können mehr als 100 Jahre alt werden.',
    ],
  },
  quokka: {
    about:
      'Das Quokka ist ein kleines, pelziges Tier aus Australien, ungefähr so groß wie eine Katze. Wegen seines lächelnden Gesichts nennt man es oft das glücklichste Tier der Welt.',
    facts: [
      'Viele Quokkas leben auf der Insel Rottnest, und der Name bedeutet Rattennest, weil ein Entdecker sie für riesige Ratten hielt.',
      'Quokkas sind eine Art kleines Känguru, und sie hüpfen auch genauso herum.',
      'Eine Quokkamama trägt ihr Baby, das man Joey nennt, etwa sechs Monate lang in ihrem Beutel.',
    ],
  },
};

export default info;
