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
let cars = [], clouds = [], particles = [], assetGroup = null, assetSig = '', yacht = null, rotors = [], seaMesh = null;
const cx = (k) => (k - (GRID.cols - 1) / 2) * GRID.gap, cz = (k) => (k - (GRID.rows - 1) / 2) * GRID.gap;
const SEA_Z = 52, BEACH_Z = 40;
// Oyuncunun varlıkları için ayrılmış hücreler
const RESERVED = { ofis: [-1, 1], galeri: [0, -1], dugun: [1, -1], tv: [2, -1], kulup: [3, -1], beton: [4, 1] };
const VILLA = { x: 70, z: -40 };
const OTEL = { x: -7.5, z: 46 };
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
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
  const span = 190, vTop = -95, vBot = BEACH_Z, vLen = vBot - vTop, vMid = (vTop + vBot) / 2;
  const lines = [];
  for (let k = -5; k < GRID.cols + 5; k++) lines.push([true, cx(k) + GRID.gap / 2]);
  for (let k = -5; k < GRID.rows + 5; k++) if (cz(k) + GRID.gap / 2 < BEACH_Z) lines.push([false, cz(k) + GRID.gap / 2]);
  for (const [vertical, off] of lines) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(vertical ? 3.2 : span, vertical ? vLen : 3.2), road);
    r.rotation.x = -Math.PI / 2; r.position.set(vertical ? off : 0, vertical ? 0.02 : 0.021, vertical ? vMid : off); r.receiveShadow = true; scene.add(r);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(vertical ? 0.12 : span, vertical ? vLen : 0.12), lineM);
    l.rotation.x = -Math.PI / 2; l.position.set(vertical ? off : 0, 0.03, vertical ? vMid : off); scene.add(l);
  }
  // Sahil ve deniz
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(400, SEA_Z - BEACH_Z + 2), mat('#e3d3a4'));
  beach.rotation.x = -Math.PI / 2; beach.position.set(0, 0.015, (BEACH_Z + SEA_Z) / 2); beach.receiveShadow = true; scene.add(beach);
  seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 160, 60, 24), new THREE.MeshStandardMaterial({ color: '#2f86b8', roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.93, flatShading: true }));
  seaMesh.rotation.x = -Math.PI / 2; seaMesh.position.set(0, 0.08, SEA_Z + 80); scene.add(seaMesh);
  for (let i = 0; i < 14; i++) { // şemsiyeler
    const x = rand(-90, 90), z = rand(BEACH_Z + 3, SEA_Z - 2);
    if (Math.abs(x - OTEL.x) < 9) continue;
    const pole = box(0.08, 1.6, 0.08, mat('#ddd')); pole.position.set(x, 0.8, z); scene.add(pole);
    const top = new THREE.Mesh(new THREE.ConeGeometry(1, 0.5, 8), mat(['#e63946', '#f4a261', '#2a9d8f', '#fff'][i % 4])); top.position.set(x, 1.7, z); scene.add(top);
  }
  // Trafik
  const carCols = ['#c1121f', '#f1faee', '#1d3557', '#ffb703', '#6c757d', '#2a9d8f', '#111'];
  for (let i = 0; i < 26; i++) {
    const vertical = Math.random() < 0.5;
    const pool = lines.filter((l) => l[0] === vertical);
    const [, off] = pool[Math.floor(Math.random() * pool.length)];
    const c = carMesh(carCols[i % carCols.length]);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const lane = dir * 0.75;
    if (vertical) { c.position.set(off + lane, 0, rand(vTop, vBot)); c.rotation.y = dir > 0 ? 0 : Math.PI; }
    else { c.position.set(rand(-95, 95), 0, off - lane); c.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    c.userData = { vertical, dir, speed: rand(5, 11), min: vertical ? vTop : -95, max: vertical ? vBot : 95 };
    scene.add(c); cars.push(c);
  }
  // Bulutlar
  const cm = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.9, flatShading: true });
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(2.5, 5), 0), cm); b.position.set(k * 3 - 6, rand(-1, 1.5), rand(-2, 2)); g.add(b); }
    g.position.set(rand(-150, 150), rand(45, 65), rand(-120, 80)); g.userData.v = rand(0.6, 1.6);
    scene.add(g); clouds.push(g);
  }
  // Villa tepesi
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(20, 26, 4, 10), mat('#6f8a5c', { flatShading: true }));
  hill.position.set(VILLA.x, 2, VILLA.z); hill.receiveShadow = true; scene.add(hill);
  for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2; tree(VILLA.x + Math.cos(a) * 17, VILLA.z + Math.sin(a) * 17); }
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
    if (Object.values(RESERVED).some(([a, b]) => a === gx && b === gz)) continue;
    const x = cx(gx), z = cz(gz);
    if (z > BEACH_Z - 6) continue;
    if (Math.hypot(x - VILLA.x, z - VILLA.z) < 30) continue;
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
    if (Math.sin(a) * r > SEA_Z - 10) continue;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(rand(10, 25), rand(8, 22), 6), mat('#6f8a5c'));
    hill.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(hill);
  }
}

