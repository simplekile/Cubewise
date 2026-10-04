// Progress lives in localStorage on the device. No account, no server.

const KEY = 'cubewise.v1';

const fresh = () => ({
  xp: 0,            // total XP ever earned
  cap: 0,           // highest skill level unlocked (gates passed)
  done: {},         // lessonId -> date finished
  quiz: {},         // lessonId -> true once answered right
  quizRun: 0,       // right answers in a row (first try)
  solves: [],       // { t: seconds, at: ms }
  timerXp: { day: '', xp: 0 },
  streak: { day: '', count: 0 },
  ach: {},          // achievementId -> date earned
  flags: {},        // selfSolve, noBook, six
  settings: defaults(),
});
export const defaults = () => ({
  name: '',         // shown in the greeting
  speed: 'mid',     // lesson turn speed: slow | mid | fast
  inspect: false,   // 15 s inspection before a timed solve
  hold: 'short',    // how long to hold the timer before it is ready: short | long
  calm: false,      // reduce motion
});

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...fresh(), ...saved, settings: { ...defaults(), ...(saved.settings || {}) } };
    }
  } catch { /* private mode or corrupt data: start over */ }
  return fresh();
}

export function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full or blocked */ }
}

export function wipe() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return fresh();
}

export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

// XP to go from level n to n+1
export const need = (n) => 100 + 50 * (n - 1);

export function levelOf(total) {
  let level = 1, rest = total;
  while (rest >= need(level)) { rest -= need(level); level++; }
  return { level, now: rest, need: need(level) };
}

// Average of the last n solves without the best and the worst one.
export function aoN(solves, n) {
  if (solves.length < n) return null;
  const a = solves.slice(-n).map((s) => s.t).sort((x, y) => x - y).slice(1, -1);
  return a.reduce((s, v) => s + v, 0) / a.length;
}

export function fmt(s) {
  if (s == null || !isFinite(s)) return '–';
  const m = Math.floor(s / 60), r = s - m * 60;
  return m ? `${m}:${r < 10 ? '0' : ''}${r.toFixed(2)}` : r.toFixed(2);
}
