import type { InfoPack } from '../types';

const info: InfoPack = {
  deer: {
    about:
      'Hươu là con vật hiền lành, duyên dáng, sống trong rừng và trên những cánh đồng cỏ. Hầu hết hươu đực đều mọc sừng trên đầu.',
    facts: [
      'Hươu con có bộ lông lốm đốm trắng, giúp nó ẩn mình giữa lá cây.',
      'Mỗi năm, hươu đực lại rụng sừng, rồi một cặp sừng mới tinh mọc lên thay thế.',
      'Hươu nhảy rất giỏi, nhiều chú có thể nhảy qua cả hàng rào cao hơn người lớn.',
    ],
  },
  fox: {
    about:
      'Cáo đỏ là họ hàng hoang dã thông minh của chó, có chiếc đuôi rậm và đôi tai nhọn. Cáo sống trong rừng, trên đồng ruộng, và cả trong thị trấn nữa.',
    facts: [
      'Cáo thính tai đến mức có thể nghe thấy cả những tiếng động nhỏ xíu dưới lớp tuyết.',
      'Khi cuộn tròn đi ngủ, cáo quấn chiếc đuôi rậm quanh mình như một tấm chăn ấm.',
      'Cáo con rất thích cùng nhau chơi đùa, lăn lộn trước cửa hang.',
    ],
  },
  bear: {
    about:
      'Gấu nâu là con vật to lớn, khỏe mạnh, có bộ lông dày và bờm xờm. Gấu nâu sống trong rừng và trên núi, và có chiếc mũi đánh hơi cực giỏi.',
    facts: [
      'Nhiều chú gấu ngủ đông một giấc thật dài trong chiếc hang ấm cúng, và gấu con bé xíu chào đời ngay trong hang.',
      'Gấu thường đứng thẳng trên hai chân sau để nhìn cho rõ và đánh hơi cho kỹ.',
      'Gấu nâu bơi giỏi, và có những chú bắt cá dưới sông rất tài.',
    ],
  },
  squirrel: {
    about:
      'Sóc là con vật nhanh nhẹn, lúc nào cũng bận rộn, có chiếc đuôi to và rậm giúp nó giữ thăng bằng. Sóc leo thoăn thoắt lên cây và nhảy từ cành này sang cành khác.',
    facts: [
      'Sóc chôn các loại hạt để dành ăn sau, và những hạt bị sóc bỏ quên có thể mọc thành cây mới!',
      'Sóc có thể chạy chúc đầu xuống thân cây bằng cách xoay ngược bàn chân sau.',
      'Tổ của sóc được làm từ cành nhỏ và lá cây, ở tít trên cao trên cây.',
    ],
  },
  hedgehog: {
    about:
      'Nhím là con vật nhỏ, phủ đầy hàng nghìn chiếc gai cứng. Khi thấy lo sợ, nó cuộn tròn lại thành một quả bóng gai thật chặt.',
    facts: [
      'Những chiếc gai đầu tiên của nhím con mềm và có màu trắng.',
      'Nhím hay khụt khịt và ủn ỉn, nghe giống hệt những chú lợn con.',
      'Vào mùa đông, nhím cuộn tròn trong một chiếc tổ lá ấm cúng và ngủ một mạch đến mùa xuân.',
    ],
  },
  raccoon: {
    about:
      'Gấu mèo là con vật thông minh, có chiếc mặt nạ đen ngang qua mắt và chiếc đuôi rậm có khoang. Gấu mèo hoạt động nhiều nhất vào ban đêm.',
    facts: [
      'Bàn chân trước của gấu mèo khéo léo như đôi bàn tay nhỏ, mở được cả nắp hộp và những chiếc khóa đơn giản.',
      'Đôi khi gấu mèo nhúng thức ăn vào nước trước khi ăn, trông như đang rửa đồ ăn vậy.',
      'Gấu mèo con kêu líu ríu và chin chít để trò chuyện với mẹ.',
    ],
  },
  wolf: {
    about:
      'Chó sói xám là thành viên hoang dã lớn nhất trong họ nhà chó. Sói sống cùng nhau thành từng gia đình, gọi là bầy.',
    facts: [
      'Sói tru lên để trò chuyện với cả bầy, và tiếng tru có thể vang xa khắp khu rừng.',
      'Cả bầy cùng nhau chăm sóc sói con, và những con sói lớn còn chơi đùa với các bé nữa.',
      'Từ rất, rất lâu rồi, chó nhà có nguồn gốc từ loài sói, nên chó và sói là họ hàng gần của nhau.',
    ],
  },
  badger: {
    about:
      'Lửng là con vật khỏe mạnh, lông xù, có khuôn mặt kẻ sọc đen trắng. Lửng đào những ngôi nhà rộng lớn dưới lòng đất.',
    facts: [
      'Lửng giữ nhà cửa sạch sẽ, gọn gàng, và tha cỏ cùng lá tươi về làm những chiếc giường ấm cúng.',
      'Có những chiếc hang mà các gia đình lửng đã ở suốt một trăm năm, thậm chí còn lâu hơn nữa.',
      'Lửng ra ngoài vào ban đêm và dùng chiếc mũi siêu thính để tìm giun và sâu bọ.',
    ],
  },
  beaver: {
    about:
      'Hải ly là con vật to, lông dày, có chiếc đuôi dẹt hình mái chèo. Hải ly là những người thợ xây cừ khôi, chúng đắp đập chắn ngang dòng suối bằng cành cây và bùn.',
    facts: [
      'Những chiếc răng cửa to của hải ly có màu cam, rất chắc khỏe và không bao giờ ngừng mọc.',
      'Hải ly xây những ngôi nhà ấm cúng, với những lối vào bí mật giấu dưới mặt nước.',
      'Hải ly báo động cho cả nhà bằng cách đập đuôi xuống mặt nước, kêu ùm một tiếng thật to.',
    ],
  },
  moose: {
    about:
      'Nai sừng tấm là loài lớn nhất trong họ hươu nai, có đôi chân dài và chiếc mũi to, xệ xuống. Nó sống trong những khu rừng lạnh giá ở phương bắc.',
    facts: [
      'Nai sừng tấm bơi rất giỏi, chúng còn có thể lặn hẳn xuống nước để gặm cây cỏ.',
      'Cặp sừng của nai sừng tấm đực có thể rộng bằng chiều cao của một người lớn.',
      'Dưới cằm nai sừng tấm có một mảng da phủ lông lủng lẳng, trông như một chiếc chuông nhỏ.',
    ],
  },
  skunk: {
    about:
      'Chồn hôi là con vật lông đen trắng, có chiếc đuôi to và bông xù. Nó có thể xịt ra một thứ nước cực kỳ hôi để bảo những con vật khác tránh xa.',
    facts: [
      'Trước khi xịt, chồn hôi giậm chân và dựng đuôi lên, có chú còn trồng cây chuối nữa!',
      'Khi đi khám phá, chồn hôi con xếp thành một hàng ngay ngắn, lũn cũn theo sau mẹ.',
      'Chồn hôi dùng những chiếc vuốt dài ở chân trước để đào đất, tìm bọ cánh cứng và các loại sâu bọ khác để ăn.',
    ],
  },
};

export default info;