function carMesh(color) {
  const g = new THREE.Group();
  const body = box(1.1, 0.45, 2.1, mat(color, { roughness: 0.4, metalness: 0.3 })); body.position.y = 0.4; g.add(body);
  const cab = box(0.95, 0.4, 1.1, mat('#223', { roughness: 0.2 })); cab.position.set(0, 0.8, -0.1); g.add(cab);
  return g;
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


// ---------- Oyuncunun hayatı: ofis, arabalar, villa, yat, işletmeler ----------
function textSign(text, bg = '#111', fg = '#f4c20d', w = 6, h = 1.4) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 120;
  const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 512, 120);
  g.fillStyle = fg; g.font = 'bold 52px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text.length > 18 ? text.slice(0, 17) + '…' : text, 256, 62);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.35, side: THREE.DoubleSide }));
}
const cell = ([a, b]) => new THREE.Vector3(cx(a), 0, cz(b));

function glassMat(color = '#6fa8c9') { return new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.6 }); }

function buildOffice(g, level, firma) {
  const p = cell(RESERVED.ofis);
  const o = new THREE.Group(); o.position.copy(p);
  let h;
  if (level === 0) {
    const c = box(5, 2.4, 2.4, mat('#d8d2c0')); c.position.y = 1.2; o.add(c);
    const win = box(1.4, 0.8, 0.05, glassMat()); win.position.set(1, 1.5, 1.23); o.add(win);
    h = 2.4;
  } else if (level === 1) {
    h = 3 * FLOOR_H * 1.3;
    const b = box(8, h, 6, mat('#e8e2d4')); b.position.y = h / 2; o.add(b);
    for (let f = 0; f < 3; f++) { const w = box(8.05, 0.5, 6.05, glassMat('#4b7a99')); w.position.y = f * h / 3 + 1.2; o.add(w); }
  } else {
    h = 14;
    const b = box(8, h, 8, glassMat('#3d7ea6')); b.position.y = h / 2; o.add(b);
    const crown = box(8.4, 0.6, 8.4, mat('#222')); crown.position.y = h + 0.3; o.add(crown);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.1, 20), mat('#333')); pad.position.y = h + 0.65; o.add(pad);
  }
  const sign = textSign(firma || 'İNŞAAT', '#111', '#f4c20d', 7, 1.4);
  sign.position.set(0, h + 1.4, 0); o.add(sign);
  const sign2 = sign.clone(); sign2.rotation.y = Math.PI; o.add(sign2);
  const lbl = labelSprite('🏢 Senin ofisin', '#f4c20d'); lbl.position.set(0, h + 4, 0); lbl.scale.set(6.5, 1.2, 1); o.add(lbl);
  g.add(o);
  return p;
}

function buildMercedes(color) {
  const g = new THREE.Group();
  const body = box(1.6, 0.55, 3.4, mat(color, { roughness: 0.15, metalness: 0.8 })); body.position.y = 0.5; g.add(body);
  const cab = box(1.4, 0.5, 1.8, mat('#0b0f18', { roughness: 0.05, metalness: 0.9 })); cab.position.set(0, 1.0, -0.2); g.add(cab);
  const star = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), mat('#ddd', { metalness: 1, roughness: 0.2 })); star.position.set(0, 0.62, 1.72); g.add(star);
  return g;
}

