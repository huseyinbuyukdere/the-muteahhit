// THE MÜTEAHHİT — three.js şehir sahnesi: arsalar, şantiyeler, binalar, deprem ve kaçış uçağı.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const FLOOR_H = 0.9;
const GRID = { cols: 4, rows: 3, gap: 15 };
const SIZES = [
  { w: 6, d: 6, blocks: [[0, 0]] },
  { w: 3.6, d: 3.6, blocks: [[-3.6, -2.6], [3.6, -2.6], [0, 3.4]] },
  { w: 7.5, d: 7.5, blocks: [[0, 0]] },
];

let renderer, scene, camera, controls, clock, sun, hemi, cityMat;
const groups = new Map();
let cranes = [], shake = 0, plane = null, focusTarget = null, sinking = [];
const texCache = {};
const rand = (a, b) => a + Math.random() * (b - a);

export function slotPos(slot) {
  const c = slot % GRID.cols, r = Math.floor(slot / GRID.cols);
  return new THREE.Vector3((c - (GRID.cols - 1) / 2) * GRID.gap, 0, (r - (GRID.rows - 1) / 2) * GRID.gap);
}

function windowTexture(lit, seed = 1) {
  const key = `${lit}-${seed}`;
  if (texCache[key]) return texCache[key];
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32;
  const g = cv.getContext('2d');
  g.fillStyle = lit ? '#000' : '#ffffff'; g.fillRect(0, 0, 32, 32);
  if (lit) { g.fillStyle = seed ? '#ffd98a' : '#ffcf7a'; }
  else g.fillStyle = '#5d6f80';
  g.fillRect(9, 8, 14, 16);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  texCache[key] = t;
  return t;
}

function labelSprite(text, color = '#ffd34d') {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(15,18,24,0.78)';
  g.beginPath(); g.roundRect(4, 8, 504, 80, 18); g.fill();
  g.strokeStyle = color; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fff'; g.font = 'bold 38px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text.length > 24 ? text.slice(0, 23) + '…' : text, 256, 50);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(8.5, 1.6, 1); s.renderOrder = 10;
  return s;
}

function signBoard(text) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#f4c20d'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#111'; g.font = 'bold 26px system-ui, sans-serif'; g.textAlign = 'center';
  g.fillText('SATILIK', 128, 40); g.font = 'bold 20px system-ui'; g.fillText('KAT KARŞILIĞI', 128, 74);
  g.font = '16px system-ui'; g.fillText(text.slice(0, 22), 128, 106);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const box = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });

export function init(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#9cc7e8');
  scene.fog = new THREE.Fog('#9cc7e8', 70, 180);
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
  camera.position.set(42, 38, 52);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 12; controls.maxDistance = 130;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.35;
  controls.addEventListener('start', () => { controls.autoRotate = false; focusTarget = null; });
  hemi = new THREE.HemisphereLight('#dfefff', '#4a5a3a', 0.9); scene.add(hemi);
  sun = new THREE.DirectionalLight('#fff3dd', 1.6);
  sun.position.set(40, 60, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 200 });
  scene.add(sun);
  buildWorld();
  clock = new THREE.Clock();
  window.addEventListener('resize', resize);
  resize();
  renderer.setAnimationLoop(tick);
}

