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
// Tıklama, işçiler ve sahne olayları
let pickCb = null, workers = [], envGroup = null, envSig = '', flashers = [], marchers = [], movers = [], pressCams = [], hoverT = 0;
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
const cx = (k) => (k - (GRID.cols - 1) / 2) * GRID.gap, cz = (k) => (k - (GRID.rows - 1) / 2) * GRID.gap;
const SEA_Z = 52, BEACH_Z = 40;
// Oyuncunun varlıkları için ayrılmış hücreler
const RESERVED = { ofis: [-1, 1], galeri: [0, -1], dugun: [1, -1], tv: [2, -1], kulup: [3, -1], beton: [4, 1] };
const VILLA = { x: 70, z: -40 };
const OTEL = { x: -7.5, z: 46 };
const texCache = {};
const GREY = new THREE.Color('#8f99a3'), SUN_DAY = new THREE.Color('#fff3dd'), SUN_DUSK = new THREE.Color('#ffb070'), FOCUS_OFF = new THREE.Vector3(18, 20, 22);
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW ? 1.5 : 2));
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
  controls.addEventListener('start', () => { controls.autoRotate = false; focusTarget = null; if (cine) { cine = null; document.body.classList.remove('cine'); } });
  hemi = new THREE.HemisphereLight('#dfefff', '#4a5a3a', 0.9); scene.add(hemi);
  sun = new THREE.DirectionalLight('#fff3dd', 1.6);
  sun.position.set(40, 60, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 200 });
  scene.add(sun);
  buildWorld();
  bindPicking(canvas);
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
  streetLamps();
  if (HEAD_MAT) cityMat.push(HEAD_MAT);
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, r = rand(100, 170);
    if (Math.sin(a) * r > SEA_Z - 10) continue;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(rand(10, 25), rand(8, 22), 6), mat('#6f8a5c'));
    hill.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(hill);
  }
}

let HEAD_MAT = null, LAMP_MAT = null;
function carMesh(color) {
  const g = new THREE.Group();
  const body = box(1.1, 0.45, 2.1, mat(color, { roughness: 0.4, metalness: 0.3 })); body.position.y = 0.4; g.add(body);
  const cab = box(0.95, 0.4, 1.1, mat('#223', { roughness: 0.2 })); cab.position.set(0, 0.8, -0.1); g.add(cab);
  // Farlar: gece yanar
  if (!HEAD_MAT) HEAD_MAT = new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#ffe9a8', emissiveIntensity: 0 });
  for (const x of [-0.35, 0.35]) { const h = new THREE.Mesh(HEAD_GEO, HEAD_MAT); h.position.set(x, 0.45, 1.06); g.add(h); }
  return g;
}
const HEAD_GEO = new THREE.BoxGeometry(0.22, 0.12, 0.04);