function buildVilla(g, heli) {
  const v = new THREE.Group(); v.position.set(VILLA.x, 4, VILLA.z);
  const white = mat('#f7f5ef'), wood = mat('#8a5a3b');
  const a = box(10, 3, 7, white); a.position.set(0, 1.5, 0); v.add(a);
  const b = box(6, 3, 6, white); b.position.set(2, 4.5, -0.5); v.add(b);
  const glass = box(9.5, 2.2, 0.1, glassMat('#9fd3f0')); glass.position.set(0, 1.5, 3.55); v.add(glass);
  const deck = box(12, 0.2, 5, wood); deck.position.set(0, 0.1, 6); v.add(deck);
  const pool = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 3), new THREE.MeshStandardMaterial({ color: '#35c0e8', roughness: 0.05, emissive: '#0b5c7a', emissiveIntensity: 0.4 }));
  pool.position.set(-1, 0.2, 6.2); v.add(pool);
  for (const x of [-7, 7]) { const palm = box(0.35, 5, 0.35, mat('#7a5230')); palm.position.set(x, 2.5, 6); v.add(palm); const lf = new THREE.Mesh(new THREE.ConeGeometry(2, 1, 6), mat('#3f8f3a', { flatShading: true })); lf.position.set(x, 5.2, 6); v.add(lf); }
  if (heli) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.15, 24), mat('#444')); pad.position.set(-9, 0.1, -5); v.add(pad);
    const H = new THREE.Group(); H.position.set(-9, 0.2, -5);
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), mat('#1d3557', { metalness: 0.5, roughness: 0.3 })); body.scale.set(1, 0.8, 1.5); body.position.y = 1.1; H.add(body);
    const tail = box(0.25, 0.25, 3, mat('#1d3557')); tail.position.set(0, 1.3, -2.4); H.add(tail);
    const rotor = box(6, 0.05, 0.25, mat('#111')); rotor.position.y = 2.1; H.add(rotor); rotors.push(rotor);
    v.add(H);
  }
  const lbl = labelSprite('🏡 Villan', '#35c0e8'); lbl.position.set(0, 9, 0); lbl.scale.set(5, 1, 1); v.add(lbl);
  g.add(v);
}

function buildYacht(g) {
  const y = new THREE.Group(); y.position.set(28, 0.2, SEA_Z + 22);
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.2, 12, 8, 1), mat('#fbfbfb', { roughness: 0.3 })); hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.6); hull.position.y = 0.6; y.add(hull);
  const deck = box(7, 1.2, 2.4, mat('#f4f4f4')); deck.position.set(-0.5, 1.9, 0); y.add(deck);
  const win = box(6, 0.4, 2.45, mat('#111', { roughness: 0.1 })); win.position.set(-0.5, 2.0, 0); y.add(win);
  const top = box(3.5, 0.9, 2, mat('#f4f4f4')); top.position.set(-1, 3, 0); y.add(top);
  const lbl = labelSprite('🛥️ Yatın', '#35c0e8'); lbl.position.set(0, 6, 0); lbl.scale.set(4.5, 0.9, 1); y.add(lbl);
  g.add(y); yacht = y;
}

function bizLabel(o, text, h) { const l = labelSprite(text, '#9ad17a'); l.position.set(0, h, 0); l.scale.set(6, 1.15, 1); o.add(l); }