function resize() {
  const el = renderer.domElement;
  const w = el.clientWidth || window.innerWidth, h = el.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

function buildWorld() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('#7d9868'));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const road = mat('#3b3f45');
  const lineM = mat('#e8e2c8');
  const span = 190;
  const cx = (k) => (k - (GRID.cols - 1) / 2) * GRID.gap, cz = (k) => (k - (GRID.rows - 1) / 2) * GRID.gap;
  const lines = [];
  for (let k = -5; k < GRID.cols + 5; k++) lines.push([true, cx(k) + GRID.gap / 2]);
  for (let k = -5; k < GRID.rows + 5; k++) lines.push([false, cz(k) + GRID.gap / 2]);
  for (const [vertical, off] of lines) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(vertical ? 3.2 : span, vertical ? span : 3.2), road);
    r.rotation.x = -Math.PI / 2; r.position.set(vertical ? off : 0, vertical ? 0.02 : 0.021, vertical ? 0 : off); r.receiveShadow = true; scene.add(r);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(vertical ? 0.12 : span, vertical ? span : 0.12), lineM);
    l.rotation.x = -Math.PI / 2; l.position.set(vertical ? off : 0, 0.03, vertical ? 0 : off); scene.add(l);
  }
  // Oyuncu arsaları (boş parseller)
  for (let s = 0; s < GRID.cols * GRID.rows; s++) {
    const p = slotPos(s);
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(GRID.gap - 4, GRID.gap - 4), mat('#8e8a6e'));
    lot.rotation.x = -Math.PI / 2; lot.position.set(p.x, 0.025, p.z); lot.receiveShadow = true; scene.add(lot);
  }
  // Çevre şehir
  cityMat = [];
  const tones = ['#c9c3b8', '#b8b2a6', '#d8cdb8', '#a9b1b8', '#cbb8a4', '#e0d6c4'];
  const winTex = windowTexture(false, 0);
  for (const tone of tones) cityMat.push(new THREE.MeshStandardMaterial({ color: tone, roughness: 0.9, map: winTex, emissive: '#ffcf7a', emissiveMap: windowTexture(true, 0), emissiveIntensity: 0 }));
  for (let gx = -5; gx < GRID.cols + 5; gx++) for (let gz = -5; gz < GRID.rows + 5; gz++) {
    if (gx >= 0 && gx < GRID.cols && gz >= 0 && gz < GRID.rows) continue;
    const x = cx(gx), z = cz(gz);
    const dist = Math.hypot(x, z);
    if (dist > 95) continue;
    const n = Math.random() < 0.5 ? 1 : 2;
    for (let k = 0; k < n; k++) {
      const w = rand(3.5, n > 1 ? 5 : 8), d = rand(3.5, 8), fl = Math.max(2, Math.round(rand(2, 10) - dist / 22));
      const h = fl * FLOOR_H;
      const base = cityMat[Math.floor(Math.random() * cityMat.length)];
      const m = box(w, h, d, base.clone());
      m.material.map = winTex.clone(); m.material.map.repeat.set(Math.max(1, Math.round(w / 1.5)), fl); m.material.map.needsUpdate = true;
      m.material.emissiveMap = windowTexture(true, 0).clone(); m.material.emissiveMap.repeat.set(Math.max(1, Math.round(w / 1.5)), fl); m.material.emissiveMap.needsUpdate = true;
      m.position.set(x + (n > 1 ? (k ? 3 : -3) : 0), h / 2, z + rand(-1.5, 1.5));
      scene.add(m); cityMat.push(m.material);
      if (Math.random() < 0.4) { const roof = box(w * 0.3, 0.6, d * 0.3, mat('#777')); roof.position.set(m.position.x, h + 0.3, m.position.z); scene.add(roof); }
    }
    if (Math.random() < 0.6) tree(x + rand(-6, 6), z + (Math.random() < 0.5 ? -6 : 6));
  }
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, r = rand(100, 170);
    const hill = new THREE.Mesh(new THREE.ConeGeometry(rand(10, 25), rand(8, 22), 6), mat('#6f8a5c'));
    hill.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(hill);
  }
}

function tree(x, z, parent = scene) {
  const t = box(0.3, 1.2, 0.3, mat('#6b4b2a')); t.position.set(x, 0.6, z); parent.add(t);
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.9, 1.4), 0), mat('#4f7d3a', { flatShading: true }));
  c.position.set(x, 1.9, z); c.castShadow = true; parent.add(c);
}

// ---------- Projeler ----------
function qualityColor(k) {
  const bad = new THREE.Color('#b9a58c'), good = new THREE.Color('#f1ece2');
  return bad.lerp(good, Math.max(0, Math.min(1, k / 100)));
}

function signature(p) {
  const fl = p.phase === 'insaat' ? Math.ceil((p.progress / 100) * p.floors) : -1;
  return [p.phase, fl, Math.round(p.kalite / 20), p.collapsed, p.hasar, p.slot, p.name].join('|');
}

