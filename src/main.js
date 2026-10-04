import './style.css';
import {
  createIcons, House, Box, Timer, Map, Flame, Rotate3d, RotateCcw, RotateCw, ArrowRight, ChevronLeft, ChevronRight,
  SkipBack, Play, Undo2, Repeat, Shuffle, Check, Lock, BookOpen, Sparkles, BookX, Gauge, Zap, Trophy, X, Circle, Settings, Download, Upload, Trash2, LockKeyhole, LockKeyholeOpen,
} from 'lucide';
import { createCube, invertMove } from './cube.js';
import { LESSONS, LEVELS, lessonsOf, byId } from './lessons.js';
import { viewAt } from './views.js';
import { load, save, wipe, today, levelOf, aoN, fmt, defaults } from './store.js';

const ICONS = { House, Box, Timer, Map, Flame, Rotate3d, RotateCcw, RotateCw, ArrowRight, ChevronLeft, ChevronRight, SkipBack, Play, Undo2, Repeat, Shuffle, Check, Lock, BookOpen, Sparkles, BookX, Gauge, Zap, Trophy, X, Circle, Settings, Download, Upload, Trash2, LockKeyhole, LockKeyholeOpen };
const icons = () => createIcons({ icons: ICONS });

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
// a small square of the real sticker colour in front of each colour name, outside of tags
const SW = { 'xanh lá': '#1FB86E', 'xanh dương': '#2F6BFF', 'trắng': '#F4F6FA', 'vàng': '#FFD43B', 'đỏ': '#E3343F', 'cam': '#FF7A1A' };
const SW_RE = /(^|[^\p{L}])(xanh lá|xanh dương|trắng|vàng|đỏ|cam)(?![\p{L}])/giu;
const swatch = (html) => html.split(/(<[^>]*>)/).map((part) => part.startsWith('<') ? part
  : part.replace(SW_RE, (_, pre, w) => `${pre}<span class="cw"><span class="sw" style="--sw:${SW[w.toLowerCase()]}"></span>${w}</span>`)).join('');
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let state = load();
const cube = createCube();

// ---------- toast ----------
const toastQ = [];
let toastBusy = false;
function toast(text) {
  toastQ.push(text);
  if (!toastBusy) nextToast();
}
function nextToast() {
  const t = toastQ.shift();
  if (!t) { toastBusy = false; return; }
  toastBusy = true;
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 300); }, 1400);
}

$('#version').textContent = `Phiên bản ${__VERSION__}`;

// ---------- confetti: small squares in the six sticker colours ----------
const CONF = ['#FFD43B', '#F4F6FA', '#1FB86E', '#2F6BFF', '#E3343F', '#FF7A1A'];
const still = () => state.settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(x, y, n = 36, spread = 1) {
  if (still()) return;
  const cv = document.createElement('canvas');
  cv.className = 'confetti';
  const app = $('#app'), r = app.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  app.appendChild(cv);
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);
  const ox = x - r.left, oy = y - r.top;
  const bits = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2 * spread, v = 0.35 + Math.random() * 0.45 * spread;
    return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 5 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.02, c: CONF[i % 6] };
  });
  const t0 = performance.now(), life = 1500 + 300 * spread;
  let prev = t0;
  (function tick(now) {
    const dt = Math.min(32, now - prev), t = now - t0;
    prev = now;
    g.clearRect(0, 0, r.width, r.height);
    g.globalAlpha = Math.max(0, 1 - Math.max(0, t - life * 0.6) / (life * 0.4));
    for (const b of bits) {
      b.vy += 0.0011 * dt; b.vx *= 0.992; b.vy *= 0.992;
      b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
      g.save(); g.translate(b.x, b.y); g.rotate(b.rot);
      g.fillStyle = b.c; g.beginPath(); g.roundRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.8, 1.5); g.fill();
      g.restore();
    }
    if (t < life) requestAnimationFrame(tick); else cv.remove();
  })(t0);
}
const burstAt = (el, n, spread) => { const b = el.getBoundingClientRect(); confetti(b.left + b.width / 2, b.top + b.height / 2, n, spread); };
const bigBurst = () => { const r = $('#app').getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height * 0.45, 90, 1.6); };

// ---------- XP, streak, achievements ----------
function addXp(v, why) {
  const before = levelOf(state.xp).level;
  state.xp += v;
  const after = levelOf(state.xp).level;
  toast(`+${v} XP · ${why}`);
  if (after > before) { toast(`Lên level ${after}`); bigBurst(); }
  save(state);
  renderHome();
}

function touchDay() {
  const d = today();
  if (state.streak.day === d) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yd = y.toLocaleDateString('en-CA');
  state.streak = { day: d, count: state.streak.day === yd ? state.streak.count + 1 : 1 };
}
function streakNow() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const alive = state.streak.day === today() || state.streak.day === y.toLocaleDateString('en-CA');
  return alive ? state.streak.count : 0;
}

