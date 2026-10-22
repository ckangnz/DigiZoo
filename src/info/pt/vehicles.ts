import type { InfoPack } from '../types';

const info: InfoPack = {
  'police-car': {
    about:
      'O carro de polícia é um carro especial que os policiais dirigem para ajudar a proteger todo mundo. As luzes piscando e a sirene alta avisam os outros motoristas para abrir caminho.',
    facts: [
      'Algumas equipes de polícia têm até carros esportivos super-rápidos!',
      'Os carros de polícia mudam muito de um país para outro: alguns são pretos e brancos, e outros têm quadrados azuis e amarelos.',
      'Um rádio no carro deixa os policiais conversarem entre si e descobrirem onde estão precisando de ajuda.',
    ],
  },
  ambulance: {
    about:
      'A ambulância leva bem depressa ao hospital as pessoas que precisam de médico. Por dentro, ela é como um hospitalzinho sobre rodas.',
    facts: [
      'Muitas vezes, a palavra ambulância vem escrita ao contrário na frente, para os motoristas que estão adiante conseguirem ler pelo espelho.',
      'Os ajudantes da ambulância, muitas vezes chamados de socorristas, dirigem e cuidam das pessoas no caminho.',
      'Algumas ambulâncias voam: as ambulâncias aéreas são helicópteros ou aviões que chegam até pessoas que estão bem longe.',
    ],
  },
  'fire-truck': {
    about:
      'O caminhão de bombeiros leva os bombeiros, que apagam incêndios e ajudam as pessoas. Ele vem cheio de escadas, mangueiras compridas e ferramentas úteis.',
    facts: [
      'Uma bomba forte empurra a água pelas mangueiras com tanta força que o jato pode subir mais alto que uma casa.',
      'Muitos caminhões de bombeiros têm uma escada comprida que vai esticando, esticando, até alcançar as janelas lá no alto.',
      'Há muito tempo, os carros de bombeiros eram puxados por cavalos pelas ruas.',
    ],
  },
  'school-bus': {
    about:
      'O ônibus escolar leva as crianças para a escola de manhã e depois as traz de volta para casa. O motorista vai pegando as crianças nos pontos de ônibus pelo caminho.',
    facts: [
      'Nos Estados Unidos e no Canadá, os ônibus escolares são pintados de amarelo bem forte, para todo mundo conseguir ver.',
      'Esses ônibus amarelos têm uma plaquinha de pare que se abre do lado, e os carros esperam enquanto as crianças sobem e descem.',
      'Um ônibus escolar grande consegue levar umas 70 crianças.',
    ],
  },
  taxi: {
    about:
      'O táxi é um carro com motorista que leva as pessoas aonde elas quiserem ir. No fim da corrida, os passageiros pagam pela viagem.',
    facts: [
      'Para dirigir um dos táxis pretos de Londres, os motoristas decoram milhares de ruas para uma prova chamada O Conhecimento.',
      'A palavra táxi vem de taxímetro, uma maquininha que calcula quanto custa cada corrida.',
      'Em Nova York, os táxis famosos são de um amarelo bem vivo, por isso é fácil achá-los.',
    ],
  },
  'garbage-truck': {
    about:
      'O caminhão de lixo e a sua equipe vão de rua em rua, esvaziando as lixeiras e levando o lixo embora. Eles ajudam a deixar as nossas cidades limpinhas e arrumadas.',
    facts: [
      'Uma máquina lá dentro amassa o lixo bem achatadinho, para caber muito, muito mais lixo no caminhão.',
      'Alguns caminhões recolhem o lixo reciclável, como garrafas, latas e papel, para ele virar coisas novas.',
      'Um caminhão de lixo consegue esvaziar as lixeiras de centenas de casas num dia só.',
    ],
  },
  tractor: {
    about:
      'O trator é uma máquina forte da fazenda que puxa coisas pesadas, como carretas e arados. Os fazendeiros usam tratores para ajudar a plantar a comida que a gente come.',
    facts: [
      'Alguns tratores conseguem se dirigir sozinhos, usando sinais de satélites lá no alto, no espaço.',
      'Muitos tratores têm rodas traseiras gigantes, com garras fundas e grossas que seguram bem no chão mole e cheio de lama.',
      'Os primeiros tratores funcionavam a vapor, como os trens a vapor de antigamente.',
    ],
  },
  digger: {
    about:
      'A escavadeira é uma máquina grande, com um braço comprido e uma concha que recolhe a terra. Ela cava buracos para casas novas, estradas e canos.',
    facts: [
      'A parte de cima da escavadeira, onde fica o motorista, consegue dar uma volta completa.',
      'O braço da escavadeira se mexe com óleo empurrado por tubos, e isso o deixa forte o bastante para levantar pedras pesadas.',
      'Muitas escavadeiras andam sobre esteiras em vez de rodas, para não afundar na lama mole.',
    ],
  },
  'dump-truck': {
    about:
      'O caminhão caçamba carrega cargas pesadas, como areia, terra e pedras. Quando ele chega, a caçamba lá de trás se levanta, e a carga inteira escorrega para fora.',
    facts: [
      'Os maiores caminhões caçamba têm rodas mais altas que uma pessoa adulta, e o motorista sobe uma escada para entrar!',
      'Os caminhões caçamba muitas vezes trabalham com as escavadeiras: a escavadeira enche o caminhão, e o caminhão leva a carga embora.',
      'O caminhão caçamba também é chamado de basculante, porque a caçamba dele se inclina para despejar a carga.',
    ],
  },
  train: {
    about:
      'O trem é uma fila de vagões que corre sobre os trilhos, muitas vezes puxada por uma máquina chamada locomotiva. Um único trem consegue levar centenas de pessoas ao mesmo tempo.',
    facts: [
      'Os trens a vapor esquentam a água até ela virar vapor, que faz as rodas girarem e sai em nuvenzinhas pela chaminé.',
      'Os trens mais rápidos de hoje conseguem correr a mais de 300 quilômetros por hora.',
      'Os primeiros trens a vapor foram construídos na Grã-Bretanha, há mais de 200 anos.',
    ],
  },
  airplane: {
    about:
      'O avião é uma máquina voadora com asas que leva as pessoas lá no alto, cruzando o céu. O piloto comanda o avião da cabine, bem lá na frente.',
    facts: [
      'Os grandes aviões de passageiros voam a uns 10 quilômetros de altura, mais alto que a montanha mais alta da Terra.',
      'Uma hélice girando ou um motor a jato empurra o avião para a frente, e o ar que passa correndo pelas asas o levanta.',
      'Os primeiros voos de avião eram bem curtinhos: em 1903, o primeiro voo dos irmãos Wright durou só 12 segundos.',
    ],
  },
  helicopter: {
    about:
      'O helicóptero é uma máquina voadora com pás compridas que giram lá em cima. Ele consegue subir reto, ficar parado no ar e até voar para trás.',
    facts: [
      'Na maioria dos helicópteros, umas pás pequenas que giram na cauda impedem que ele fique rodopiando sem parar.',
      'Os helicópteros conseguem pousar em lugares pequenos, e isso os ajuda a chegar até pessoas em montanhas, ilhas e navios.',
      'Há mais de 500 anos, o artista Leonardo da Vinci desenhou uma máquina voadora um pouco parecida com um helicóptero.',
    ],
  },
  motorbike: {
    about:
      'A moto é como uma bicicleta com motor, então quem pilota não precisa pedalar. Os motociclistas usam um capacete resistente para proteger a cabeça.',
    facts: [
      'Nas corridas, os pilotos inclinam tanto a moto nas curvas que uns protetores especiais nos joelhos raspam no chão.',
      'Para ir mais rápido, o piloto gira a manopla do lado direito do guidão.',
      'Uma das primeiras motos, construída na Alemanha há uns 140 anos, tinha rodas e quadro de madeira.',
    ],
  },
  bicycle: {
    about:
      'A bicicleta é uma máquina de duas rodas que anda quando você empurra os pedais. As suas pernas são o motor dela, então ela nunca precisa de combustível.',
    facts: [
      'As primeiras bicicletas não tinham pedais, e as pessoas iam empurrando o chão com os pés, igualzinho numa bicicleta de equilíbrio.',
      'Quando você empurra os pedais, uma corrente faz a roda de trás girar, e lá vai você.',
      'Na Holanda, existem mais bicicletas do que pessoas!',
    ],
  },
  boat: {
    about:
      'O rebocador é um barco pequeno, mas fortíssimo, que ajuda os navios grandes a entrar e sair dos portos movimentados.',
    facts: [
      'Os rebocadores são tão fortes que conseguem empurrar e puxar navios muitas vezes maiores que eles.',
      'Os rebocadores muitas vezes têm pneus velhos ou borracha grossa nos lados, que funcionam como para-choques macios.',
      'O capitão guia o rebocador da casa do leme, uma salinha lá no alto, com janelas por todos os lados.',
    ],
  },
};

export default info;