function buildBiz(g, key) {
  const o = new THREE.Group();
  if (key === 'otel') o.position.set(OTEL.x, 0, OTEL.z); else o.position.copy(cell(RESERVED[key]));
  if (key === 'galeri') {
    const b = box(10, 3, 7, glassMat('#9fc6db')); b.position.y = 1.5; o.add(b);
    const roof = box(10.4, 0.3, 7.4, mat('#222')); roof.position.y = 3.15; o.add(roof);
    const s = textSign('OTO GALERİ', '#c1121f', '#fff', 6, 1.1); s.position.set(0, 3.9, 3.8); o.add(s);
    ['#111', '#c1121f', '#eee', '#1d3557'].forEach((c, i) => { const m = buildMercedes(c); m.scale.setScalar(0.8); m.position.set(-3.6 + i * 2.4, 0, 5.4); o.add(m); });
    bizLabel(o, '🏎️ Galerin', 7);
  } else if (key === 'dugun') {
    const b = box(11, 4, 8, mat('#fff4f8')); b.position.y = 2; o.add(b);
    const s = textSign('DÜĞÜN SALONU', '#ff4d8d', '#fff', 7, 1.3); s.position.set(0, 4.9, 4.05); o.add(s);
    for (let i = 0; i < 12; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshStandardMaterial({ color: '#ffd', emissive: ['#ff4d8d', '#ffd166', '#06d6a0'][i % 3], emissiveIntensity: 1.5 })); l.position.set(-5.2 + i * 0.95, 4.1, 4.1); o.add(l); }
    bizLabel(o, '💒 Düğün salonun', 8);
  } else if (key === 'tv') {
    const b = box(7, 6, 7, mat('#d0d5dd')); b.position.y = 3; o.add(b);
    const mast = box(0.4, 14, 0.4, mat('#c1121f')); mast.position.set(2, 13, 2); o.add(mast);
    for (let i = 0; i < 4; i++) { const r = box(0.45, 1.5, 0.45, mat('#fff')); r.position.set(2, 8 + i * 3.4, 2); o.add(r); }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 3), mat('#eee')); dish.position.set(-2, 6.5, 0); dish.rotation.x = -1; o.add(dish);
    const s = textSign('KANAL 1', '#1d3557', '#fff', 4.5, 1.1); s.position.set(0, 5, 3.55); o.add(s);
    bizLabel(o, '📺 TV kanalın', 22);
  } else if (key === 'kulup') {
    const field = new THREE.Mesh(new THREE.PlaneGeometry(10, 6.5), mat('#3c9a3c')); field.rotation.x = -Math.PI / 2; field.position.y = 0.06; o.add(field);
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 6.5), mat('#fff')); ln.rotation.x = -Math.PI / 2; ln.position.y = 0.07; o.add(ln);
    for (const z of [-4.2, 4.2]) { const st = box(11, 1.6, 1.4, mat('#f4c20d')); st.position.set(0, 0.8, z); o.add(st); }
    for (const x of [-6, 6]) { const lt = box(0.2, 7, 0.2, mat('#666')); lt.position.set(x, 3.5, -5); o.add(lt); const lamp = box(1.2, 0.6, 0.3, new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 1 })); lamp.position.set(x, 7, -5); o.add(lamp); }
    bizLabel(o, '⚽ Kulübün', 9);
  } else if (key === 'beton') {
    for (let i = 0; i < 3; i++) { const si = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 7, 12), mat('#b9bec4', { metalness: 0.4 })); si.position.set(-3 + i * 3, 5, -2); si.castShadow = true; o.add(si); const cone = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.5, 12), mat('#b9bec4')); cone.rotation.x = Math.PI; cone.position.set(-3 + i * 3, 0.9, -2); o.add(cone); }
    const belt = box(0.6, 0.4, 9, mat('#555')); belt.position.set(4, 3, 0); belt.rotation.x = -0.4; o.add(belt);
    const truck = new THREE.Group(); const cabin = box(1.6, 1.4, 1.6, mat('#f4c20d')); cabin.position.set(0, 1, 1.8); truck.add(cabin);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 3, 10), mat('#e8e8e8')); drum.rotation.x = Math.PI / 2 - 0.2; drum.position.set(0, 1.5, -0.4); truck.add(drum);
    truck.position.set(0, 0, 4); o.add(truck);
    const s = textSign('HAZIR BETON', '#333', '#f4c20d', 5, 1); s.position.set(0, 9.4, -2); o.add(s);
    bizLabel(o, '🏭 Beton santralin', 12);
  } else if (key === 'otel') {
    const b = box(14, 8, 6, mat('#fdfaf3')); b.position.set(0, 4, -3); o.add(b);
    for (let f = 0; f < 4; f++) { const bal = box(14.2, 0.2, 6.8, glassMat('#9fd3f0')); bal.position.set(0, 1.9 + f * 2, -2.6); o.add(bal); }
    const pool = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 3), new THREE.MeshStandardMaterial({ color: '#35c0e8', roughness: 0.05, emissive: '#0b5c7a', emissiveIntensity: 0.4 })); pool.position.set(0, 0.12, 2.6); o.add(pool);
    const s = textSign('BOUTIQUE HOTEL', '#0b3954', '#fff', 7, 1.1); s.position.set(0, 8.9, 0.05); o.add(s);
    bizLabel(o, '🏨 Otelin', 12);
  }
  g.add(o);
}

function officeLevel(state) { return state.completed >= 5 ? 2 : state.completed >= 2 ? 1 : 0; }