function streetLamps() {
  LAMP_MAT = new THREE.MeshStandardMaterial({ color: '#fff6d8', emissive: '#ffd98a', emissiveIntensity: 0 });
  const pole = mat('#4a4f57'), pg = new THREE.CylinderGeometry(0.07, 0.09, 3.2, 6), lg = new THREE.SphereGeometry(0.28, 8, 6);
  for (let c = -1; c <= GRID.cols; c++) for (let r = -1; r <= GRID.rows; r++) {
    const x = cx(c) + GRID.gap / 2 - 1.9, z = cz(r) + GRID.gap / 2 - 1.9;
    if (z > BEACH_Z - 4) continue;
    const p = new THREE.Mesh(pg, pole); p.position.set(x, 1.6, z); scene.add(p);
    const l = new THREE.Mesh(lg, LAMP_MAT); l.position.set(x, 3.25, z); scene.add(l);
  }
  cityMat.push(LAMP_MAT);
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
    const hit = new THREE.Mesh(new THREE.BoxGeometry(GRID.gap - 4, 4, GRID.gap - 4), HIT_MAT); hit.position.y = 2; g.add(hit);
    g.userData.pick = { kind: 'proje', id: p.id };
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
        const s = box(S.w + 0.3, 0.18, S.d + 0.3, slab); s.position.set(bx, f * FLOOR_H + FLOOR_H, bz); s.userData.floorIdx = f; g.add(s);
        for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
          const c = box(0.3, FLOOR_H, 0.3, conc); c.position.set(bx + cx * S.w / 2.3, f * FLOOR_H + FLOOR_H / 2, bz + cz * S.d / 2.3); c.userData.floorIdx = f; g.add(c);
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
    const load = box(1.4, 0.35, 0.9, mat('#8b5a2b')); load.position.set(7, -4.2, 0); jib.add(load);
    jib.userData = { cable, load, ph: rand(0, 6) };
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
  if (p.phase === 'insaat' || p.phase === 'yatirim') addWorkers(g, p);
  const lbl = labelSprite(p.name, p.done ? '#9ad17a' : '#ffd34d');
  lbl.position.set(0, (p.phase === 'arsa' || p.phase === 'yatirim' ? 5 : p.floors * FLOOR_H + 3), 0);
  g.add(lbl);
  // Tıklanabilir alan: parselin tamamı
  const hit = new THREE.Mesh(new THREE.BoxGeometry(GRID.gap - 4, p.phase === 'arsa' || p.phase === 'yatirim' ? 4 : p.floors * FLOOR_H + 1, GRID.gap - 4), HIT_MAT);
  hit.position.y = hit.geometry.parameters.height / 2; hit.userData.hitbox = true; g.add(hit);
  g.userData.pick = { kind: 'proje', id: p.id };
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
  const hit = new THREE.Mesh(new THREE.BoxGeometry(9, h + 2, 9), HIT_MAT); hit.position.y = (h + 2) / 2; hit.userData.hitbox = true; o.add(hit);
  o.userData.pick = { kind: 'ofis' };
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
  assetGroup.traverse((o) => { if (o.isMesh && o.material !== HIT_MAT) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(assetGroup);
}

// ---------- Canlı sahne: işçiler, tıklama, mağdurlar, polis, basın ----------
const HIT_MAT = new THREE.MeshBasicMaterial({ visible: false });
const shared = (g) => { g.userData.shared = true; return g; };
const G_BODY = shared(new THREE.BoxGeometry(0.5, 0.72, 0.3)), G_LEG = shared(new THREE.BoxGeometry(0.18, 0.55, 0.2));
const G_ARM = shared(new THREE.BoxGeometry(0.14, 0.58, 0.16)), G_HEAD = shared(new THREE.SphereGeometry(0.2, 8, 6));
const G_HELM = shared(new THREE.SphereGeometry(0.25, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2)), G_HIT = shared(new THREE.BoxGeometry(2.2, 2.6, 2.2));
const mcache = {};
const cm = (c, o) => mcache[c + (o ? JSON.stringify(o) : '')] || (mcache[c + (o ? JSON.stringify(o) : '')] = mat(c, o));

function figure({ body = '#f28c28', legs = '#34495e', skin = '#d9a77c', helmet = '#f4c20d', scale = 0.75 } = {}) {
  const f = new THREE.Group();
  const lg = [];
  for (const x of [-0.12, 0.12]) { const piv = new THREE.Group(); piv.position.set(x, 0.55, 0); const l = new THREE.Mesh(G_LEG, cm(legs)); l.position.y = -0.275; piv.add(l); f.add(piv); lg.push(piv); }
  const b = new THREE.Mesh(G_BODY, cm(body)); b.position.y = 0.91; b.castShadow = true; f.add(b);
  const ar = [];
  for (const x of [-0.33, 0.33]) { const piv = new THREE.Group(); piv.position.set(x, 1.22, 0); const a = new THREE.Mesh(G_ARM, cm(body)); a.position.y = -0.27; piv.add(a); f.add(piv); ar.push(piv); }
  const h = new THREE.Mesh(G_HEAD, cm(skin)); h.position.y = 1.5; f.add(h);
  if (helmet) { const hm = new THREE.Mesh(G_HELM, cm(helmet)); hm.position.y = 1.55; f.add(hm); }
  const hit = new THREE.Mesh(G_HIT, HIT_MAT); hit.position.y = 1; f.add(hit);
  f.scale.setScalar(scale);
  f.userData.legs = lg; f.userData.arms = ar;
  return f;
}

function addWorkers(g, p) {
  const n = p.phase === 'yatirim' ? 2 : 3 + p.tier;
  const unsafe = p.kalite < 45;
  for (let i = 0; i < n; i++) {
    const helm = !(unsafe && i % 2 === 0);
    const w = figure({ body: i % 3 === 2 ? '#2d6cdf' : '#f28c28', helmet: helm ? (i === 0 ? '#ffffff' : '#f4c20d') : null, skin: ['#d9a77c', '#b98563', '#e8c39e'][i % 3] });
    // Parselin kenarında bir hat boyunca gidip gelir
    const side = i % 4, r = 5.1, span = rand(2.5, 4.5), off = rand(-2, 2);
    const A = new THREE.Vector3(), B = new THREE.Vector3();
    if (side === 0) { A.set(off - span, 0, r); B.set(off + span, 0, r); }
    else if (side === 1) { A.set(r, 0, off - span); B.set(r, 0, off + span); }
    else if (side === 2) { A.set(off - span, 0, -r); B.set(off + span, 0, -r); }
    else { A.set(-r, 0, off - span); B.set(-r, 0, off + span); }
    w.position.copy(A);
    w.userData = { ...w.userData, A, B, k: Math.random(), dir: 1, speed: rand(0.12, 0.22), work: 0, pick: { kind: 'isci', id: p.id, n: i, baret: helm } };
    g.add(w); workers.push(w);
  }
}

const BANNERS = {
  cokme: ['KATİL MÜTEAHHİT', 'ADALET İSTİYORUZ', 'BETON RAPORU NEREDE?', 'UNUTMAYACAĞIZ'],
  tapu: ['#TapumuVer', 'TAPUMU VER!', 'EVİMİZ NEREDE?', '3 YILDIR KİRADAYIZ'],
  gecikme: ['EVİMİZ NEREDE?', 'SÖZ VERDİN!', 'KİRA ÖDEMEKTEN BIKTIK', 'MAĞDURUZ'],
};

function police(x, z, ry) {
  const c = new THREE.Group();
  const body = box(1.15, 0.45, 2.2, cm('#1d3a8a', { roughness: 0.5 })); body.position.y = 0.4; c.add(body);
  const door = box(1.17, 0.2, 1.1, cm('#ffffff')); door.position.y = 0.42; c.add(door);
  const cab = box(0.95, 0.4, 1.1, cm('#223', { roughness: 0.2 })); cab.position.set(0, 0.8, -0.1); c.add(cab);
  const r = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: '#ff2030' })); r.position.set(-0.22, 1.08, -0.1); c.add(r);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.3), new THREE.MeshBasicMaterial({ color: '#2060ff' })); b.position.set(0.22, 1.08, -0.1); c.add(b);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff2030', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.position.set(0, 1.2, -0.1); glow.scale.setScalar(4); c.add(glow);
  flashers.push({ r, b, glow });
  const hit = new THREE.Mesh(G_HIT, HIT_MAT); hit.scale.set(1, 0.8, 1.6); hit.position.y = 0.8; c.add(hit);
  c.position.set(x, 0, z); c.rotation.y = ry;
  c.userData.pick = { kind: 'polis' };
  return c;
}

