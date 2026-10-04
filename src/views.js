// Camera for each lesson: where the cube faces, how close, and what sits in the middle.
// `at[i]` is the view once i moves (or steps) are done; the latest one at or before i applies.
// yaw turns the cube left/right, pitch tilts it toward you (higher shows more of the top),
// zoom > 1 moves closer, focus is a point in cube coordinates (x right, y up, z front).

const FRONT = { yaw: -0.72, pitch: 0.5, zoom: 1 };
const TOP = { yaw: -0.6, pitch: 0.95, zoom: 1.12, focus: [0, 0.5, 0] };

export const VIEWS = {
  'c0-pieces': { lock: false, at: { 0: FRONT } },
  'c0-notation': {
    lock: true,
    at: {
      0: FRONT,
      2: { yaw: -0.5, pitch: 0.9, zoom: 1.1, focus: [0, 0.4, 0] },  // U and U': look down on the top
      4: { yaw: -0.3, pitch: 0.4, zoom: 1.1, focus: [0, 0, 0.4] },  // F2: face the front
    },
  },
  'c0-reverse': { lock: true, at: { 0: { ...FRONT, pitch: 0.6 } } },

  'c1-cross': { lock: true, at: { 0: { yaw: -0.45, pitch: 0.3, zoom: 1.35, focus: [0, 0, 0.9] } } },
  'c1-corners': { lock: true, at: { 0: { yaw: -0.75, pitch: 0.35, zoom: 1.4, focus: [0.7, 0, 0.7] } } },
  'c1-middle': {
    lock: true,
    at: {
      0: { yaw: -0.72, pitch: 0.55, zoom: 1.3, focus: [0.5, 0.3, 0.6] },
      4: { yaw: -0.72, pitch: 0.4, zoom: 1.45, focus: [0.8, 0, 0.8] },  // second half: the slot
    },
  },
  'c1-yellowcross': { lock: true, at: { 0: TOP } },
  'c1-sune': { lock: true, at: { 0: TOP } },
  'c1-corners-ll': { lock: true, at: { 0: TOP } },
  'c1-edges-ll': { lock: true, at: { 0: TOP } },

  'c2-commutator': { lock: true, at: { 0: { yaw: -0.75, pitch: 0.45, zoom: 1.3, focus: [0.7, 0.3, 0.7] } } },
  'c2-conjugate': { lock: true, at: { 0: { ...FRONT, pitch: 0.65, zoom: 1.08 } } },
};

export function viewAt(id, i) {
  const v = VIEWS[id];
  if (!v) return { lock: false, view: FRONT };
  let view = FRONT;
  for (const k of Object.keys(v.at).map(Number).sort((a, b) => a - b)) if (k <= i) view = v.at[k];
  return { lock: v.lock, view };
}