function syncAssets(state) {
  const owned = Object.keys(state.owned || {}).sort();
  const sig = [owned.join(','), officeLevel(state), state.firma || ''].join('|');
  if (sig === assetSig) return;
  assetSig = sig;
  if (assetGroup) { scene.remove(assetGroup); assetGroup.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  rotors = []; yacht = null;
  assetGroup = new THREE.Group();
  const op = buildOffice(assetGroup, officeLevel(state), state.firma);
  const has = (k) => owned.includes(k);
  let slot = 0;
  const park = (m) => { m.position.set(op.x - 3 + slot * 2.3, 0, op.z + 5.5); slot++; assetGroup.add(m); };
  if (!has('mercedes') && !has('range')) { const kam = carMesh('#8a9aa8'); kam.scale.setScalar(1.3); park(kam); }
  if (has('mercedes')) park(buildMercedes('#0c0c0c'));
  if (has('range')) { const r = buildMercedes('#2f3e2f'); r.scale.set(1.05, 1.3, 0.95); park(r); }
  if (has('villa')) buildVilla(assetGroup, has('helikopter'));
  else if (has('helikopter')) buildVilla(assetGroup, true);
  if (has('yat')) buildYacht(assetGroup);
  for (const k of ['galeri', 'dugun', 'tv', 'kulup', 'beton', 'otel']) if (has(k)) buildBiz(assetGroup, k);
  assetGroup.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(assetGroup);
}

// ---------- Efektler ----------
function burst(pos, colors, n, speed, life, gravity, size = 0.35) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(n * 3), col = new Float32Array(n * 3), vel = [];
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    arr[i * 3] = pos.x; arr[i * 3 + 1] = pos.y; arr[i * 3 + 2] = pos.z;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(rand(-1, 1)), sp = speed * rand(0.5, 1);
    vel.push([Math.sin(ph) * Math.cos(th) * sp, Math.abs(Math.cos(ph)) * sp * (gravity > 0 ? 0.6 : 1), Math.sin(ph) * Math.sin(th) * sp]);
    c.set(colors[i % colors.length]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity: 1, depthWrite: false }));
  scene.add(m);
  particles.push({ m, vel, t: 0, life, gravity });
}

export function fireworks(state) {
  const done = state.projects.filter((p) => p.done && !p.collapsed && p.slot >= 0).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))[0];
  const base = done ? slotPos(done.slot) : new THREE.Vector3();
  const h = done ? done.floors * FLOOR_H + 6 : 12;
  for (let i = 0; i < 5; i++) setTimeout(() => burst(base.clone().add(new THREE.Vector3(rand(-5, 5), h + rand(0, 6), rand(-5, 5))), [['#ff595e', '#ffca3a'], ['#8ac926', '#1982c4'], ['#6a4c93', '#ffffff']][i % 3], 120, 9, 1.8, 6, 0.45), i * 280);
}

function dust(pos) { burst(pos.clone().add(new THREE.Vector3(0, 2, 0)), ['#9a938a', '#b8b1a6', '#7c766e'], 260, 6, 3.2, -0.6, 1.2); }

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
  syncAssets(state);
}

export function focus(p) {
  if (!p || p.slot < 0) return;
  focusTarget = slotPos(p.slot);
  controls.autoRotate = false;
}

export function quake(power, collapseIds, done) {
  shake = 2.5 + power * 2;
  sinking = [];
  for (const id of collapseIds) { const g = groups.get(id); if (g) { sinking.push({ g, t: 0 }); setTimeout(() => dust(g.position), 900); } }
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
  for (const c of cars) {
    const u = c.userData, k = u.vertical ? 'z' : 'x';
    c.position[k] += u.dir * u.speed * dt;
    if (c.position[k] > u.max) c.position[k] = u.min; else if (c.position[k] < u.min) c.position[k] = u.max;
  }
  for (const cl of clouds) { cl.position.x += cl.userData.v * dt; if (cl.position.x > 170) cl.position.x = -170; }
  for (const r of rotors) r.rotation.y += dt * 18;
  if (yacht) { yacht.position.y = 0.2 + Math.sin(t * 1.3) * 0.15; yacht.rotation.z = Math.sin(t * 0.9) * 0.03; }
  if (seaMesh) seaMesh.position.y = 0.08 + Math.sin(t * 0.8) * 0.05;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.t += dt;
    const a = p.m.geometry.attributes.position;
    for (let j = 0; j < p.vel.length; j++) {
      const v = p.vel[j]; v[1] -= p.gravity * dt * 3; v[0] *= 0.985; v[2] *= 0.985;
      a.array[j * 3] += v[0] * dt; a.array[j * 3 + 1] += v[1] * dt; a.array[j * 3 + 2] += v[2] * dt;
    }
    a.needsUpdate = true;
    p.m.material.opacity = Math.max(0, 1 - p.t / p.life);
    if (p.t > p.life) { scene.remove(p.m); p.m.geometry.dispose(); particles.splice(i, 1); }
  }
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
