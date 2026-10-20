import type { InfoPack } from '../types';

const info: InfoPack = {
  lion: {
    about:
      'Sư tử là một loài mèo to lớn, khỏe mạnh, sống trên những đồng cỏ rộng mênh mông ở châu Phi. Sư tử sống thành từng gia đình, gọi là bầy.',
    facts: [
      'Tiếng gầm của sư tử có thể vang xa tới 8 ki-lô-mét.',
      'Mỗi ngày, sư tử có thể nằm nghỉ và ngủ tới 20 tiếng.',
      'Phần lớn sư tử đực khi lớn lên đều mọc một chiếc bờm to và bông xù.',
    ],
  },
  elephant: {
    about:
      'Voi là con vật to lớn nhất sống trên cạn. Chiếc vòi dài của voi vừa là cái mũi, vừa là một bàn tay đắc lực.',
    facts: [
      'Voi con đôi khi mút vòi, giống như em bé mút ngón tay cái vậy.',
      'Voi bơi rất giỏi, và chúng có thể dùng vòi như một chiếc ống thở.',
      'Voi phe phẩy đôi tai to như những chiếc quạt để giữ cho mình mát mẻ.',
    ],
  },
  giraffe: {
    about:
      'Hươu cao cổ là con vật cao nhất thế giới. Chiếc cổ dài giúp nó với tới những chiếc lá mọng nước trên cao.',
    facts: [
      'Lưỡi của hươu cao cổ có màu tím sẫm và có thể dài khoảng 50 xen-ti-mét.',
      'Chiếc cổ dài của hươu cao cổ chỉ có bảy đốt xương, bằng đúng số đốt xương cổ của bé!',
      'Hươu cao cổ con có thể đứng dậy chỉ khoảng một giờ sau khi chào đời.',
    ],
  },
  zebra: {
    about:
      'Ngựa vằn là họ hàng hoang dã của ngựa, với những sọc đen trắng thật nổi bật. Ngựa vằn sống cùng nhau thành từng đàn.',
    facts: [
      'Không có hai chú ngựa vằn nào có sọc giống hệt nhau, cũng như không có hai người nào có dấu vân tay giống nhau.',
      'Bên dưới bộ lông kẻ sọc, ngựa vằn có làn da sẫm màu.',
      'Ngựa vằn có thể đứng mà ngủ, giống hệt như ngựa.',
    ],
  },
  hippo: {
    about:
      'Hà mã là một con vật khổng lồ, ngâm mình gần như cả ngày dưới sông hồ cho mát. Cái tên hà mã có nghĩa là “ngựa sông”.',
    facts: [
      'Hà mã tự tạo ra một loại kem chống nắng màu hơi đỏ, giúp bảo vệ làn da khỏi ánh nắng mặt trời.',
      'Hà mã không biết bơi, cũng chẳng nổi được, nên chúng nhún nhảy dọc theo đáy sông.',
      'Ban đêm, hà mã lên bờ để gặm cỏ.',
    ],
  },
  rhino: {
    about:
      'Tê giác là một con vật to lớn, nặng nề, có làn da dày và sừng mọc trên mũi. Có loài tê giác chỉ có một sừng, có loài lại có hai sừng.',
    facts: [
      'Sừng tê giác được làm từ cùng một chất với tóc và móng tay của bé.',
      'Tê giác rất thích lăn trong bùn, vừa để mát vừa để bảo vệ da khỏi nắng.',
      'Tê giác nhìn không rõ lắm, nhưng lại có chiếc mũi đánh hơi cực giỏi.',
    ],
  },
  cheetah: {
    about:
      'Báo săn là con vật chạy nhanh nhất trên cạn. Chú mèo thon thả, lốm đốm này có thể chạy nước rút khoảng 100 ki-lô-mét một giờ, nhanh như ô tô trên đường cao tốc.',
    facts: [
      'Báo săn không gầm được như sư tử, nhưng chúng có thể kêu chíp chíp như chim và kêu gừ gừ như mèo nhà.',
      'Chiếc đuôi dài giúp báo săn giữ thăng bằng và rẽ thật nhanh khi đang chạy.',
      'Những vệt đen chạy từ mắt xuống miệng báo săn có thể giúp nó nhìn rõ hơn dưới nắng chói.',
    ],
  },
  meerkat: {
    about:
      'Cầy meerkat là một con vật nhỏ, lông mềm, sống ở những vùng đất khô cằn phía nam châu Phi. Chúng sống thành những gia đình đông vui, cùng chung những chiếc hang dưới lòng đất.',
    facts: [
      'Một chú meerkat đứng thẳng trên hai chân sau để canh gác, trong khi các bạn khác đi tìm thức ăn.',
      'Buổi sáng, cầy meerkat tắm nắng, ưỡn bụng về phía mặt trời cho ấm.',
      'Cầy meerkat có thể khép tai lại để cát không lọt vào khi đào hang.',
    ],
  },
  leopard: {
    about:
      'Báo hoa mai là một loài mèo lớn khỏe mạnh, có bộ lông lốm đốm và leo trèo rất giỏi. Nó thường nằm nghỉ trên những cành cây cao.',
    facts: [
      'Những đốm trên lông báo hoa mai được gọi là đốm hoa hồng, vì trông chúng hơi giống những bông hoa hồng.',
      'Có những con báo hoa mai lông sẫm màu đến mức khó nhìn thấy đốm, và người ta gọi chúng là báo đen.',
      'Báo hoa mai thường sống một mình và hoạt động nhiều nhất vào ban đêm.',
    ],
  },
  ostrich: {
    about:
      'Đà điểu là loài chim lớn nhất thế giới. Đà điểu không biết bay, nhưng có thể chạy rất nhanh trên đôi chân dài và khỏe.',
    facts: [
      'Một quả trứng đà điểu nặng bằng khoảng 24 quả trứng gà.',
      'Đà điểu có đôi mắt to nhất trong tất cả các loài vật sống trên cạn.',
      'Mỗi bàn chân đà điểu chỉ có hai ngón, giúp nó chạy thật nhanh.',
    ],
  },
  flamingo: {
    about:
      'Hồng hạc là loài chim cao, màu hồng, có đôi chân dài và mảnh. Nó thường đứng chỉ bằng một chân, kể cả khi ngủ.',
    facts: [
      'Hồng hạc có màu hồng là nhờ thức ăn của nó, như những con tôm nhỏ xíu.',
      'Hồng hạc ăn bằng cách lộn ngược đầu, lọc những mẩu thức ăn tí hon ra khỏi nước.',
      'Hồng hạc con mới nở có màu xám hoặc trắng, rồi dần dần chuyển sang màu hồng khi lớn lên.',
    ],
  },
  warthog: {
    about:
      'Lợn bướu là một loài lợn hoang ở châu Phi, có chiếc mõm dẹt và cặp răng nanh cong. Khi chạy, chiếc đuôi mảnh của nó dựng thẳng lên trời.',
    facts: [
      'Lợn bướu quỳ hai chân trước xuống để gặm những đám cỏ ngắn.',
      'Lợn bướu thường ngủ trong những chiếc hang do con vật khác đào, và chúng đi lùi vào, mông vào trước.',
      'Những cái bướu trên mặt lợn bướu không phải là mụn cóc, mà là những miếng đệm cứng giúp bảo vệ nó.',
    ],
  },
  gazelle: {
    about:
      'Linh dương gazelle là loài linh dương nhỏ nhắn, duyên dáng, có cặp sừng cong. Nhiều con sống thành đàn lớn trên những đồng cỏ ở châu Phi.',
    facts: [
      'Linh dương có thể bật cao lên không trung trên bốn chân thẳng đơ, như thể đang nhún trên lò xo.',
      'Linh dương chạy rất nhanh, lại còn chạy zích zắc và rẽ ngoặt thật lẹ.',
      'Linh dương con nằm im lặng trốn trong đám cỏ cao, trong khi mẹ ăn cỏ ở gần đó.',
    ],
  },
  buffalo: {
    about:
      'Trâu rừng châu Phi là họ hàng to khỏe của bò, có cặp sừng cong rất lớn. Chúng sống thành đàn, có đàn lên tới hàng trăm con.',
    facts: [
      'Những chú chim nhỏ tên là chim mỏ bò cưỡi trên lưng trâu và ăn những con bọ tí hon trên da chúng.',
      'Ở những con trâu đực trưởng thành, hai chiếc sừng nối liền ở giữa, tạo thành một chiếc mũ cứng trên đầu.',
      'Trâu rừng uống rất nhiều nước, nên chúng thích ở gần sông và những vũng nước.',
    ],
  },
  hyena: {
    about:
      'Linh cẩu đốm là loài vật thông minh, sống thành những gia đình lớn gọi là bầy. Chúng trò chuyện với nhau bằng tiếng hú, tiếng càu nhàu và cả tiếng cười khúc khích.',
    facts: [
      'Trong gia đình linh cẩu, linh cẩu cái to hơn linh cẩu đực, và thủ lĩnh là một cô linh cẩu cái.',
      'Linh cẩu trông hơi giống chó, nhưng thật ra lại là họ hàng gần với mèo và cầy mangut hơn.',
      'Linh cẩu con mới sinh có bộ lông sẫm màu, rồi lớn lên mới có đốm.',
    ],
  },
  gorilla: {
    about:
      'Khỉ đột là loài vượn người lớn nhất thế giới. Khỉ đột sống thành gia đình trong những khu rừng châu Phi, đứng đầu là một con đực to lớn gọi là khỉ đột lưng bạc.',
    facts: [
      'Khỉ đột đấm ngực như đánh trống để gửi lời nhắn cho những con khỉ đột khác.',
      'Mỗi con khỉ đột có những nếp nhăn trên mũi không giống ai, giống như dấu vân tay vậy.',
      'Khỉ đột con cưỡi trên lưng mẹ, bám thật chặt vào bộ lông của mẹ.',
    ],
  },
};

export default info;