const fresh = new Set(); // achievements earned this session, not yet shown on the journey screen
const bestOf = () => (state.solves.length ? Math.min(...state.solves.map((s) => s.t)) : null);
const ACH = [
  { id: 'first', how: "Học xong bất kỳ bài nào, tức là trả lời đúng câu hỏi cuối bài.", name: 'Bài học đầu tiên', icon: 'book-open', tone: 't-blue', test: () => Object.keys(state.done).length > 0 },
  { id: 'home', how: "Học xong bài Ba loại mảnh ở cấp 0.", name: 'Mảnh nào chỗ nấy', icon: 'box', tone: 't-blue', test: () => !!state.done['c0-pieces'] },
  { id: 'solve', how: "Tự giải được khối thật, rồi bấm \"Tôi đã tự giải được khối thật\" ở bài Đổi chỗ cạnh tầng trên hoặc ở mốc cấp 1 trong Hành trình.", name: 'Giải lần đầu', icon: 'sparkles', tone: 't-green', test: () => !!state.flags.selfSolve },
  { id: 'nobook', how: "Giải được khối thật mà không nhìn hướng dẫn, rồi bấm nút xác nhận ở bài Đổi chỗ cạnh tầng trên hoặc ở mốc cấp 1.", name: 'Không cần hướng dẫn', icon: 'book-x', tone: 't-red', test: () => !!state.flags.noBook },
  { id: 'comm', how: "Trả lời đúng ngay lần đầu 10 câu hỏi vì sao liên tiếp. Trả lời sai một lần là đếm lại từ đầu.", name: 'Mười câu đúng liền', icon: 'repeat', tone: 't-gold', test: () => state.quizRun >= 10, progress: () => `${Math.min(state.quizRun, 10)}/10` },
  { id: 'six', how: "Ở bài Commutator đầu tiên (cấp 2), bấm nút lặp để chạy R U R' U' 6 lần và xem khối tự về như cũ.", name: 'Chu kỳ 6', icon: 'rotate-cw', tone: 't-blue', test: () => !!state.flags.six },
  { id: 'timer', how: "Giải một lần với đồng hồ ở tab Luyện tập.", name: 'Lần bấm giờ đầu tiên', icon: 'timer', tone: 't-orange', test: () => state.solves.length > 0 },
  { id: 'sub2', how: "Có một lần giải bấm giờ dưới 2 phút.", name: 'Dưới 2 phút', icon: 'gauge', tone: 't-orange', test: () => bestOf() != null && bestOf() < 120 },
  { id: 'sub1', how: "Có một lần giải bấm giờ dưới 1 phút.", name: 'Dưới 1 phút', icon: 'zap', tone: 't-orange', test: () => bestOf() != null && bestOf() < 60 },
  { id: 'st3', how: "Học hoặc giải bấm giờ 3 ngày liên tiếp.", name: 'Chuỗi 3 ngày', icon: 'flame', tone: 't-red', test: () => state.streak.count >= 3, progress: () => `${Math.min(streakNow(), 3)}/3` },
  { id: 'st7', how: "Học hoặc giải bấm giờ 7 ngày liên tiếp.", name: 'Chuỗi 7 ngày', icon: 'flame', tone: 't-red', test: () => state.streak.count >= 7, progress: () => `${Math.min(streakNow(), 7)}/7` },
  { id: 'st30', how: "Học hoặc giải bấm giờ 30 ngày liên tiếp.", name: 'Chuỗi 30 ngày', icon: 'flame', tone: 't-gold', test: () => state.streak.count >= 30, progress: () => `${Math.min(streakNow(), 30)}/30` },
  { id: 'pb', how: "Phá kỷ lục cá nhân của bạn, khi đã có ít nhất 5 lần giải bấm giờ.", name: 'Kỷ lục mới', icon: 'trophy', tone: 't-gold', test: () => !!state.flags.pb },
];
function checkAch() {
  for (const a of ACH) {
    if (!state.ach[a.id] && a.test()) {
      state.ach[a.id] = today();
      fresh.add(a.id);
      toast(`Thành tựu: ${a.name}`);
      addXp(30, 'thành tựu');
    }
  }
  save(state);
}

// ---------- milestones ----------
const TIME_GOAL = { 2: 120, 3: 60 };
const goalText = (sec) => (sec % 60 === 0 ? `${sec / 60} phút` : `${sec} giây`);
const LAST_GATE = 3; // levels after this have no content yet
function gateInfo(n) {
  const ls = lessonsOf(n);
  const reqs = [];
  if (ls.length) {
    const d = ls.filter((l) => state.done[l.id]).length;
    reqs.push({ ok: d === ls.length, text: `Học xong ${d}/${ls.length} bài` });
  }
  if (n === 1) reqs.push({ ok: !!state.flags.selfSolve, text: 'Tự giải được khối thật', self: true });
  if (TIME_GOAL[n]) {
    const a = aoN(state.solves, 12);
    const goal = TIME_GOAL[n];
    reqs.push({
      ok: a != null && a < goal,
      text: a == null ? `Ao12 dưới ${goalText(goal)} · cần thêm ${12 - state.solves.length} lần giải` : `Ao12 dưới ${goalText(goal)} · hiện tại ${fmt(a)}`,
    });
  }
  return { reqs, ready: n <= LAST_GATE && reqs.every((r) => r.ok) };
}
function passGate() {
  const n = state.cap;
  if (!gateInfo(n).ready) return;
  state.cap = n + 1;
  toast(`Qua mốc cấp ${n}`);
  bigBurst();
  addXp(100 * (n + 1), `mốc cấp ${n}`);
  checkAch();
  renderAll();
}

