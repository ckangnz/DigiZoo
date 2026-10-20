import type { InfoPack } from '../types';

const info: InfoPack = {
  sun: {
    about:
      'Il Sole è una stella, la stella più vicina alla Terra. È un’enorme palla di gas caldissimo e luminoso che ci dà luce e calore.',
    facts: [
      'Il Sole è così grande che dentro ci starebbero più di un milione di Terre.',
      'La luce del Sole impiega circa 8 minuti per arrivare fino alla Terra.',
      'Le altre stelle sembrano minuscole perché sono molto, molto più lontane del Sole.',
    ],
  },
  mercury: {
    about:
      'Mercurio è il pianeta più piccolo e il più vicino al Sole. È un mondo di roccia pieno di crateri, solo un po’ più grande della nostra Luna.',
    facts: [
      'Mercurio sfreccia intorno al Sole più veloce di tutti gli altri pianeti, così il suo anno dura solo 88 giorni terrestri.',
      'Visto che non ha quasi aria che trattenga il calore, di giorno fa caldissimo e di notte fa un freddo gelido.',
      'Mercurio non ha lune e non ha anelli.',
    ],
  },
  venus: {
    about:
      'Venere è il secondo pianeta dal Sole ed è grande quasi come la Terra. La sua aria densa trattiene il calore come una coperta, e così è il pianeta più caldo.',
    facts: [
      'Venere gira su sé stessa così piano che per fare un giro completo ci mette più tempo che per fare tutto il giro intorno al Sole!',
      'Gira nel verso opposto alla Terra, così su Venere il Sole sorge a ovest.',
      'Venere è il pianeta più luminoso del nostro cielo, e spesso la chiamano stella del mattino o stella della sera.',
    ],
  },
  earth: {
    about:
      'La Terra è la nostra casa, il terzo pianeta dal Sole. È l’unico pianeta che conosciamo dove ci sono esseri viventi, dalle minuscole formiche alle balene giganti.',
    facts: [
      'Gli oceani coprono gran parte della Terra, così dallo spazio sembra una grande biglia blu.',
      'La Terra fa un giro su sé stessa ogni giorno, ed è per questo che ci sono il giorno e la notte.',
      'La Terra impiega un anno intero per fare tutto il giro intorno al Sole.',
    ],
  },
  mars: {
    about:
      'Marte è il quarto pianeta dal Sole. Lo chiamano il Pianeta Rosso, perché il suo terreno è coperto di polvere rossa come la ruggine.',
    facts: [
      'Su Marte c’è il vulcano più alto che conosciamo, Olympus Mons, alto più del doppio del monte Everest!',
      'Marte ha due piccole lune, che si chiamano Fobos e Deimos.',
      'Gli scienziati hanno mandato su Marte dei robot esploratori, chiamati rover, per andarci in giro.',
    ],
  },
  jupiter: {
    about:
      'Giove è il pianeta più grande del nostro Sistema solare. È un’enorme palla di gas con strisce colorate e una gigantesca tempesta chiamata Grande Macchia Rossa.',
    facts: [
      'Giove è così grande che dentro ci starebbero più di mille Terre.',
      'Gira su sé stesso più veloce di tutti gli altri pianeti, così lassù un giorno dura solo 10 ore circa.',
      'La sua luna Ganimede è la luna più grande del Sistema solare, ancora più grande del pianeta Mercurio.',
    ],
  },
  saturn: {
    about:
      'Saturno è il sesto pianeta dal Sole e il secondo più grande. È un pianeta gigante fatto di gas, famoso per i suoi bellissimi anelli.',
    facts: [
      'Saturno è così leggero per la sua grandezza che potrebbe galleggiare in una vasca da bagno gigante piena d’acqua!',
      'I suoi anelli sono fatti di ghiaccio e roccia, da granellini minuscoli a pezzi grandi come una casa.',
      'Saturno ha più lune di qualsiasi altro pianeta: finora ne sono state trovate centinaia.',
    ],
  },
  uranus: {
    about:
      'Urano è il settimo pianeta dal Sole. È un gigante ghiacciato di colore verde azzurro, tutto inclinato su un fianco, come una palla che rotola intorno al Sole.',
    facts: [
      'Siccome è inclinato, su Urano ogni stagione dura circa 21 anni.',
      'È un gas chiamato metano a dare a Urano il suo colore verde azzurro.',
      'Urano è stato il primo pianeta scoperto guardando con un telescopio.',
    ],
  },
  neptune: {
    about:
      'Nettuno è l’ottavo pianeta e il più lontano dal Sole. È un gigante blu e freddo, con i venti più veloci di tutti i pianeti.',
    facts: [
      'Nettuno impiega circa 165 anni per fare un solo giro intorno al Sole.',
      'Nettuno è stato il primo pianeta scoperto grazie alla matematica, e non solo guardando il cielo.',
      'Solo una sonda spaziale, chiamata Voyager 2, è andata a visitare Nettuno.',
    ],
  },
  pluto: {
    about:
      'Plutone è un pianeta nano, lontanissimo, oltre Nettuno. È un piccolo mondo ghiacciato, ancora più piccolo della nostra Luna.',
    facts: [
      'Su Plutone c’è una grande macchia chiara a forma di cuore!',
      'Il nome Plutone lo ha scelto una bambina inglese di 11 anni che si chiamava Venetia.',
      'Un tempo Plutone era chiamato il nono pianeta, ma ora gli scienziati lo chiamano pianeta nano.',
    ],
  },
  moon: {
    about:
      'Nello spazio, la Luna è la vicina di casa della Terra, e gira intorno al nostro pianeta. Brilla perché la luce del Sole rimbalza su di lei.',
    facts: [
      'Nel 1969, Neil Armstrong è stato la prima persona a camminare sulla Luna.',
      'Senza vento né pioggia a cancellarle, le impronte sulla Luna possono restare per tantissimo tempo.',
      'Sembra che la Luna cambi forma, ma in realtà vediamo solo una parte più o meno grande del suo lato illuminato dal Sole.',
    ],
  },
  rocket: {
    about:
      'Il razzo è una macchina potentissima che porta astronauti e veicoli spaziali su, nello spazio. Sfreccia verso l’alto spingendo gas caldissimo fuori dai motori, verso il basso.',
    facts: [
      'Mentre sale verso lo spazio, un grande razzo può andare molte volte più veloce di un aereo a reazione.',
      'I razzi si portano dietro il loro ossigeno, così i motori continuano a funzionare nello spazio, dove non c’è aria.',
      'I grandi razzi sono costruiti a pezzi, chiamati stadi, che si staccano quando hanno finito il carburante.',
    ],
  },
  astronaut: {
    about:
      'L’astronauta è una persona che viaggia nello spazio. Molti astronauti vivono e lavorano per mesi su una stazione spaziale, in alto sopra la Terra.',
    facts: [
      'Nello spazio gli astronauti diventano un po’ più alti, e poi tornano come prima quando rientrano sulla Terra!',
      'Sulla stazione spaziale, gli astronauti dormono in sacchi a pelo attaccati alla parete, così non vanno in giro fluttuando.',
      'Dalla stazione spaziale, gli astronauti possono vedere circa 16 albe e 16 tramonti ogni giorno.',
    ],
  },
  ufo: {
    about:
      'UFO è la sigla inglese che vuol dire oggetto volante non identificato, cioè qualcosa nel cielo che nessuno sa ancora spiegare. Nelle storie, spesso sono dischi volanti con dentro alieni simpatici.',
    facts: [
      'Nessuno ha mai trovato un vero disco volante, ma gli scienziati stanno ascoltando se arrivano segnali dallo spazio.',
      'Quasi sempre gli UFO si rivelano aerei, palloni, uccelli o perfino il luminoso pianeta Venere.',
      'Gli scienziati hanno trovato migliaia di pianeti intorno ad altre stelle, e stanno cercando tracce di vita.',
    ],
  },
  comet: {
    about:
      'La cometa è come una gigantesca palla di neve sporca, fatta di ghiaccio, polvere e roccia. Quando si avvicina al Sole, le spunta una lunga coda luminosa.',
    facts: [
      'La coda di una cometa può allungarsi per milioni di chilometri nello spazio.',
      'La sua coda punta sempre dalla parte opposta al Sole, anche quando la cometa se ne sta allontanando.',
      'La cometa di Halley ritorna circa ogni 76 anni, e la sua prossima visita sarà nel 2061.',
    ],
  },
};

export default info;
