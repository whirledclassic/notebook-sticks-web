/* Replay tapes — record a walk and play it back as a ghost doodle. */
(function () {
  const KEY = "ns-tapes-v1";
  const MAX_MS = 90000;
  const STEP = 80;
  function loadTapes() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && Array.isArray(raw.tapes)) return raw.tapes;
    } catch (e) {}
    return [];
  }
  function saveTapes(tapes) {
    try { localStorage.setItem(KEY, JSON.stringify({ tapes: tapes.slice(0, 8) })); } catch (e) {}
  }
  const Replay = {
    rec: false, play: false, frames: [], started: 0, lastSample: 0,
    tapes: loadTapes(), ghost: null, playStarted: 0, playing: null
  };
  function sample() {
    if (!state || !state.me) return;
    const me = state.me;
    Replay.frames.push({
      t: Date.now() - Replay.started, x: Math.round(me.x), y: Math.round(me.y),
      facing: me.facing, walking: !!me.walking, pose: me.pose || "stand", page: me.page,
      chat: me.chat && Date.now() < (me.chatUntil || 0) ? me.chat : "",
      color: me.color, hat: me.hat, extra: me.extra || "none", name: me.name
    });
  }
  function setRec(on) {
    if (on) {
      Replay.rec = true; Replay.frames = []; Replay.started = Date.now(); Replay.lastSample = 0;
      sample(); paintHud("REC");
      if (typeof logLine === "function") logLine("Recording. R to stop.");
      if (window.__nbBanner) window.__nbBanner("Recording this walk", "ok");
    } else if (Replay.rec) {
      Replay.rec = false;
      const tape = {
        id: "tape-" + Date.now().toString(36),
        name: (state && state.me && state.me.name) || "Doodle",
        page: Replay.frames[0] && Replay.frames[0].page,
        ms: Replay.frames.length ? Replay.frames[Replay.frames.length - 1].t : 0,
        at: Date.now(),
        look: state && state.me ? { color: state.me.color, hat: state.me.hat, extra: state.me.extra } : {},
        frames: Replay.frames.slice()
      };
      if (tape.frames.length > 4) {
        Replay.tapes.unshift(tape); Replay.tapes = Replay.tapes.slice(0, 8); saveTapes(Replay.tapes);
        if (typeof logLine === "function") logLine("Saved replay · " + Math.round(tape.ms / 1000) + "s · " + tape.frames.length + " frames.");
      } else if (typeof logLine === "function") logLine("Tape too short.");
      paintHud(""); paint();
    }
  }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function poseAt(tape, t) {
    const frames = tape.frames;
    if (!frames.length) return null;
    if (t <= frames[0].t) return frames[0];
    if (t >= frames[frames.length - 1].t) return frames[frames.length - 1];
    let i = 1; while (i < frames.length && frames[i].t < t) i++;
    const a = frames[i - 1], b = frames[i];
    const span = Math.max(1, b.t - a.t); const u = (t - a.t) / span;
    return {
      x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u),
      facing: u > 0.5 ? b.facing : a.facing, walking: b.walking, pose: b.pose, page: b.page, chat: b.chat,
      color: b.color || tape.look.color, hat: b.hat || tape.look.hat, extra: b.extra || tape.look.extra, name: tape.name
    };
  }
  function playTape(tape, share) {
    if (!tape || !tape.frames || !tape.frames.length) return;
    Replay.play = true; Replay.playing = tape; Replay.playStarted = Date.now();
    Replay.ghost = {
      id: "replay-" + tape.id, name: (tape.name || "Ghost") + " replay", ghost: true,
      color: (tape.look && tape.look.color) || "#888", hat: (tape.look && tape.look.hat) || "none",
      extra: (tape.look && tape.look.extra) || "none", page: tape.page,
      x: tape.frames[0].x, y: tape.frames[0].y, facing: 1, walking: false, pose: "stand", chat: "", chatUntil: 0
    };
    if (state && state.others) state.others.set(Replay.ghost.id, Replay.ghost);
    if (tape.page && state && state.me && tape.page !== state.me.page && typeof net === "function") net({ type: "page", page: tape.page });
    paintHud("PLAY");
    if (typeof logLine === "function") logLine("Playing " + tape.name + " · " + Math.round(tape.ms / 1000) + "s");
    if (share) {
      const payload = { type: "replay", name: tape.name, tape: { id: tape.id, name: tape.name, page: tape.page, ms: tape.ms, look: tape.look, frames: tape.frames } };
      if (typeof net === "function") net(payload);
      try {
        const ch = new BroadcastChannel("notebook-sticks-web");
        ch.postMessage(Object.assign({ from: window.__nbPlayerId || "replay" }, payload));
        ch.close();
      } catch (e) {}
    }
  }
  function stopPlay() {
    Replay.play = false;
    if (Replay.ghost && state && state.others) state.others.delete(Replay.ghost.id);
    Replay.ghost = null; Replay.playing = null;
    paintHud(Replay.rec ? "REC" : "");
  }
  window.tickReplay = function () {
    const now = Date.now();
    if (Replay.rec) {
      if (now - Replay.lastSample >= STEP) { Replay.lastSample = now; sample(); }
      if (now - Replay.started >= MAX_MS) setRec(false);
    }
    if (Replay.play && Replay.playing && Replay.ghost) {
      const t = now - Replay.playStarted;
      if (t >= Replay.playing.ms) { stopPlay(); return; }
      const pose = poseAt(Replay.playing, t); if (!pose) return;
      const g = Replay.ghost;
      g.x = pose.x; g.y = pose.y; g.facing = pose.facing; g.walking = pose.walking;
      g.pose = pose.pose; g.page = pose.page; g.color = pose.color; g.hat = pose.hat; g.extra = pose.extra;
      if (pose.chat) { g.chat = pose.chat; g.chatUntil = now + 200; }
      if (state && state.others) state.others.set(g.id, g);
    }
  };
  window.drawReplay = function (g) {
    if (!Replay.ghost) return;
    const p = Replay.ghost;
    g.save(); g.globalAlpha = 0.55; g.setLineDash([5, 4]);
    g.strokeStyle = "rgba(43,108,176,.45)"; g.beginPath(); g.arc(p.x, p.y - 20, 28, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]); g.restore();
  };
  window.handleReplay = function (msg) {
    if (!msg || msg.type !== "replay" || !msg.tape) return;
    if (Replay.play) return;
    if (typeof logLine === "function") logLine((msg.name || "Someone") + " shared a replay.");
    playTape(msg.tape, false);
  };
  window.replayChat = function (raw) {
    const text = String(raw || "").trim().toLowerCase();
    if (text === "/rec" || text === "/record") { setRec(!Replay.rec); return true; }
    if (text === "/play" || text === "/replay") {
      if (Replay.play) stopPlay();
      else if (Replay.tapes[0]) playTape(Replay.tapes[0], true);
      else if (typeof logLine === "function") logLine("No tape yet. R or /rec first.");
      return true;
    }
    if (text === "/stop") { stopPlay(); setRec(false); return true; }
    return false;
  };
  function paintHud(mode) {
    const rec = document.getElementById("replay-hud"); if (!rec) return;
    if (!mode) { rec.classList.remove("show"); rec.textContent = ""; return; }
    rec.classList.add("show"); rec.dataset.mode = mode;
    rec.textContent = mode === "REC" ? "● rec" : "▶ replay";
  }
  function paint() {
    const box = document.getElementById("replay-box"); if (!box) return;
    box.innerHTML =
      "<b>Replay tape</b><div class='sub'>Record a walk. Play it back as a ghost. Share it to other tabs.</div>" +
      "<button type='button' data-rec='1'>" + (Replay.rec ? "Stop recording" : "Record") + "</button>" +
      "<button type='button' data-play='1' " + (Replay.tapes[0] ? "" : "disabled") + ">" + (Replay.play ? "Stop playback" : "Play last tape") + "</button>" +
      (Replay.tapes.length ? "<div class='sub'>Saved tapes</div>" + Replay.tapes.map((t, i) =>
        "<button type='button' data-tape='" + i + "'>" + t.name + " · " + Math.round(t.ms / 1000) + "s · " + (t.page || "?") + "</button>"
      ).join("") : "<div class='sub'>Nothing saved yet.</div>") +
      "<div class='sub'>R record · P play · /rec · /play</div>";
  }
  function bind() {
    const toggle = document.getElementById("replay-toggle");
    if (toggle) toggle.onclick = function () {
      const box = document.getElementById("replay-box"); if (!box) return;
      const open = !box.classList.contains("show");
      ["look", "friends", "member-box", "game-panel", "admin-box"].forEach((id) => {
        const el = document.getElementById(id); if (el) el.classList.remove("show");
      });
      box.classList.toggle("show", open); if (open) paint();
    };
    const box = document.getElementById("replay-box");
    if (box) box.addEventListener("click", function (e) {
      const t = e.target;
      if (t.dataset.rec) setRec(!Replay.rec);
      if (t.dataset.play) { if (Replay.play) stopPlay(); else if (Replay.tapes[0]) playTape(Replay.tapes[0], true); }
      if (t.dataset.tape != null) playTape(Replay.tapes[Number(t.dataset.tape)], true);
      paint();
    });
    addEventListener("keydown", function (e) {
      if (state && (state.chatting || state.lookOpen)) return;
      if (document.activeElement && document.activeElement.id === "chat") return;
      const k = e.key.toLowerCase();
      if (k === "r" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setRec(!Replay.rec); paint(); }
      if (k === "p" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (Replay.play) stopPlay(); else if (Replay.tapes[0]) playTape(Replay.tapes[0], true);
        paint();
      }
    });
    setInterval(paint, 3000);
  }
  try {
    const bus = new BroadcastChannel("notebook-sticks-web");
    bus.onmessage = function (ev) {
      const msg = ev.data;
      if (!msg || msg.from === window.__nbPlayerId) return;
      window.handleReplay(msg);
    };
  } catch (e) {}
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.Replay = Replay;
})();