// ---------- navigation ----------
let current = 's-home';
const ORDER = ['s-settings', 's-home', 's-learn', 's-lesson', 's-train', 's-path'];
// stagger children in: each gets an index the CSS turns into a delay
function stagger(el, cls) {
  [...el.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10)));
  el.classList.remove(cls);
  void el.offsetWidth; // restart the animation
  el.classList.add(cls);
}
function go(id) {
  if (current === 's-train' && id !== 's-train') cancelTimer();
  const dir = Math.sign(ORDER.indexOf(id) - ORDER.indexOf(current));
  current = id;
  $$('.screen').forEach((s) => {
    s.hidden = s.id !== id;
    if (s.id !== id) return;
    s.scrollTop = 0;
    s.lastY = 0;
    s.style.setProperty('--dx', `${dir * 18}px`);
    stagger(s, 'enter');
  });
  showBar();
  const tab = id === 's-lesson' ? 's-learn' : id;
  $$('.tab').forEach((t, i) => {
    const on = t.dataset.go === tab;
    t.classList.toggle('on', on);
    if (on) $('.tabbar').style.setProperty('--tab', i);
  });
  cube.stop();
  if (id === 's-home') { cube.reset(); cube.pose(); cube.mount($('#stage-home'), { spin: true }); $('#lastMove').textContent = ''; renderHome(); }
  if (id === 's-learn') renderLessonList();
  if (id === 's-train') { cube.reset(); cube.pose(); cube.mount($('#stage-train'), { spin: true }); cube.apply(scramble); renderStats(); }
  if (id === 's-path') renderPath();
  if (id === 's-settings') renderSettings();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) go(b.dataset.go);
});