let _glow = null;
function glowTex() {
  if (_glow) return _glow;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  _glow = new THREE.CanvasTexture(cv);
  return _glow;
}

function syncEnv(st) {
  const m = st.m || 0, tapu = (st.sosyal && st.sosyal.tapu) || 0;
  const live = st.projects.filter((p) => p.slot >= 0);
  const col = live.find((p) => p.collapsed);
  const late = live.filter((p) => !p.done && !p.collapsed && p.gecikme >= 3).sort((a, b) => b.gecikme - a.gecikme)[0];
  const target = col || late || null;
  const protest = !!col || m >= 8 || tapu >= 800;
  const crowd = protest ? Math.min(14, 4 + Math.floor(m / 12) + (tapu >= 5000 ? 3 : 0)) : 0;
  const press = protest && (!!col || m >= 20 || tapu >= 800);
  const pol = st.r >= 75 || st.ending === 'iade' || st.ending === 'hapis' || st.ending === 'kovuldun';
  const tema = col ? 'cokme' : tapu >= 800 ? 'tapu' : 'gecikme';
  const sig = [crowd, press, pol, target ? target.id : 'ofis', tema].join('|');
  if (sig === envSig) return;
  envSig = sig;
  if (envGroup) { const old = envGroup; flashers = flashers.filter((f) => !isChildOf(f.glow, old)); scene.remove(old); old.traverse((o) => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); }
  envGroup = new THREE.Group(); marchers = []; pressCams = [];
  const base = target ? slotPos(target.slot) : cell(RESERVED.ofis);
  if (crowd) {
    const txt = BANNERS[tema];
    const signs = txt.map((t) => textSign(t, '#f5f1e6', t.startsWith('#') ? '#1d6fd8' : '#b3121f', 2.4, 0.8));
    for (let i = 0; i < crowd; i++) {
      const row = i % 2, x = (Math.floor(i / 2) - (crowd / 4)) * 1.15 + rand(-0.2, 0.2);
      const f = figure({ body: ['#6d4c8f', '#2a9d8f', '#8d5b3f', '#c1121f', '#555f6b', '#e9c46a'][i % 6], legs: '#2b2d42', helmet: null, skin: ['#d9a77c', '#b98563', '#e8c39e'][i % 3], scale: 0.7 });
      f.position.set(base.x + x, 0, base.z + 6.6 + row * 1.1);
      f.rotation.y = Math.PI + rand(-0.3, 0.3);
      if (i % 2 === 0) {
        const sg = signs[(i / 2) % signs.length].clone();
        const pole = box(0.06, 1.8, 0.06, cm('#6b4b2a')); pole.position.set(0.33, 1.9, 0.1); f.add(pole);
        sg.position.set(0.33, 2.9, 0.12); sg.rotation.y = Math.PI; f.add(sg);
        f.userData.arms[1].rotation.x = -2.6;
      } else f.userData.arms.forEach((a) => (a.rotation.z = 0));
      f.userData.phase = rand(0, 6); f.userData.pick = { kind: 'magdur', id: target ? target.id : null, tema };
      envGroup.add(f); marchers.push(f);
    }
  }
  if (press) {
    const r = figure({ body: '#222831', legs: '#393e46', helmet: null, scale: 0.7 });
    r.position.set(base.x + 6.2, 0, base.z + 9.2); r.rotation.y = Math.PI * 0.8;
    const cam = box(0.35, 0.3, 0.5, cm('#111')); cam.position.set(0.25, 1.55, 0.35); r.add(cam);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffffff', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    fl.position.set(0.25, 1.6, 0.7); fl.scale.setScalar(3); r.add(fl);
    const mic = textSign('HABER', '#c1121f', '#fff', 1.1, 0.35); mic.position.set(-0.4, 2.3, 0); r.add(mic);
    r.userData.pick = { kind: 'basin', id: target ? target.id : null };
    envGroup.add(r); pressCams.push({ fl, t: rand(0, 2) });
  }
  if (pol) {
    const o = cell(RESERVED.ofis);
    envGroup.add(police(o.x + 5.5, o.z + 6.8, Math.PI / 2 + 0.3));
    if (target) envGroup.add(police(base.x - 6, base.z + 6.8, -Math.PI / 2 - 0.2));
  }
  scene.add(envGroup);
}

