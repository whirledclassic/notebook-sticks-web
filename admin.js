/* Admin: kick / ban / mute + broadcast panel. Codes only — no backend. */
(function () {
  const CODES = { INKBOSS: 1, STICKMOD: 1, WHIRLED: 1, ADMIN: 1 };
  const KEY = "ns-mod-v1";
  const ADMIN_KEY = "ns-admin";

  function loadMod() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && Array.isArray(raw.bans)) return raw;
    } catch (e) {}
    return { bans: [], mutes: [], log: [] };
  }
  function saveMod(mod) {
    try { localStorage.setItem(KEY, JSON.stringify(mod)); } catch (e) {}
  }

  const Admin = {
    on: false,
    mod: loadMod(),
    isAdmin: function () { return this.on; },
    isBanned: function (name) {
      const n = String(name || "").toLowerCase();
      return this.mod.bans.some((b) => String(b).toLowerCase() === n);
    },
    isMuted: function (name) {
      const n = String(name || "").toLowerCase();
      return this.mod.mutes.some((b) => String(b).toLowerCase() === n);
    },
    note: function (text) {
      this.mod.log = this.mod.log || [];
      this.mod.log.unshift({ t: Date.now(), text: text });
      this.mod.log = this.mod.log.slice(0, 24);
      saveMod(this.mod);
      if (typeof logLine === "function") logLine(text);
      paint();
    }
  };

  try { Admin.on = localStorage.getItem(ADMIN_KEY) === "1"; } catch (e) {}

  function people() {
    if (typeof everyone === "function") return everyone();
    return state && state.me ? [state.me] : [];
  }
  function findNamed(name) {
    const n = String(name || "").toLowerCase();
    return people().find((p) => p && String(p.name || "").toLowerCase() === n) || null;
  }
  let bus = null;
  try { bus = new BroadcastChannel("notebook-sticks-web"); } catch (e) {}
  if (bus) {
    bus.onmessage = function (ev) {
      const msg = ev.data;
      if (!msg || msg.from === window.__nbPlayerId) return;
      window.handleAdmin(msg);
    };
  }
  function send(msg) {
    if (typeof net === "function") net(msg);
    if (bus) bus.postMessage(Object.assign({ from: window.__nbPlayerId || "admin" }, msg));
    window.handleAdmin(msg);
  }
  function banner(text, kind) {
    const el = document.getElementById("br-banner");
    if (!el) return;
    el.textContent = text;
    el.dataset.kind = kind || "info";
    el.classList.add("show");
    clearTimeout(banner._t);
    banner._t = setTimeout(function () { el.classList.remove("show"); }, 5200);
  }

  function applyToMe(msg) {
    const myName = state && state.me ? state.me.name : "";
    const target = String(msg.target || "").toLowerCase();
    if (!target || target !== String(myName).toLowerCase()) return;
    if (msg.action === "kick") {
      banner("Kicked by " + (msg.by || "admin") + (msg.reason ? " — " + msg.reason : ""), "warn");
      Admin.note("You were kicked.");
      setTimeout(function () {
        const boot = document.getElementById("boot");
        if (boot) boot.style.display = "flex";
        window.__nbKicked = true;
      }, 400);
    }
    if (msg.action === "ban") {
      banner("Banned from the notebook.", "warn");
      window.__nbBanned = true;
    }
    if (msg.action === "mute") banner("You are muted.", "warn");
    if (msg.action === "unmute") banner("You can talk again.", "ok");
  }

  function grant(on) {
    Admin.on = !!on;
    try { localStorage.setItem(ADMIN_KEY, Admin.on ? "1" : "0"); } catch (e) {}
    const badge = document.getElementById("admin-badge");
    if (badge) {
      badge.hidden = !Admin.on;
      badge.dataset.on = Admin.on ? "1" : "0";
    }
    const btn = document.getElementById("admin-toggle");
    if (btn) btn.hidden = !Admin.on;
    paint();
  }

  function act(action, target, reason) {
    if (!Admin.on) return false;
    target = String(target || "").trim();
    if (!target) return false;
    const n = target.toLowerCase();
    if (action === "ban") {
      if (!Admin.mod.bans.some((b) => String(b).toLowerCase() === n)) Admin.mod.bans.push(target);
      Admin.mod.mutes = Admin.mod.mutes.filter((b) => String(b).toLowerCase() !== n);
    }
    if (action === "unban") Admin.mod.bans = Admin.mod.bans.filter((b) => String(b).toLowerCase() !== n);
    if (action === "mute") {
      if (!Admin.mod.mutes.some((b) => String(b).toLowerCase() === n)) Admin.mod.mutes.push(target);
    }
    if (action === "unmute") Admin.mod.mutes = Admin.mod.mutes.filter((b) => String(b).toLowerCase() !== n);
    saveMod(Admin.mod);
    const who = state && state.me ? state.me.name : "admin";
    send({ type: "mod", action: action, target: target, reason: reason || "", by: who });
    Admin.note(action + " " + target + (reason ? " (" + reason + ")" : ""));
    if (action === "kick" || action === "ban") {
      const p = findNamed(target);
      if (p && p.id && state.others) state.others.delete(p.id);
    }
    paint();
    return true;
  }

  function broadcastText(text) {
    if (!Admin.on) return false;
    text = String(text || "").trim().slice(0, 160);
    if (!text) return false;
    const who = state && state.me ? state.me.name : "admin";
    send({ type: "broadcast", name: who, text: text });
    banner("BROADCAST · " + who + ": " + text, "br");
    Admin.note("[br] " + text);
    return true;
  }

  window.handleAdmin = function (msg) {
    if (!msg) return;
    if (msg.type === "mod") {
      if (msg.action === "ban" && msg.target && !Admin.isBanned(msg.target)) Admin.mod.bans.push(msg.target);
      if (msg.action === "unban") Admin.mod.bans = Admin.mod.bans.filter((b) => String(b).toLowerCase() !== String(msg.target).toLowerCase());
      if (msg.action === "mute" && msg.target && !Admin.isMuted(msg.target)) Admin.mod.mutes.push(msg.target);
      if (msg.action === "unmute") Admin.mod.mutes = Admin.mod.mutes.filter((b) => String(b).toLowerCase() !== String(msg.target).toLowerCase());
      saveMod(Admin.mod);
      applyToMe(msg);
      paint();
    }
    if (msg.type === "broadcast") {
      banner("BROADCAST · " + (msg.name || "admin") + ": " + msg.text, "br");
      if (typeof logLine === "function") logLine("[broadcast] " + (msg.name || "admin") + ": " + msg.text);
    }
  };

  window.adminChat = function (raw) {
    const text = String(raw || "").trim();
    const low = text.toLowerCase();
    const adminUnlock = text.match(/^\/admin(?:\s+(\S+))?$/i);
    if (adminUnlock) {
      const code = String(adminUnlock[1] || "").toUpperCase();
      if (CODES[code]) { grant(true); if (typeof logLine === "function") logLine("Admin desk unlocked."); banner("Admin on. Open Admin or /br hello", "ok"); }
      else if (code === "OFF") { grant(false); if (typeof logLine === "function") logLine("Admin off."); }
      else if (typeof logLine === "function") logLine("Try /admin INKBOSS");
      return true;
    }
    if (low === "/admins") {
      if (typeof logLine === "function") logLine(Admin.on ? "You have the admin desk." : "No admin on this tab. /admin INKBOSS");
      return true;
    }
    const br = text.match(/^\/(?:br|broadcast)\s+(.+)/i);
    if (br) {
      if (!Admin.on) { if (typeof logLine === "function") logLine("Need admin. /admin INKBOSS"); return true; }
      broadcastText(br[1]);
      return true;
    }
    const kick = text.match(/^\/kick\s+(\S+)(?:\s+(.+))?$/i);
    const ban = text.match(/^\/ban\s+(\S+)(?:\s+(.+))?$/i);
    const unban = text.match(/^\/unban\s+(\S+)/i);
    const mute = text.match(/^\/mute\s+(\S+)/i);
    const unmute = text.match(/^\/unmute\s+(\S+)/i);
    if (kick || ban || unban || mute || unmute) {
      if (!Admin.on) { if (typeof logLine === "function") logLine("Need admin. /admin INKBOSS"); return true; }
      if (kick) act("kick", kick[1], kick[2]);
      if (ban) act("ban", ban[1], ban[2]);
      if (unban) act("unban", unban[1]);
      if (mute) act("mute", mute[1]);
      if (unmute) act("unmute", unmute[1]);
      return true;
    }
    if (state && state.me && Admin.isMuted(state.me.name)) {
      banner("Muted — chat is blocked.", "warn");
      return true;
    }
    return false;
  };

  function paint() {
    const box = document.getElementById("admin-box");
    if (!box) return;
    if (!Admin.on) { box.classList.remove("show"); return; }
    const roster = people().filter((p) => p && p.name);
    const bans = Admin.mod.bans;
    const mutes = Admin.mod.mutes;
    box.innerHTML =
      "<b>Admin desk</b><div class='sub'>kick · mute · ban · /br message</div>" +
      "<textarea id='br-input' maxlength='160' placeholder='broadcast to every tab'></textarea>" +
      "<button type='button' data-br='1'>Broadcast</button>" +
      "<div class='sub'>On this page</div>" +
      roster.map((p) => {
        const mine = typeof isMe === "function" && p.id && isMe(p.id);
        const muted = Admin.isMuted(p.name);
        const banned = Admin.isBanned(p.name);
        return "<div class='admin-row'><span>" + p.name + (mine ? " (you)" : "") +
          (muted ? " · muted" : "") + (banned ? " · banned" : "") + "</span>" +
          (mine ? "" : "<span class='acts'>" +
            "<button type='button' data-act='kick' data-name='" + p.name + "'>kick</button>" +
            "<button type='button' data-act='mute' data-name='" + p.name + "'>" + (muted ? "unmute" : "mute") + "</button>" +
            "<button type='button' data-act='ban' data-name='" + p.name + "'>" + (banned ? "unban" : "ban") + "</button>" +
            "</span>") + "</div>";
      }).join("") +
      (bans.length ? "<div class='sub'>Bans</div>" + bans.map((n) =>
        "<button type='button' data-act='unban' data-name='" + n + "'>unban " + n + "</button>").join("") : "") +
      (mutes.length ? "<div class='sub'>Mutes</div>" + mutes.map((n) =>
        "<button type='button' data-act='unmute' data-name='" + n + "'>unmute " + n + "</button>").join("") : "") +
      "<div class='sub'>Log</div><div class='admin-log'>" +
      (Admin.mod.log || []).slice(0, 8).map((row) => "<div>" + row.text + "</div>").join("") +
      "</div>";
  }

  function bind() {
    const toggle = document.getElementById("admin-toggle");
    if (toggle) toggle.onclick = function () {
      const box = document.getElementById("admin-box");
      if (!box) return;
      const open = !box.classList.contains("show");
      ["look", "friends", "member-box", "game-panel", "replay-box"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("show");
      });
      box.classList.toggle("show", open);
      if (open) paint();
    };
    const box = document.getElementById("admin-box");
    if (box) box.addEventListener("click", function (e) {
      const t = e.target;
      if (t.dataset.br) {
        const area = document.getElementById("br-input");
        broadcastText(area && area.value);
        if (area) area.value = "";
      }
      const action = t.dataset.act;
      const name = t.dataset.name;
      if (action && name) {
        if (action === "mute" && Admin.isMuted(name)) act("unmute", name);
        else if (action === "ban" && Admin.isBanned(name)) act("unban", name);
        else act(action, name);
      }
    });
    grant(Admin.on);
    setInterval(function () { if (Admin.on) paint(); }, 2500);
  }

  setInterval(function () {
    if (typeof socket === "undefined" || !socket || socket.__adminWrapped) return;
    socket.__adminWrapped = true;
    const prev = socket.onmessage;
    socket.onmessage = function (ev) {
      try { window.handleAdmin(JSON.parse(ev.data)); } catch (e) {}
      if (prev) prev.call(this, ev);
    };
  }, 200);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  window.Admin = Admin;
  window.__nbBanner = banner;
})();