// ---------- home ----------
function nextLesson() {
  return LESSONS.find((l) => l.cap <= state.cap && !state.done[l.id]);
}
function renderHome() {
  const d = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#today').textContent = d.charAt(0).toUpperCase() + d.slice(1);
  $('#hello').textContent = state.settings.name ? `Chào ${state.settings.name}` : 'Chào bạn';
  const s = streakNow();
  $('#streakNum').textContent = s;
  $('#streakChip').classList.toggle('off', s === 0);

  const lv = levelOf(state.xp);
  if ($('#lvlNum').textContent !== String(lv.level) && shownXp != null) {
    const b = $('#lvlNum'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  countTo($('#xpNow'), lv.now);
  $('#lvlNum').textContent = lv.level;
  $('#lvl').textContent = lv.level;
  $('#xpNeed').textContent = lv.need;
  $('#xpBar').style.width = `${Math.round((lv.now / lv.need) * 100)}%`;
  const cap = LEVELS[Math.min(state.cap, LEVELS.length - 1)];
  $('#capName').textContent = `Cấp ${cap.n} · ${cap.name}`;

  const cta = $('#homeCtaText');
  const next = nextLesson();
  if (gateInfo(state.cap).ready) { cta.textContent = `Nhận mốc cấp ${state.cap}`; homeAction = () => go('s-path'); }
  else if (next) { cta.textContent = `${Object.keys(state.done).length ? 'Học tiếp' : 'Bắt đầu'}: ${next.title}`; homeAction = () => openLesson(next.id); }
  else if (state.cap === 1 && !state.flags.selfSolve) { cta.textContent = 'Thử giải khối thật'; homeAction = () => go('s-path'); }
  else { cta.textContent = 'Luyện với đồng hồ'; homeAction = () => go('s-train'); }
}
let homeAction = () => {};
let shownXp = null;
function countTo(el, to) {
  const from = Number(el.textContent) || 0;
  shownXp = to;
  if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
  const t0 = performance.now(), dur = 700;
  const step = (now) => {
    if (shownXp !== to) return; // a newer count took over
    const t = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
$('#homeCta').addEventListener('click', () => homeAction());

let prime = false;
$('#primeKey').addEventListener('click', (e) => {
  prime = !prime;
  e.currentTarget.classList.toggle('on', prime);
  e.currentTarget.setAttribute('aria-pressed', String(prime));
  $$('.key[data-m]').forEach((k) => { k.textContent = k.dataset.m + (prime ? "'" : ''); });
});
$$('.key[data-m]').forEach((k) => k.addEventListener('click', () => {
  const m = k.dataset.m + (prime ? "'" : '');
  $('#lastMove').textContent = m;
  cube.turn(m, 240);
}));
$('#resetKey').addEventListener('click', () => { cube.reset(); $('#lastMove').textContent = ''; });

// ---------- lesson list ----------
function renderLessonList() {
  const html = [];
  for (const lv of LEVELS.slice(0, 3)) {
    const ls = lessonsOf(lv.n);
    const open = lv.n <= state.cap;
    const d = ls.filter((l) => state.done[l.id]).length;
    html.push(`<div class="group"><div class="group-head"><h2>Cấp ${lv.n} · ${esc(lv.name)}</h2><span class="small muted">${open ? `${d}/${ls.length}` : '<i data-lucide="lock" style="width:14px;height:14px"></i>'}</span></div>`);
    for (const l of ls) {
      const done = !!state.done[l.id];
      const sub = l.solution ? l.solution.join(' ') : `${l.steps.length} bước`;
      html.push(`<button class="lrow" data-lesson="${l.id}" ${open ? '' : 'disabled'}>
        <span class="tick ${done ? 'done' : ''}">${done ? '<i data-lucide="check"></i>' : ''}</span>
        <span class="t"><b>${esc(l.title)}</b><span>${esc(sub)}</span></span>
        ${done ? '' : open ? '<span class="xp">+20 XP</span>' : ''}
        <i data-lucide="chevron-right"></i></button>`);
    }
    html.push('</div>');
  }
  html.push(`<p class="note">Từ cấp 3 trở đi chủ yếu là luyện tốc độ. Bài CFOP sẽ có ở bản sau.</p>`);
  $('#lessonList').innerHTML = html.join('');
  $$('#lessonList .group').forEach((g) => stagger(g, 'enter-list'));
  icons();
}
$('#lessonList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lesson]');
  if (b && !b.disabled) openLesson(b.dataset.lesson);
});

// ---------- lesson player ----------
const turnMs = () => ({ slow: 800, mid: 480, fast: 260 })[state.settings.speed] || 480;
let L = null, li = 0, answered = false, missed = false;

function openLesson(id) {
  L = byId(id);
  freeLook = false;
  go('s-lesson');
  cube.mount($('#stage-learn'), { spin: false });
  cube.pose();
  $('#lessonTitle').textContent = L.title;
  const siblings = lessonsOf(L.cap);
  const at = siblings.indexOf(L);
  $('#lessonSteps').innerHTML = siblings.map((_, i) => `<i class="${i < at ? 'on' : i === at ? 'cur' : ''}"></i>`).join('');
  $('#lessonSteps').setAttribute('aria-label', `Bài ${at + 1} trong ${siblings.length}`);
  $('#lSix').hidden = !L.six;
  const hasMoves = L.steps.every((s) => s.m);
  $('#seq').hidden = !hasMoves;
  $('#seq').classList.toggle('compact', L.steps.length > 6);
  $('#seq').innerHTML = hasMoves ? L.steps.map((s) => `<span class="mv">${esc(s.m)}</span>`).join('') : '';
  renderQuiz();
  lessonReset();
}

// camera follows the lesson: locked to the angle the caption talks about, zoomed where it matters
let freeLook = false;
function viewFor(i) {
  const v = viewAt(L.id, i);
  cube.lock(v.lock && !freeLook);
  if (!freeLook || !v.lock) cube.view(v.view);
  const b = $('#lookBtn');
  b.hidden = !v.lock;
  b.innerHTML = `<i data-lucide="${freeLook ? 'lock-keyhole-open' : 'lock-keyhole'}"></i>${freeLook ? 'Đang xoay tự do' : 'Góc nhìn cố định'}`;
  b.setAttribute('aria-pressed', String(freeLook));
  icons();
}
$('#lookBtn').addEventListener('click', () => {
  freeLook = !freeLook;
  if (L) viewFor(li);
});
function highlightAt(i) {
  let dim = L.dim || null;
  for (let j = 0; j < i; j++) if ('dim' in L.steps[j]) dim = L.steps[j].dim;
  cube.highlight(dim, L.track);
}
function textAt(i) {
  let t = L.intro;
  for (let j = 0; j < i; j++) if (L.steps[j].text) t = L.steps[j].text;
  return t;
}
function lessonUi() {
  const n = L.steps.length;
  // the caption explains the move just made, so that move is the one lit up
  $$('#seq .mv').forEach((el, i) => { el.className = `mv${i < li - 1 ? ' done' : i === li - 1 ? ' next' : ''}`; });
  $('#lessonBadge').textContent = `${li}/${n}`;
  const why = $('#whyText'), txt = textAt(li);
  if (why.dataset.src !== txt) { why.dataset.src = txt; why.innerHTML = swatch(txt); why.classList.remove('swap'); void why.offsetWidth; why.classList.add('swap'); }
  $('#lPrev').disabled = li === 0;
  // the main button says exactly what it will do: the next move, move on, or start over
  const over = li >= n, step = L.steps[li];
  $('#lNextText').innerHTML = over ? 'Làm lại từ đầu' : step.m ? `Vặn <b>${esc(step.m)}</b>` : 'Tiếp';
  $('#lNext').setAttribute('aria-label', over ? 'Làm lại từ đầu' : step.m ? `Vặn ${step.m}` : 'Bước tiếp');
  $('#lNext').classList.toggle('over', over);
  $('#lReset').hidden = over;
  const end = li >= n;
  $('#quiz').hidden = !end;
  $('#lessonDone').hidden = !(end && answered);
  $('#selfBox').hidden = !(end && answered && L.selfReport);
  if (end && answered && L.selfReport) renderSelf($('#selfBox'));
}
function lessonReset() {
  cube.reset();
  if (L.setup?.length) cube.apply(L.setup);
  li = 0;
  highlightAt(0);
  viewFor(0);
  lessonUi();
}
$('#lNext').addEventListener('click', () => {
  if (!L || cube.busy()) return;
  if (li >= L.steps.length) { lessonReset(); return; }
  const s = L.steps[li];
  const after = () => { li++; highlightAt(li); viewFor(li); lessonUi(); if (li === L.steps.length) $('#quiz').scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }); };
  if (s.m) cube.turn(s.m, turnMs()).then(after); else after();
});
$('#lPrev').addEventListener('click', () => {
  if (!L || cube.busy() || li <= 0) return;
  li--;
  const s = L.steps[li];
  const after = () => { highlightAt(li); viewFor(li); lessonUi(); };
  if (s.m) cube.turn(invertMove(s.m), turnMs()).then(after); else after();
});
$('#lReset').addEventListener('click', () => { if (L) lessonReset(); });
$('#lSix').addEventListener('click', async () => {
  if (!L || cube.busy()) return;
  lessonReset();
  const moves = [];
  for (let i = 0; i < 6; i++) moves.push(...L.solution);
  $('#whyText').dataset.src = ''; $('#whyText').innerHTML = `Đang chạy ${esc(L.solution.join(' '))} 6 lần liên tiếp, tổng ${moves.length} nước…`;
  $('#lNext').disabled = true;
  await cube.seq(moves, 170);
  if (current !== 's-lesson') return;
  $('#whyText').dataset.src = ''; $('#whyText').innerHTML = 'Sau <b>6 lần</b> lặp commutator này, khối tự về như cũ.';
  $('#lessonBadge').textContent = `${moves.length}/${moves.length}`;
  $('#lNext').disabled = false;
  if (!state.flags.six) { state.flags.six = true; checkAch(); }
});

