import type { InfoPack } from '../types';

const info: InfoPack = {
  cow: {
    about:
      'A vaca é um animal da fazenda grande e calmo que nos dá leite. As vacas gostam de ficar juntas, num grupo chamado rebanho.',
    facts: [
      'O focinho de cada vaca tem o seu próprio desenho de bolinhas e linhas, igualzinho às suas impressões digitais.',
      'As vacas mastigam a comida duas vezes: o capim volta da barriga para a boca, e elas mastigam de novo.',
      'O filhote da vaca se chama bezerro, e ele já consegue andar no mesmo dia em que nasce.',
    ],
  },
  pig: {
    about:
      'O porco é um animal da fazenda muito esperto, com um nariz redondo chamado focinho. Os porcos adoram rolar na lama, que os refresca nos dias quentes.',
    facts: [
      'Os porcos são muito espertos e conseguem aprender truques, igualzinho aos cachorros.',
      'O focinho do porco é ótimo para farejar comida escondida debaixo da terra.',
      'A mamãe porca grunhe baixinho para chamar os porquinhos quando é hora de mamar.',
    ],
  },
  sheep: {
    about:
      'A ovelha é um animal da fazenda calmo, com um casaco de lã macia. As ovelhas ficam bem juntinhas num grupo chamado rebanho.',
    facts: [
      'O filhote da ovelha se chama cordeiro, e ele reconhece a mãe pelo balido dela.',
      'As ovelhas conseguem lembrar a cara de 50 outras ovelhas por uns dois anos.',
      'Mais ou menos uma vez por ano, as ovelhas cortam o cabelo, e a lã delas vira coisas como meias e gorros.',
    ],
  },
  horse: {
    about:
      'O cavalo é um animal forte e veloz, com crina e rabo compridos e soltos. As pessoas andam a cavalo há milhares de anos.',
    facts: [
      'Os cavalos conseguem cochilar em pé, porque as pernas deles podem travar no lugar.',
      'O filhote do cavalo se chama potro, e ele consegue ficar de pé mais ou menos uma hora depois de nascer.',
      'Os olhos do cavalo ficam dos lados da cabeça, então ele consegue ver quase tudo à sua volta.',
    ],
  },
  chicken: {
    about:
      'A galinha é uma ave da fazenda muito simpática que bota ovos. Os filhotes dela, fofinhos, se chamam pintinhos.',
    facts: [
      'Os pintinhos já conseguem piar para a mãe quando ainda estão dentro do ovo.',
      'Existem mais galinhas no mundo do que qualquer outro tipo de ave.',
      'Uma galinha pode botar até mais ou menos um ovo por dia.',
    ],
  },
  duck: {
    about:
      'O pato é uma ave aquática de pés achatados, com membranas entre os dedos, que funcionam como remos. As penas dele são à prova d’água, então ele fica sequinho enquanto nada.',
    facts: [
      'O quá-quá alto que você ouve vem quase sempre das fêmeas, e os machos têm uma voz mais baixinha e rouca.',
      'Os patos conseguem dormir com um olho aberto, para ficar de vigia.',
      'Os filhotes de pato, os patinhos, sabem nadar logo depois de sair do ovo.',
    ],
  },
  goat: {
    about:
      'A cabra é um animal da fazenda animado e curioso, que adora explorar. Muitas cabras têm uma barbichinha no queixo.',
    facts: [
      'Em inglês, o filhote da cabra se chama kid, a mesma palavra que eles usam para criança!',
      'As cabras são ótimas escaladoras, e algumas até sobem em árvores para mordiscar as folhas.',
      'A parte escura no meio do olho da cabra tem o formato de um retângulo deitado.',
    ],
  },
  dog: {
    about:
      'O cachorro é um animal fiel e carinhoso, e um dos amigos mais antigos das pessoas. Nas fazendas, os cachorros ajudam a juntar as ovelhas e as vacas.',
    facts: [
      'O faro do cachorro é tão bom que ele sente cheiros que a gente nem percebe.',
      'Os filhotes nascem de olhos fechados e só os abrem com umas duas semanas de vida.',
      'Os cachorros se refrescam ofegando, e suam um pouquinho pelas patas.',
    ],
  },
  cat: {
    about:
      'O gato é um animal macio e curioso, de bigodes compridos e corpo bem flexível. Os gatos costumam ronronar quando estão felizes e confortáveis.',
    facts: [
      'Os gatos podem dormir de 12 a 16 horas por dia.',
      'A língua do gato é áspera como uma lixa, e isso o ajuda a escovar o pelo e deixá-lo limpinho.',
      'Os gatos enxergam com pouca luz muito melhor do que as pessoas.',
    ],
  },
  rooster: {
    about:
      'O galo é o macho adulto da galinha, com uma coroa vermelha chamada crista. Ele é famoso pelo seu cocoricó bem alto.',
    facts: [
      'Quando o galo encontra um petisco gostoso, ele chama as galinhas para dividir.',
      'Os galos cantam de manhã, mas também podem cantar a qualquer hora do dia.',
      'As pelinhas vermelhas penduradas embaixo do bico do galo se chamam barbelas.',
    ],
  },
  turkey: {
    about:
      'O peru é uma ave grande que veio da América do Norte. Para se exibir, o peru estufa as penas e abre o rabo como um leque.',
    facts: [
      'A cabeça do peru macho pode ficar vermelha, branca ou azul quando ele fica empolgado.',
      'O famoso glu-glu é feito pelos perus machos, e dá para ouvir de bem longe.',
      'Os perus selvagens conseguem voar distâncias curtas, e à noite dormem em cima das árvores.',
    ],
  },
  goose: {
    about:
      'O ganso é uma ave aquática grande, de pescoço comprido e grasnado bem alto. Os gansos são bons vigias e fazem barulho quando chegam estranhos.',
    facts: [
      'Os gansos selvagens voam juntos em forma de V, o que os ajuda a economizar energia nas viagens longas.',
      'Os filhotes de ganso, os gansinhos, seguem os pais para todo lado.',
      'Muitas vezes, os gansos ficam com o mesmo par a vida inteira.',
    ],
  },
  donkey: {
    about:
      'O burro é um primo forte e tranquilo do cavalo, com orelhas compridas e macias. Os burros chamam uns aos outros com um zurro bem alto.',
    facts: [
      'Os burros fazem amizades bem fortes e ficam mais felizes quando têm um amigo por perto.',
      'As orelhas grandes do burro o ajudam a ouvir sons distantes e a se refrescar nos dias quentes.',
      'O pelo fofinho do burro não é à prova d’água, então ele gosta de um abrigo seco quando chove.',
    ],
  },
  rabbit: {
    about:
      'O coelho é um bichinho macio e fofinho, de orelhas compridas e um narizinho que não para de se mexer. Os coelhos pulam com as fortes pernas de trás.',
    facts: [
      'Quando o coelho está muito feliz, ele pode pular e se torcer no ar, e isso se chama binky.',
      'Os dentes da frente do coelho nunca param de crescer, então ele os mantém curtinhos mastigando bastante feno.',
      'Os coelhos selvagens vivem juntos em grandes tocas debaixo da terra.',
    ],
  },
  alpaca: {
    about:
      'A alpaca é um animal calmo e fofinho das montanhas da América do Sul. A lã macia e quentinha dela vira roupas bem aconchegantes.',
    facts: [
      'As alpacas cantarolam baixinho para conversar entre si.',
      'As alpacas são primas dos camelos, mas não têm corcova.',
      'O filhote da alpaca se chama cria, e quase sempre nasce durante o dia.',
    ],
  },
  mouse: {
    about:
      'O ratinho é um bichinho pequenininho e ligeiro, de orelhas redondas e rabo comprido. Os ratinhos usam os bigodes para se guiar no escuro.',
    facts: [
      'Os ratinhos cantam musiquinhas uns para os outros, mas elas são tão agudas que os nossos ouvidos não conseguem escutar.',
      'Um ratinho consegue passar por um buraco mais ou menos da largura de um lápis.',
      'Os ratinhos fazem ninhos aconchegantes com coisas macias, como capim, fiapos e papel.',
    ],
  },
  bee: {
    about:
      'A abelha é um inseto zumbidor e trabalhador, com listras peludinhas. As abelhas levam o pozinho das flores, chamado pólen, de flor em flor, e assim ajudam as plantas a dar frutos e sementes.',
    facts: [
      'As abelhas fazem uma dancinha requebrada para contar às amigas onde encontrar flores.',
      'A abelha tem cinco olhos: dois grandes e três pequenininhos no alto da cabeça.',
      'As abelhas fazem mel com um suco docinho das flores chamado néctar.',
    ],
  },
};

export default info;
