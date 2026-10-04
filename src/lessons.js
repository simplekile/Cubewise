// Lessons for cấp 0-2. A lesson is a short walk-through on the 3D cube:
//   setup  moves applied instantly before the lesson starts (usually the inverse of the solution)
//   steps  each step may turn one move and/or change what is highlighted; `text` explains the result
//   dim    (home) -> true greys a piece out, judged by the piece's solved position
//   track  solved position of the piece that glows
// Cube orientation: yellow up, white down, green front, orange right, red left, blue back.
//
// Words used in every lesson (keep them the same everywhere):
//   mặt phải / mặt trên ...   a face, the thing a letter turns. Never "cột phải".
//   tầng trên / giữa / dưới   a layer
//   chỗ                       where a piece belongs. A spot is named by the faces it touches, always in the
//                             order trên/dưới, trước/sau, trái/phải: "góc trên-trước-phải", "cạnh trên-trước".
//                             A middle-layer edge spot is "chỗ trước-phải của tầng giữa". Never "khe".
//   kẻ sọc                    the tracked piece (it is drawn with moving stripes)
//   gỡ                        undo a move. Never "hoàn tác" or "trả" for this.
//   lật                       change which colour of a piece faces up
//   về như cũ                 back to how it was before
//   liên hợp, commutator      the two patterns of cấp 2

import { invertSeq } from './cube.js';

const S = (s) => s.split(' ');
const kind = (p) => Math.abs(p.x) + Math.abs(p.y) + Math.abs(p.z); // 1 center, 2 edge, 3 corner
const notRU = (p) => !(p.x === 1 || p.y === 1);

export const LEVELS = [
  { n: 0, name: 'Làm quen', goal: 'Hoàn thành 3 bài làm quen' },
  { n: 1, name: 'Lần giải đầu tiên', goal: 'Tự giải được khối thật một lần' },
  { n: 2, name: 'Hiểu cơ chế', goal: 'Ao12 dưới 2 phút' },
  { n: 3, name: 'Trôi chảy', goal: 'Ao12 dưới 1 phút' },
  { n: 4, name: 'CFOP hai bước', goal: 'Ao12 dưới 40 giây' },
  { n: 5, name: 'Nhìn trước', goal: 'Ao12 dưới 30 giây' },
  { n: 6, name: 'CFOP đầy đủ', goal: 'Ao12 dưới 20 giây' },
];

// moves -> steps where only some indices carry new text; a step without text keeps the last one
function walk(moves, notes) {
  return moves.map((m, i) => ({ m, text: notes[i + 1] }));
}

