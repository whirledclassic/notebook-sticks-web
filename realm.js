/* Notebook Sticks realm layer.
   Feature map inspired by Heroic Labs Nakama (Apache-2.0):
   session, storage collections, notifications, leaderboards, chat channels.
   This file is original code. Pages has no server — BroadcastChannel is the transport.
   Swap Realm.transport later for a real Nakama / Colyseus socket. */
(function () {
  const STORE = "ns-realm-store-v1";
  const NOTES = "ns-realm-notes-v1";
  const BOARD = "ns-realm-board-v1";
  const CH = "notebook-sticks-web";

  const Realm = {
    session: null,
    notes: [],
    board: { stamps: [], waves: [], chats: [], steps: [], picks: [] },
    channel: "room"
  };

  function nameOf() {
    return String((typeof state !== "undefined" && state && state.me && state.me.name) || "Doodle").slice(0, 16);
  }
  function idOf() {
    return (typeof state !== "undefined" && state && (state.id || (state.me && state.me.id))) || window.__nbPlayerId || "local";
  }
  function log(t) { if (typeof logLine === "function") logLine(t); }
  function loadJSON(key, fallback) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      return raw == null ? fallback : raw;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function storageRead() { return loadJSON(STORE, {}); }
  function storageWrite(all) { saveJSON(STORE, all); }
  Realm.write = function (collection, key, value) {
    const all = storageRead();
    if (!all[collection]) all[collection] = {};
    all[collection][key] = { value: value, version: Date.now(), owner: nameOf() };
    storageWrite(all);
    bus({ kind: "storage", collection: collection, key: key, value: value });
    return all[collection][key];
  };
  Realm.read = function (collection, key) {
    const all = storageRead();
    return all[collection] && all[collection][key] ? all[collection][key].value : null;
  };
  Realm.list = function (collection) {
    const all = storageRead();
    return all[collection] || {};
  };

  Realm.authenticate = function () {
    Realm.session = {
      user_id: idOf(),
      username: nameOf(),
      vars: {
        page: (state && state.me && state.me.page) || "cover",
        member: (state && state.me && state.me.member) || "free"
      },
      created: Date.now(),
      transport: "broadcast"
    };
    Realm.write("users", nameOf().toLowerCase(), {
      id: idOf(),
      name: nameOf(),
      page: Realm.session.vars.page,
      seen: Date.now()
    });
    return Realm.session;
  };

  function loadNotes() { Realm.notes = loadJSON(NOTES + ":" + nameOf().toLowerCase(), []); return Realm.notes; }
  function saveNotes() { saveJSON(NOTES + ":" + nameOf().toLowerCase(), Realm.notes.slice(0, 40)); }
  Realm.notify = function (code, subject, content) {
    const note = { id: "n-" + Date.now().toString(36), code: code, subject: subject, content: content || "", t: Date.now(), seen: false };
    loadNotes();
    Realm.notes.unshift(note);
    saveNotes();
    if (window.__nbBanner) window.__nbBanner(subject, "ok");
    else log(subject);
    return note;
  };
  Realm.inbox = function () { return loadNotes(); };

  function loadBoard() {
    const b = loadJSON(BOARD, null);
    if (b && b.stamps) Realm.board = b;
    return Realm.board;
  }
  function saveBoard() { saveJSON(BOARD, Realm.board); }
  Realm.score = function (board, value) {
    loadBoard();
    if (!Realm.board[board]) Realm.board[board] = [];
    const name = nameOf();
    const row = Realm.board[board].find(function (r) { return r.owner === name; });
    const n = Number(value) || 0;
    if (row) {
      if (n > row.score) row.score = n;
      row.update = Date.now();
    } else {
      Realm.board[board].push({ owner: name, score: n, update: Date.now() });
    }
    Realm.board[board].sort(function (a, b) { return b.score - a.score; });
    Realm.board[board] = Realm.board[board].slice(0, 25);
    saveBoard();
    bus({ kind: "board", board: board, owner: name, score: n });
  };
  Realm.top = function (board, n) {
    loadBoard();
    return (Realm.board[board] || []).slice(0, n || 10);
  };

  function bus(msg) {
    try {
      const ch = new BroadcastChannel(CH);
      ch.postMessage(Object.assign({ type: "realm", from: idOf(), name: nameOf() }, msg));
      ch.close();
    } catch (e) {}
    if (typeof net === "function") net(Object.assign({ type: "realm" }, msg));
  }

  Realm.sendChannel = function (channel, text) {
    const body = String(text || "").trim().slice(0, 140);
    if (!body) return;
    bus({ kind: "channel", channel: channel || "room", text: body });
    if (channel && channel !== "room" && typeof logLine === "function") {
      logLine("[" + channel + "] " + nameOf() + ": " + body);
    }
  };

  function onRealm(msg) {
    if (!msg || msg.from === idOf()) return;
    if (msg.kind === "channel" && msg.channel && msg.channel !== "room") {
      log("[" + msg.channel + "] " + (msg.name || "?") + ": " + (msg.text || ""));
    }
    if (msg.kind === "board" && msg.board && msg.owner) {
      loadBoard();
      const list = Realm.board[msg.board] || (Realm.board[msg.board] = []);
      const row = list.find(function (r) { return r.owner === msg.owner; });
      if (!row) list.push({ owner: msg.owner, score: msg.score || 0, update: Date.now() });
      else if ((msg.score || 0) > row.score) row.score = msg.score;
      list.sort(function (a, b) { return b.score - a.score; });
      saveBoard();
    }
    if (msg.kind === "note" && msg.to && String(msg.to).toLowerCase() === nameOf().toLowerCase()) {
      Realm.notify(msg.code || "mail", msg.subject || "Note", msg.content || "");
    }
  }

  try {
    const live = new BroadcastChannel(CH);
    live.addEventListener("message", function (ev) {
      const m = ev.data;
      if (m && m.type === "realm") onRealm(m);
    });
  } catch (e) {}

  function paintBoard() {
    const box = document.getElementById("board-box");
    if (!box) return;
    loadBoard();
    function rows(id, label) {
      const list = Realm.top(id, 8);
      return "<div class='sub'>" + label + "</div>" +
        (list.length ? list.map(function (r, i) {
          return "<div class='sub'>" + (i + 1) + ". " + r.owner + " · " + r.score + "</div>";
        }).join("") : "<div class='sub'>empty</div>");
    }
    box.innerHTML =
      "<b>Board</b><div class='sub'>Local + same-browser ranks. Real Nakama boards plug in later.</div>" +
      rows("stamps", "Stamps") +
      rows("waves", "Waves") +
      rows("chats", "Chats") +
      rows("picks", "Pickups") +
      "<div class='sub'>/board stamps</div>";
  }

  function paintNotes() {
    const box = document.getElementById("notes-box");
    if (!box) return;
    const list = loadNotes();
    box.innerHTML =
      "<b>Notes</b><div class='sub'>Nakama-style notifications on this doodle.</div>" +
      (list.length ? list.map(function (n) {
        return "<div class='sub'><b>" + (n.subject || n.code) + "</b> · " + (n.content || "") + "</div>";
      }).join("") : "<div class='sub'>Nothing yet.</div>");
  }

  window.realmChat = function (text) {
    const m = String(text || "").trim();
    const low = m.toLowerCase();
    if (low === "/board" || low.indexOf("/board ") === 0) {
      const box = document.getElementById("board-box");
      if (box) { if (window.closeHudPanels) closeHudPanels("board-box"); box.classList.add("show"); paintBoard(); }
      return true;
    }
    if (low === "/notes") {
      const box = document.getElementById("notes-box");
      if (box) { if (window.closeHudPanels) closeHudPanels("notes-box"); box.classList.add("show"); paintNotes(); }
      return true;
    }
    if (low.indexOf("/g ") === 0 || low.indexOf("/club ") === 0) {
      const body = m.replace(/^\/(g|club)\s+/i, "");
      if (window.Clubs && Clubs.mine()) Realm.sendChannel("group:" + Clubs.mine().id, body);
      else log("Join a club first. More → Clubs.");
      return true;
    }
    if (low === "/who" || low === "/online") {
      const n = 1 + (state && state.others ? state.others.size : 0);
      log(n + " on this page. Session " + (Realm.session && Realm.session.username || nameOf()) + ".");
      return true;
    }
    return false;
  };

  window.tickRealm = function () {
    if (!Realm.session && typeof state !== "undefined" && state && state.me) Realm.authenticate();
    if (Realm.session && state && state.me) {
      Realm.session.vars.page = state.me.page;
      Realm.session.username = state.me.name;
    }
  };

  document.addEventListener("click", function (e) {
    const t = e.target; if (!t) return;
    if (t.id === "board-toggle") {
      const box = document.getElementById("board-box"); if (!box) return;
      const on = !box.classList.contains("show");
      if (window.closeHudPanels) closeHudPanels(on ? "board-box" : "");
      box.classList.toggle("show", on);
      if (on) paintBoard();
    }
    if (t.id === "notes-toggle") {
      const box = document.getElementById("notes-box"); if (!box) return;
      const on = !box.classList.contains("show");
      if (window.closeHudPanels) closeHudPanels(on ? "notes-box" : "");
      box.classList.toggle("show", on);
      if (on) paintNotes();
    }
  });

  setInterval(function () {
    if (!window.Account || !Account.current || !Account.current.stats) return;
    const s = Account.current.stats;
    Realm.score("stamps", s.stamps || 0);
    Realm.score("waves", s.waves || 0);
    Realm.score("chats", s.chats || 0);
    Realm.score("steps", s.steps || 0);
    Realm.score("picks", s.picks || 0);
  }, 12000);

  window.Realm = Realm;
  window.paintBoard = paintBoard;
  window.paintNotes = paintNotes;
})();