function tickLife(dt, t) {
  for (const w of workers) {
    const u = w.userData;
    if (u.work > 0) {
      u.work -= dt;
      u.arms[1].rotation.x = -1.2 + Math.sin(t * 9) * 0.6;
      u.legs[0].rotation.x = u.legs[1].rotation.x = 0;
      if (u.work <= 0) u.arms[1].rotation.x = 0;
      continue;
    }
    u.k += dt * u.speed * u.dir;
    if (u.k >= 1 || u.k <= 0) { u.k = Math.max(0, Math.min(1, u.k)); u.dir *= -1; u.work = rand(1, 4); }
    w.position.lerpVectors(u.A, u.B, u.k);
    const dx = (u.B.x - u.A.x) * u.dir, dz = (u.B.z - u.A.z) * u.dir;
    w.rotation.y = Math.atan2(dx, dz);
    const sw = Math.sin(t * 8 + u.k * 20) * 0.6;
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw; u.arms[0].rotation.x = -sw * 0.7; u.arms[1].rotation.x = sw * 0.7;
  }
  for (const f of marchers) {
    const ph = t * 3 + f.userData.phase;
    f.position.y = Math.max(0, Math.sin(ph)) * 0.12;
    f.userData.arms[0].rotation.x = -2.4 + Math.sin(ph) * 0.5;
  }
  const on = Math.floor(t * 4) % 2 === 0;
  for (const fl of flashers) {
    fl.r.material.color.set(on ? '#ff2030' : '#330008'); fl.b.material.color.set(on ? '#000833' : '#2060ff');
    fl.glow.material.color.set(on ? '#ff2030' : '#2060ff');
  }
  for (const pc of pressCams) {
    pc.t -= dt;
    if (pc.t <= 0) { pc.t = rand(0.8, 3); pc.fl.material.opacity = 1; }
    else pc.fl.material.opacity = Math.max(0, pc.fl.material.opacity - dt * 6);
  }
  for (let i = movers.length - 1; i >= 0; i--) {
    const mv = movers[i]; mv.t += dt;
    const k = mv.t / mv.dur;
    if (k >= 1) { mv.stage++; mv.t = 0; if (mv.stage >= mv.path.length - 1) { scene.remove(mv.o); flashers = flashers.filter((f) => !isChildOf(f.glow, mv.o)); movers.splice(i, 1); continue; } }
    const a = mv.path[mv.stage], b = mv.path[mv.stage + 1];
    mv.dur = a.w || Math.max(0.5, a.p.distanceTo(b.p) / 12);
    const kk = Math.min(1, mv.t / mv.dur);
    mv.o.position.lerpVectors(a.p, b.p, a.w ? 0 : kk * kk * (3 - 2 * kk));
    if (mv.flash) { const f = Math.floor(t * 5) % 2 === 0; mv.flash.material.color.set(f ? '#ffb000' : '#442200'); }
  }
  // Masaüstünde fare üstündeki şeye göre imleç
  hoverT -= dt;
}