function renderQuiz() {
  answered = false; missed = false;
  const q = L.quiz;
  $('#quizTag').textContent = state.quiz[L.id] ? 'Câu hỏi vì sao' : 'Câu hỏi vì sao · +10 XP';
  $('#quizQ').innerHTML = swatch(esc(q.q));
  $('#opts').innerHTML = q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${'ABC'[i]}</span>${swatch(esc(o))}</button>`).join('');
  $('#fb').hidden = true;
}
$('#opts').addEventListener('click', (e) => {
  const b = e.target.closest('.opt');
  if (!b || answered) return;
  const ok = Number(b.dataset.i) === L.quiz.ok;
  const fb = $('#fb');
  fb.hidden = false;
  if (!ok) {
    b.classList.add('wrong');
    fb.className = 'feedback no';
    fb.innerHTML = `<b>Chưa đúng.</b> Gợi ý: ${swatch(esc(L.quiz.hint))}`;
    if (!missed) { missed = true; state.quizRun = 0; save(state); }
    return;
  }
  answered = true;
  b.classList.add('right');
  fb.className = 'feedback ok';
  fb.innerHTML = `<b>Đúng rồi.</b> ${swatch(esc(L.quiz.right))}`;
  if (!missed) state.quizRun += 1;
  if (!state.quiz[L.id]) { state.quiz[L.id] = true; addXp(10, 'câu hỏi vì sao'); }
  // the lesson is done: the cube lights up and takes a bow, confetti from the right answer
  cube.celebrate();
  burstAt(b, state.done[L.id] ? 18 : 40, 1);
  if (!state.done[L.id]) {
    state.done[L.id] = today();
    touchDay();
    addXp(20, 'xong bài');
  }
  save(state);
  checkAch();
  const next = LESSONS[LESSONS.indexOf(L) + 1];
  const nextOpen = next && next.cap <= state.cap;
  $('#lessonDoneText').textContent = nextOpen ? `Bài tiếp: ${next.title}` : gateInfo(state.cap).ready ? `Nhận mốc cấp ${state.cap}` : 'Xong';
  lessonUi();
});
$('#lessonDone').addEventListener('click', () => {
  const next = LESSONS[LESSONS.indexOf(L) + 1];
  if (next && next.cap <= state.cap) openLesson(next.id);
  else if (gateInfo(state.cap).ready) go('s-path');
  else go('s-learn');
});

// self-report: the app cannot see the real cube, so the learner tells it
function renderSelf(el) {
  const f = state.flags;
  el.innerHTML = `<p class="small muted">Đã thử trên khối thật chưa?</p>
    <button class="ghost ${f.selfSolve ? 'on' : ''}" data-flag="selfSolve"><i data-lucide="${f.selfSolve ? 'check' : 'circle'}"></i>Tôi đã tự giải được khối thật</button>
    ${f.selfSolve ? `<button class="ghost ${f.noBook ? 'on' : ''}" data-flag="noBook"><i data-lucide="${f.noBook ? 'check' : 'circle'}"></i>Giải được mà không nhìn hướng dẫn</button>` : ''}`;
  icons();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-flag]');
  if (!b) return;
  const k = b.dataset.flag;
  if (state.flags[k]) return;
  state.flags[k] = true;
  touchDay();
  save(state);
  checkAch();
  renderAll();
  if (current === 's-lesson') lessonUi();
});

// ---------- timer ----------
const FACES = ['U', 'D', 'R', 'L', 'F', 'B'];
const AXIS = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };
const SUF = ['', "'", '2'];
function genScramble() {
  const out = [];
  let last = -1, prev = null;
  while (out.length < 20) {
    const f = FACES[Math.floor(Math.random() * 6)];
    // no same face twice, and no X Y X on one axis (e.g. R L R)
    if (f === prev || (AXIS[f] === last && out.length > 1 && out[out.length - 2][0] === f)) continue;
    last = AXIS[f]; prev = f;
    out.push(f + SUF[Math.floor(Math.random() * 3)]);
  }
  return out;
}
let scramble = genScramble();
function newScramble() {
  scramble = genScramble();
  $('#scr').textContent = scramble.join(' ');
  cube.reset(); cube.pose(); cube.apply(scramble);
}
$('#scr').textContent = scramble.join(' ');
$('#newScr').addEventListener('click', () => { if (tState === 'idle' || tState === 'done') newScramble(); });

function renderStats() {
  $('#ao5').textContent = fmt(aoN(state.solves, 5));
  $('#ao12').textContent = fmt(aoN(state.solves, 12));
  $('#best').textContent = fmt(bestOf());
  const goal = TIME_GOAL[state.cap] ?? TIME_GOAL[Math.min(Math.max(state.cap, 2), 3)];
  const a12 = aoN(state.solves, 12);
  const gap = $('#gap');
  if (a12 == null) gap.textContent = `Cần ${12 - state.solves.length} lần giải nữa để tính Ao12`;
  else if (a12 < goal) gap.textContent = `Ao12 đã dưới ${goalText(goal)}`;
  else gap.textContent = `Còn ${(a12 - goal).toFixed(1)} giây nữa là Ao12 dưới ${goalText(goal)}`;
  const t = state.timerXp.day === today() ? state.timerXp.xp : 0;
  gap.textContent += ` · XP từ đồng hồ hôm nay ${t}/50`;
}

let tState = 'idle', holdT = 0, t0 = 0, raf = 0;
let inspecting = false, inspT = 0, inspEnd = 0;
const tEl = $('#timer'), tm = $('#tm'), hint = $('#tmHint');
const IDLE_HINT = () => (state.settings.inspect ? 'Chạm để bắt đầu 15 giây quan sát' : 'Giữ rồi thả để bắt đầu');
function startInspection() {
  inspecting = true;
  inspEnd = performance.now() + 15000;
  hint.textContent = 'Đang quan sát · giữ rồi thả để bắt đầu giải';
  const tick = () => {
    if (!inspecting) return;
    const left = Math.ceil((inspEnd - performance.now()) / 1000);
    if (tState !== 'hold' && tState !== 'ready') {
      tm.textContent = left > 0 ? String(left) : '0';
      tEl.classList.toggle('late', left <= 3);
    }
    if (left <= 0) hint.textContent = 'Hết 15 giây quan sát · giữ rồi thả để bắt đầu';
    inspT = setTimeout(tick, 200);
  };
  tick();
}
function stopInspection() { inspecting = false; clearTimeout(inspT); tEl.classList.remove('late'); }
function press() {
  if (tState === 'run') { stopRun(); return; }
  if (tState !== 'idle' && tState !== 'done') return;
  if (state.settings.inspect && !inspecting) { tState = 'inspectStart'; $('#dropLast').hidden = true; startInspection(); return; }
  tState = 'hold'; tEl.className = 'timer hold'; if (!inspecting) tm.textContent = '0.00';
  $('#dropLast').hidden = true;
  holdT = setTimeout(() => { if (tState === 'hold') { tState = 'ready'; tEl.className = 'timer ready'; tm.textContent = '0.00'; hint.textContent = 'Thả để bắt đầu'; } }, state.settings.hold === 'long' ? 550 : 300);
}
function release() {
  if (tState === 'inspectStart') { tState = 'idle'; return; }
  if (tState === 'hold') {
    clearTimeout(holdT); tState = 'idle'; tEl.className = 'timer';
    hint.textContent = inspecting ? 'Đang quan sát · giữ rồi thả để bắt đầu giải' : IDLE_HINT();
    return;
  }
  if (tState === 'ready') {
    stopInspection();
    tState = 'run'; tEl.className = 'timer'; hint.textContent = 'Chạm để dừng';
    t0 = performance.now();
    const tick = () => { tm.textContent = fmt((performance.now() - t0) / 1000); raf = requestAnimationFrame(tick); };
    tick();
  }
}
function cancelTimer() {
  if (tState === 'run' || tState === 'hold' || tState === 'ready') {
    cancelAnimationFrame(raf); clearTimeout(holdT);
    tState = 'idle'; tEl.className = 'timer'; tm.textContent = '0.00'; hint.textContent = IDLE_HINT();
  }
  if (inspecting) { stopInspection(); tState = 'idle'; tm.textContent = '0.00'; hint.textContent = IDLE_HINT(); }
}
function stopRun() {
  cancelAnimationFrame(raf);
  const s = Math.round((performance.now() - t0) / 10) / 100;
  tm.textContent = fmt(s);
  tEl.classList.remove('land'); void tEl.offsetWidth; tEl.classList.add('land');
  tState = 'stopping';
  setTimeout(() => { if (tState === 'stopping') tState = 'done'; }, 250);
  if (s < 3) { hint.textContent = 'Nhanh quá, chắc bạn chạm nhầm. Lần này chưa lưu.'; return; }
  const prevBest = bestOf();
  state.solves.push({ t: s, at: Date.now() });
  if (state.solves.length > 500) state.solves.splice(0, state.solves.length - 500);
  touchDay();
  const d = today();
  if (state.timerXp.day !== d) state.timerXp = { day: d, xp: 0 };
  if (state.timerXp.xp < 50) { state.timerXp.xp += 5; addXp(5, 'lần giải tính giờ'); }
  if (prevBest != null && s < prevBest && state.solves.length > 5) {
    state.flags.pb = true;
    hint.textContent = 'Kỷ lục mới';
    burstAt(tEl, 50, 1.3);
    addXp(25, 'kỷ lục mới');
  } else hint.textContent = state.settings.inspect ? 'Đã lưu · chạm để quan sát lần tiếp' : 'Đã lưu · giữ để giải tiếp';
  save(state);
  checkAch();
  renderStats();
  $('#dropLast').hidden = false;
  newScramble();
}
$('#dropLast').addEventListener('click', () => {
  state.solves.pop();
  save(state);
  renderStats();
  $('#dropLast').hidden = true;
  tm.textContent = '0.00';
  hint.textContent = 'Đã bỏ lần vừa rồi';
});
tEl.addEventListener('pointerdown', (e) => { e.preventDefault(); press(); });
tEl.addEventListener('pointerup', release);
tEl.addEventListener('pointercancel', release);
tEl.addEventListener('pointerleave', () => { if (tState === 'hold') release(); });
tEl.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (current !== 's-train' || e.code !== 'Space') return;
  e.preventDefault();
  if (!e.repeat) press();
});
document.addEventListener('keyup', (e) => {
  if (current !== 's-train' || e.code !== 'Space') return;
  e.preventDefault();
  release();
});

// ---------- journey ----------
function renderPath() {
  const out = [];
  for (const lv of LEVELS) {
    const n = lv.n;
    const cls = n < state.cap ? 'done' : n === state.cap ? 'cur' : 'lock';
    const orb = n < state.cap ? '<i data-lucide="check"></i>' : n;
    let body = `<b>${esc(lv.name)}</b>`;
    if (cls === 'cur') {
      if (n > LAST_GATE) body += '<span class="small muted">Nội dung cấp này sẽ có ở bản sau. Cứ luyện đồng hồ nhé.</span>';
      else {
        const g = gateInfo(n);
        body += g.reqs.filter((r) => !r.self).map((r) => `<span class="req ${r.ok ? 'ok' : ''}"><i data-lucide="${r.ok ? 'check' : 'circle'}"></i>${esc(r.text)}</span>`).join('');
        if (n === 1) body += '<div class="self-path"></div>';
        if (g.ready) body += `<button class="cta" id="gateBtn"><span>Nhận mốc · +${100 * (n + 1)} XP</span><span class="go"><i data-lucide="arrow-right"></i></span></button>`;
      }
    } else if (cls === 'lock') {
      body += `<span class="small muted">${esc(lv.goal)}</span>`;
    }
    out.push(`<div class="node ${cls}"><div class="rail"><div class="orb">${orb}</div></div><div class="body">${body}</div></div>`);
  }
  $('#path').innerHTML = out.join('');
  const sp = $('#path .self-path');
  if (sp) { renderSelf(sp); sp.classList.add('self'); sp.style.alignItems = 'flex-start'; sp.firstElementChild.remove(); }
  $('#gateBtn')?.addEventListener('click', passGate);

  const got = ACH.filter((a) => state.ach[a.id]).length;
  $('#achCount').textContent = `${got}/${ACH.length}`;
  $('#badges').innerHTML = ACH.map((a) => {
    const has = !!state.ach[a.id];
    const prog = !has && a.progress ? `<small>${a.progress()}</small>` : '';
    return `<button class="bd ${has ? '' : 'lock'} ${fresh.has(a.id) ? 'new' : ''}" data-ach="${a.id}" aria-label="${esc(a.name)}${has ? ', đã đạt' : ', chưa đạt'}"><div class="ic ${has ? a.tone : ''}"><i data-lucide="${a.icon}"></i></div><span>${esc(a.name)}</span>${prog}</button>`;
  }).join('');
  fresh.clear();
  stagger($('#path'), 'enter-list');
  icons();
}
// achievement detail: what it takes, where you are, when you got it
function openAch(id) {
  const a = ACH.find((x) => x.id === id);
  const when = state.ach[id];
  const ic = $('#sheetIc');
  ic.className = `ic ${when ? a.tone : 'muted-ic'}`;
  ic.innerHTML = `<i data-lucide="${a.icon}"></i>`;
  $('#sheetName').textContent = a.name;
  $('#sheetHow').textContent = a.how;
  const st = $('#sheetState');
  if (when) {
    const d = new Date(`${when}T00:00`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    st.innerHTML = `<i data-lucide="check"></i>Đã đạt ngày ${esc(d)} · +30 XP`;
    st.className = 'sheet-state ok';
  } else {
    st.innerHTML = `<i data-lucide="lock"></i>Chưa đạt${a.progress ? ` · ${esc(a.progress())}` : ''} · +30 XP khi đạt`;
    st.className = 'sheet-state';
  }
  icons();
  const sh = $('#sheet');
  sh.hidden = false;
  requestAnimationFrame(() => sh.classList.add('open'));
}
function closeSheet() {
  const sh = $('#sheet');
  sh.classList.remove('open');
  setTimeout(() => { if (!sh.classList.contains('open')) sh.hidden = true; }, 350);
}
$('#badges').addEventListener('click', (e) => { const b = e.target.closest('[data-ach]'); if (b) openAch(b.dataset.ach); });
$('#sheet').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

$('#wipe').addEventListener('click', () => {
  if (!confirm('Xóa toàn bộ XP, bài đã học, các lần giải và thành tựu? Không thể hoàn tác.')) return;
  const keep = state.settings;
  state = wipe();
  state.settings = keep;
  save(state);
  renderAll();
  go('s-home');
});

function renderAll() {
  renderHome();
  if (current === 's-path') renderPath();
  if (current === 's-learn') renderLessonList();
  if (current === 's-train') renderStats();
  if (current === 's-settings') renderSettings();
}

// ---------- tab bar: hides while scrolling down or after a few idle seconds; scrolling up brings it back ----------
const bar = $('.tabbar');
const IDLE_MS = 3000;
let idleT = 0;
function showBar() {
  bar.classList.remove('away');
  clearTimeout(idleT);
  idleT = setTimeout(() => bar.classList.add('away'), IDLE_MS);
}
function hideBar() { clearTimeout(idleT); bar.classList.add('away'); }
// a tap on empty space toggles the bar; taps on buttons, the cube or fields only keep it from timing out
const ACTIVE = 'button, a, input, select, textarea, label, canvas, .tabbar, .sheet, [data-go], [data-lesson]';
document.addEventListener('click', (e) => {
  const away = bar.classList.contains('away');
  if (e.target.closest(ACTIVE)) { if (!away) showBar(); return; }
  if (away) showBar(); else hideBar();
});
$$('.screen').forEach((sc) => sc.addEventListener('scroll', () => {
  const y = sc.scrollTop, dy = y - (sc.lastY || 0);
  if (Math.abs(dy) < 6) return;
  const atEnd = y + sc.clientHeight >= sc.scrollHeight - 4;
  if (dy > 0 && y > 40 && !atEnd) hideBar(); else showBar();
  sc.lastY = y;
}, { passive: true }));

// ---------- settings ----------
function applySettings() {
  const calm = !!state.settings.calm;
  document.documentElement.classList.toggle('calm', calm);
  cube.setCalm(calm);
  if (tState === 'idle') hint.textContent = IDLE_HINT();
}
function renderSettings() {
  const st = state.settings;
  $('#setName').value = st.name;
  $('#setInspect').checked = st.inspect;
  $('#setCalm').checked = st.calm;
  $$('.seg[data-set]').forEach((g) => g.querySelectorAll('button').forEach((b) => {
    const on = st[g.dataset.set] === b.dataset.v;
    b.classList.toggle('on', on);
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(on));
  }));
}
function setSetting(k, v) {
  state.settings[k] = v;
  save(state);
  applySettings();
  renderSettings();
}
$('#setName').addEventListener('input', (e) => { state.settings.name = e.target.value.trim().slice(0, 24); save(state); });
$('#setName').addEventListener('change', () => renderHome());
$('#setInspect').addEventListener('change', (e) => setSetting('inspect', e.target.checked));
$('#setCalm').addEventListener('change', (e) => setSetting('calm', e.target.checked));
$$('.seg[data-set]').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-v]');
  if (b) setSetting(g.dataset.set, b.dataset.v);
}));
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'cubewise', version: 1, savedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cubewise-sao-luu-${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Đã tạo tệp sao lưu');
});
$('#importFile').addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const s = data?.state;
    if (data?.app !== 'cubewise' || !s || typeof s.xp !== 'number' || !Array.isArray(s.solves)) throw new Error('bad');
    if (!confirm('Thay tiến độ hiện tại bằng bản sao lưu này?')) return;
    state = { ...load(), ...s, settings: { ...defaults(), ...(s.settings || {}) } };
    save(state);
    applySettings();
    renderAll();
    renderSettings();
    toast('Đã khôi phục tiến độ');
  } catch {
    toast('Tệp này không phải bản sao lưu Cubewise');
  }
});

// ---------- start ----------
applySettings();
icons();
checkAch();
go('s-home');
