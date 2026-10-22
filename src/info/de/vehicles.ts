import type { InfoPack } from '../types';

const info: InfoPack = {
  'police-car': {
    about:
      'Das Polizeiauto ist ein besonderes Auto, mit dem die Polizei unterwegs ist, damit alle sicher sind. Mit Blinklicht und lauter Sirene sagt es den anderen Autofahrern: Bitte Platz machen.',
    facts: [
      'Manche Polizisten fahren sogar superschnelle Sportwagen!',
      'Polizeiautos sehen überall auf der Welt anders aus: Manche sind schwarz und weiß, andere haben blaue und gelbe Karos.',
      'Über ein Funkgerät im Auto können die Polizisten miteinander sprechen und erfahren, wo Hilfe gebraucht wird.',
    ],
  },
  ambulance: {
    about:
      'Der Krankenwagen bringt Menschen, die einen Arzt brauchen, ganz schnell ins Krankenhaus. Innen ist er wie ein kleines Krankenhaus auf Rädern.',
    facts: [
      'Vorne auf vielen Krankenwagen steht ein Wort in Spiegelschrift, damit die Autofahrer davor es in ihrem Rückspiegel richtig herum lesen können.',
      'Die Helfer im Krankenwagen, die man oft Sanitäter nennt, fahren den Wagen und kümmern sich unterwegs um die Kranken.',
      'Es gibt sogar fliegende Krankenwagen: Rettungshubschrauber und Rettungsflugzeuge bringen Hilfe zu Menschen, die weit weg sind.',
    ],
  },
  'fire-truck': {
    about:
      'Das Feuerwehrauto bringt die Feuerwehrleute zum Einsatz, die Feuer löschen und Menschen helfen. Es ist vollgepackt mit Leitern, langen Schläuchen und praktischem Werkzeug.',
    facts: [
      'Eine starke Pumpe drückt das Wasser so kräftig durch die Schläuche, dass es höher als ein Haus spritzen kann.',
      'Viele Feuerwehrautos haben eine lange Leiter, die immer länger und länger ausfährt, bis hinauf zu hohen Fenstern.',
      'Früher zogen Pferde die Feuerwehrwagen durch die Straßen.',
    ],
  },
  'school-bus': {
    about:
      'Der Schulbus bringt Kinder morgens zur Schule und fährt sie danach wieder nach Hause. Unterwegs sammelt der Busfahrer die Kinder an den Haltestellen ein.',
    facts: [
      'In Amerika und Kanada sind Schulbusse knallgelb, damit alle sie gut sehen können.',
      'Diese gelben Busse haben ein kleines Stoppschild, das zur Seite ausklappt, damit die Autos warten, während die Kinder ein- und aussteigen.',
      'Ein großer Schulbus kann etwa 70 Kinder mitnehmen.',
    ],
  },
  taxi: {
    about:
      'Das Taxi ist ein Auto mit einem Fahrer, der die Leute genau dorthin bringt, wo sie hinwollen. Am Ende bezahlen die Fahrgäste für die Fahrt.',
    facts: [
      'Wer in London eines der schwarzen Taxis fahren will, muss Tausende Straßen auswendig lernen, für eine Prüfung, die „das Wissen“ heißt.',
      'Das Wort Taxi kommt von Taxameter, einem kleinen Gerät, das ausrechnet, wie viel jede Fahrt kostet.',
      'In New York sind die berühmten Taxis knallgelb, damit man sie leicht entdeckt.',
    ],
  },
  'garbage-truck': {
    about:
      'Das Müllauto und seine Mannschaft fahren von Straße zu Straße, leeren die Mülltonnen und bringen den Müll weg. So helfen sie, unsere Städte sauber und ordentlich zu halten.',
    facts: [
      'Eine Maschine im Inneren presst den Müll platt, so passt noch viel, viel mehr hinein.',
      'Manche Müllautos holen Flaschen, Dosen und Papier ab, damit daraus neue Dinge gemacht werden können.',
      'Ein Müllauto kann an einem einzigen Tag die Tonnen von Hunderten Häusern leeren.',
    ],
  },
  tractor: {
    about:
      'Der Traktor ist eine starke Maschine auf dem Bauernhof, die schwere Sachen zieht, zum Beispiel Anhänger und Pflüge. Bauern brauchen Traktoren, um das Essen anzubauen, das auf unseren Tellern landet.',
    facts: [
      'Manche Traktoren können von selbst lenken, mit Signalen von Satelliten hoch oben im Weltall.',
      'Viele Traktoren haben riesige Hinterräder mit tiefem, grobem Profil, das sich im weichen, matschigen Boden festkrallt.',
      'Die allerersten Traktoren fuhren mit Dampf, genau wie alte Dampfloks.',
    ],
  },
  digger: {
    about:
      'Der Bagger ist eine große Maschine mit einem langen Arm und einer großen Schaufel. Er gräbt Löcher für neue Häuser, Straßen und Rohre.',
    facts: [
      'Das Oberteil des Baggers, in dem der Fahrer sitzt, kann sich einmal ganz im Kreis drehen.',
      'Der Arm eines Baggers wird von Öl bewegt, das durch Schläuche gepresst wird, so kann er sogar schwere Felsbrocken heben.',
      'Viele Bagger fahren auf Ketten statt auf Rädern, damit sie nicht im weichen Matsch einsinken.',
    ],
  },
  'dump-truck': {
    about:
      'Der Kipplaster transportiert schwere Ladungen wie Sand, Erde und Steine. Wenn er ankommt, kippt die Ladefläche nach oben, und die ganze Ladung rutscht heraus.',
    facts: [
      'Die größten Kipplaster haben Räder, die höher sind als ein Erwachsener, und der Fahrer steigt über eine Treppe ein!',
      'Kipplaster arbeiten oft mit Baggern zusammen: Der Bagger belädt den Laster, und der Laster fährt die Ladung weg.',
      'Kipplaster heißen auch Kipper, weil sie ihre Ladung auskippen.',
    ],
  },
  train: {
    about:
      'Der Zug ist eine Reihe von Wagen, die auf Schienen rollen, oft gezogen von einer Lokomotive, kurz Lok. Ein einziger Zug kann Hunderte Menschen auf einmal mitnehmen.',
    facts: [
      'Dampfloks erhitzen Wasser, bis daraus Dampf wird, und der Dampf dreht die Räder und pufft aus dem Schornstein.',
      'Die schnellsten Züge von heute flitzen mit mehr als 300 Kilometern pro Stunde dahin.',
      'Die ersten Dampfzüge wurden vor mehr als 200 Jahren in Großbritannien gebaut.',
    ],
  },
  airplane: {
    about:
      'Das Flugzeug ist eine Flugmaschine mit Flügeln, die Menschen hoch oben am Himmel von Ort zu Ort bringt. Der Pilot fliegt es vom Cockpit aus, ganz vorne.',
    facts: [
      'Große Passagierflugzeuge fliegen etwa 10 Kilometer hoch, höher als der höchste Berg der Erde.',
      'Ein wirbelnder Propeller oder ein Düsentriebwerk treibt das Flugzeug an, und die Luft, die an den Flügeln vorbeisaust, hebt es hoch.',
      'Den allerersten Flug mit einem Motorflugzeug machten die Brüder Wright im Jahr 1903, und er dauerte nur 12 Sekunden.',
    ],
  },
  helicopter: {
    about:
      'Der Hubschrauber ist eine Flugmaschine mit langen Rotorblättern auf dem Dach, die sich im Kreis drehen. Er kann senkrecht nach oben fliegen, in der Luft stehen bleiben und sogar rückwärts fliegen.',
    facts: [
      'Bei den meisten Hubschraubern sorgt ein kleiner Propeller hinten am Heck dafür, dass sich der Hubschrauber nicht immerzu im Kreis dreht.',
      'Hubschrauber können auf kleinen Flächen landen, und so kommen sie auch zu Menschen auf Bergen, Inseln und Schiffen.',
      'Schon vor mehr als 500 Jahren zeichnete der Künstler Leonardo da Vinci eine Flugmaschine, die ein bisschen wie ein Hubschrauber aussah.',
    ],
  },
  motorbike: {
    about:
      'Das Motorrad ist ein Rad mit Motor, deshalb muss der Fahrer nicht strampeln. Motorradfahrer tragen einen festen Helm, der ihren Kopf schützt.',
    facts: [
      'Rennfahrer legen sich in den Kurven so schräg, dass besondere Polster an ihren Knien über den Boden schleifen.',
      'Um schneller zu fahren, dreht der Fahrer am rechten Griff des Lenkers.',
      'Eines der ersten Motorräder wurde vor etwa 140 Jahren in Deutschland gebaut, und es hatte Räder und einen Rahmen aus Holz.',
    ],
  },
  bicycle: {
    about:
      'Das Fahrrad ist ein Fahrzeug mit zwei Rädern, und du fährst damit, indem du in die Pedale trittst. Deine Beine sind sein Motor, deshalb braucht es nie Benzin.',
    facts: [
      'Die allerersten Fahrräder hatten keine Pedale, deshalb stießen sich die Fahrer mit den Füßen ab, genau wie auf einem Laufrad.',
      'Wenn du in die Pedale trittst, dreht eine Kette das Hinterrad, und los geht’s.',
      'In den Niederlanden gibt es mehr Fahrräder als Menschen!',
    ],
  },
  boat: {
    about:
      'Dieses Boot ist ein Schlepper, klein, aber bärenstark. Er hilft großen Schiffen, in belebte Häfen hinein- und wieder hinauszufahren.',
    facts: [
      'Schlepper sind so stark, dass sie Schiffe schieben und ziehen können, die viele Male größer sind als sie selbst.',
      'Schlepper haben oft alte Reifen oder dickes Gummi an den Seiten, die wie weiche Puffer wirken.',
      'Der Kapitän steuert den Schlepper aus dem Steuerhaus, einem Raum hoch oben mit Fenstern ringsherum.',
    ],
  },
};

export default info;