// Tek seferlik sahne olayları (kart açılınca)
export function event3d(kind, projId) {
  if (!scene) return;
  const p = projId != null ? [...groups.entries()].find(([id]) => id === projId) : null;
  const base = p ? p[1].position.clone() : cell(RESERVED.ofis);
  if (kind === 'denetim') {
    const c = carMesh('#f4f4f4');
    const stripe = box(1.12, 0.12, 2.12, cm('#1d6fd8')); stripe.position.y = 0.45; c.add(stripe);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), new THREE.MeshBasicMaterial({ color: '#ffb000' })); lamp.position.set(0, 1.08, -0.1); c.add(lamp);
    const lbl = labelSprite('🚨 Denetim', '#ffb000'); lbl.scale.set(4.5, 0.85, 1); lbl.position.y = 2.4; c.add(lbl);
    const z = base.z + GRID.gap / 2 - 0.75;
    c.rotation.y = Math.PI / 2;
    const path = [{ p: new THREE.Vector3(base.x - 45, 0, z) }, { p: new THREE.Vector3(base.x - 2, 0, z) }, { p: new THREE.Vector3(base.x - 2, 0, z), w: 9 }, { p: new THREE.Vector3(base.x - 2, 0, z) }, { p: new THREE.Vector3(base.x + 60, 0, z) }];
    c.position.copy(path[0].p); scene.add(c);
    movers.push({ o: c, path, stage: 0, t: 0, dur: 3, flash: lamp });
  } else if (kind === 'basin') {
    for (let i = 0; i < 6; i++) setTimeout(() => burst(base.clone().add(new THREE.Vector3(rand(-5, 5), rand(1, 3), 7 + rand(0, 2))), ['#ffffff', '#fffbe0'], 14, 1.2, 0.35, 0, 1.1), i * 260 + rand(0, 120));
  } else if (kind === 'polis') {
    const o = cell(RESERVED.ofis);
    const c = police(0, 0, Math.PI / 2);
    const z = o.z + GRID.gap / 2 - 0.75;
    const path = [{ p: new THREE.Vector3(o.x - 50, 0, z) }, { p: new THREE.Vector3(o.x + 1, 0, z) }, { p: new THREE.Vector3(o.x + 1, 0, z), w: 12 }, { p: new THREE.Vector3(o.x + 1, 0, z) }];
    c.position.copy(path[0].p); scene.add(c);
    movers.push({ o: c, path, stage: 0, t: 0, dur: 3 });
  }
}

export function onPick(cb) { pickCb = cb; }

function pickAt(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const roots = [...groups.values(), ...(assetGroup ? [assetGroup] : []), ...(envGroup ? [envGroup] : [])];
  const hits = raycaster.intersectObjects(roots, true);
  // Önce en özel (işçi/mağdur/polis) olanı, sonra bina
  let best = null;
  for (const h of hits.slice(0, 8)) {
    for (let o = h.object; o; o = o.parent) if (o.userData && o.userData.pick) {
      const pk = o.userData.pick;
      if (!best) best = pk;
      if (pk.kind !== 'proje' && pk.kind !== 'ofis') return pk;
      break;
    }
  }
  return best;
}

function bindPicking(canvas) {
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || !pickCb) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dtm = performance.now() - down.t;
    down = null;
    if (moved > 8 || dtm > 600) return;
    const pk = pickAt(e.clientX, e.clientY);
    if (pk) pickCb({ ...pk, x: e.clientX, y: e.clientY });
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || hoverT > 0 || e.buttons) return;
    hoverT = 0.12;
    canvas.style.cursor = pickAt(e.clientX, e.clientY) ? 'pointer' : '';
  });
}

