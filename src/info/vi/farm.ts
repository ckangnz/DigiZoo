import type { InfoPack } from '../types';

const info: InfoPack = {
  cow: {
    about:
      'Bò sữa là con vật to lớn, hiền lành ở nông trại, cho chúng ta sữa để uống. Bò thích ở bên nhau thành một nhóm gọi là đàn.',
    facts: [
      'Mũi của mỗi chú bò có những nốt sần và đường vân riêng, giống như dấu vân tay của bé.',
      'Bò nhai thức ăn hai lần, đưa cỏ từ trong bụng lên miệng để nhai lại.',
      'Bò con được gọi là bê, và bê có thể đi được ngay trong ngày chào đời.',
    ],
  },
  pig: {
    about:
      'Lợn là con vật thông minh ở nông trại, có chiếc mũi tròn gọi là mõm. Lợn rất thích lăn trong bùn để mát mẻ vào những ngày nóng nực.',
    facts: [
      'Lợn rất thông minh và có thể học làm trò, giống như chó vậy.',
      'Chiếc mõm của lợn đánh hơi rất giỏi, tìm ra cả thức ăn giấu dưới đất.',
      'Lợn mẹ ủn ỉn khe khẽ để gọi đàn lợn con khi đến giờ bú sữa.',
    ],
  },
  sheep: {
    about:
      'Cừu là con vật hiền lành ở nông trại, có bộ lông len mềm mại. Cừu luôn ở sát bên nhau thành một nhóm gọi là đàn.',
    facts: [
      'Cừu con được gọi là cừu non, và cừu non nhận ra mẹ nhờ tiếng kêu be be của mẹ.',
      'Cừu có thể nhớ mặt 50 con cừu khác trong khoảng hai năm.',
      'Mỗi năm, cừu được cắt lông khoảng một lần, và lông của chúng được làm thành những thứ như tất và mũ.',
    ],
  },
  horse: {
    about:
      'Ngựa là con vật khỏe mạnh, chạy nhanh, có bờm và đuôi dài bay phấp phới. Con người đã cưỡi ngựa từ hàng nghìn năm nay.',
    facts: [
      'Ngựa có thể đứng mà chợp mắt, vì chân của chúng có thể khóa cứng lại.',
      'Ngựa con có thể đứng dậy khoảng một giờ sau khi chào đời.',
      'Mắt ngựa nằm ở hai bên đầu, nên ngựa nhìn được gần như khắp xung quanh.',
    ],
  },
  chicken: {
    about:
      'Gà là loài chim thân thiện ở nông trại và biết đẻ trứng. Những cô gà đã lớn được gọi là gà mái, còn những chú gà bé xíu lông tơ thì gọi là gà con.',
    facts: [
      'Gà con có thể kêu chiếp chiếp với mẹ ngay khi còn nằm trong trứng.',
      'Trên thế giới, gà nhiều hơn bất kỳ loài chim nào khác.',
      'Một cô gà mái có thể đẻ tới khoảng một quả trứng mỗi ngày.',
    ],
  },
  duck: {
    about:
      'Vịt là loài chim sống dưới nước, có đôi bàn chân dẹt với lớp màng như mái chèo. Lông vịt không thấm nước, nên vịt bơi mà người vẫn khô ráo.',
    facts: [
      'Tiếng cạp cạp to mà bé nghe thấy chủ yếu là của vịt mái, còn vịt đực có giọng nhỏ hơn và khàn khàn.',
      'Vịt có thể ngủ mà vẫn mở một mắt để canh chừng.',
      'Vịt con có thể bơi ngay sau khi nở.',
    ],
  },
  goat: {
    about:
      'Dê là con vật hiếu động, tò mò ở nông trại và rất thích khám phá. Nhiều chú dê có một chòm râu nhỏ ở cằm.',
    facts: [
      'Trong tiếng Anh, dê con được gọi là “kid”, cũng là từ dùng để gọi trẻ con!',
      'Dê leo trèo rất giỏi, có chú còn trèo lên cây để gặm lá.',
      'Phần đen ở giữa mắt dê có hình chữ nhật nằm ngang.',
    ],
  },
  dog: {
    about:
      'Chó là con vật trung thành, thân thiện và là một trong những người bạn lâu đời nhất của con người. Ở nông trại, chó giúp lùa cừu và bò về một chỗ.',
    facts: [
      'Mũi chó thính đến mức có thể ngửi thấy những thứ mà chúng ta hoàn toàn không ngửi được.',
      'Cún con sinh ra đã nhắm mắt, và mở mắt khi được khoảng hai tuần tuổi.',
      'Chó hạ nhiệt bằng cách thở hổn hển, và chúng ra một chút mồ hôi qua bàn chân.',
    ],
  },
  cat: {
    about:
      'Mèo là con vật mềm mại, tò mò, có bộ ria dài và thân hình dẻo dai. Mèo thường kêu gừ gừ khi thấy vui vẻ và dễ chịu.',
    facts: [
      'Mèo có thể ngủ khoảng 12 đến 16 tiếng mỗi ngày.',
      'Lưỡi mèo ráp như giấy nhám, giúp mèo chải lông sạch sẽ.',
      'Trong ánh sáng lờ mờ, mèo nhìn rõ hơn con người rất nhiều.',
    ],
  },
  rooster: {
    about:
      'Gà trống là chú gà đực đã lớn, có chiếc mào đỏ trên đầu. Gà trống nổi tiếng với tiếng gáy ò ó o thật to.',
    facts: [
      'Khi tìm thấy món gì ngon, gà trống gọi các cô gà mái đến cùng ăn.',
      'Gà trống gáy vào buổi sáng, nhưng cũng có thể gáy vào bất cứ lúc nào trong ngày.',
      'Những miếng da đỏ lủng lẳng dưới mỏ gà trống được gọi là tích.',
    ],
  },
  turkey: {
    about:
      'Gà tây là loài chim to, có nguồn gốc từ Bắc Mỹ. Để khoe dáng, gà tây xù lông lên và xòe đuôi ra như một chiếc quạt.',
    facts: [
      'Khi phấn khích, đầu của gà tây đực có thể đổi sang màu đỏ, trắng hoặc xanh.',
      'Tiếng kêu nổi tiếng của gà tây là do gà tây đực phát ra, và có thể nghe thấy từ rất xa.',
      'Gà tây hoang dã có thể bay những quãng ngắn, và ban đêm chúng ngủ trên cây.',
    ],
  },
  goose: {
    about:
      'Ngỗng là loài chim nước to, có chiếc cổ dài và tiếng kêu quàng quạc thật to. Ngỗng giữ nhà rất giỏi và kêu ầm lên khi có người lạ tới gần.',
    facts: [
      'Ngỗng trời bay cùng nhau theo hình chữ V, giúp chúng tiết kiệm sức trên những chuyến đi dài.',
      'Những chú ngỗng con lúc nào cũng lẽo đẽo theo bố mẹ khắp nơi.',
      'Ngỗng thường sống cùng một bạn đời suốt cả cuộc đời.',
    ],
  },
  donkey: {
    about:
      'Lừa là họ hàng khỏe mạnh, hiền lành của ngựa, có đôi tai dài và mềm. Lừa gọi nhau bằng tiếng kêu í ò thật to.',
    facts: [
      'Lừa kết bạn rất thân và vui nhất khi có bạn bên cạnh.',
      'Đôi tai to giúp lừa nghe được những âm thanh ở xa và giữ mát vào những ngày nóng.',
      'Bộ lông xù của lừa không chống thấm nước, nên lừa thích có chỗ trú khô ráo khi trời mưa.',
    ],
  },
  rabbit: {
    about:
      'Thỏ là con vật mềm mại, lông xù, có đôi tai dài và chiếc mũi hay khụt khịt. Thỏ nhảy bằng đôi chân sau khỏe mạnh.',
    facts: [
      'Khi thật vui, thỏ có thể nhảy vọt lên và xoay người giữa không trung, gọi là cú “binky”.',
      'Răng cửa của thỏ không bao giờ ngừng mọc, nên thỏ giữ cho răng ngắn bằng cách nhai thật nhiều cỏ khô.',
      'Thỏ hoang sống cùng nhau trong những ngôi nhà lớn dưới lòng đất gọi là hang thỏ.',
    ],
  },
  alpaca: {
    about:
      'Lạc đà alpaca là con vật hiền lành, lông xù, đến từ vùng núi Nam Mỹ. Bộ lông len mềm và ấm của nó được làm thành những bộ quần áo ấm áp.',
    facts: [
      'Lạc đà alpaca ngân nga khe khẽ để trò chuyện với nhau.',
      'Lạc đà alpaca là họ hàng của lạc đà, nhưng chúng không có bướu.',
      'Lạc đà alpaca con được gọi là “cria”, và thường được sinh ra vào ban ngày.',
    ],
  },
  mouse: {
    about:
      'Chuột là con vật tí hon, nhanh nhẹn, có đôi tai tròn và chiếc đuôi dài. Chuột dùng ria để dò đường trong bóng tối.',
    facts: [
      'Chuột hát cho nhau nghe những bài hát nhỏ, nhưng cao quá nên tai chúng ta không nghe được.',
      'Chuột có thể lách qua một cái lỗ chỉ to bằng chiếc bút chì.',
      'Chuột làm những chiếc tổ ấm áp từ những thứ mềm như cỏ, bông vụn và giấy.',
    ],
  },
  bee: {
    about:
      'Ong là loài côn trùng chăm chỉ, kêu vo ve, có những sọc lông tơ. Ong mang bụi hoa gọi là phấn hoa từ bông này sang bông khác, giúp cây ra quả và hạt.',
    facts: [
      'Ong mật nhảy một điệu nhảy lắc lư để chỉ cho bạn bè biết chỗ có hoa.',
      'Ong có năm con mắt, gồm hai mắt to và ba mắt tí hon trên đỉnh đầu.',
      'Ong mật làm ra mật ong từ một loại nước ngọt của hoa gọi là mật hoa.',
    ],
  },
};

export default info;