function buildProject(p) {
  const g = new THREE.Group();
  const pos = slotPos(p.slot);
  g.position.copy(pos);
  const S = SIZES[p.tier];
  g.userData.cranes = [];
  if (p.collapsed) {
    const rm = [mat('#8a8378'), mat('#6d675e'), mat('#a39a8a')];
    for (let i = 0; i < 70; i++) {
      const b = box(rand(0.4, 2.2), rand(0.2, 0.7), rand(0.4, 2.2), rm[i % 3]);
      b.position.set(rand(-4, 4), rand(0.1, 1.6), rand(-4, 4)); b.rotation.set(rand(-0.6, 0.6), rand(0, 3), rand(-0.6, 0.6)); g.add(b);
    }
    for (let i = 0; i < 10; i++) { const r = box(0.08, rand(1, 2.5), 0.08, mat('#553')); r.position.set(rand(-3, 3), 1, rand(-3, 3)); r.rotation.set(rand(-1, 1), 0, rand(-1, 1)); g.add(r); }
    const tape = box(11, 0.08, 0.08, mat('#e33', { emissive: '#600' })); tape.position.set(0, 1, 5.3); g.add(tape);
    g.add(Object.assign(labelSprite(`${p.name} ✝`, '#e33'), {}));
    g.children[g.children.length - 1].position.set(0, 6, 0);
    return g;
  }
  if (p.phase === 'arsa') {
    const house = box(4, 2.4, 3.5, mat('#c49a6c')); house.position.set(-1, 1.2, 0); g.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.6, 4), mat('#9b3b2a', { flatShading: true }));
    roof.position.set(-1, 3.2, 0); roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
    const pole = box(0.15, 3, 0.15, mat('#555')); pole.position.set(3.6, 1.5, 3); g.add(pole);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.4), new THREE.MeshStandardMaterial({ map: signBoard(p.semt), side: THREE.DoubleSide }));
    board.position.set(3.6, 3, 3); board.rotation.y = -0.5; g.add(board);
    tree(3, -3, g);
  } else if (p.phase === 'yatirim') {
    const pit = box(10, 0.4, 10, mat('#6b5234')); pit.position.y = 0.05; g.add(pit);
    const fenceM = mat('#2d6cdf');
    for (const [x, z, w, d] of [[0, 5.5, 11, 0.1], [0, -5.5, 11, 0.1], [5.5, 0, 0.1, 11], [-5.5, 0, 0.1, 11]]) { const f = box(w, 1.8, d, fenceM); f.position.set(x, 0.9, z); g.add(f); }
    const ex = box(1.6, 1.2, 2.4, mat('#f0b400')); ex.position.set(1, 0.9, 0); g.add(ex);
    const arm = box(0.3, 0.3, 3, mat('#e0a000')); arm.position.set(1, 1.8, 2); arm.rotation.x = 0.5; g.add(arm);
  } else if (p.phase === 'insaat') {
    const floors = Math.max(1, Math.ceil((p.progress / 100) * p.floors));
    const conc = mat('#9c9a95'), slab = mat('#b5b2ab');
    for (const [bx, bz] of S.blocks) {
      for (let f = 0; f < floors; f++) {
        const s = box(S.w + 0.3, 0.18, S.d + 0.3, slab); s.position.set(bx, f * FLOOR_H + FLOOR_H, bz); g.add(s);
        for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
          const c = box(0.3, FLOOR_H, 0.3, conc); c.position.set(bx + cx * S.w / 2.3, f * FLOOR_H + FLOOR_H / 2, bz + cz * S.d / 2.3); g.add(c);
        }
      }
      const sc = new THREE.Mesh(new THREE.BoxGeometry(S.w + 0.9, floors * FLOOR_H + 0.8, S.d + 0.9), new THREE.MeshStandardMaterial({ color: '#2e9e4f', transparent: true, opacity: 0.28, wireframe: false, depthWrite: false }));
      sc.position.set(bx, (floors * FLOOR_H + 0.8) / 2, bz); g.add(sc);
    }
    const craneH = p.floors * FLOOR_H + 4;
    const cm = mat('#f2b705');
    const crane = new THREE.Group();
    const tower = box(0.5, craneH, 0.5, cm); tower.position.y = craneH / 2; crane.add(tower);
    const jib = new THREE.Group(); jib.position.y = craneH;
    const arm = box(11, 0.4, 0.4, cm); arm.position.x = 3; jib.add(arm);
    const cw = box(1.2, 0.9, 0.9, mat('#444')); cw.position.x = -2.2; jib.add(cw);
    const cable = box(0.05, 4, 0.05, mat('#222')); cable.position.set(7, -2, 0); jib.add(cable);
    crane.add(jib); crane.position.set(S.w / 2 + 1.5, 0, -S.d / 2 - 1);
    if (p.tier === 1) crane.position.set(0, 0, 0);
    g.add(crane); g.userData.cranes.push(jib);
  } else {
    const col = qualityColor(p.kalite);
    for (const [bx, bz] of S.blocks) {
      const h = p.floors * FLOOR_H;
      const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8, map: windowTexture(false, 1).clone(), emissive: '#ffcf7a', emissiveMap: windowTexture(true, 1).clone(), emissiveIntensity: 0 });
      m.map.repeat.set(Math.round(S.w / 1.3), p.floors); m.map.needsUpdate = true;
      m.emissiveMap.repeat.set(Math.round(S.w / 1.3), p.floors); m.emissiveMap.needsUpdate = true;
      const b = box(S.w, h, S.d, m); b.position.set(bx, h / 2 + 0.3, bz); g.add(b); cityMat.push(m);
      const base = box(S.w + 0.6, 0.3, S.d + 0.6, mat('#666')); base.position.set(bx, 0.15, bz); g.add(base);
      const roof = box(S.w + 0.2, 0.25, S.d + 0.2, mat(p.kalite > 60 ? '#445' : '#7a6f60')); roof.position.set(bx, h + 0.42, bz); g.add(roof);
      if (p.tier === 2) { const top = box(2, 2, 2, mat('#334')); top.position.set(bx, h + 1.5, bz); g.add(top); }
      if (p.hasar) { b.rotation.z = 0.05; b.rotation.x = 0.03; }
    }
    if (p.phase === 'satis' || p.phase === 'teslim') {
      const flag = box(0.1, 3, 0.1, mat('#555')); flag.position.set(S.w / 2 + 2, 1.5, S.d / 2 + 2); g.add(flag);
      const f2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1), new THREE.MeshStandardMaterial({ color: '#e63946', side: THREE.DoubleSide })); f2.position.set(S.w / 2 + 2.8, 2.6, S.d / 2 + 2); g.add(f2);
    }
    if (p.kalite > 70) for (let i = 0; i < 4; i++) tree(rand(-6, 6), i % 2 ? 6 : -6, g);
  }
  const lbl = labelSprite(p.name, p.done ? '#9ad17a' : '#ffd34d');
  lbl.position.set(0, (p.phase === 'arsa' || p.phase === 'yatirim' ? 5 : p.floors * FLOOR_H + 3), 0);
  g.add(lbl);
  return g;
}

