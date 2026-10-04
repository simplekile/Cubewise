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
    steps: walk(S("R U F F' U' R'"), [, , ,
      "Khối đã bị xáo. Nước cuối là F, nên gỡ nó trước bằng <b>F'</b>.",
      "Tiếp theo gỡ U bằng <b>U'</b>.",
      "Cuối cùng gỡ R bằng <b>R'</b>.",
      'Về như cũ. Quy tắc: <b>đảo thứ tự và đổi chiều</b> từng nước. Như đi tất rồi đi giày, khi cởi thì cởi giày trước.',
    ]),
    quiz: {
      q: 'Công thức nào gỡ được R U F?',
      opts: ["R' U' F'", "F' U' R'", 'F U R'], ok: 1,
      right: 'Đảo thứ tự thành F U R, rồi đổi chiều từng nước.',
      hint: 'Nước làm sau cùng phải được gỡ đầu tiên.',
    },
  },

  {
    id: 'c1-cross', cap: 1, title: 'Dấu cộng trắng',
    solution: S('F2'), track: [0, -1, 1],
    dim: (p) => !(kind(p) === 1 || (p.x === 0 && p.y === -1 && p.z === 1)),
    intro: 'Mặt trắng nằm dưới. Cạnh trắng-xanh lá đang ở tầng trên, màu trắng hướng lên, màu xanh lá đã nằm ngay trên tâm xanh lá.',
    notes: [, '<b>F2</b> đưa nó thẳng xuống, nằm giữa tâm trắng và tâm xanh lá. Với mỗi cạnh trắng còn lại có màu trắng hướng lên: xoay U cho màu kia nằm trên tâm cùng màu, rồi xoay mặt đó nửa vòng.'],
    quiz: {
      q: 'Vì sao phải xoay U cho cạnh nằm trên tâm cùng màu rồi mới F2?',
      opts: ['Để màu thứ hai của cạnh khớp với tâm bên cạnh', 'Để F2 nhanh hơn', 'Không cần, đặt đâu cũng được'], ok: 0,
      right: 'Tâm không di chuyển, nên cạnh trắng-xanh chỉ đúng khi nằm giữa tâm trắng và tâm xanh.',
      hint: 'Mảnh nào trên khối không bao giờ đổi chỗ?',
    },
  },
  {
    id: 'c1-corners', cap: 1, title: 'Góc trắng',
    solution: S("R U R' U' R U R' U' R U R' U'"), track: [1, -1, 1],
    dim: (p) => !(kind(p) === 1 || p.y === -1),
    intro: "Góc trắng-xanh lá-cam đang nằm ngay trên chỗ của nó, màu trắng hướng lên. Lặp <b>R U R' U'</b> cho tới khi nó về đúng chỗ, đúng hướng. Bốn nước này đi theo nhịp: mở khe, đổi mảnh, đóng khe, trả tầng trên.",
    notes: [,
      '<b>R · mở</b>: nâng khe góc trắng lên tầng trên để tầng trên chạm được vào nó. Góc phát sáng tạm lùi ra sau.',
      '<b>U · đổi</b>: tầng trên đẩy mảnh đang nằm trong khe sang trái, và đưa góc phát sáng vào đúng chỗ đó.',
      "<b>R' · đóng</b>: hạ khe xuống, mang góc phát sáng về tầng dưới.",
      "<b>U' · trả</b>: đưa tầng trên về. Góc đã xuống đúng chỗ nhưng màu trắng đang quay sang phải, nên làm tiếp. Nhịp này được giải thích kỹ ở cấp 2.", , , , 'Lần thứ hai xong. Dấu cộng trắng vẫn nguyên sau mỗi lần lặp.', , , , 'Góc đã về đúng chỗ, đúng hướng. Tùy hướng ban đầu, bạn cần 1, 3 hoặc 5 lần.'],
    quiz: {
      q: "Góc trắng ở trên chỗ của nó nhưng màu trắng hướng sang phải. Làm gì?",
      opts: ["Lặp R U R' U' tới khi góc vào đúng", 'Xoay cả khối', 'Phải học công thức mới'], ok: 0,
      right: 'Cùng một công thức xử lý mọi hướng, chỉ khác số lần lặp.',
      hint: 'Bài vừa rồi lặp đúng một công thức.',
    },
  },
  {
    id: 'c1-middle', cap: 1, title: 'Tầng giữa',
    solution: S("U R U' R' U' F' U F"), track: [1, 0, 1],
    dim: (p) => !(p.y <= 0 || (p.x === 1 && p.y === 0 && p.z === 1)),
    intro: 'Cạnh xanh lá-cam ở tầng trên, màu xanh lá khớp với tâm xanh lá phía trước. Nó cần vào khe giữa trước-phải.',
    notes: [, , , , "Nửa đầu <b>U R U' R'</b> kéo góc trắng lên tầng trên để mở khe. Cạnh vẫn chờ ở chỗ cũ.", , , , "Nửa sau <b>U' F' U F</b> đưa góc và cạnh cùng xuống. Tầng dưới vẫn nguyên vẹn, khe đã đầy. Cạnh cần vào bên trái thì làm bản đối xứng: U' L' U L U F U' F'."],
    quiz: {
      q: 'Vì sao công thức phải kéo góc trắng lên rồi mới đưa xuống?',
      opts: ['Để mở khe cho cạnh vào, rồi trả góc về', 'Vì góc đang sai', 'Để xáo tầng trên'], ok: 0,
      right: 'Không có đường vào khe mà không tạm làm xáo tầng dưới, nên công thức xáo có kiểm soát rồi trả lại.',
      hint: 'Góc trắng đã đúng từ trước. Công thức chỉ mượn chỗ của nó.',
    },
  },
  {
    id: 'c1-yellowcross', cap: 1, title: 'Dấu cộng vàng',
    solution: S("F R U R' U' F'"),
    dim: (p) => p.y < 1,
    intro: "Tầng trên có một đường thẳng vàng nằm ngang. <b>F R U R' U' F'</b> biến nó thành dấu cộng mà không phá 2 tầng dưới.",
    notes: [, "<b>F</b> mở đầu: xoay mặt trước để đưa các mảnh tầng trên vào đúng chỗ mà R U R' U' sẽ xáo.", , , , "<b>R U R' U'</b> chạy trong lúc mặt trước vẫn đang lệch.", "<b>F'</b> đóng lại. Dấu cộng vàng đã có. Nếu tầng trên là hình chữ L, đặt hai nhánh chỉ ra sau và sang trái rồi làm công thức hai lần; nếu chỉ có chấm giữa, làm một lần để ra chữ L. Kiểu làm A, làm B, rồi hoàn tác A gọi là liên hợp, bạn sẽ học ở cấp 2."],
    quiz: {
      q: "Vì sao F' ở cuối không phá thành quả?",
      opts: ["Vì F' hoàn tác F, chỉ để lại tác dụng của R U R' U'", "Vì F' không chạm vào tầng dưới", 'Ngẫu nhiên'], ok: 0,
      right: "F đưa các mảnh tầng trên vào đúng những chỗ R U R' U' sẽ làm xáo, F' đưa chúng về. Vì vậy chỉ tầng trên thay đổi, hai tầng dưới vẫn nguyên.",
      hint: 'F có chạm vào tầng dưới. Hãy nghĩ xem F và F\' liên quan gì nhau.',
    },
  },
  {
    id: 'c1-sune', cap: 1, title: 'Mặt vàng',
    solution: S("R U R' U R U2 R'"),
    dim: (p) => p.y < 1,
    intro: 'Dấu cộng vàng đã có. Chỉ một góc có màu vàng hướng lên, nằm ở trước-trái. Đây đúng là trường hợp dùng <b>Sune</b>.',
    notes: [, , , "<b>R U R'</b> kéo góc trắng ở dưới-phải lên tầng trên rồi dời nó sang trái. Tầng dưới tạm bị xáo, nửa sau sẽ trả lại.", , , , 'Cả mặt trên đã vàng. Nếu chưa, xoay U rồi làm lại Sune: có đúng 1 góc vàng hướng lên thì đặt nó ở trước-trái; không có góc nào thì để góc trước-trái có màu vàng nhìn sang trái; có 2 góc thì để góc trước-trái có màu vàng nhìn ra trước.'],
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
    intro: 'Góc trước-trái đã đúng chỗ, 3 góc còn lại cần đổi chỗ vòng tròn. Công thức này đổi chỗ 3 góc mà vẫn giữ màu vàng hướng lên.',
    notes: [, , , , , , , , , 'Cả 4 góc đã đúng chỗ, góc phát sáng đi một vòng rồi về lại đúng chỗ cũ. Trên khối thật: xoay U tới khi có đúng một góc đúng chỗ, xoay cả khối để nó ở trước-trái rồi làm công thức; nếu 3 góc vẫn sai thì làm thêm lần nữa. Xoay U thế nào cũng không có đúng một góc thì làm công thức một lần rồi tìm lại.'],
    quiz: {
      q: 'Trước khi làm công thức, đặt góc đã đúng ở đâu?',
      opts: ['Trước-trái', 'Trước-phải', 'Ở đâu cũng được'], ok: 0,
      right: 'Công thức giữ yên góc trước-trái và đổi chỗ vòng tròn 3 góc còn lại.',
      hint: 'Để ý góc phát sáng trong bài.',
    },
  },
  {
    id: 'c1-edges-ll', cap: 1, title: 'Đổi chỗ cạnh cuối',
    solution: S("R U' R U R U R U' R' U' R2"),
    dim: (p) => p.y < 1,
    track: [0, 1, -1],
    intro: 'Mặt vàng và các góc đã xong, còn 3 cạnh tầng trên đổi chỗ vòng tròn. Đặt cạnh đã đúng ở phía sau.',
    notes: [, , , , , , , , , , , 'Khối đã giải xong. Nếu 3 cạnh xoay sai chiều, chỉ cần làm thêm một lần. Đó là toàn bộ phương pháp tầng-theo-tầng, giờ thử trên khối thật nhé.'],
    quiz: {
      q: 'Cả 4 cạnh đều sai chỗ. Làm gì?',
      opts: ['Làm công thức một lần, rồi sẽ có một cạnh đúng', 'Giải lại từ đầu', 'Dùng lại công thức đổi chỗ góc'], ok: 0,
      right: 'Một lần công thức luôn tạo ra ít nhất một cạnh đúng, sau đó đặt nó ra sau và làm tiếp.',
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
    notes: [, '<b>A = F</b>: đặt các mảnh vào vị trí mà B xử lý được.', , , , '<b>B</b> vẫn là commutator quen thuộc.', "<b>A' = F'</b> đưa các mảnh F đã dời về lại, chỉ để lại tác dụng của B. Đây chính là công thức dấu cộng vàng ở cấp 1."],
    quiz: {
      q: "Trong F R U R' U' F', phần nào là A?",
      opts: ['F', 'R U', "U' F'"], ok: 0,
      right: "F mở đầu và F' đóng lại, nên A = F.",
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
