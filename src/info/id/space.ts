import type { InfoPack } from '../types';

const info: InfoPack = {
  sun: {
    about:
      'Matahari adalah sebuah bintang, yaitu bintang yang paling dekat dengan Bumi. Matahari adalah bola gas raksasa yang sangat panas dan berpijar, yang memberi kita cahaya dan kehangatan.',
    facts: [
      'Matahari begitu besar sampai lebih dari satu juta Bumi bisa muat di dalamnya.',
      'Cahaya matahari butuh waktu sekitar 8 menit untuk sampai dari Matahari ke Bumi.',
      'Bintang-bintang lain terlihat kecil karena letaknya jauh, jauh lebih jauh daripada Matahari.',
    ],
  },
  mercury: {
    about:
      'Merkurius adalah planet terkecil dan yang paling dekat dengan Matahari. Merkurius adalah dunia berbatu yang penuh kawah, hanya sedikit lebih besar daripada Bulan kita.',
    facts: [
      'Merkurius mengelilingi Matahari lebih cepat daripada planet lain, jadi satu tahunnya hanya 88 hari Bumi.',
      'Karena hampir tidak punya udara untuk menahan panas, siangnya sangat panas dan malamnya dingin membeku.',
      'Merkurius tidak punya bulan dan tidak punya cincin.',
    ],
  },
  venus: {
    about:
      'Venus adalah planet kedua dari Matahari, dan ukurannya hampir sama dengan Bumi. Udaranya yang tebal memerangkap panas seperti selimut, sehingga Venus menjadi planet yang paling panas.',
    facts: [
      'Venus berputar begitu lambat, sampai satu kali berputar butuh waktu lebih lama daripada satu kali mengelilingi Matahari!',
      'Venus berputar ke arah yang berlawanan dengan Bumi, jadi di Venus, Matahari terbit di barat.',
      'Venus adalah planet paling terang di langit kita, dan orang sering menyebutnya bintang fajar atau bintang senja.',
    ],
  },
  earth: {
    about:
      'Bumi adalah rumah kita, planet ketiga dari Matahari. Bumi adalah satu-satunya planet yang kita tahu punya makhluk hidup, mulai dari semut mungil sampai paus raksasa.',
    facts: [
      'Lautan menutupi sebagian besar Bumi, jadi dari luar angkasa Bumi terlihat seperti kelereng biru yang besar.',
      'Bumi berputar satu kali setiap hari, dan itulah sebabnya ada siang dan malam.',
      'Bumi butuh waktu satu tahun penuh untuk berkeliling mengitari Matahari.',
    ],
  },
  mars: {
    about:
      'Mars adalah planet keempat dari Matahari. Mars disebut Planet Merah, karena tanahnya ditutupi debu merah seperti karat.',
    facts: [
      'Mars punya gunung berapi tertinggi yang kita ketahui, yaitu Olympus Mons, yang tingginya lebih dari dua kali Gunung Everest!',
      'Mars punya dua bulan kecil, yang bernama Phobos dan Deimos.',
      'Para ilmuwan sudah mengirim robot penjelajah yang disebut rover untuk berkeliling di Mars.',
    ],
  },
  jupiter: {
    about:
      'Jupiter adalah planet terbesar di tata surya kita. Jupiter adalah bola gas raksasa dengan garis-garis warna-warni dan badai besar yang disebut Bintik Merah Raksasa.',
    facts: [
      'Jupiter begitu besar sampai lebih dari seribu Bumi bisa muat di dalamnya.',
      'Jupiter berputar lebih cepat daripada planet lain, jadi satu hari di sana hanya sekitar 10 jam.',
      'Bulannya yang bernama Ganimede adalah bulan terbesar di tata surya kita, bahkan lebih besar daripada planet Merkurius.',
    ],
  },
  saturn: {
    about:
      'Saturnus adalah planet keenam dari Matahari dan planet terbesar kedua. Saturnus adalah bola gas raksasa yang terkenal dengan cincinnya yang indah.',
    facts: [
      'Saturnus begitu ringan untuk ukurannya, sampai ia bisa mengapung di dalam bak mandi raksasa berisi air!',
      'Cincinnya terbuat dari es dan batu, mulai dari butiran mungil sampai bongkahan sebesar rumah.',
      'Saturnus punya lebih banyak bulan daripada planet lain, dan sudah ratusan yang ditemukan.',
    ],
  },
  uranus: {
    about:
      'Uranus adalah planet ketujuh dari Matahari. Uranus adalah raksasa es berwarna biru kehijauan yang miring ke samping, seperti bola yang menggelinding mengitari Matahari.',
    facts: [
      'Karena miring, setiap musim di Uranus berlangsung sekitar 21 tahun.',
      'Gas yang disebut metana memberi Uranus warna biru kehijauan.',
      'Uranus adalah planet pertama yang ditemukan dengan melihat lewat teleskop.',
    ],
  },
  neptune: {
    about:
      'Neptunus adalah planet kedelapan dan yang paling jauh dari Matahari. Neptunus adalah raksasa biru yang dingin dengan angin paling kencang di antara semua planet.',
    facts: [
      'Neptunus butuh waktu sekitar 165 tahun untuk mengelilingi Matahari satu kali saja.',
      'Neptunus adalah planet pertama yang ditemukan dengan bantuan matematika, bukan hanya dengan mengamati langit.',
      'Hanya satu pesawat luar angkasa, yaitu Voyager 2, yang pernah mengunjungi Neptunus.',
    ],
  },
  pluto: {
    about:
      'Pluto adalah planet kerdil yang letaknya jauh di luar Neptunus. Pluto adalah dunia kecil yang penuh es, bahkan lebih kecil daripada Bulan kita.',
    facts: [
      'Pluto punya daerah besar dan terang yang berbentuk seperti hati!',
      'Pluto diberi nama oleh seorang anak perempuan berumur 11 tahun dari Inggris yang bernama Venetia.',
      'Dulu Pluto disebut planet kesembilan, tetapi sekarang para ilmuwan menyebutnya planet kerdil.',
    ],
  },
  moon: {
    about:
      'Bulan adalah tetangga terdekat Bumi di luar angkasa, dan Bulan bergerak mengelilingi planet kita. Bulan bersinar karena cahaya matahari dipantulkan olehnya.',
    facts: [
      'Pada tahun 1969, Neil Armstrong menjadi orang pertama yang berjalan di Bulan.',
      'Karena tidak ada angin atau hujan yang menghapusnya, jejak kaki di Bulan bisa bertahan sangat lama.',
      'Bentuk Bulan seperti berubah-ubah, padahal kita hanya melihat bagian sisinya yang disinari matahari, kadang sedikit dan kadang banyak.',
    ],
  },
  rocket: {
    about:
      'Roket adalah mesin yang sangat kuat untuk membawa astronaut dan pesawat antariksa naik ke luar angkasa. Roket melesat ke atas dengan menyemburkan gas panas ke bawah dari mesinnya.',
    facts: [
      'Dalam perjalanan ke luar angkasa, roket besar bisa melaju berkali-kali lebih cepat daripada pesawat jet.',
      'Roket membawa oksigennya sendiri, jadi mesinnya tetap bisa bekerja di luar angkasa yang tidak ada udaranya.',
      'Roket besar dibuat bertingkat-tingkat, dan setiap tingkat akan terlepas saat bahan bakarnya habis.',
    ],
  },
  astronaut: {
    about:
      'Astronaut adalah orang yang bepergian ke luar angkasa. Banyak astronaut tinggal dan bekerja selama berbulan-bulan di stasiun luar angkasa, tinggi di atas Bumi.',
    facts: [
      'Di luar angkasa, astronaut bertambah tinggi sedikit, lalu menyusut lagi saat pulang ke Bumi!',
      'Di stasiun luar angkasa, astronaut tidur di dalam kantong tidur yang diikat ke dinding, supaya tidak melayang ke mana-mana.',
      'Astronaut di stasiun luar angkasa bisa melihat sekitar 16 kali matahari terbit dan 16 kali matahari terbenam setiap hari.',
    ],
  },
  ufo: {
    about:
      'UFO adalah singkatan bahasa Inggris yang artinya benda terbang tak dikenal, yaitu sesuatu di langit yang belum bisa dijelaskan oleh siapa pun. Dalam cerita, UFO sering berupa piring terbang dengan alien ramah di dalamnya.',
    facts: [
      'Belum pernah ada yang menemukan piring terbang sungguhan, tetapi para ilmuwan terus mendengarkan sinyal dari luar angkasa.',
      'Kebanyakan UFO ternyata adalah pesawat, balon, burung, atau bahkan planet Venus yang terang.',
      'Para ilmuwan sudah menemukan ribuan planet yang mengelilingi bintang lain, dan mereka sedang mencari tanda-tanda kehidupan.',
    ],
  },
  comet: {
    about:
      'Komet itu seperti bola salju raksasa yang kotor, yang terbuat dari es, debu, dan batu. Saat mendekati Matahari, komet menumbuhkan ekor panjang yang bercahaya.',
    facts: [
      'Ekor komet bisa membentang sampai jutaan kilometer di luar angkasa.',
      'Ekornya selalu mengarah menjauhi Matahari, bahkan saat komet itu sedang bergerak menjauhi Matahari.',
      'Komet Halley kembali sekitar setiap 76 tahun sekali, dan kunjungan berikutnya adalah pada tahun 2061.',
    ],
  },
};

export default info;
