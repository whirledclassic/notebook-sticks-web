/* Tiny Web Audio sketchbook SFX. No files. Mute saves in this browser. */
(function () {
  const KEY = "ns-sfx-muted";
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) {}
  const last = {};

  function ac() {
    if (ctx) return ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    return ctx;
  }
  function resume() {
    const c = ac();
    if (c && c.state === "suspended") c.resume();
  }
  function env(gain, t, a, hold, rel, peak) {
    peak = peak == null ? 0.12 : peak;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + a);
    gain.gain.exponentialRampToValueAtTime(peak * 0.7, t + a + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
  }
  function tone(freq, type, a, hold, rel, peak) {
    const c = ac();
    if (!c || muted) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    o.connect(g); g.connect(c.destination);
    const t = c.currentTime;
    env(g, t, a || 0.01, hold || 0.06, rel || 0.12, peak);
    o.start(t);
    o.stop(t + (a || 0.01) + (hold || 0.06) + (rel || 0.12) + 0.02);
  }
  function sweep(from, to, type, dur, peak) {
    const c = ac();
    if (!c || muted) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "triangle";
    o.frequency.setValueAtTime(from, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, to), c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    env(g, c.currentTime, 0.01, dur * 0.4, dur * 0.5, peak || 0.1);
    o.start();
    o.stop(c.currentTime + dur + 0.05);
  }
  function noise(dur, peak, hp) {
    const c = ac();
    if (!c || muted) return;
    const n = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = n;
    const f = c.createBiquadFilter();
    f.type = hp ? "highpass" : "lowpass";
    f.frequency.value = hp || 1800;
    const g = c.createGain();
    src.connect(f); f.connect(g); g.connect(c.destination);
    env(g, c.currentTime, 0.005, dur * 0.2, dur * 0.7, peak || 0.06);
    src.start();
  }
  function gated(name, ms) {
    const now = performance.now();
    if (last[name] && now - last[name] < ms) return false;
    last[name] = now;
    return true;
  }

  const Sfx = {
    muted: function () { return muted; },
    resume: resume,
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {}
      if (!muted) resume();
      paint();
      if (!muted) Sfx.click();
      return muted;
    },
    step: function () { if (gated("step", 170)) noise(0.038, 0.03, 900); },
    sit: function () { noise(0.08, 0.05, 500); tone(140, "triangle", 0.01, 0.05, 0.1, 0.05); },
    dance: function () { if (gated("dance", 280)) tone(380 + Math.random() * 90, "triangle", 0.005, 0.04, 0.08, 0.04); },
    page: function () { sweep(320, 180, "triangle", 0.18, 0.08); noise(0.12, 0.04, 700); },
    stamp: function () { tone(520, "square", 0.005, 0.04, 0.08, 0.08); tone(780, "sine", 0.01, 0.05, 0.1, 0.06); },
    chat: function () { tone(640, "sine", 0.01, 0.05, 0.08, 0.07); },
    shout: function () { tone(420, "square", 0.01, 0.08, 0.12, 0.08); tone(630, "square", 0.02, 0.08, 0.14, 0.05); },
    plane: function () { sweep(480, 220, "sawtooth", 0.35, 0.06); },
    slap: function () { noise(0.08, 0.12, 400); tone(180, "triangle", 0.001, 0.03, 0.08, 0.1); },
    wave: function () { tone(880, "sine", 0.01, 0.06, 0.16, 0.06); },
    win: function () { tone(523, "sine", 0.01, 0.08, 0.1, 0.08); setTimeout(function () { tone(659, "sine", 0.01, 0.08, 0.1, 0.08); }, 90); setTimeout(function () { tone(784, "sine", 0.01, 0.12, 0.18, 0.09); }, 180); },
    lose: function () { sweep(320, 120, "triangle", 0.28, 0.08); },
    click: function () { tone(880, "square", 0.002, 0.02, 0.04, 0.04); },
    buy: function () { tone(600, "triangle", 0.01, 0.06, 0.1, 0.07); tone(900, "sine", 0.02, 0.08, 0.12, 0.05); },
    error: function () { tone(160, "square", 0.01, 0.08, 0.1, 0.07); },
    join: function () { sweep(300, 500, "sine", 0.16, 0.06); },
    mark: function () { tone(740, "triangle", 0.01, 0.05, 0.1, 0.06); },
    friend: function () { tone(520, "sine", 0.01, 0.07, 0.1, 0.07); tone(780, "sine", 0.04, 0.08, 0.14, 0.06); },
    play: function (name) { if (typeof Sfx[name] === "function" && name !== "play" && name !== "toggle") Sfx[name](); }
  };
  function paint() {
    const b = document.getElementById("sfx-toggle");
    if (b) b.textContent = muted ? "Sound off" : "Sound on";
  }
  window.Sfx = Sfx;
  document.addEventListener("click", function () { resume(); }, { once: true });
  document.addEventListener("keydown", function () { resume(); }, { once: true });
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "sfx-toggle") {
      Sfx.toggle();
      return;
    }
    if (e.target && e.target.closest && e.target.closest(".bar, #pages, #dest, #prompt-box, #game-panel, #friends, #shop, #member-box")) {
      if (e.target.tagName === "BUTTON" && e.target.id !== "sfx-toggle") Sfx.click();
    }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
