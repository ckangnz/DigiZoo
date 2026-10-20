import type { InfoPack } from '../types';

const info: InfoPack = {
  tiger: {
    about:
      'O tigre é o maior felino do mundo. O pelo laranja com listras escuras o ajuda a se esconder entre as árvores e o capim alto.',
    facts: [
      'Ao contrário de muitos felinos, os tigres adoram água e são ótimos nadadores.',
      'Os tigres têm uma mancha branca atrás de cada orelha.',
      'Os filhotes de tigre ficam com a mãe por uns dois anos, enquanto aprendem a se virar sozinhos.',
    ],
  },
  monkey: {
    about:
      'Os macacos são animais espertos e brincalhões que adoram subir e pular pelas árvores. Existem muitos tipos diferentes, e muitos vivem em florestas quentes e cheias de folhas.',
    facts: [
      'Alguns macacos conseguem se pendurar nos galhos pelo rabo, como se tivessem uma mão a mais.',
      'Os macacos catam o pelo uns dos outros para ficarem limpinhos e para mostrar que são amigos.',
      'A maioria dos macacos tem rabo, mas os grandes símios, como os gorilas e os chimpanzés, não têm.',
    ],
  },
  snake: {
    about:
      'As cobras são répteis compridos, com escamas e sem pernas. Elas deslizam pelo chão fazendo ondas com o corpo flexível.',
    facts: [
      'A cobra cheira o ar pondo para fora e para dentro a sua língua de duas pontas.',
      'Quando a cobra cresce, ela se contorce para sair da pele velha, muitas vezes numa peça só, bem comprida.',
      'As cobras não conseguem piscar, porque não têm pálpebras, e por isso dormem até de olhos abertos.',
    ],
  },
  parrot: {
    about:
      'Os papagaios são aves espertas e coloridas, com um bico forte e curvo. Muitos vivem em bandos barulhentos nas florestas quentes do mundo todo.',
    facts: [
      'Alguns papagaios conseguem aprender a imitar palavras e sons do dia a dia, como um assobio ou a campainha.',
      'Muitos papagaios seguram a comida com um pé, assim como você segura um lanchinho na mão.',
      'Papagaios grandes, como as araras, podem viver mais de 50 anos.',
    ],
  },
  peacock: {
    about:
      'O pavão macho tem penas compridíssimas e brilhantes, azuis e verdes. Ele abre as penas como um leque gigante para se exibir.',
    facts: [
      'As fêmeas se chamam pavoas, e os filhotes, pavõezinhos.',
      'Os pavões sabem voar, e à noite dormem lá no alto das árvores.',
      'O pavão é a ave nacional da Índia.',
    ],
  },
  crocodile: {
    about:
      'O crocodilo é um réptil grande, de pele cheia de escamas e calombos, e um rabo comprido e forte. Ele gosta de ficar deitado ao sol na margem dos rios para se esquentar.',
    facts: [
      'A mamãe crocodilo leva os filhotes até a água com todo o cuidado, dentro da boca.',
      'Quando o crocodilo perde um dente, nasce outro no lugar, várias e várias vezes.',
      'Os crocodilos têm parentes que viveram há muito tempo, na mesma época dos dinossauros.',
    ],
  },
  orangutan: {
    about:
      'O orangotango é um grande primata de pelo comprido, laranja e desgrenhado. Ele passa quase a vida inteira lá no alto das árvores das florestas tropicais da Ásia.',
    facts: [
      'Quando chove, às vezes os orangotangos seguram folhas grandes em cima da cabeça, como se fossem guarda-chuvas.',
      'Na língua malaia, orangotango quer dizer pessoa da floresta.',
      'Toda noite, o orangotango faz um ninho novo de folhas para dormir, lá no alto das árvores.',
    ],
  },
  tapir: {
    about:
      'A anta é um animal tranquilo, com um nariz curto e flexível, como uma trombinha. A anta-malaia parece estar usando uma mantinha branca.',
    facts: [
      'Os filhotes de anta são cheios de listras e pintinhas, e parecem melancias com perninhas!',
      'As antas são primas dos cavalos e dos rinocerontes, mesmo parecendo um pouco com porcos.',
      'Quando a anta nada, ela pode usar o nariz flexível como um tubo de mergulho.',
    ],
  },
  hornbill: {
    about:
      'O calau é uma ave de bico enorme e curvo. O calau-bicorne ainda tem em cima do bico um capacete amarelo bem vivo, chamado casco.',
    facts: [
      'A mamãe calau se fecha dentro do ninho, num buraco de árvore, tampando a entrada, e o papai passa comida para ela por uma frestinha.',
      'Os calaus têm cílios compridos, o que é muito raro para uma ave.',
      'Os calaus ajudam novas árvores a nascer, espalhando as sementes das frutas que comem.',
    ],
  },
  pangolin: {
    about:
      'O pangolim é um bicho tímido, coberto de escamas duras, como uma pinha de pinheiro que anda. Para se proteger, ele se enrola e vira uma bola bem fechada.',
    facts: [
      'O filhote de pangolim passeia montado no rabo da mãe.',
      'Os pangolins são os únicos mamíferos cobertos de escamas.',
      'Os pangolins não têm dentes e comem formigas com uma língua comprida e grudenta.',
    ],
  },
  'red-panda': {
    about:
      'O panda-vermelho é um bichinho peludo, de pelo marrom-avermelhado e rabo comprido e listrado. Ele vive nas florestas das montanhas da Ásia e adora comer bambu.',
    facts: [
      'O panda-vermelho se enrola no rabo grande e fofo, como se fosse um cobertorzinho, para se esquentar.',
      'Os pandas-vermelhos têm um osso especial no pulso que funciona como um polegar e os ajuda a segurar o bambu.',
      'Os pandas-vermelhos não são ursos, e também não são parentes próximos dos pandas-gigantes.',
    ],
  },
  bat: {
    about:
      'Os morcegos são bichos peludos com asas, e são os únicos mamíferos que voam de verdade. A maioria dorme de dia e acorda à noite.',
    facts: [
      'Os morcegos dormem de cabeça para baixo, pendurados e bem agarrados pelos pés.',
      'A asa do morcego é, na verdade, uma mão, com dedos compridos e finos ligados por uma pele elástica.',
      'Muitos morcegos se guiam no escuro soltando guinchos e escutando o eco.',
    ],
  },
  mongoose: {
    about:
      'O mangusto é um bichinho pequeno e ligeiro, de corpo comprido e rabo peludo. Existem muitos tipos, e a maioria vive na África e na Ásia.',
    facts: [
      'Alguns mangustos quebram ovos jogando-os para trás, por entre as pernas, contra uma pedra.',
      'O suricato é um tipo de mangusto, então os dois são primos próximos.',
      'Uma história famosa fala de um mangusto pequeno e corajoso chamado Rikki-Tikki-Tavi.',
    ],
  },
  gibbon: {
    about:
      'O gibão é um primata pequeno, de braços muito compridos. Ele se balança de galho em galho, lá no alto das florestas da Ásia.',
    facts: [
      'Muitos papais e mamães gibões cantam juntos, bem alto, logo cedinho.',
      'Quando o gibão anda no chão, ele levanta os braços compridos para se equilibrar.',
      'Os gibões são símios, por isso, ao contrário da maioria dos macacos, não têm rabo.',
    ],
  },
};

export default info;
