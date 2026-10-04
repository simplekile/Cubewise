import * as THREE from 'three';

// Yellow on top, white on the bottom, green in front: the orientation beginner
// guides use once the white cross is built on the bottom.
const FACE = {
  px: 0xff7a1a, // right: orange
  nx: 0xe3343f, // left: red
  py: 0xffd43b, // up: yellow
  ny: 0xf4f6fa, // down: white
  pz: 0x1fb86e, // front: green
  nz: 0x2f6bff, // back: blue
};
const DIM = new THREE.Color(0x2a2a33);

// face letter -> [axis, layer, sign of a clockwise quarter turn]
const MOVES = { R: ['x', 1, -1], L: ['x', -1, 1], U: ['y', 1, -1], D: ['y', -1, 1], F: ['z', 1, -1], B: ['z', -1, 1] };

export function invertMove(m) {
  if (m.includes('2')) return m;
  return m.includes("'") ? m[0] : m + "'";
}
export function invertSeq(seq) {
  return seq.slice().reverse().map(invertMove);
}

function roundedSquare(w, r) {
  const h = w / 2;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h);
  return new THREE.ShapeGeometry(s, 5);
}

export function createCube() {
  const osReduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let reduce = osReduce;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2a3a, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 0.75);
  key.position.set(4, 7, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb9c4ff, 0.35);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);
  const stickerGeo = roundedSquare(0.84, 0.14);
  const bodyGeo = new THREE.BoxGeometry(0.97, 0.97, 0.97);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0c0e14, roughness: 0.55, metalness: 0.1 });

  let cubies = [];
  let tracked = null;

  function build() {
    cubies.forEach((c) => group.remove(c));
    cubies = [];
    tracked = null;
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const c = new THREE.Object3D();
      c.position.set(x, y, z);
      c.userData.home = [x, y, z];
      c.add(new THREE.Mesh(bodyGeo, bodyMat));
      c.userData.stickers = [];
      const faces = [];
      if (x === 1) faces.push(['px', [0, Math.PI / 2, 0], [0.5, 0, 0]]);
      if (x === -1) faces.push(['nx', [0, -Math.PI / 2, 0], [-0.5, 0, 0]]);
      if (y === 1) faces.push(['py', [-Math.PI / 2, 0, 0], [0, 0.5, 0]]);
      if (y === -1) faces.push(['ny', [Math.PI / 2, 0, 0], [0, -0.5, 0]]);
      if (z === 1) faces.push(['pz', [0, 0, 0], [0, 0, 0.5]]);
      if (z === -1) faces.push(['nz', [0, Math.PI, 0], [0, 0, -0.5]]);
      for (const [name, rot, pos] of faces) {
        const mat = new THREE.MeshStandardMaterial({ color: FACE[name], roughness: 0.3, metalness: 0, emissive: 0x000000 });
        const m = new THREE.Mesh(stickerGeo, mat);
        m.rotation.set(...rot);
        m.position.set(pos[0] * 1.006, pos[1] * 1.006, pos[2] * 1.006);
        m.userData.base = new THREE.Color(FACE[name]);
        c.add(m);
        c.userData.stickers.push(m);
      }
      group.add(c);
      cubies.push(c);
    }
  }
  build();

  function pose() {
    group.quaternion.identity();
    group.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -0.72);
    group.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), 0.5);
  }
  pose();

  // ----- turning -----
  let queue = [];
  let anim = null;

  function parse(m) {
    const [axis, layer, sign] = MOVES[m[0]];
    const turns = m.includes('2') ? 2 : 1;
    const dir = m.includes("'") ? -1 : 1;
    return { axis, layer, angle: sign * dir * turns * Math.PI / 2 };
  }
  function snap(c) {
    c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
    const mtx = new THREE.Matrix4().makeRotationFromQuaternion(c.quaternion);
    const e = mtx.elements;
    [0, 1, 2, 4, 5, 6, 8, 9, 10].forEach((i) => { e[i] = Math.round(e[i]); });
    c.quaternion.setFromRotationMatrix(mtx);
  }
  function begin() {
    if (anim || !queue.length) return;
    const job = queue.shift();
    const p = parse(job.m);
    group.updateMatrixWorld(true);
    const pivot = new THREE.Object3D();
    group.add(pivot);
    pivot.updateMatrixWorld(true);
    const sel = cubies.filter((c) => Math.round(c.position[p.axis]) === p.layer);
    sel.forEach((c) => pivot.attach(c));
    anim = { pivot, sel, axis: p.axis, angle: p.angle, t0: performance.now(), dur: reduce ? 0 : job.dur, job };
    if (anim.dur === 0) finish();
  }
  function finish() {
    const a = anim;
    a.pivot.rotation[a.axis] = a.angle;
    a.pivot.updateMatrixWorld(true);
    a.sel.forEach((c) => { group.attach(c); snap(c); });
    group.remove(a.pivot);
    anim = null;
    a.job.done?.();
    begin();
  }
  function turn(m, dur = 280) {
    return new Promise((done) => { queue.push({ m, dur, done }); begin(); });
  }
  async function seq(moves, dur = 280, gap = 0) {
    for (const m of moves) {
      await turn(m, dur);
      if (gap) await new Promise((r) => setTimeout(r, gap));
    }
  }
  function apply(moves) {
    // instant, used for setups and scrambles
    moves.forEach((m) => { queue.push({ m, dur: 0 }); });
    const wasReduce = anim;
    if (!wasReduce) begin();
    while (anim) finish();
  }
  function stop() {
    queue.forEach((j) => j.done?.());
    queue = [];
    if (anim) finish();
  }
  function reset() { stop(); build(); }
  const busy = () => !!anim || queue.length > 0;

  // ----- highlighting -----
  // dimFn(home) -> true to grey the piece out, judged by where the piece belongs when solved;
  // trackHome = solved position of the piece to make glow
  function highlight(dimFn, trackHome) {
    tracked = null;
    for (const c of cubies) {
      const [x, y, z] = c.userData.home;
      const dim = dimFn ? dimFn({ x, y, z }) : false;
      for (const s of c.userData.stickers) {
        s.userData.target = dim ? DIM : s.userData.base; // eased toward in frame()
        s.material.emissive.setHex(0x000000);
      }
      const h = c.userData.home;
      if (trackHome && h[0] === trackHome[0] && h[1] === trackHome[1] && h[2] === trackHome[2]) tracked = c;
    }
  }

  // ----- drag to rotate -----
  let dragging = false, lx = 0, ly = 0, idleSpin = true, lastTouch = 0;
  let vx = 0, vy = 0; // drag velocity in radians per ms, kept after release for inertia
  let lastMoveT = 0;
  const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0);
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; lastMoveT = performance.now();
    canvas.setPointerCapture(e.pointerId);
    lastTouch = performance.now();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    group.rotateOnWorldAxis(Y, dx * 0.011);
    group.rotateOnWorldAxis(X, dy * 0.011);
    const now = performance.now(), dt = Math.max(1, now - lastMoveT);
    // smoothed velocity so a flick carries on after the finger lifts
    vx = vx * 0.6 + ((dx * 0.011) / dt) * 0.4;
    vy = vy * 0.6 + ((dy * 0.011) / dt) * 0.4;
    lastMoveT = now;
    lastTouch = now;
  });
  const endDrag = () => {
    dragging = false;
    const now = performance.now();
    if (now - lastMoveT > 80) vx = vy = 0; // finger rested before lifting: no fling
    lastTouch = now;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // ----- sizing -----
  let host = null;
  let lift = 0;
  const ro = new ResizeObserver(fit);
  function fit() {
    if (!host) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const base = Number(host.dataset.dist || 12);
    camera.position.set(0, lift, camera.aspect < 1 ? (base / camera.aspect) * 0.85 : base);
    camera.lookAt(0, lift, 0);
    camera.updateProjectionMatrix();
  }
  function mount(el, { spin = false } = {}) {
    if (host) ro.unobserve(host);
    host = el;
    lift = Number(el.dataset.lift || 0);
    el.insertBefore(canvas, el.firstChild);
    ro.observe(el);
    idleSpin = spin;
    vx = vy = 0;
    fit();
    intro = reduce ? null : performance.now();
  }
  let intro = null; // start time of the scale-in when the cube appears on a screen

  // ease-out with a small overshoot, so a layer lands with a soft settle instead of a hard stop
  const settle = (t) => { const c = 1.25; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const smooth = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let prevT = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - prevT);
    prevT = now;
    if (anim) {
      const t = Math.min(1, (now - anim.t0) / anim.dur);
      const e = anim.dur < 220 ? smooth(t) : settle(t);
      anim.pivot.rotation[anim.axis] = anim.angle * e;
      if (t >= 1) finish();
    }
    if (!dragging && (Math.abs(vx) > 1e-5 || Math.abs(vy) > 1e-5)) {
      group.rotateOnWorldAxis(Y, vx * dt);
      group.rotateOnWorldAxis(X, vy * dt);
      const k = Math.pow(0.994, dt); // friction
      vx *= k; vy *= k;
      lastTouch = now;
    }
    if (idleSpin && !dragging && !reduce && now - lastTouch > 2500) {
      // ease the idle spin in rather than starting at full speed
      const ramp = Math.min(1, (now - lastTouch - 2500) / 1200);
      group.rotateOnWorldAxis(Y, 0.00021 * ramp * dt);
    }
    if (intro != null) {
      const t = Math.min(1, (now - intro) / 700);
      group.scale.setScalar(0.82 + 0.18 * settle(t));
      if (t >= 1) intro = null;
    }
    const blend = 1 - Math.exp(-dt / 70);
    for (const c of cubies) for (const s of c.userData.stickers) {
      const tg = s.userData.target;
      if (tg && !s.material.color.equals(tg)) {
        s.material.color.lerp(tg, blend);
        if (Math.abs(s.material.color.r - tg.r) + Math.abs(s.material.color.g - tg.g) + Math.abs(s.material.color.b - tg.b) < 0.004) s.material.color.copy(tg);
      }
    }
    if (tracked) {
      const k = 0.16 + 0.14 * Math.sin(now / 260);
      tracked.userData.stickers.forEach((s) => s.material.emissive.setRGB(k, k, k));
    }
    if (host && host.offsetParent !== null) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const setCalm = (on) => { reduce = osReduce || on; };
  return { mount, turn, seq, apply, reset, stop, busy, highlight, pose, setCalm };
}
