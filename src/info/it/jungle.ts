import type { InfoPack } from '../types';

const info: InfoPack = {
  tiger: {
    about:
      'La tigre è il felino più grande del mondo. Il suo pelo arancione e le strisce scure la aiutano a nascondersi tra gli alberi e l’erba alta.',
    facts: [
      'A differenza di tanti felini, le tigri adorano l’acqua e sono bravissime a nuotare.',
      'Le tigri hanno una macchia bianca dietro ogni orecchio.',
      'I cuccioli di tigre restano con la mamma per circa due anni, mentre imparano a cavarsela da soli.',
    ],
  },
  monkey: {
    about:
      'Le scimmie sono animali intelligenti e giocherelloni che adorano arrampicarsi e saltare da un albero all’altro. Ne esistono tantissimi tipi, e molte vivono in foreste calde e piene di foglie.',
    facts: [
      'Alcune scimmie riescono ad appendersi ai rami con la coda, come se avessero una mano in più.',
      'Le scimmie si puliscono il pelo a vicenda, per stare pulite e per mostrare che sono amiche.',
      'Quasi tutte le scimmie hanno la coda, ma le grandi scimmie come i gorilla e gli scimpanzé no.',
    ],
  },
  snake: {
    about:
      'I serpenti sono rettili lunghi e coperti di squame, senza zampe. Scivolano sul terreno ondeggiando il loro corpo flessuoso.',
    facts: [
      'Il serpente annusa l’aria facendo guizzare dentro e fuori la sua lingua biforcuta.',
      'Quando il serpente cresce, sguscia fuori dalla sua vecchia pelle, spesso tutta in un unico lungo pezzo.',
      'I serpenti non possono sbattere le palpebre perché non le hanno, quindi dormono perfino a occhi aperti.',
    ],
  },
  parrot: {
    about:
      'I pappagalli sono uccelli intelligenti e coloratissimi, con un becco forte e ricurvo. Molti vivono in stormi chiassosi nelle foreste calde di tutto il mondo.',
    facts: [
      'Alcuni pappagalli imparano a ripetere parole e suoni di tutti i giorni, come un fischio o il campanello di casa.',
      'Molti pappagalli tengono il cibo con una zampa, proprio come tu tieni la merenda in mano.',
      'I pappagalli grandi, come le are, possono vivere più di 50 anni.',
    ],
  },
  peacock: {
    about:
      'Il pavone maschio ha lunghe piume luccicanti, blu e verdi. Per farsi ammirare, le apre come un enorme ventaglio e fa la ruota.',
    facts: [
      'La femmina del pavone si chiama pavona, e i suoi piccoli si chiamano pulcini.',
      'I pavoni sanno volare, e di notte dormono in alto sugli alberi.',
      'Il pavone è l’uccello nazionale dell’India.',
    ],
  },
  crocodile: {
    about:
      'Il coccodrillo è un grande rettile con la pelle squamosa e bitorzoluta e una coda lunga e forte. Gli piace stare sdraiato al sole sulle rive dei fiumi per scaldarsi.',
    facts: [
      'La mamma coccodrillo porta delicatamente i suoi piccoli fino all’acqua, tenendoli in bocca.',
      'Quando il coccodrillo perde un dente, al suo posto ne spunta uno nuovo, ancora e ancora.',
      'I coccodrilli hanno dei parenti che vivevano tanto tempo fa, nella stessa epoca dei dinosauri.',
    ],
  },
  orangutan: {
    about:
      'L’orango è una grande scimmia dal pelo lungo, arruffato e arancione. Passa quasi tutta la vita in alto, sugli alberi delle foreste tropicali dell’Asia.',
    facts: [
      'Quando piove, gli oranghi a volte si tengono sopra la testa delle grandi foglie, come ombrelli.',
      'In lingua malese, il suo nome, orangutan, significa persona della foresta.',
      'Ogni sera, l’orango si costruisce un nuovo nido di foglie per dormire, in alto sugli alberi.',
    ],
  },
  tapir: {
    about:
      'Il tapiro è un animale mite con un naso corto e flessibile, come una piccola proboscide. Il tapiro malese sembra che abbia addosso una coperta bianca.',
    facts: [
      'I cuccioli di tapiro sono tutti strisce e puntini, e sembrano piccole angurie con le zampe!',
      'I tapiri sono cugini dei cavalli e dei rinoceronti, anche se assomigliano un po’ ai maiali.',
      'Quando nuota, il tapiro può usare il suo naso flessibile come un boccaglio.',
    ],
  },
  hornbill: {
    about:
      'Il bucero è un uccello con un becco enorme e ricurvo. Il bucero bicorne ha anche un elmo giallo brillante sopra il becco, chiamato casco.',
    facts: [
      'La mamma bucero si mura dentro il suo nido, nel buco di un albero, e il papà le passa il cibo attraverso una piccola fessura.',
      'I buceri hanno lunghe ciglia, cosa molto rara per un uccello.',
      'I buceri aiutano a far crescere nuovi alberi spargendo i semi dei frutti che mangiano.',
    ],
  },
  pangolin: {
    about:
      'Il pangolino è un animale timido, coperto di squame dure, come una pigna che cammina. Per stare al sicuro, sa chiudersi a palla, stretto stretto.',
    facts: [
      'Il cucciolo di pangolino si fa portare in giro sulla coda della mamma.',
      'I pangolini sono gli unici mammiferi coperti di squame.',
      'I pangolini non hanno denti, e si pappano le formiche con una lingua lunga e appiccicosa.',
    ],
  },
  'red-panda': {
    about:
      'Il panda rosso è un animale peloso, di colore bruno rossiccio, con una lunga coda a strisce. Vive nelle foreste di montagna dell’Asia e adora mangiare il bambù.',
    facts: [
      'Per scaldarsi, il panda rosso si avvolge nella sua coda grande e soffice, come in una copertina.',
      'I panda rossi hanno uno speciale osso del polso che funziona come un pollice e li aiuta a tenere il bambù.',
      'I panda rossi non sono orsi, e non sono nemmeno cugini stretti dei panda giganti.',
    ],
  },
  bat: {
    about:
      'I pipistrelli sono animali pelosi con le ali, e sono gli unici mammiferi che sanno volare davvero. Quasi tutti i pipistrelli dormono di giorno e si svegliano di notte.',
    facts: [
      'I pipistrelli dormono a testa in giù, appesi ben stretti con le zampe.',
      'L’ala del pipistrello in realtà è una mano, con dita lunghe e sottili unite da una pelle elastica.',
      'Molti pipistrelli trovano la strada al buio emettendo dei piccoli squittii e ascoltandone l’eco.',
    ],
  },
  mongoose: {
    about:
      'La mangusta è un animaletto svelto, con il corpo lungo e la coda folta. Ne esistono tanti tipi, e quasi tutti vivono in Africa e in Asia.',
    facts: [
      'Alcune manguste rompono le uova lanciandole all’indietro, tra le zampe, contro un sasso.',
      'Il suricato è un tipo di mangusta, quindi i due sono cugini stretti.',
      'Una storia famosa racconta di una piccola mangusta coraggiosa di nome Rikki-Tikki-Tavi.',
    ],
  },
  gibbon: {
    about:
      'Il gibbone è una piccola scimmia con le braccia lunghissime. Si sposta di ramo in ramo dondolandosi, in alto nelle foreste dell’Asia.',
    facts: [
      'Tanti genitori gibbone cantano insieme a squarciagola al mattino presto.',
      'Quando cammina per terra, il gibbone tiene le lunghe braccia alzate per stare in equilibrio.',
      'I gibboni sono scimmie antropomorfe, quindi, a differenza della maggior parte delle scimmie, non hanno la coda.',
    ],
  },
};

export default info;