// ---------- Görsel: hava durumu, kat kat yükselme, mikser, sinematik kamera, kalite ayarı ----------
const LOW = typeof window !== 'undefined' && (window.innerWidth <= 860 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
let weather = null, weatherKind = '', wetness = 0, growers = [], mixerT = 8, cine = null, perf = { n: 0, sum: 0, done: false };

function setWeather(kind) {
  if (kind === weatherKind) return;
  weatherKind = kind;
  if (weather) { scene.remove(weather); weather.geometry.dispose(); weather = null; }
  if (!kind) return;
  const n = Math.round((LOW ? 700 : 1800) * (kind === 'kar' ? 0.8 : 1));
  const W = 110, H = 60;
  if (kind === 'yagmur') {
    const arr = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) { const x = rand(-W / 2, W / 2), y = rand(0, H), z = rand(-W / 2, W / 2); arr.set([x, y, z, x - 0.12, y + 0.9, z], i * 6); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    weather = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#b8c8da', transparent: true, opacity: 0.55, depthWrite: false }));
  } else {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([rand(-W / 2, W / 2), rand(0, H), rand(-W / 2, W / 2)], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    weather = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 0.55, map: glowTex(), transparent: true, opacity: 0.95, depthWrite: false }));
  }
  weather.frustumCulled = false; weather.userData = { W, H, kind };
  scene.add(weather);
}

function tickWeather(dt, t) {
  const target = weatherKind ? 1 : 0;
  wetness += (target - wetness) * Math.min(1, dt * 0.8);
  if (!weather) return;
  weather.position.set(controls.target.x, 0, controls.target.z);
  const a = weather.geometry.attributes.position, arr = a.array, { W, H, kind } = weather.userData;
  if (kind === 'yagmur') {
    const dy = 42 * dt, dx = 5 * dt;
    for (let i = 0; i < arr.length; i += 6) {
      arr[i + 1] -= dy; arr[i + 4] -= dy; arr[i] -= dx; arr[i + 3] -= dx;
      if (arr[i + 1] < 0) { const x = rand(-W / 2, W / 2), z = rand(-W / 2, W / 2); arr[i] = x; arr[i + 1] = H; arr[i + 2] = z; arr[i + 3] = x - 0.12; arr[i + 4] = H + 0.9; arr[i + 5] = z; }
    }
  } else {
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= 3.2 * dt; arr[i] += Math.sin(t * 0.8 + i) * dt * 0.9;
      if (arr[i + 1] < 0) { arr[i] = rand(-W / 2, W / 2); arr[i + 1] = H; arr[i + 2] = rand(-W / 2, W / 2); }
    }
  }
  a.needsUpdate = true;
}

// Oyun ayına göre hava: kışın kar, bahar/güz yağmur, yaz çoğunlukla açık
function weatherFor(t) {
  const ay = ((t % 12) + 12) % 12, h = ((t * 9301 + 49297) % 233280) / 233280;
  if (ay === 11 || ay <= 1) return h < 0.5 ? 'kar' : h < 0.7 ? 'yagmur' : '';
  if ((ay >= 2 && ay <= 4) || ay >= 9) return h < 0.35 ? 'yagmur' : '';
  return h < 0.07 ? 'yagmur' : '';
}

function growFloors(g, from) {
  let delay = 0;
  const byFloor = {};
  g.traverse((o) => { const f = o.userData.floorIdx; if (f != null && f >= from) (byFloor[f] = byFloor[f] || []).push(o); });
  for (const f of Object.keys(byFloor).sort((a, b) => a - b)) {
    for (const o of byFloor[f]) { o.scale.y = 0.01; growers.push({ o, t: -delay, g, top: +f }); }
    delay += 0.45;
  }
}

function tickGrow(dt) {
  for (let i = growers.length - 1; i >= 0; i--) {
    const gr = growers[i]; gr.t += dt;
    if (gr.t < 0) continue;
    const k = Math.min(1, gr.t / 0.55), c1 = 1.70158;
    gr.o.scale.y = Math.max(0.01, 1 + (c1 + 1) * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2));
    if (k >= 1) {
      gr.o.scale.y = 1; growers.splice(i, 1);
      if (!growers.some((x) => x.g === gr.g && x.top === gr.top) && gr.o.parent) {
        const p = new THREE.Vector3(); gr.o.getWorldPosition(p);
        if (!LOW || Math.random() < 0.5) burst(p, ['#b8b1a6', '#d6d0c4'], 24, 2, 0.9, -0.3, 0.6);
      }
    }
  }
}