function disposeGroup(g) {
  scene.remove(g);
  g.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  cranes = cranes.filter((c) => !g.userData.cranes.includes(c));
}

export function sync(state) {
  const seen = new Set();
  for (const p of state.projects) {
    if (p.slot < 0) continue;
    seen.add(p.id);
    const sig = signature(p);
    const cur = groups.get(p.id);
    if (cur && cur.userData.sig === sig) continue;
    if (cur) disposeGroup(cur);
    const g = buildProject(p);
    g.userData.sig = sig; g.userData.cranes = g.userData.cranes || [];
    cranes.push(...g.userData.cranes);
    scene.add(g); groups.set(p.id, g);
  }
  for (const [id, g] of groups) if (!seen.has(id)) { disposeGroup(g); groups.delete(id); }
}

export function focus(p) {
  if (!p || p.slot < 0) return;
  focusTarget = slotPos(p.slot);
  controls.autoRotate = false;
}

export function quake(power, collapseIds, done) {
  shake = 2.5 + power * 2;
  sinking = [];
  for (const id of collapseIds) { const g = groups.get(id); if (g) sinking.push({ g, t: 0 }); }
  setTimeout(() => { sinking = []; done && done(); }, 2600);
}

export function flyPlane() {
  if (plane) scene.remove(plane);
  plane = new THREE.Group();
  const w = mat('#f4f4f4');
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 8, 10), w); body.rotation.z = Math.PI / 2; plane.add(body);
  const wing = box(1.8, 0.15, 9, w); plane.add(wing);
  const tail = box(1.2, 1.8, 0.15, mat('#c1121f')); tail.position.set(-3.6, 1, 0); plane.add(tail);
  plane.position.set(-120, 25, 30); plane.userData.t = 0;
  scene.add(plane);
}

let lastT = 0;
function tick() {
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  for (const c of cranes) c.rotation.y += dt * 0.25;
  // Gün döngüsü (~3 dk)
  const day = (Math.sin(t * 0.035) + 1) / 2;
  const dayCol = new THREE.Color('#9cc7e8'), nightCol = new THREE.Color('#141b2d'), dusk = new THREE.Color('#e59866');
  const sky = nightCol.clone().lerp(day > 0.5 ? dayCol : dusk, Math.min(1, day * 1.6)).lerp(dayCol, Math.max(0, (day - 0.6) * 2.5));
  scene.background.copy(sky); scene.fog.color.copy(sky);
  sun.intensity = 0.25 + day * 1.5; hemi.intensity = 0.35 + day * 0.6;
  if (t - lastT > 0.5) {
    lastT = t;
    const e = Math.max(0, 1 - day * 1.8) * 1.4;
    for (const m of cityMat) m.emissiveIntensity = e;
  }
  if (focusTarget) {
    controls.target.lerp(focusTarget, 0.06);
    const desired = focusTarget.clone().add(new THREE.Vector3(18, 20, 22));
    camera.position.lerp(desired, 0.04);
    if (camera.position.distanceTo(desired) < 0.5) focusTarget = null;
  }
  for (const s of sinking) {
    s.t += dt;
    s.g.rotation.z = Math.sin(s.t * 30) * 0.04 + s.t * 0.12;
    s.g.position.y = -s.t * s.t * 1.8;
  }
  if (plane) {
    plane.userData.t += dt;
    plane.position.x += dt * 38; plane.position.y += dt * 4;
    if (plane.position.x > 160) { scene.remove(plane); plane = null; }
  }
  controls.update();
  if (shake > 0) {
    shake -= dt;
    const a = Math.min(1, shake) * 0.6;
    camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a;
  }
  renderer.render(scene, camera);
}
