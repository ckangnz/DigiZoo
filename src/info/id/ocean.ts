import type { InfoPack } from '../types';

const info: InfoPack = {
  fish: {
    about:
      'Ikan badut adalah ikan kecil berwarna oranye dengan garis-garis putih. Ia tinggal di dalam anemon laut, yaitu hewan laut lunak yang bentuknya seperti bunga.',
    facts: [
      'Ayah ikan badut menjaga telur-telurnya, dan mengipasinya dengan sirip supaya tetap segar.',
      'Lapisan lendir khusus membuat ikan badut tetap aman di antara lengan-lengan anemon yang melambai.',
      'Dalam keluarga ikan badut, ikan yang paling besar adalah sang ibu, dan dialah bosnya.',
    ],
  },
  shark: {
    about:
      'Hiu adalah ikan yang kuat, yang berenang dengan kibasan ekornya. Hiu sudah hidup di lautan sejak jauh sebelum zaman dinosaurus.',
    facts: [
      'Ikan terbesar di dunia adalah seekor hiu, yaitu hiu paus yang jinak dan berbintik-bintik.',
      'Hiu menumbuhkan gigi baru sepanjang hidupnya, jadi giginya tidak pernah habis.',
      'Hiu tidak punya tulang keras, hanya tulang rawan yang lentur seperti ujung hidungmu.',
    ],
  },
  dolphin: {
    about:
      'Lumba-lumba adalah hewan laut yang cerdas dan suka bermain, yang bernapas dengan udara lewat lubang di atas kepalanya. Lumba-lumba sering melompat dan bermain di antara ombak.',
    facts: [
      'Setiap lumba-lumba punya siulan khasnya sendiri, agak mirip seperti nama.',
      'Lumba-lumba tidur dengan setengah otaknya secara bergantian, jadi mereka tetap bisa naik ke permukaan untuk bernapas.',
      'Lumba-lumba menemukan jalan dengan bersuara klik dan mendengarkan gema yang memantul kembali.',
    ],
  },
  whale: {
    about:
      'Paus adalah hewan laut raksasa yang bernapas dengan udara, sama seperti kamu. Saat paus mengembuskan napas, semburan seperti kabut memancar tinggi ke udara.',
    facts: [
      'Paus biru adalah hewan terbesar yang pernah diketahui, bahkan lebih berat daripada dinosaurus terbesar.',
      'Paus bungkuk menyanyikan lagu-lagu panjang yang bisa terdengar jauh di dalam laut.',
      'Banyak paus besar memakan banyak sekali hewan kecil mirip udang yang disebut krill.',
    ],
  },
  octopus: {
    about:
      'Gurita adalah hewan laut yang lunak dan cerdas dengan delapan lengan yang meliuk-liuk. Gurita tidak punya tulang, jadi ia bisa menyelinap lewat celah yang sangat kecil.',
    facts: [
      'Gurita punya tiga jantung dan darah berwarna biru.',
      'Gurita bisa berganti warna dalam sekejap untuk berbaur dengan batu dan karang.',
      'Alat pengisap di lengan gurita bisa merasakan rasa benda yang disentuhnya.',
    ],
  },
  'sea-turtle': {
    about:
      'Penyu adalah reptil laut yang berenang dengan sirip, bukan dengan kaki. Ada penyu yang berkelana ribuan kilometer menyeberangi lautan.',
    facts: [
      'Induk penyu sering berenang kembali ke pantai tempat ia menetas dulu untuk bertelur.',
      'Penyu yang sedang beristirahat bisa menahan napas selama berjam-jam.',
      'Berbeda dengan kura-kura darat, penyu tidak bisa menarik kepalanya masuk ke dalam tempurungnya.',
    ],
  },
  crab: {
    about:
      'Kepiting adalah hewan laut dengan cangkang keras, delapan kaki untuk berjalan, dan dua capit yang kuat. Kebanyakan kepiting berjalan menyamping.',
    facts: [
      'Saat cangkangnya sudah terlalu sempit, kepiting keluar dari cangkang itu, lalu cangkang baru yang lunak di bawahnya pun mengeras.',
      'Mata kepiting terletak di ujung tangkai kecil, jadi ia bisa menjulurkannya untuk melihat ke sekeliling.',
      'Ada kepiting yang melambaikan capitnya yang besar untuk mengirim pesan kepada kepiting lain.',
    ],
  },
  jellyfish: {
    about:
      'Ubur-ubur adalah hewan laut yang lunak dan berbentuk seperti payung, dengan tentakel panjang yang melambai-lambai. Ia berenang dengan mengerutkan tubuhnya untuk mendorong air menjauh.',
    facts: [
      'Ubur-ubur tidak punya otak, tidak punya jantung, dan tidak punya tulang.',
      'Ada ubur-ubur yang bisa membuat cahayanya sendiri dan bersinar di laut yang gelap.',
      'Tubuh ubur-ubur hampir seluruhnya terdiri dari air, dan banyak ubur-ubur yang tembus pandang.',
    ],
  },
  seal: {
    about:
      'Anjing laut adalah hewan laut bertubuh ramping dengan sirip dan mata besar yang gelap. Lapisan lemak yang tebal di bawah kulitnya menjaganya tetap hangat di air yang dingin.',
    facts: [
      'Anak anjing laut pelabuhan sudah bisa berenang hanya beberapa jam setelah lahir.',
      'Anjing laut bisa tidur sebentar di air, mengapung tegak dengan hanya hidungnya yang menyembul keluar.',
      'Kumis anjing laut bisa merasakan riak-riak kecil di air, dan itu membantunya menemukan makanan.',
    ],
  },
  penguin: {
    about:
      'Penguin adalah burung yang tidak bisa terbang, tetapi ia jago berenang. Sayapnya yang kaku berfungsi seperti sirip untuk melesat di dalam air.',
    facts: [
      'Ayah penguin kaisar menghangatkan telurnya di atas kakinya, di bawah lipatan kulit yang hangat.',
      'Tidak semua penguin tinggal di tempat yang penuh es, karena ada juga yang tinggal di pantai yang cerah di Afrika.',
      'Punggung penguin yang hitam dan perutnya yang putih membuatnya sulit terlihat di dalam air.',
    ],
  },
  starfish: {
    about:
      'Bintang laut adalah hewan laut berbentuk bintang yang biasanya punya lima lengan. Walaupun hidup di laut, ia sama sekali bukan ikan!',
    facts: [
      'Bintang laut punya satu mata mungil di ujung setiap lengannya.',
      'Bintang laut bergerak pelan dengan ratusan kaki tabung kecil di bawah lengannya.',
      'Kalau bintang laut kehilangan satu lengan, ia bisa menumbuhkan lengan yang baru.',
    ],
  },
  seahorse: {
    about:
      'Kuda laut adalah ikan kecil dengan kepala berbentuk seperti kepala kuda dan ekor yang melingkar. Ia melilitkan ekornya ke rumput laut untuk berpegangan erat.',
    facts: [
      'Ayah kuda laut membawa bayi-bayinya di dalam kantong di perutnya sampai mereka lahir.',
      'Kuda laut bisa menggerakkan setiap matanya sendiri-sendiri, jadi ia bisa melihat ke dua arah sekaligus.',
      'Kuda laut adalah perenang yang lambat, yang bergerak dengan mengibaskan sirip kecil di punggungnya.',
    ],
  },
  stingray: {
    about:
      'Ikan pari adalah ikan pipih dengan sirip lebar yang terlihat seperti sayap. Ia meluncur di dalam air seolah-olah sedang terbang.',
    facts: [
      'Ikan pari suka bersembunyi di bawah pasir, dengan hanya matanya yang mengintip keluar.',
      'Mata ikan pari ada di bagian atas tubuhnya, sedangkan mulutnya ada di bagian bawah.',
      'Ikan pari adalah sepupu hiu, dan seperti hiu, mereka tidak punya tulang keras.',
    ],
  },
  orca: {
    about:
      'Paus pembunuh, atau orca, adalah hewan laut besar berwarna hitam putih, dan ia adalah jenis lumba-lumba yang paling besar. Orca hidup dalam kelompok keluarga yang erat yang disebut kawanan.',
    facts: [
      'Setiap keluarga orca punya cara memanggilnya sendiri, seperti bahasa keluarga mereka sendiri.',
      'Di banyak keluarga orca, seekor nenek yang bijaksana memimpin jalan.',
      'Sirip di punggung orca jantan bisa tumbuh setinggi orang dewasa.',
    ],
  },
  pufferfish: {
    about:
      'Ikan buntal adalah ikan gembul yang bisa menggembungkan tubuhnya seperti balon. Ia melakukannya dengan cepat-cepat menelan banyak air.',
    facts: [
      'Ada satu jenis ikan buntal yang menggambar pola lingkaran yang indah di pasir untuk memikat pasangannya.',
      'Gigi ikan buntal menyatu seperti paruh yang kuat, untuk meremukkan cangkang.',
      'Ikan buntal berenang dengan lambat, jadi menggembung adalah caranya untuk tetap aman.',
    ],
  },
  'sea-otter': {
    about:
      'Berang-berang laut adalah hewan laut berbulu yang suka mengapung telentang. Bulunya adalah yang paling tebal di antara semua hewan, sehingga menjaganya tetap hangat di air yang dingin.',
    facts: [
      'Berang-berang laut memakai batu sebagai alat untuk memecahkan cangkang di atas perutnya.',
      'Berang-berang laut punya kantong kulit yang longgar di bawah setiap lengannya untuk menyimpan camilan dan batunya.',
      'Anak berang-berang laut menumpang di dada induknya selagi induknya mengapung.',
    ],
  },
};

export default info;