function mixerMesh() {
  const g = new THREE.Group();
  const chassis = box(1.2, 0.35, 3.4, cm('#333')); chassis.position.y = 0.45; g.add(chassis);
  const cab = box(1.2, 0.95, 1, cm('#e63946')); cab.position.set(0, 1.05, 1.25); g.add(cab);
  const win = box(1.05, 0.35, 0.05, cm('#223', { roughness: 0.2 })); win.position.set(0, 1.3, 1.76); g.add(win);
  const drum = new THREE.Group(); drum.position.set(0, 1.35, -0.45); drum.rotation.x = -0.25;
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 2.1, 10), cm('#f1ece2', { flatShading: true })); d.rotation.x = Math.PI / 2; drum.add(d);
  const st = box(0.12, 0.12, 2.1, cm('#e63946')); st.position.y = 0.66; drum.add(st);
  g.add(drum);
  for (const [x, z] of [[-0.6, 1.2], [0.6, 1.2], [-0.6, -0.9], [0.6, -0.9]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), cm('#111')); w.rotation.z = Math.PI / 2; w.position.set(x, 0.3, z); g.add(w); }
  g.userData.spin = drum;
  return g;
}

function tickMixers(dt) {
  mixerT -= dt;
  if (mixerT > 0) return;
  mixerT = rand(14, 26);
  const sites = [...groups.values()].filter((g) => g.userData.sig && g.userData.sig.startsWith('insaat'));
  if (!sites.length || movers.filter((m) => m.o.userData.spin).length >= 2) return;
  const g = sites[Math.floor(Math.random() * sites.length)];
  const base = g.position, z = base.z + GRID.gap / 2 + 0.75, dir = Math.random() < 0.5 ? 1 : -1;
  const c = mixerMesh(); c.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
  const path = [{ p: new THREE.Vector3(base.x - dir * 50, 0, z) }, { p: new THREE.Vector3(base.x + dir * 1.5, 0, z) }, { p: new THREE.Vector3(base.x + dir * 1.5, 0, z), w: 7 }, { p: new THREE.Vector3(base.x + dir * 1.5, 0, z) }, { p: new THREE.Vector3(base.x + dir * 55, 0, z) }];
  c.position.copy(path[0].p); scene.add(c);
  movers.push({ o: c, path, stage: 0, t: 0, dur: 3 });
}

// Sinematik kamera: önemli anlarda binanın etrafında yavaşça döner
export function cinematic(kind, projId) {
  if (!scene) return;
  const g = projId != null ? groups.get(projId) : null;
  const target = g ? g.position.clone() : controls.target.clone();
  const h = g && g.userData.floors ? g.userData.floors * FLOOR_H : 8;
  const cfg = { bitis: [5.5, 20 + h * 0.4, 6 + h * 0.7, 0.55], deprem: [3.5, 24, 6, 0.25], kacis: [5, 30, 18, 0.4] }[kind] || [4, 24, 10, 0.4];
  const a0 = Math.atan2(camera.position.z - target.z, camera.position.x - target.x);
  cine = { target: target.setY(h * 0.4), t: 0, dur: cfg[0], r: cfg[1], h: cfg[2], w: cfg[3], a0 };
  controls.autoRotate = false; focusTarget = null;
  document.body.classList.add('cine');
  clearTimeout(cinematic._t); cinematic._t = setTimeout(() => document.body.classList.remove('cine'), cfg[0] * 1000);
}

function tickCine(dt) {
  if (!cine) return false;
  cine.t += dt;
  const k = cine.t / cine.dur, ease = k < 0.15 ? k / 0.15 : 1;
  const a = cine.a0 + cine.t * cine.w;
  const want = new THREE.Vector3(cine.target.x + Math.cos(a) * cine.r, cine.h, cine.target.z + Math.sin(a) * cine.r);
  const f = 1 - Math.exp(-dt * (1.5 + ease * 3));
  camera.position.lerp(want, f);
  controls.target.lerp(cine.target, f);
  if (k >= 1) { cine = null; document.body.classList.remove('cine'); }
  return true;
}

