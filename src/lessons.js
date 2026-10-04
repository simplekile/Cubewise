// Lessons for cấp 0-2. A lesson is a short walk-through on the 3D cube:
//   setup  moves applied instantly before the lesson starts (usually the inverse of the solution)
//   steps  each step may turn one move and/or change what is highlighted; `text` explains the result
//   dim    (home) -> true greys a piece out, judged by the piece's solved position
//   track  solved position of the piece that glows
// Cube orientation: yellow up, white down, green front, orange right, red left, blue back.

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
    intro: 'Khối 3x3 có 26 mảnh nhìn thấy, nhưng chỉ có 3 loại. Bấm tiếp để xem từng loại.',
    steps: [
      { label: 'Tâm', dim: (p) => kind(p) !== 1, text: '<b>6 mảnh tâm</b>, mỗi mảnh 1 màu. Khi vặn các mặt, tâm không bao giờ đổi chỗ cho nhau, nên màu tâm quyết định màu của cả mặt.' },
      { label: 'Cạnh', dim: (p) => kind(p) !== 2, text: '<b>12 mảnh cạnh</b>, mỗi mảnh 2 màu. Vặn kiểu gì thì cạnh vẫn nằm ở chỗ của cạnh.' },
      { label: 'Góc', dim: (p) => kind(p) !== 3, text: '<b>8 mảnh góc</b>, mỗi mảnh 3 màu. Góc luôn nằm ở chỗ của góc.' },
      { label: 'Ý nghĩa', dim: null, text: 'Vì vậy giải khối không phải tô màu từng ô, mà là <b>đưa từng mảnh về nhà</b> của nó.' },
    ],
    quiz: {
      q: 'Mảnh có đúng 2 màu là loại nào?',
      opts: ['Tâm', 'Cạnh', 'Góc'], ok: 1,
      right: 'Tâm có 1 màu, cạnh có 2, góc có 3.',
      hint: 'Đếm số mặt lộ ra ngoài của mảnh đó.',
    },
  },
  {
    id: 'c0-notation', cap: 0, title: 'Ký hiệu nước đi',
    intro: 'Mỗi chữ là một mặt: <b>R</b> phải, <b>L</b> trái, <b>U</b> trên, <b>D</b> dưới, <b>F</b> trước, <b>B</b> sau. Một chữ đứng riêng là xoay mặt đó 90° theo chiều kim đồng hồ, khi nhìn thẳng vào mặt đó.',
    steps: walk(S("R R' U U' F2 F2"), [,
      '<b>R</b>: mặt phải xoay theo chiều kim đồng hồ khi nhìn từ bên phải. Cột phải của mặt trước đi lên.',
      "<b>R'</b> (đọc là R phẩy): cùng mặt đó, xoay ngược lại. R rồi R' là về như cũ.",
      '<b>U</b>: mặt trên xoay theo chiều kim đồng hồ khi nhìn từ trên xuống. Hàng trên của mặt trước chạy sang trái.',
      "<b>U'</b>: mặt trên xoay ngược lại, về như cũ.",
      '<b>F2</b>: mặt trước xoay nửa vòng, bằng hai lần F. Xoay chiều nào cũng ra cùng kết quả.',
      'Thêm F2 nữa là đủ một vòng, khối về nguyên trạng.',
    ]),
    quiz: {
      q: "R' khác R ở điểm nào?",
      opts: ['Xoay một mặt khác', 'Cùng mặt phải, xoay ngược chiều kim đồng hồ', 'Xoay nửa vòng'], ok: 1,
      right: "Dấu phẩy chỉ đổi chiều, mặt vẫn là mặt phải.",
      hint: 'Chữ cái cho biết mặt nào, dấu phía sau cho biết xoay thế nào.',
    },
  },
  {
    id: 'c0-reverse', cap: 0, title: 'Gỡ ngược một công thức',
    intro: 'Chuỗi nước đi nào cũng gỡ được. Thử làm <b>R U F</b>, rồi tìm đường về.',
    steps: walk(S("R U F F' U' R'"), [,
      '<b>R</b>: nước thứ nhất.',
      '<b>U</b>: nước thứ hai.',
      "<b>F</b>: nước thứ ba, khối đã bị xáo. Nước làm sau cùng phải gỡ đầu tiên: chỉ lúc khối còn y như ngay sau F thì <b>F'</b> mới trả đúng các mảnh F vừa dời.",
      "<b>F' · gỡ F</b>: khối về đúng trạng thái ngay sau U. Giờ nước cần gỡ là U, nên làm <b>U'</b>.",
      "<b>U' · gỡ U</b>: khối về trạng thái ngay sau R. Gỡ nốt bằng <b>R'</b>.",
      'Về như cũ. Quy tắc: <b>đảo thứ tự và đổi chiều</b> từng nước, vì mỗi nước gỡ phải gặp đúng trạng thái mà nước nó gỡ để lại. Như đi tất rồi đi giày, khi cởi thì cởi giày trước.',
    ]),
    quiz: {
      q: 'Công thức nào gỡ được R U F?',
      opts: ["R' U' F'", "F' U' R'", 'F U R'], ok: 1,
      right: "F làm sau cùng nên phải gỡ đầu tiên: đảo thứ tự thành F U R, rồi đổi chiều từng nước. Làm R' U' F' thì khối không về như cũ.",
      hint: 'Nước làm sau cùng phải được gỡ đầu tiên.',
    },
  },

  {
    id: 'c1-cross', cap: 1, title: 'Dấu cộng trắng',
    solution: S('F2'), track: [0, -1, 1],
    dim: (p) => !(kind(p) === 1 || (p.x === 0 && p.y === -1 && p.z === 1)),
    intro: 'Bước 1 của cách giải tầng-theo-tầng: dấu cộng trắng ở mặt dưới. Làm 4 cạnh trắng trước vì đặt chúng không phá gì, và chúng nối tâm trắng với 4 tâm bên làm mốc cho các bước sau. Cạnh trắng-xanh lá đang ở tầng trên, màu trắng hướng lên, màu xanh lá nằm ngay trên tâm xanh lá.',
    notes: [, '<b>F2 · hạ</b>: nửa vòng đưa cạnh thẳng xuống tầng dưới mà vẫn ở mặt trước, nên xanh lá vẫn khớp tâm, trắng quay xuống. Cạnh trắng khác có màu trắng hướng lên: xoay U cho màu kia nằm trên tâm cùng màu, rồi xoay mặt đó nửa vòng.'],
    quiz: {
      q: 'Vì sao phải xoay U cho cạnh nằm trên tâm cùng màu rồi mới F2?',
      opts: ['Để màu thứ hai của cạnh khớp với tâm bên cạnh', 'Để F2 nhanh hơn', 'Không cần, đặt đâu cũng được'], ok: 0,
      right: 'Tâm không di chuyển, nên cạnh trắng-xanh lá chỉ đúng khi nằm giữa tâm trắng và tâm xanh lá. F2 giữ màu kia ở nguyên mặt đó, nên phải xoay U cho khớp tâm trước khi hạ.',
      hint: 'Mảnh nào trên khối không bao giờ đổi chỗ?',
    },
  },
  {
    id: 'c1-corners', cap: 1, title: 'Góc trắng',
    solution: S("R U R' U' R U R' U' R U R' U'"), track: [1, -1, 1],
    dim: (p) => !(kind(p) === 1 || p.y === -1),
    intro: "Bước 2: đưa 4 góc trắng về để xong cả tầng dưới. Góc trắng-xanh lá-cam đang nằm ngay trên chỗ của nó, màu trắng hướng lên. Lặp <b>R U R' U'</b> cho tới khi nó về đúng chỗ, đúng hướng. Bốn nước này đi theo nhịp: mở khe, đổi mảnh, đóng khe, trả tầng trên.",
    notes: [,
      '<b>R · mở</b>: nâng khe góc trắng lên tầng trên để tầng trên chạm được vào nó. Góc phát sáng tạm lùi ra sau.',
      '<b>U · đổi</b>: tầng trên đẩy mảnh đang nằm trong khe sang trái, và đưa góc phát sáng vào đúng chỗ đó.',
      "<b>R' · đóng</b>: hạ khe xuống, mang góc phát sáng về tầng dưới.",
      "<b>U' · trả</b>: đưa tầng trên về. Góc đã xuống đúng chỗ nhưng màu trắng đang quay sang phải, nên làm tiếp. Nhịp này được giải thích kỹ ở cấp 2.", , , , 'Lần thứ hai xong. Dấu cộng trắng vẫn nguyên sau mỗi lần lặp.', , , , 'Góc đã về đúng chỗ, đúng hướng. Tùy hướng ban đầu, bạn cần 1, 3 hoặc 5 lần.'],
    quiz: {
      q: "Góc trắng ở trên chỗ của nó nhưng màu trắng hướng sang phải. Làm gì?",
      opts: ["Lặp R U R' U' tới khi góc vào đúng", 'Xoay cả khối', 'Phải học công thức mới'], ok: 0,
      right: "Sáu lần R U R' U' thì khối về như cũ, và trên đường đi góc này ghé chỗ ngay trên khe với đủ 3 hướng. Nên hướng nào cũng chỉ cần lặp; trắng hướng sang phải thì 1 lần là xong.",
      hint: 'Bài vừa rồi lặp đúng một công thức.',
    },
  },
  {
    id: 'c1-middle', cap: 1, title: 'Tầng giữa',
    solution: S("U R U' R' U' F' U F"), track: [1, 0, 1],
    dim: (p) => !(p.y <= 0 || (p.x === 1 && p.y === 0 && p.z === 1)),
    intro: 'Bước 3: tầng trắng đã xong, giờ lấp 4 khe tầng giữa bằng các cạnh không có màu vàng. Cạnh xanh lá-cam ở tầng trên, màu xanh lá khớp tâm xanh lá phía trước; nó cần vào khe trước-phải. Ý tưởng: nhấc góc trắng bên dưới khe lên, ghép với cạnh thành một cặp, rồi hạ cả cặp xuống.',
    notes: [,
      "<b>U · tránh</b>: dời cạnh xanh lá-cam sang trái. Lát nữa U' đưa nó về chỗ cũ; nếu bỏ nước này, R' sẽ kéo cạnh vào khe nhưng bị lật ngược.",
      '<b>R · mở</b>: nâng góc trắng ở dưới-trước-phải lên tầng trên.',
      "<b>U'</b>: đưa góc trắng ra sau-phải, cạnh xanh lá-cam về lại phía trước.",
      "<b>R' · đóng</b>: hạ cột phải. Góc trắng về trước-phải nhưng vẫn ở tầng trên, sát cạnh xanh lá-cam: hai mảnh thành một cặp, mặt xanh lá cùng nhìn ra trước.",
      "<b>U' · tránh</b>: dời cả cặp sang phải, ra khỏi mặt trước, để F' sắp tới không chạm vào chúng.",
      "<b>F' · mở</b>: xoay mặt trước ngược chiều. Giờ một nước F sẽ đưa chỗ trên-trước-phải xuống đúng chỗ góc trắng, và chỗ trên-trước xuống đúng khe. Cạnh trắng-xanh lá tạm nằm trong khe.",
      '<b>U · đổi</b>: đưa cặp góc và cạnh về trước-phải, đúng hai chỗ mà F sẽ hạ xuống.',
      "<b>F · đóng</b>: hạ cả cặp: góc về chỗ, cạnh vào khe, dấu cộng trắng cũng về lại. Cạnh cần vào bên trái thì làm bản đối xứng: U' L' U L U F U' F'.",
    ],
    quiz: {
      q: 'Vì sao công thức phải kéo góc trắng lên rồi mới đưa xuống?',
      opts: ['Để mở khe cho cạnh vào, rồi trả góc về', 'Vì góc đang sai', 'Để xáo tầng trên'], ok: 0,
      right: 'Góc trắng nằm ngay dưới khe. Công thức nhấc nó lên, ghép với cạnh thành một cặp, rồi hạ cả cặp xuống cùng lúc, nên tầng dưới bị xáo tạm rồi được trả lại.',
      hint: 'Góc trắng đã đúng từ trước. Công thức chỉ mượn chỗ của nó.',
    },
  },
  {
    id: 'c1-yellowcross', cap: 1, title: 'Dấu cộng vàng',
    solution: S("F R U R' U' F'"),
    dim: (p) => p.y < 1,
    intro: "Bước 4: hai tầng dưới đã xong, giờ làm mặt vàng. Trước hết lật các cạnh cho màu vàng hướng lên, thành dấu cộng. Tầng trên đang có một đường thẳng vàng nằm ngang, hai cạnh trước và sau bị lật. <b>F R U R' U' F'</b> sửa chúng mà không phá 2 tầng dưới.",
    notes: [,
      "<b>F · chuẩn bị</b>: cạnh vàng phía trước (màu vàng nhìn ra trước) xuống khe trước-phải, chỗ mà R chạm tới được.",
      '<b>R</b>: nâng cạnh đó lên lại tầng trên, giờ màu vàng hướng lên.',
      '<b>U</b>: tầng trên quay, đưa cạnh bị lật phía sau sang bên phải.',
      "<b>R'</b>: hạ cột phải, kéo cạnh bị lật đó xuống khe trước-phải.",
      "<b>U'</b>: trả tầng trên. Đã có 3 cạnh vàng hướng lên, cạnh thứ tư đang chờ trong khe. Làm A (F), làm B (R U R' U'), rồi hoàn tác A gọi là liên hợp, bạn sẽ học ở cấp 2.",
      "<b>F' · trả</b>: hoàn tác F, cạnh trong khe lên lại mặt trên với màu vàng hướng lên; 2 tầng dưới nguyên vẹn. Đường dọc: xoay U cho nằm ngang. Chữ L: hai nhánh chỉ ra sau và sang trái, làm 2 lần. Chỉ chấm giữa: làm 1 lần ra chữ L.",
    ],
    quiz: {
      q: "Vì sao F' ở cuối không phá thành quả?",
      opts: ["Vì F' hoàn tác F, chỉ để lại tác dụng của R U R' U'", "Vì F' không chạm vào tầng dưới", 'Ngẫu nhiên'], ok: 0,
      right: "Ở hai tầng dưới, R U R' U' chỉ chạm khe trước-phải và góc dưới-trước-phải. F đã đưa mảnh tầng trên vào đúng hai chỗ đó, F' đưa chúng về, nên chỉ tầng trên thay đổi.",
      hint: 'F có chạm vào tầng dưới. Hãy nghĩ xem F và F\' liên quan gì nhau.',
    },
  },
  {
    id: 'c1-sune', cap: 1, title: 'Mặt vàng',
    solution: S("R U R' U R U2 R'"),
    dim: (p) => p.y < 1,
    intro: 'Bước 5: dấu cộng vàng đã có, giờ lật các góc cho cả mặt trên vàng. Ở đây chỉ một góc có màu vàng hướng lên, nằm ở trước-trái. Đây đúng là trường hợp dùng <b>Sune</b>. Mẹo để nhìn: U chỉ đưa góc đi vòng, không đổi màu đang hướng lên; chỉ R và R\' mới lật góc.',
    notes: [,
      '<b>R · mượn chỗ</b>: nâng góc trắng ở dưới-trước-phải lên tầng trên. Sune mượn tạm chỗ của nó để lật các góc vàng, cuối công thức sẽ trả lại.',
      '<b>U</b>: dời góc trắng sang trước-trái, ra khỏi cột phải.',
      "<b>R'</b>: hạ cột phải. Một góc vàng xuống nằm tạm ở chỗ của góc trắng.",
      '<b>U</b>: dời góc trắng tiếp ra sau-trái.',
      '<b>R</b>: nâng góc vàng đang nằm tạm đó lên lại tầng trên.',
      '<b>U2</b>: nửa vòng đưa góc trắng về trước-phải, ngay trên chỗ của nó.',
      "<b>R' · trả</b>: góc trắng về chỗ cũ, tầng dưới nguyên vẹn, cả mặt trên đã vàng. Nếu chưa, xoay U rồi làm lại: 1 góc vàng lên thì đặt nó ở trước-trái; 0 góc thì góc trước-trái có vàng nhìn sang trái; 2 góc thì vàng nhìn ra trước.",
    ],
    quiz: {
      q: 'Sau Sune, mặt vàng xong nhưng các mảnh tầng trên có thể sai chỗ. Vì sao vẫn ổn?',
      opts: ['Vì bước sau chỉ đổi chỗ mà không làm mất màu vàng', 'Vì sai chỗ không quan trọng', 'Vì làm lại Sune sẽ sửa'], ok: 0,
      right: 'Mỗi bước giữ thành quả của bước trước: định hướng trước, đổi chỗ sau.',
      hint: 'Hai bài tiếp theo chỉ đổi chỗ mảnh.',
    },
  },
  {
    id: 'c1-corners-ll', cap: 1, title: 'Đổi chỗ góc vàng',
    solution: S("R' F R' B2 R F' R' B2 R2"),
    dim: (p) => p.y < 1,
    track: [-1, 1, 1],
    intro: 'Bước 6: mặt vàng đã xong nhưng các mảnh tầng trên có thể sai chỗ. Công thức này chỉ đổi chỗ góc, công thức bài sau chỉ đổi chỗ cạnh, nên hai bước không phá nhau. Ở đây góc trước-trái đã đúng chỗ, 3 góc còn lại cần đổi chỗ vòng tròn mà vẫn giữ màu vàng hướng lên.',
    notes: [,
      "<b>R' · chuẩn bị</b>: hạ cột phải, để 3 góc cần đổi nằm đúng 3 chỗ mà phần giữa sẽ đổi vòng: trên-trước-phải, dưới-trước-phải và trên-sau-trái. Nửa sau của R2 ở cuối sẽ hoàn tác nước này.",
      '<b>F · A</b>: xoay mặt trước, góc phát sáng tạm sang trước-phải.', , ,
      "<b>R' B2 R · B</b>: đổi góc dưới-trước-phải với góc trên-sau-trái. Ở mặt trước, đó là chỗ duy nhất bị đụng: góc phát sáng xuống rồi lại về trước-phải.",
      "<b>F' · hoàn tác A</b>: góc phát sáng về trước-trái. A và B chỉ chung đúng một chỗ góc, nên làm A, B, hoàn tác A, rồi B lần nữa chỉ đổi vòng 3 góc (commutator, cấp 2).", , ,
      "<b>R' B2 R2</b>: đổi lại cặp góc, R cuối hoàn tác R' đầu. Xong 4 góc. Trên khối thật: xoay U tới khi đúng 1 góc đúng chỗ, xoay cả khối cho nó ở trước-trái rồi làm; 3 góc vẫn sai thì làm lại; không góc nào đúng thì làm 1 lần rồi tìm lại.",
    ],
    quiz: {
      q: 'Trước khi làm công thức, đặt góc đã đúng ở đâu?',
      opts: ['Trước-trái', 'Trước-phải', 'Ở đâu cũng được'], ok: 0,
      right: 'Công thức đổi vòng 3 góc còn lại. Góc trước-trái chỉ đi một vòng rồi về đúng chỗ cũ, nên góc đã đúng phải đặt ở đó.',
      hint: 'Để ý góc phát sáng trong bài.',
    },
  },
  {
    id: 'c1-edges-ll', cap: 1, title: 'Đổi chỗ cạnh cuối',
    solution: S("R U' R U R U R U' R' U' R2"),
    dim: (p) => p.y < 1,
    track: [0, 1, -1],
    intro: 'Bước cuối: mặt vàng và các góc đã xong, còn 3 cạnh tầng trên đổi chỗ vòng tròn. Đặt cạnh đã đúng ở phía sau (cạnh phát sáng). Công thức chỉ đổi vòng 3 cạnh còn lại, mọi thứ khác về như cũ. Ý chính: cột phải quay đủ một vòng và chở các cạnh đi.',
    notes: [,
      '<b>R · mở</b>: cạnh vàng-đỏ (đang nằm ở bên phải, chỗ của cạnh vàng-cam) bị cột phải kéo xuống sau-phải.',
      "<b>U'</b>: tầng trên quay, cạnh vàng-cam vào trên-phải để cột phải chở nó đi tiếp.", , , , ,
      '<b>R U R U R · chở</b>: bốn nước R vừa quay cột phải đủ một vòng. Cạnh vàng-đỏ đi hết vòng rồi lên lại trên-phải; cạnh vàng-cam vẫn đang nằm trong cột phải.', , ,
      "<b>U' R' U' · về chỗ</b>: cạnh vàng-đỏ về bên trái, vàng-xanh lá về phía trước, R' cất cạnh vàng-cam xuống dưới-phải. Giờ mọi mảnh đã đúng, chỉ trừ cột phải đang lệch nửa vòng.",
      '<b>R2 · đóng</b>: trả cột phải, cạnh vàng-cam lên đúng chỗ. Khối đã giải xong. Nếu 3 cạnh xoay sai chiều, làm thêm một lần. Đó là toàn bộ cách giải tầng-theo-tầng, giờ thử trên khối thật nhé.',
    ],
    quiz: {
      q: 'Cả 4 cạnh đều sai chỗ. Làm gì?',
      opts: ['Làm công thức một lần, rồi sẽ có một cạnh đúng', 'Giải lại từ đầu', 'Dùng lại công thức đổi chỗ góc'], ok: 0,
      right: 'Khi cả 4 cạnh sai, chúng đổi chỗ theo từng cặp. Công thức đổi vòng 3 cạnh, nên sau một lần luôn có đúng một cạnh về chỗ; đặt nó ra sau và làm tiếp.',
      hint: 'Công thức cần một cạnh đúng để đặt phía sau.',
    },
    selfReport: true,
  },

  {
    id: 'c2-commutator', cap: 2, title: 'Commutator đầu tiên',
    solution: S("R U R' U'"), setup: [], track: [1, 1, 1], dim: notRU, six: true,
    intro: 'Khối đang ở trạng thái đã giải. Các mảnh mờ không thuộc mặt R hay U, nên suốt 4 nước sắp tới chúng đứng yên. Theo dõi góc đang phát sáng: bốn nước đi theo nhịp <b>mở, đổi, đóng, trả</b>.',
    notes: [,
      '<b>R · mở</b>: nâng khe dưới-trước-phải lên tầng trên, để tầng trên chạm được vào nó. Góc phát sáng tạm lùi ra phía sau.',
      '<b>U · đổi</b>: tầng trên đẩy mảnh vừa được nâng lên sang trái, và đưa góc phát sáng vào đúng chỗ đó.',
      "<b>R' · đóng</b>: hạ khe xuống. Góc phát sáng giờ nằm ở dưới, thế chỗ mảnh cũ.",
      "<b>U' · trả</b>: đưa tầng trên về, mảnh cũ quay lại trước-phải-trên. R' gỡ R, U' gỡ U, nên mảnh nào chỉ bị một trong hai chạm tới đều được trả về; chỉ vài mảnh ở chỗ giao của R và U đổi chỗ. Dạng A B A' B' này gọi là commutator. Bấm nút lặp để làm 6 lần liên tiếp và xem khối tự về như cũ.",
    ],
    quiz: {
      q: 'Mảnh nào chắc chắn không đổi chỗ?',
      opts: ['Cạnh DL (dưới, trái)', 'Góc DFR (dưới, trước, phải)', 'Mọi mảnh trên mặt R'], ok: 0,
      right: 'Cạnh DL không thuộc mặt R cũng không thuộc mặt U, nên không nước nào chạm tới nó. Góc DFR thì có: nước R đầu tiên kéo nó lên.',
      hint: 'Một mảnh chỉ di chuyển khi nước vặn chạm vào mặt chứa nó.',
    },
  },
  {
    id: 'c2-conjugate', cap: 2, title: 'Liên hợp A B A\'',
    solution: S("F R U R' U' F'"), setup: [],
    intro: "Liên hợp là làm <b>A</b> để đặt các mảnh vào chỗ thuận tay, làm <b>B</b>, rồi hoàn tác <b>A</b>. Ở đây A = F, B = R U R' U'.",
    notes: [,
      '<b>A = F · chuẩn bị</b>: cạnh trên-trước xuống khe trước-phải, góc trên-trước-phải xuống dưới-trước-phải. Đó đúng là hai chỗ ở hai tầng dưới mà B sẽ chạm vào.', , , ,
      "<b>B = R U R' U'</b>: commutator quen thuộc. Ở hai tầng dưới nó chỉ đụng khe trước-phải và góc dưới-trước-phải, nơi đang chứa mảnh của tầng trên.",
      "<b>A' = F' · hoàn tác</b>: đưa các mảnh đó về tầng trên. Kết quả chỉ tầng trên bị đổi, hai tầng dưới nguyên vẹn. Đây chính là công thức dấu cộng vàng ở cấp 1.",
    ],
    quiz: {
      q: "Trong F R U R' U' F', phần nào là A?",
      opts: ['F', 'R U', "U' F'"], ok: 0,
      right: "F mở đầu để chuẩn bị, F' ở cuối hoàn tác nó, nên A = F; phần kẹp giữa R U R' U' là B.",
      hint: 'A xuất hiện ở đầu, và bản đảo của nó ở cuối.',
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