export const LESSONS = [
  {
    id: 'c0-pieces', cap: 0, title: 'Ba loại mảnh',
    intro: 'Khối 3x3 có 26 mảnh nhìn thấy được, nhưng chỉ có 3 loại. Bấm Tiếp để xem từng loại.',
    steps: [
      { label: 'Tâm', dim: (p) => kind(p) !== 1, text: '<b>6 mảnh tâm</b>, mỗi mảnh có 1 màu. Tâm không bao giờ đổi chỗ, nên màu của tâm cho biết cả mặt đó phải có màu gì.' },
      { label: 'Cạnh', dim: (p) => kind(p) !== 2, text: '<b>12 mảnh cạnh</b>, mỗi mảnh có 2 màu. Xoay thế nào thì cạnh cũng chỉ nằm ở chỗ dành cho cạnh.' },
      { label: 'Góc', dim: (p) => kind(p) !== 3, text: '<b>8 mảnh góc</b>, mỗi mảnh có 3 màu. Góc cũng chỉ nằm ở chỗ dành cho góc.' },
      { label: 'Ý nghĩa', dim: null, text: 'Vì vậy, giải khối là <b>đưa từng mảnh về đúng chỗ</b>, không phải tô màu từng ô. Trong các bài, chỗ của mảnh được gọi theo các mặt nó chạm vào, ví dụ góc <b>trên-trước-phải</b>.' },
    ],
    quiz: {
      q: 'Mảnh có đúng 2 màu là loại nào?',
      opts: ['Tâm', 'Cạnh', 'Góc'], ok: 1,
      right: 'Tâm có 1 màu, cạnh có 2 màu, góc có 3 màu.',
      hint: 'Đếm số mặt của mảnh lộ ra ngoài.',
    },
  },
  {
    id: 'c0-notation', cap: 0, title: 'Ký hiệu nước đi',
    intro: 'Mỗi chữ cái là một mặt: <b>R</b> phải, <b>L</b> trái, <b>U</b> trên, <b>D</b> dưới, <b>F</b> trước, <b>B</b> sau. Chỉ có chữ cái nghĩa là xoay mặt đó một phần tư vòng theo chiều kim đồng hồ, khi nhìn thẳng vào mặt đó.',
    steps: walk(S("R R' U U' F2 F2"), [,
      '<b>R</b>: xoay mặt phải theo chiều kim đồng hồ, nhìn từ bên phải. Cột bên phải của mặt trước đi lên.',
      "<b>R'</b> (đọc là R phẩy): xoay mặt phải ngược chiều kim đồng hồ. Làm R rồi R' thì khối về như cũ.",
      '<b>U</b>: xoay mặt trên theo chiều kim đồng hồ, nhìn từ trên xuống. Hàng trên cùng của mặt trước chạy sang trái.',
      "<b>U'</b>: xoay mặt trên ngược chiều kim đồng hồ. Khối về như cũ.",
      '<b>F2</b>: xoay mặt trước nửa vòng, bằng hai lần F. Nửa vòng thì xoay chiều nào cũng như nhau.',
      'Thêm một F2 nữa là đủ một vòng, khối về như cũ.',
    ]),
    quiz: {
      q: "R' khác R ở điểm nào?",
      opts: ['Xoay một mặt khác', 'Vẫn là mặt phải, nhưng xoay ngược chiều kim đồng hồ', 'Xoay nửa vòng'], ok: 1,
      right: 'Dấu phẩy chỉ đổi chiều xoay, mặt vẫn là mặt phải.',
      hint: 'Chữ cái cho biết mặt nào, ký hiệu phía sau cho biết xoay thế nào.',
    },
  },
  {
    id: 'c0-reverse', cap: 0, title: 'Gỡ một chuỗi nước đi',
    intro: 'Chuỗi nước đi nào cũng gỡ được. Hãy làm <b>R U F</b>, rồi tìm cách đưa khối về như cũ.',
    steps: walk(S("R U F F' U' R'"), [,
      '<b>R</b>: nước thứ nhất.',
      '<b>U</b>: nước thứ hai.',
      "<b>F</b>: nước thứ ba, khối đã bị xáo trộn. F' chỉ gỡ được F khi khối còn y như lúc vừa làm F, nên phải gỡ F trước tiên bằng <b>F'</b>.",
      "<b>F'</b> gỡ F: khối về như lúc vừa làm xong U. Tiếp theo gỡ U bằng <b>U'</b>.",
      "<b>U'</b> gỡ U: khối về như lúc vừa làm xong R. Cuối cùng gỡ R bằng <b>R'</b>.",
      'Khối đã về như cũ. Quy tắc: <b>đảo thứ tự, rồi đổi chiều từng nước</b>. Giống đi tất rồi đi giày: lúc cởi thì cởi giày trước.',
    ]),
    quiz: {
      q: 'Chuỗi nào gỡ được R U F?',
      opts: ["R' U' F'", "F' U' R'", 'F U R'], ok: 1,
      right: "F làm sau cùng nên phải gỡ trước tiên. Đảo thứ tự thành F U R, rồi đổi chiều từng nước. Làm R' U' F' thì khối không về như cũ.",
      hint: 'Nước làm sau cùng phải được gỡ trước tiên.',
    },
  },

  {
    id: 'c1-cross', cap: 1, title: 'Dấu cộng trắng',
    solution: S('F2'), track: [0, -1, 1],
    dim: (p) => !(kind(p) === 1 || (p.x === 0 && p.y === -1 && p.z === 1)),
    intro: 'Bước 1 của cách giải từng tầng: làm dấu cộng trắng ở mặt dưới. Bắt đầu bằng 4 cạnh trắng vì đặt chúng không làm hỏng gì, và chúng nối tâm trắng với 4 tâm xung quanh, làm mốc cho các bước sau. Cạnh trắng-xanh lá (kẻ sọc) đang ở tầng trên: màu trắng hướng lên, màu xanh lá nằm ngay trên tâm xanh lá.',
    notes: [, '<b>F2</b>: xoay mặt trước nửa vòng. Cạnh đi thẳng xuống tầng dưới mà vẫn ở mặt trước, nên màu xanh lá vẫn khớp tâm, còn màu trắng quay xuống dưới. Với các cạnh trắng khác có màu trắng hướng lên: xoay U cho màu còn lại nằm trên tâm cùng màu, rồi xoay mặt đó nửa vòng.'],
    quiz: {
      q: 'Vì sao phải xoay U cho cạnh nằm trên tâm cùng màu rồi mới làm F2?',
      opts: ['Để màu thứ hai của cạnh khớp với tâm', 'Để F2 nhanh hơn', 'Không cần, đặt đâu cũng được'], ok: 0,
      right: 'Tâm không bao giờ đổi chỗ, nên cạnh trắng-xanh lá chỉ đúng khi nằm giữa tâm trắng và tâm xanh lá. F2 giữ màu xanh lá ở nguyên mặt trước, nên phải xoay U cho khớp tâm trước.',
      hint: 'Loại mảnh nào không bao giờ đổi chỗ?',
    },
  },
  {
    id: 'c1-corners', cap: 1, title: 'Góc trắng',
    solution: S("R U R' U' R U R' U' R U R' U'"), track: [1, -1, 1],
    dim: (p) => !(kind(p) === 1 || p.y === -1),
    intro: "Bước 2: đưa 4 góc trắng về chỗ để xong cả tầng dưới. Góc trắng-xanh lá-cam (kẻ sọc) đang nằm ngay trên chỗ của nó, màu trắng hướng lên. Lặp <b>R U R' U'</b> cho tới khi góc về đúng chỗ với màu trắng hướng xuống. Bốn nước này theo nhịp: <b>mở, đổi, đóng, trả</b>.",
    notes: [,
      '<b>R · mở</b>: nâng chỗ dưới-trước-phải lên tầng trên, để tầng trên với tới được. Góc kẻ sọc tạm bị đẩy ra trên-sau-phải.',
      '<b>U · đổi</b>: tầng trên đẩy mảnh vừa được nâng lên sang trái, và đưa góc kẻ sọc về trên-trước-phải.',
      "<b>R' · đóng</b>: hạ mặt phải xuống, đưa góc kẻ sọc về chỗ dưới-trước-phải.",
      "<b>U' · trả</b>: đưa tầng trên về. Góc đã đúng chỗ nhưng màu trắng đang hướng sang phải, nên lặp tiếp. Cấp 2 sẽ giải thích kỹ nhịp này.", , , , 'Xong lần thứ hai. Dấu cộng trắng vẫn nguyên sau mỗi lần lặp.', , , , 'Góc đã đúng chỗ, màu trắng hướng xuống. Tùy hướng lúc đầu, bạn cần lặp 1, 3 hoặc 5 lần.'],
    quiz: {
      q: 'Góc trắng nằm ngay trên chỗ của nó nhưng màu trắng hướng sang phải. Làm gì?',
      opts: ["Lặp R U R' U' tới khi góc vào đúng", 'Xoay cả khối', 'Học thêm công thức mới'], ok: 0,
      right: "Lặp R U R' U' 6 lần thì khối về như cũ, và trong lúc đó góc này đi qua đủ 3 hướng ngay trên chỗ của nó. Vì vậy hướng nào cũng chỉ cần lặp. Màu trắng hướng sang phải thì 1 lần là xong.",
      hint: 'Bài vừa rồi chỉ lặp một công thức.',
    },
  },
  {
    id: 'c1-middle', cap: 1, title: 'Tầng giữa',
    solution: S("U R U' R' U' F' U F"), track: [1, 0, 1],
    dim: (p) => !(p.y <= 0 || (p.x === 1 && p.y === 0 && p.z === 1)),
    intro: 'Bước 3: tầng dưới đã xong, giờ đưa 4 cạnh không có màu vàng vào tầng giữa. Cạnh xanh lá-cam (kẻ sọc) đang ở tầng trên, màu xanh lá khớp tâm xanh lá phía trước. Nó cần vào chỗ trước-phải của tầng giữa. Cách làm: nhấc góc trắng bên dưới lên, ghép với cạnh thành một cặp, rồi hạ cả cặp xuống.',
    notes: [,
      "<b>U · tránh</b>: dời cạnh xanh lá-cam sang trái cho khỏi vướng. Nếu bỏ nước này, R' ở sau sẽ kéo cạnh xuống tầng giữa nhưng bị ngược màu.",
      '<b>R · mở</b>: nâng góc trắng ở dưới-trước-phải lên tầng trên.',
      "<b>U'</b>: góc trắng sang trên-sau-phải, cạnh xanh lá-cam về lại trên-trước.",
      "<b>R' · đóng</b>: hạ mặt phải. Góc trắng về trên-trước-phải, nằm sát cạnh xanh lá-cam thành một cặp, cả hai có màu xanh lá nhìn ra trước.",
      "<b>U' · tránh</b>: dời cả cặp sang phải, ra khỏi mặt trước, để F' sắp tới không chạm vào chúng.",
      "<b>F' · mở</b>: xoay mặt trước ngược chiều kim đồng hồ. Cạnh trắng-xanh lá tạm vào chỗ trước-phải của tầng giữa. Giờ một nước F sẽ hạ chỗ trên-trước-phải xuống chỗ góc trắng, và chỗ trên-trước xuống tầng giữa.",
      '<b>U · đổi</b>: đưa cặp góc và cạnh về trên-trước-phải và trên-trước, đúng hai chỗ mà F sẽ hạ xuống.',
      "<b>F · đóng</b>: hạ cả cặp. Góc về chỗ, cạnh vào tầng giữa, dấu cộng trắng cũng về như cũ. Nếu cạnh cần vào bên trái, làm bản đối xứng: U' L' U L U F U' F'.",
    ],
    quiz: {
      q: 'Vì sao công thức nhấc góc trắng lên rồi mới hạ xuống?',
      opts: ['Để ghép nó với cạnh rồi hạ cả hai cùng lúc', 'Vì góc đang sai', 'Để xáo trộn tầng trên'], ok: 0,
      right: 'Góc trắng nằm ngay dưới chỗ cạnh cần vào. Công thức nhấc nó lên, ghép với cạnh thành một cặp, rồi hạ cả cặp xuống. Tầng dưới chỉ bị xáo trộn tạm thời rồi về như cũ.',
      hint: 'Góc trắng đã đúng từ trước, công thức chỉ tạm nhấc nó ra.',
    },
  },
  {
    id: 'c1-yellowcross', cap: 1, title: 'Dấu cộng vàng',
    solution: S("F R U R' U' F'"),
    dim: (p) => p.y < 1,
    intro: "Bước 4: hai tầng dưới đã xong, giờ làm mặt vàng. Trước hết lật các cạnh cho màu vàng hướng lên, tạo thành dấu cộng. Tầng trên đang có một đường vàng nằm ngang, còn hai cạnh trên-trước và trên-sau bị lật. <b>F R U R' U' F'</b> sửa hai cạnh đó mà không làm hỏng hai tầng dưới.",
    notes: [,
      '<b>F · chuẩn bị</b>: cạnh trên-trước (màu vàng nhìn ra trước) xuống chỗ trước-phải của tầng giữa, nơi R với tới được.',
      '<b>R</b>: nâng cạnh đó trở lại tầng trên, lần này màu vàng hướng lên.',
      '<b>U</b>: xoay tầng trên, đưa cạnh bị lật ở phía sau sang bên phải.',
      "<b>R'</b>: hạ mặt phải, kéo cạnh bị lật đó xuống chỗ trước-phải của tầng giữa.",
      "<b>U'</b>: đưa tầng trên về. Đã có 3 cạnh vàng hướng lên, cạnh thứ tư đang chờ ở tầng giữa. Kiểu làm A, rồi B, rồi gỡ A như thế này gọi là liên hợp, bạn sẽ học ở cấp 2.",
      "<b>F' · gỡ F</b>: cạnh đang chờ lên lại tầng trên với màu vàng hướng lên, hai tầng dưới về như cũ. Trên khối thật: đường vàng nằm dọc thì xoay U cho nằm ngang. Hình chữ L: đặt hai nhánh chỉ ra sau và sang trái, rồi làm 2 lần. Chỉ có chấm giữa: làm 1 lần sẽ ra chữ L.",
    ],
    quiz: {
      q: "Vì sao F' ở cuối không làm hỏng hai tầng dưới?",
      opts: ["Vì F' gỡ F, chỉ còn lại tác dụng của R U R' U'", "Vì F' không chạm vào tầng dưới", 'Ngẫu nhiên'], ok: 0,
      right: "Ở hai tầng dưới, R U R' U' chỉ chạm chỗ trước-phải của tầng giữa và góc dưới-trước-phải. F đã đưa mảnh của tầng trên vào đúng hai chỗ đó, F' đưa chúng về, nên chỉ tầng trên thay đổi.",
      hint: "F có chạm vào tầng dưới. F và F' liên quan với nhau thế nào?",
    },
  },
  {
    id: 'c1-sune', cap: 1, title: 'Mặt vàng',
    solution: S("R U R' U R U2 R'"),
    dim: (p) => p.y < 1,
    intro: "Bước 5: dấu cộng vàng đã có, giờ lật các góc cho cả mặt trên thành màu vàng. Ở đây chỉ một góc có màu vàng hướng lên, ở trên-trước-trái: đúng trường hợp dùng công thức <b>Sune</b>. Mẹo: U chỉ đưa các góc đi vòng mà không đổi màu hướng lên; chỉ R và R' mới lật góc.",
    notes: [,
      '<b>R</b>: nâng góc trắng ở dưới-trước-phải lên tầng trên. Sune tạm lấy chỗ của nó để lật các góc vàng, cuối công thức sẽ đưa nó về.',
      '<b>U</b>: đưa góc trắng sang trên-trước-trái, ra khỏi mặt phải.',
      "<b>R'</b>: hạ mặt phải. Một góc vàng xuống nằm tạm ở chỗ của góc trắng.",
      '<b>U</b>: đưa góc trắng tiếp sang trên-sau-trái.',
      '<b>R</b>: nâng góc vàng đang nằm tạm đó lên lại tầng trên.',
      '<b>U2</b>: xoay tầng trên nửa vòng, đưa góc trắng về trên-trước-phải, ngay trên chỗ của nó.',
      "<b>R' · trả</b>: góc trắng về chỗ cũ, hai tầng dưới về như cũ, cả mặt trên đã vàng. Trên khối thật, nếu chưa xong thì xoay U rồi làm lại. Có 1 góc vàng hướng lên: đặt nó ở trên-trước-trái. Không có góc nào: đặt góc có màu vàng nhìn sang trái ở trên-trước-trái. Có 2 góc: đặt góc có màu vàng nhìn ra trước ở trên-trước-trái.",
    ],
    quiz: {
      q: 'Sau Sune, mặt trên đã vàng nhưng các mảnh tầng trên có thể sai chỗ. Vì sao vẫn ổn?',
      opts: ['Vì bước sau chỉ đổi chỗ mảnh, màu vàng vẫn hướng lên', 'Vì sai chỗ không quan trọng', 'Vì làm lại Sune sẽ sửa'], ok: 0,
      right: 'Mỗi bước giữ nguyên kết quả của bước trước: lật cho đúng màu trước, đổi chỗ sau.',
      hint: 'Hai bài tiếp theo chỉ đổi chỗ mảnh.',
    },
  },
  {
    id: 'c1-corners-ll', cap: 1, title: 'Đổi chỗ góc tầng trên',
    solution: S("R' F R' B2 R F' R' B2 R2"),
    dim: (p) => p.y < 1,
    track: [-1, 1, 1],
    intro: 'Bước 6: mặt trên đã vàng nhưng các mảnh tầng trên có thể sai chỗ. Công thức bài này chỉ đổi chỗ góc, bài sau chỉ đổi chỗ cạnh, nên hai bước không làm hỏng nhau. Ở đây góc trên-trước-trái (kẻ sọc) đã đúng chỗ, 3 góc còn lại cần đổi chỗ vòng tròn mà vẫn giữ màu vàng hướng lên.',
    notes: [,
      "<b>R' · chuẩn bị</b>: hạ mặt phải, để 3 góc cần đổi nằm đúng 3 chỗ mà phần giữa công thức sẽ đổi vòng: trên-trước-phải, dưới-trước-phải và trên-sau-trái. R2 ở cuối sẽ gỡ nước này.",
      '<b>F · A</b>: xoay mặt trước, góc kẻ sọc tạm sang trên-trước-phải.', , ,
      "<b>R' B2 R · B</b>: đổi chỗ góc dưới-trước-phải với góc trên-sau-trái. Ở mặt trước, chỉ chỗ dưới-trước-phải bị chạm tới: góc kẻ sọc xuống đó rồi lại về trên-trước-phải.",
      "<b>F' · gỡ A</b>: góc kẻ sọc về trên-trước-trái. A và B chỉ chung đúng một chỗ góc, nên làm A, B, gỡ A, rồi B lần nữa thì chỉ 3 góc đổi chỗ vòng tròn. Kiểu này gọi là commutator, học ở cấp 2.", , ,
      "<b>R' B2 R2</b>: làm B lần nữa, và R cuối cùng gỡ R' ở đầu. Xong 4 góc. Trên khối thật: xoay U tới khi có đúng 1 góc đúng chỗ, xoay cả khối cho góc đó ở trên-trước-trái rồi làm. Nếu 3 góc kia vẫn sai, làm lại. Nếu không góc nào đúng, làm 1 lần rồi tìm lại.",
    ],
    quiz: {
      q: 'Trước khi làm công thức, đặt góc đã đúng chỗ ở đâu?',
      opts: ['Trên-trước-trái', 'Trên-trước-phải', 'Ở đâu cũng được'], ok: 0,
      right: 'Công thức đổi chỗ vòng tròn 3 góc còn lại. Góc trên-trước-trái chỉ đi một vòng rồi về đúng chỗ cũ, nên góc đã đúng phải đặt ở đó.',
      hint: 'Để ý góc kẻ sọc trong bài.',
    },
  },
  {
    id: 'c1-edges-ll', cap: 1, title: 'Đổi chỗ cạnh tầng trên',
    solution: S("R U' R U R U R U' R' U' R2"),
    dim: (p) => p.y < 1,
    track: [0, 1, -1],
    intro: 'Bước cuối: mặt vàng và 4 góc đã xong, còn 3 cạnh tầng trên cần đổi chỗ vòng tròn. Đặt cạnh đã đúng chỗ ở trên-sau (cạnh kẻ sọc). Công thức đổi chỗ vòng tròn 3 cạnh còn lại, mọi thứ khác về như cũ. Ý chính: mặt phải xoay đủ một vòng và mang các cạnh đi theo.',
    notes: [,
      '<b>R</b>: cạnh vàng-đỏ (đang ở trên-phải, chỗ của cạnh vàng-cam) bị mặt phải kéo xuống chỗ sau-phải của tầng giữa.',
      "<b>U'</b>: xoay tầng trên, đưa cạnh vàng-cam vào trên-phải để mặt phải mang nó đi tiếp.", , , , ,
      '<b>R U R U R</b>: bốn nước R vừa xoay mặt phải đủ một vòng. Cạnh vàng-đỏ đi hết vòng rồi lên lại trên-phải; cạnh vàng-cam vẫn nằm trong mặt phải.', , ,
      "<b>U' R' U'</b>: cạnh vàng-đỏ về trên-trái, cạnh vàng-xanh lá về trên-trước, R' đưa cạnh vàng-cam xuống dưới-phải. Giờ mọi mảnh đã đúng, chỉ có mặt phải đang lệch nửa vòng.",
      '<b>R2</b>: xoay mặt phải nửa vòng cho về đúng, cạnh vàng-cam lên đúng chỗ. Khối đã giải xong. Trên khối thật, nếu 3 cạnh đổi sai chiều thì làm thêm một lần. Đó là toàn bộ cách giải từng tầng, giờ thử trên khối thật nhé.',
    ],
    quiz: {
      q: 'Cả 4 cạnh tầng trên đều sai chỗ. Làm gì?',
      opts: ['Làm công thức một lần, sẽ có một cạnh đúng chỗ', 'Giải lại từ đầu', 'Dùng công thức đổi chỗ góc'], ok: 0,
      right: 'Khi cả 4 cạnh sai, chúng sai theo từng cặp đổi chỗ cho nhau. Công thức đổi chỗ vòng tròn 3 cạnh, nên sau một lần luôn có đúng một cạnh về chỗ. Đặt cạnh đó ở trên-sau rồi làm tiếp.',
      hint: 'Công thức cần một cạnh đã đúng chỗ để đặt ở phía sau.',
    },
    selfReport: true,
  },

  {
    id: 'c2-commutator', cap: 2, title: 'Commutator đầu tiên',
    solution: S("R U R' U'"), setup: [], track: [1, 1, 1], dim: notRU, six: true,
    intro: 'Khối đang ở trạng thái đã giải. Các mảnh mờ không thuộc mặt phải hay mặt trên, nên suốt 4 nước sắp tới chúng đứng yên. Theo dõi góc kẻ sọc: bốn nước đi theo nhịp <b>mở, đổi, đóng, trả</b>.',
    notes: [,
      '<b>R · mở</b>: nâng chỗ dưới-trước-phải lên tầng trên, để tầng trên với tới được. Góc kẻ sọc tạm bị đẩy ra trên-sau-phải.',
      '<b>U · đổi</b>: tầng trên đẩy mảnh vừa được nâng lên sang trái, và đưa góc kẻ sọc vào chỗ trên-trước-phải mà mảnh đó vừa rời đi.',
      "<b>R' · đóng</b>: hạ mặt phải. Góc kẻ sọc xuống dưới-trước-phải, thế chỗ mảnh cũ.",
      "<b>U' · trả</b>: đưa tầng trên về, mảnh cũ quay lại trên-trước-phải. R' gỡ R, U' gỡ U, nên mảnh nào chỉ bị một trong hai mặt chạm tới đều về chỗ cũ. Chỉ vài mảnh nằm ở chỗ giao nhau của mặt phải và mặt trên bị đổi chỗ. Dạng A B A' B' này gọi là commutator. Bấm nút lặp để làm 6 lần liên tiếp và xem khối tự về như cũ.",
    ],
    quiz: {
      q: 'Mảnh nào chắc chắn không đổi chỗ?',
      opts: ['Cạnh dưới-trái', 'Góc dưới-trước-phải', 'Mọi mảnh của mặt phải'], ok: 0,
      right: 'Cạnh dưới-trái không thuộc mặt phải, cũng không thuộc mặt trên, nên không nước nào chạm tới nó. Góc dưới-trước-phải thì có: nước R đầu tiên nâng nó lên.',
      hint: 'Một mảnh chỉ di chuyển khi mặt chứa nó được xoay.',
    },
  },
  {
    id: 'c2-conjugate', cap: 2, title: 'Liên hợp A B A\'',
    solution: S("F R U R' U' F'"), setup: [],
    intro: "Liên hợp là làm <b>A</b> để đưa các mảnh tới chỗ dễ xử lý, làm <b>B</b>, rồi gỡ <b>A</b>. Ở đây A = F, B = R U R' U'.",
    notes: [,
      '<b>A = F · chuẩn bị</b>: cạnh trên-trước xuống chỗ trước-phải của tầng giữa, góc trên-trước-phải xuống dưới-trước-phải. Đó đúng là hai chỗ ở hai tầng dưới mà B sẽ chạm vào.', , , ,
      "<b>B = R U R' U'</b>: commutator ở bài trước. Ở hai tầng dưới, nó chỉ chạm chỗ trước-phải của tầng giữa và góc dưới-trước-phải, nơi đang chứa mảnh của tầng trên.",
      "<b>A' = F' · gỡ A</b>: đưa các mảnh đó về tầng trên. Kết quả là chỉ tầng trên thay đổi, hai tầng dưới về như cũ. Đây chính là công thức dấu cộng vàng ở cấp 1.",
    ],
    quiz: {
      q: "Trong F R U R' U' F', phần nào là A?",
      opts: ['F', 'R U', "U' F'"], ok: 0,
      right: "F ở đầu để chuẩn bị, F' ở cuối gỡ nó, nên A = F. Phần nằm giữa, R U R' U', là B.",
      hint: 'A ở đầu, và nước gỡ nó ở cuối.',
    },
  },
];

// Fill in steps/setup for algorithm lessons.
for (const l of LESSONS) {
  if (!l.solution) continue;
  if (!l.setup) l.setup = invertSeq(l.solution);
  l.steps = walk(l.solution, l.notes || []);
}

export const lessonsOf = (cap) => LESSONS.filter((l) => l.cap === cap);
export const byId = (id) => LESSONS.find((l) => l.id === id);
