/* Social MMO core: party, mail, trade, inspect, status. */
(function () {
  const Core = { party: [], mail: [], trade: null, status: "online", inspect: null };
  function nameKey() { return String((state && state.me && state.me.name) || "doodle").toLowerCase().slice(0, 16); }
  function loadMail() { try { return JSON.parse(localStorage.getItem("ns-mail:" + nameKey()) || "[]"); } catch (e) { return []; } }
  function saveMail(list) { try { localStorage.setItem("ns-mail:" + nameKey(), JSON.stringify(list.slice(0, 30))); } catch (e) {} }
  function people() { return typeof everyone === "function" ? everyone() : (state ? [state.me] : []); }
  function busSend(msg) {
    if (typeof net === "function") net(Object.assign({ type: "core" }, msg));
    try {
      const bus = new BroadcastChannel("notebook-sticks-web");
      bus.postMessage(Object.assign({ from: window.__nbPlayerId || "core", type: "core" }, msg));
      bus.close();
    } catch (e) {}
  }
  function log(t) { if (typeof logLine === "function") logLine(t); }
  function paintParty() {
    const box = document.getElementById("party-box"); if (!box) return;
    const lead = state && state.me ? state.me.name : "you";
    box.innerHTML = "<b>Party</b><div class='sub'>" + (Core.party.length ? Core.party.length + " with you" : "solo") + " · " + Core.status + "</div>" +
      "<div class='sub'>" + lead + " (you)</div>" +
      Core.party.map(function (n) { return "<button data-kickp='" + n + "'>" + n + " · drop</button>"; }).join("") +
      "<button data-status='online'>Online</button><button data-status='lfg'>Looking for party</button>" +
      "<div class='sub'>/invite Name · /p hello</div>";
  }
  function paintMail() {
    const box = document.getElementById("mail-box"); if (!box) return;
    const mail = loadMail();
    box.innerHTML = "<b>Mail</b><div class='sub'>Notes persist on this doodle.</div>" +
      "<input id='mail-to' maxlength='16' placeholder='to name'/>" +
      "<input id='mail-body' maxlength='80' placeholder='message'/>" +
      "<button data-sendmail='1'>Send</button>" +
      (mail.length ? mail.map(function (m) { return "<div class='sub'><b>" + (m.from || "?") + "</b> · " + (m.text || "") + "</div>"; }).join("") : "<div class='sub'>Inbox empty.</div>");
  }
  function paintTrade() {
    const box = document.getElementById("trade-box"); if (!box) return;
    const tr = Core.trade;
    if (!tr) { box.innerHTML = "<b>Trade</b><div class='sub'>/trade Name or inspect roster</div>"; return; }
    box.innerHTML = "<b>Trade with " + tr.with + "</b>" +
      "<div class='sub'>You offer " + (tr.offer || 0) + " ink · they offer " + (tr.theirs || 0) + "</div>" +
      "<button data-off='5'>+5 ink</button><button data-off='10'>+10 ink</button>" +
      "<button data-accept='1'>Accept</button><button data-canceltr='1'>Cancel</button>";
    box.classList.add("show");
  }
  function paintProfile(p) {
    const box = document.getElementById("profile-box"); if (!box || !p) return;
    const friend = window.Account && Account.isFriend(p.name);
    box.innerHTML = "<b>" + p.name + "</b><div class='sub'>" + (p.member || "free") + (friend ? " · friend" : "") + "</div>" +
      "<button data-inv='" + p.name + "'>Invite to party</button>" +
      "<button data-tr='" + p.name + "'>Trade</button>" +
      "<button data-wh='" + p.name + "'>Whisper</button>" +
      (friend ? "" : "<button data-fr='" + p.name + "'>Friend</button>");
    box.classList.add("show");
  }
  function invite(name) {
    if (!name || Core.party.indexOf(name) >= 0) return;
    Core.party.push(name);
    busSend({ kind: "invite", toName: name, fromName: state.me.name });
    log("Invited " + name + " to the party.");
    paintParty();
  }
  function openTrade(name) {
    Core.trade = { with: name, offer: 0, theirs: 0, ready: false };
    busSend({ kind: "trade-open", toName: name, fromName: state.me.name });
    paintTrade();
  }
  function sendMail(to, text) {
    text = String(text || "").trim().slice(0, 80);
    to = String(to || "").trim();
    if (!to || !text) return;
    busSend({ kind: "mail", toName: to, fromName: state.me.name, text: text });
    log("Mail sent to " + to + ".");
    paintMail();
  }
  window.handleCore = function (msg) {
    if (!msg) return;
    const kind = msg.kind;
    const me = state && state.me ? String(state.me.name).toLowerCase() : "";
    if (kind === "invite" && String(msg.toName || "").toLowerCase() === me) {
      if (Core.party.indexOf(msg.fromName) < 0) Core.party.push(msg.fromName);
      log(msg.fromName + " invited you to a party."); paintParty();
    }
    if (kind === "mail" && String(msg.toName || "").toLowerCase() === me) {
      const box = loadMail(); box.unshift({ from: msg.fromName, text: msg.text, t: Date.now() }); saveMail(box);
      log("Mail from " + msg.fromName + "."); paintMail();
    }
    if (kind === "trade-open" && String(msg.toName || "").toLowerCase() === me) {
      Core.trade = { with: msg.fromName, offer: 0, theirs: 0, ready: false }; paintTrade();
      log(msg.fromName + " wants to trade.");
    }
    if (kind === "trade-offer" && Core.trade && String(msg.fromName).toLowerCase() === String(Core.trade.with).toLowerCase()) {
      Core.trade.theirs = msg.amount || 0; paintTrade();
    }
    if (kind === "trade-ok" && Core.trade) {
      const give = Core.trade.offer || 0, get = Core.trade.theirs || 0;
      if (window.payInk) { if (give) payInk(-give, "trade out"); if (get) payInk(get, "trade in"); }
      log("Trade closed with " + Core.trade.with + "."); Core.trade = null; paintTrade();
    }
    if (kind === "pchat") log("[party] " + (msg.fromName || "?") + ": " + msg.text);
  };
  window.coreChat = function (raw) {
    const text = String(raw || "").trim();
    const inv = text.match(/^\/(?:invite|party)\s+(\S+)/i);
    if (inv) { invite(inv[1]); return true; }
    const pchat = text.match(/^\/p(?:arty)?\s+(.+)/i);
    if (pchat) { log("[party] " + state.me.name + ": " + pchat[1]); busSend({ kind: "pchat", text: pchat[1], fromName: state.me.name }); return true; }
    const tr = text.match(/^\/trade\s+(\S+)/i);
    if (tr) { openTrade(tr[1]); return true; }
    const mail = text.match(/^\/mail\s+(\S+)\s+(.+)/i);
    if (mail) { sendMail(mail[1], mail[2]); return true; }
    if (/^\/lfg$/i.test(text)) { Core.status = "lfg"; log("Status: looking for party."); paintParty(); return true; }
    return false;
  };
  window.tickCore = function () {
    const roster = document.getElementById("roster");
    if (roster && !roster.__core) {
      roster.__core = true;
      roster.addEventListener("click", function (e) {
        const id = e.target.dataset.id;
        const p = people().find(function (o) { return String(o.id || "") === String(id || "") || o.name === e.target.textContent; });
        if (p && p !== state.me) paintProfile(p);
      });
    }
  };
  window.drawCore = function (g) {
    if (!state || !Core.party.length) return;
    people().forEach(function (p) {
      if (Core.party.indexOf(p.name) < 0) return;
      g.strokeStyle = "rgba(47,133,90,.55)"; g.lineWidth = 2;
      g.beginPath(); g.arc(p.x, p.y - 20, 30, 0, Math.PI * 2); g.stroke();
    });
  };
  try {
    const bus = new BroadcastChannel("notebook-sticks-web");
    bus.onmessage = function (ev) {
      const msg = ev.data;
      if (!msg || msg.from === window.__nbPlayerId) return;
      if (msg.type === "core" || msg.kind) window.handleCore(msg);
    };
  } catch (e) {}
  function bind() {
    const partyBtn = document.getElementById("party-toggle");
    if (partyBtn) partyBtn.onclick = function () { const el = document.getElementById("party-box"); if (el) { el.classList.toggle("show"); paintParty(); } };
    const mailBtn = document.getElementById("mail-toggle");
    if (mailBtn) mailBtn.onclick = function () { const el = document.getElementById("mail-box"); if (el) { el.classList.toggle("show"); paintMail(); } };
    const party = document.getElementById("party-box");
    if (party) party.addEventListener("click", function (e) {
      if (e.target.dataset.status) { Core.status = e.target.dataset.status; paintParty(); }
      if (e.target.dataset.kickp) { Core.party = Core.party.filter(function (n) { return n !== e.target.dataset.kickp; }); paintParty(); }
    });
    const mail = document.getElementById("mail-box");
    if (mail) mail.addEventListener("click", function (e) {
      if (!e.target.dataset.sendmail) return;
      sendMail((document.getElementById("mail-to") || {}).value, (document.getElementById("mail-body") || {}).value);
    });
    const trade = document.getElementById("trade-box");
    if (trade) trade.addEventListener("click", function (e) {
      const t = e.target; if (!Core.trade) return;
      if (t.dataset.off) {
        const n = Number(t.dataset.off);
        if ((state.wallet.ink || 0) < Core.trade.offer + n) return;
        Core.trade.offer += n;
        busSend({ kind: "trade-offer", toName: Core.trade.with, fromName: state.me.name, amount: Core.trade.offer });
        paintTrade();
      }
      if (t.dataset.accept) { busSend({ kind: "trade-ok", toName: Core.trade.with, fromName: state.me.name }); window.handleCore({ kind: "trade-ok", fromName: Core.trade.with }); }
      if (t.dataset.canceltr) { Core.trade = null; paintTrade(); }
    });
    const profile = document.getElementById("profile-box");
    if (profile) profile.addEventListener("click", function (e) {
      const t = e.target;
      if (t.dataset.inv) invite(t.dataset.inv);
      if (t.dataset.tr) openTrade(t.dataset.tr);
      if (t.dataset.wh) { const chat = document.getElementById("chat"); if (chat) { chat.value = "/w " + t.dataset.wh + " "; chat.focus(); } }
      if (t.dataset.fr && window.Account) Account.addFriend(t.dataset.fr);
    });
    paintParty();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.Core = Core;
})();