// Telefonda kasma olursa kaliteyi düşür
function tickPerf(dt) {
  if (perf.done || document.hidden) return;
  perf.n++; if (perf.n < 30) return;
  perf.sum += dt;
  if (perf.n < 150) return;
  perf.done = true;
  const avg = perf.sum / 120;
  if (avg > 1 / 40) { renderer.setPixelRatio(1); sun.shadow.mapSize.set(1024, 1024); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  if (avg > 1 / 24) { renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); }
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
  g.traverse((o) => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); });
  cranes = cranes.filter((c) => !g.userData.cranes.includes(c));
  workers = workers.filter((w) => w.parent && w.parent !== g && !isChildOf(w, g));
  growers = growers.filter((x) => x.g !== g);
}
const isChildOf = (o, g) => { for (let x = o; x; x = x.parent) if (x === g) return true; return false; };

export function sync(state) {
  const seen = new Set();
  for (const p of state.projects) {
    if (p.slot < 0) continue;
    seen.add(p.id);
    const sig = signature(p);
    const cur = groups.get(p.id);
    if (cur && cur.userData.sig === sig) continue;
    const prevFloors = cur && cur.userData.phase === 'insaat' ? cur.userData.builtFloors : null;
    if (cur) disposeGroup(cur);
    const g = buildProject(p);
    g.userData.sig = sig; g.userData.cranes = g.userData.cranes || [];
    g.userData.phase = p.phase; g.userData.floors = p.floors;
    g.userData.builtFloors = p.phase === 'insaat' ? Math.max(1, Math.ceil((p.progress / 100) * p.floors)) : 0;
    if (p.phase === 'insaat' && initDone) growFloors(g, prevFloors ?? 0);
    cranes.push(...g.userData.cranes);
    scene.add(g); groups.set(p.id, g);
  }
  for (const [id, g] of groups) if (!seen.has(id)) { disposeGroup(g); groups.delete(id); }
  syncAssets(state);
  syncEnv(state);
  setWeather(weatherFor(state.t || 0));
  initDone = true;
}
let initDone = false;

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
  for (const c of cranes) {
    c.rotation.y += dt * 0.25;
    const u = c.userData; if (u && u.cable) { const k = 0.55 + 0.45 * Math.sin(t * 0.45 + u.ph); u.cable.scale.y = k; u.cable.position.y = -2 * k; u.load.position.y = -4 * k - 0.2; }
  }
  tickWeather(dt, t); tickGrow(dt); tickMixers(dt); tickPerf(dt);
  for (const mv of movers) if (mv.o.userData.spin) mv.o.userData.spin.rotation.z += dt * 3;
  for (const c of cars) {
    const u = c.userData, k = u.vertical ? 'z' : 'x';
    c.position[k] += u.dir * u.speed * dt;
    if (c.position[k] > u.max) c.position[k] = u.min; else if (c.position[k] < u.min) c.position[k] = u.max;
  }
  for (const cl of clouds) { cl.position.x += cl.userData.v * dt; if (cl.position.x > 170) cl.position.x = -170; }
  for (const r of rotors) r.rotation.y += dt * 18;
  tickLife(dt, t);
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
  if (wetness > 0.01) sky.lerp(GREY.clone().multiplyScalar(0.35 + day * 0.65), wetness * 0.6);
  scene.background.copy(sky); scene.fog.color.copy(sky);
  scene.fog.far = 180 - wetness * 70; scene.fog.near = 70 - wetness * 35;
  sun.intensity = (0.25 + day * 1.5) * (1 - wetness * 0.45); hemi.intensity = 0.35 + day * 0.6;
  const sa = t * 0.035;
  sun.position.set(Math.cos(sa) * 55, 22 + day * 45, 20 + Math.sin(sa) * 25);
  sun.color.copy(SUN_DAY).lerp(SUN_DUSK, Math.max(0, 1 - day * 2.2));
  if (t - lastT > 0.5) {
    lastT = t;
    const e = Math.max(0, 1 - day * 1.8) * 1.4;
    for (const m of cityMat) m.emissiveIntensity = e;
  }
  const inCine = tickCine(dt);
  if (focusTarget && !inCine) {
    controls.target.lerp(focusTarget, 1 - Math.exp(-dt * 3.2));
    const desired = focusTarget.clone().add(FOCUS_OFF);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 2.2));
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

// Test yardımcısı: tıklanabilir bir şeyin ekrandaki yeri
export function _screenOf(kind) {
  const r = renderer.domElement.getBoundingClientRect();
  const list = kind === 'isci' ? workers : kind === 'magdur' ? marchers : kind === 'ofis' && assetGroup ? assetGroup.children.filter((o) => o.userData.pick) : [];
  const o = list[0]; if (!o) return null;
  const v = new THREE.Vector3(); o.getWorldPosition(v); v.y += 0.6; v.project(camera);
  return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, pick: pickAt(r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height) };
}
