import type { InfoPack } from '../types';

const info: InfoPack = {
  jaguar: {
    about:
      'Báo đốm là loài mèo hoang lớn nhất châu Mỹ. Bộ lông vàng óng của nó phủ đầy những đốm sẫm, trông như những bông hoa hồng nhỏ.',
    facts: [
      'Có những con báo đốm đen tuyền, nhưng nếu nhìn thật kỹ, bé vẫn thấy được những chiếc đốm.',
      'Không giống nhiều loài mèo khác, báo đốm rất thích nước và bơi rất khỏe.',
      'Mỗi con báo đốm có hoa văn đốm riêng, nên không có hai con nào trông giống hệt nhau.',
    ],
  },
  toucan: {
    about:
      'Chim tu-căng là loài chim rừng mưa rực rỡ, có chiếc mỏ khổng lồ đầy màu sắc. Nó sống trên những ngọn cây cao và kêu khàn khàn thật to.',
    facts: [
      'Khi ngủ, chim tu-căng giấu mỏ dưới cánh và gập đuôi lên lưng.',
      'Mỏ chim tu-căng trông có vẻ nặng, nhưng thật ra rất nhẹ, vì bên trong xốp và đầy không khí.',
      'Chiếc mỏ to còn giúp chim tỏa bớt hơi nóng cho mát vào những ngày nắng nóng.',
    ],
  },
  sloth: {
    about:
      'Con lười là một con vật chậm chạp, hiền lành, sống trên những cành cây cao trong rừng mưa. Nó dành rất nhiều thời gian treo mình lộn ngược trên cành cây.',
    facts: [
      'Con lười chỉ trèo xuống khỏi cây khoảng một lần mỗi tuần, để đi vệ sinh.',
      'Những cây tảo xanh tí hon mọc trong bộ lông của con lười, giúp nó lẫn vào màu lá cây.',
      'Con lười bơi giỏi đến bất ngờ, chúng khua đôi tay dài để bơi đi.',
    ],
  },
  frog: {
    about:
      'Ếch là một con vật nhỏ, nhảy giỏi, có đôi chân sau khỏe và làn da trơn ẩm. Nhiều loài ếch ở rừng mưa sống trên những ngọn cây cao.',
    facts: [
      'Khi ếch nuốt, mắt nó thụt vào trong đầu để giúp đẩy thức ăn xuống.',
      'Ếch không uống nước bằng miệng, mà thấm nước qua làn da.',
      'Hầu hết các loài ếch lúc mới ra đời là nòng nọc, những chú bơi tí hon có đuôi và chưa có chân.',
    ],
  },
  capybara: {
    about:
      'Chuột lang nước là loài gặm nhấm lớn nhất thế giới, họ hàng khổng lồ của chuột lang. Nó rất thích vùng vẫy và thư giãn dưới sông và ao.',
    facts: [
      'Đôi khi chim đậu trên lưng chuột lang nước, và chú chuột lang nước điềm tĩnh dường như chẳng hề bận tâm.',
      'Mắt, tai và mũi của nó nằm cao trên đầu, nên nó có thể ló ra quan sát khi đang bơi.',
      'Chuột lang nước có thể nín thở dưới nước tới khoảng 5 phút.',
    ],
  },
  butterfly: {
    about:
      'Bướm morpho xanh là một loài bướm lớn sống ở rừng mưa Trung Mỹ và Nam Mỹ. Mặt trên đôi cánh của nó có màu xanh dương rực rỡ, óng ánh.',
    facts: [
      'Bướm có thể nếm bằng chân!',
      'Cánh của nó phủ đầy những chiếc vảy tí hon bắt ánh sáng, làm đôi cánh ánh lên màu xanh.',
      'Khi khép cánh lại, nó trông có màu nâu, lốm đốm, nên có thể nấp giữa những chiếc lá.',
    ],
  },
  anteater: {
    about:
      'Thú ăn kiến khổng lồ có chiếc mõm dài và mảnh, chiếc đuôi to rậm, và chẳng có chiếc răng nào. Nó húp kiến và mối bằng chiếc lưỡi dài và dính.',
    facts: [
      'Thú ăn kiến con cưỡi trên lưng mẹ tới tận một năm.',
      'Lưỡi của nó dài khoảng 60 xen-ti-mét, còn dài hơn cả cánh tay của bé!',
      'Khi nghỉ ngơi, thú ăn kiến có thể lấy chiếc đuôi rậm phủ lên mình như một tấm chăn.',
    ],
  },
  armadillo: {
    about:
      'Tatu là một con vật nhỏ có chiếc mai cứng bằng xương, giống như một bộ áo giáp. Trong tiếng Tây Ban Nha, tên của nó có nghĩa là “chú nhỏ mặc áo giáp”.',
    facts: [
      'Tatu chín đai mẹ hầu như lúc nào cũng sinh bốn con một lúc, và cả bốn trông giống hệt nhau.',
      'Tatu nhìn không rõ lắm, nên chúng dùng chiếc mũi dài để đánh hơi tìm sâu bọ.',
      'Tatu đào hang rất giỏi, chúng dùng những chiếc vuốt khỏe để làm những chiếc hang ấm cúng.',
    ],
  },
  chameleon: {
    about:
      'Tắc kè hoa là loài thằn lằn sống trên cây và có thể đổi màu da. Nó bám vào cành cây bằng chiếc đuôi cuộn tròn.',
    facts: [
      'Tắc kè hoa có thể đảo từng mắt riêng biệt, nên nó nhìn được hai hướng cùng một lúc!',
      'Chiếc lưỡi dài và dính của nó phóng ra còn nhanh hơn một cái chớp mắt.',
      'Tắc kè hoa đổi màu chủ yếu để thể hiện cảm xúc và để làm ấm hoặc làm mát cơ thể.',
    ],
  },
  hummingbird: {
    about:
      'Chim ruồi là loài chim nhỏ xíu, sặc sỡ, có thể bay lơ lửng trên không như một chiếc trực thăng tí hon. Đôi cánh của nó đập nhanh đến mức phát ra tiếng vo vo.',
    facts: [
      'Chim ruồi có thể bay lên, bay xuống, bay sang ngang và thậm chí bay lùi.',
      'Loài chim nhỏ nhất trên thế giới là một loài chim ruồi, gọi là chim ruồi ong.',
      'Chim ruồi dùng tơ nhện để kết chiếc tổ nhỏ xíu của mình, và tơ nhện giãn ra khi chim non lớn lên.',
    ],
  },
  tarantula: {
    about:
      'Nhện tarantula là loài nhện to, lông xù, sống ở những vùng ấm áp khắp thế giới. Nhiều con nhút nhát và nghỉ ngơi trong những chiếc hang ấm cúng lót đầy tơ.',
    facts: [
      'Khi lớn lên, nhện tarantula trườn ra khỏi lớp da cũ, để lại phía sau một bản sao trống rỗng của chính mình.',
      'Nhện tarantula có tám mắt, nhưng chủ yếu cảm nhận đường đi bằng những chiếc chân đầy lông.',
      'Có những cô nhện tarantula cái sống được hơn 20 năm.',
    ],
  },
  piranha: {
    about:
      'Cá piranha bụng đỏ là loài cá ánh bạc, có chiếc bụng màu đỏ cam tươi. Nó sống ở những con sông Nam Mỹ, như dòng sông Amazon hùng vĩ.',
    facts: [
      'Cá piranha bụng đỏ có thể phát ra tiếng sủa, hơi giống một chú chó nhỏ!',
      'Cá piranha thích bơi cùng nhau thành từng đàn lớn, giúp chúng được an toàn.',
      'Cá piranha rụng răng cũ và mọc răng mới suốt cả cuộc đời.',
    ],
  },
  'river-dolphin': {
    about:
      'Cá heo sông Amazon là loài cá heo màu hồng sống ở sông chứ không sống ở biển. Đây là loài cá heo sông lớn nhất thế giới.',
    facts: [
      'Khi nước sông tràn vào rừng mưa, những chú cá heo này bơi lượn giữa những thân cây!',
      'Cá heo con lúc mới sinh có màu xám, rồi hồng dần lên khi lớn.',
      'Không giống phần lớn cá heo biển, nó có thể quay đầu sang hai bên.',
    ],
  },
  okapi: {
    about:
      'Hươu đùi vằn là một con vật nhút nhát sống trong rừng, có đôi chân kẻ sọc như ngựa vằn. Nhưng họ hàng gần nhất của nó lại là hươu cao cổ.',
    facts: [
      'Lưỡi của hươu đùi vằn dài đến mức nó có thể tự lau mắt và tai của mình.',
      'Hươu đùi vằn hoang dã chỉ sống ở một đất nước duy nhất, đó là Cộng hòa Dân chủ Congo ở châu Phi.',
      'Giống như hươu cao cổ, hươu đùi vằn đực có hai chiếc sừng ngắn được bọc da.',
    ],
  },
};

export default info;
