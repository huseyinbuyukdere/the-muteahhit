// Küçük ses efektleri (dosya yok, WebAudio ile üretilir).
let ctx = null;
let muted = false;
try { muted = localStorage.getItem('muteahhit-mute') === '1'; } catch { /* yok say */ }

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('muteahhit-mute', muted ? '1' : '0'); } catch { /* yok say */ }
  return muted;
}

function ac() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = 'sine', vol = 0.12, delay = 0, slide = 0 } = {}) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
}

function noise(dur, vol = 0.3, lp = 300) {
  const a = ac(); if (!a) return;
  const b = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(); s.buffer = b;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp;
  const g = a.createGain(); g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start();
}

export function play(name) {
  if (muted) return;
  try {
    if (name === 'coin') { tone(988, 0.08, { type: 'square', vol: 0.05 }); tone(1319, 0.25, { type: 'square', vol: 0.05, delay: 0.07 }); }
    else if (name === 'bad') { tone(220, 0.3, { type: 'sawtooth', vol: 0.05, slide: -90 }); }
    else if (name === 'ping') { tone(1175, 0.06, { type: 'sine', vol: 0.06 }); tone(1568, 0.12, { type: 'sine', vol: 0.06, delay: 0.08 }); }
    else if (name === 'click') { tone(660, 0.04, { type: 'triangle', vol: 0.04 }); }
    else if (name === 'rumble') { noise(2.4, 0.5, 120); }
    else if (name === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.07, delay: i * 0.11 })); }
    else if (name === 'goal') { [784, 988, 1175].forEach((f, i) => tone(f, 0.18, { type: 'square', vol: 0.04, delay: i * 0.08 })); }
    else if (name === 'plane') { noise(3, 0.15, 900); tone(140, 2.8, { type: 'sawtooth', vol: 0.03, slide: 200 }); }
    else if (name === 'siren') { for (let i = 0; i < 4; i++) { tone(700, 0.35, { type: 'square', vol: 0.03, delay: i * 0.7, slide: 250 }); tone(950, 0.35, { type: 'square', vol: 0.03, delay: i * 0.7 + 0.35, slide: -250 }); } }
    else if (name === 'dice') { for (let i = 0; i < 6; i++) tone(400 + Math.random() * 600, 0.04, { type: 'triangle', vol: 0.04, delay: i * 0.06 }); }
  } catch { /* ses yoksa oyun devam */ }
}
