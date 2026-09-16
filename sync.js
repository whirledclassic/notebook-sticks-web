/* Network core.
   Structure from Colyseus rooms + schema sync (MIT) and PartyKit presence (MIT).
   Original implementation. Pages has no process — BroadcastChannel is the transport.
   Later: set Sync.transport = "colyseus" | "partykit" | "nakama" and point host. */
(function () {
  const CH = "notebook-sticks-web";
  const PATCH_MS = 120;

  const Sync = {
    transport: "broadcast",
    host: "",
    roomId: "cover",
    sessionId: null,
    peers: {},
    occupancy: {},
    lastPatch: 0
  };

  function idOf() {
    return (typeof state !== "undefined" && state && (state.id || (state.me && state.me.id))) || window.__nbPlayerId || "local";
  }
  function pageOf() {
    return (typeof state !== "undefined" && state && state.me && state.me.page) || "cover";
  }
  function nameOf() {
    return String((typeof state !== "undefined" && state && state.me && state.me.name) || "Doodle").slice(0, 16);
  }

  function schemaPlayer(extra) {
    const me = (typeof state !== "undefined" && state && state.me) || {};
    return Object.assign({
      id: idOf(),
      name: nameOf(),
      x: Math.round(me.x || 0),
      y: Math.round(me.y || 0),
      page: pageOf(),
      pose: me.pose || "stand",
      facing: me.facing === -1 ? -1 : 1,
      color: me.color || "#1b1b1b",
      hat: me.hat || "none",
      hold: (me.kit && me.kit.hold) || me.extra || "none",
      t: Date.now()
    }, extra || {});
  }

  function presence() {
    return {
      type: "sync",
      op: "presence",
      room: pageOf(),
      sessionId: idOf(),
      player: schemaPlayer()
    };
  }

  function bus(msg) {
    try {
      const ch = new BroadcastChannel(CH);
      ch.postMessage(Object.assign({ from: idOf(), t: Date.now() }, msg));
      ch.close();
    } catch (e) {}
  }

  function applyPeer(msg) {
    if (!msg || !msg.player || msg.sessionId === idOf() || msg.from === idOf()) return;
    const p = msg.player;
    Sync.peers[p.id || msg.sessionId] = p;
    const room = p.page || msg.room || "cover";
    if (!Sync.occupancy[room]) Sync.occupancy[room] = {};
    Sync.occupancy[room][p.id || msg.sessionId] = { name: p.name, t: Date.now() };
  }

  function prune() {
    const now = Date.now();
    Object.keys(Sync.peers).forEach(function (id) {
      if (now - (Sync.peers[id].t || 0) > 8000) delete Sync.peers[id];
    });
    Object.keys(Sync.occupancy).forEach(function (room) {
      Object.keys(Sync.occupancy[room]).forEach(function (id) {
        if (now - (Sync.occupancy[room][id].t || 0) > 8000) delete Sync.occupancy[room][id];
      });
    });
  }

  Sync.here = function (room) {
    const bag = Sync.occupancy[room || pageOf()] || {};
    return Object.keys(bag).length;
  };

  Sync.listRoom = function (room) {
    const bag = Sync.occupancy[room || pageOf()] || {};
    return Object.keys(bag).map(function (id) { return bag[id].name; });
  };

  Sync.connect = function (opts) {
    opts = opts || {};
    Sync.transport = opts.transport || Sync.transport;
    Sync.host = opts.host || Sync.host;
    Sync.sessionId = idOf();
    Sync.roomId = pageOf();
    bus(presence());
    return Sync;
  };

  Sync.send = function (op, body) {
    bus({ type: "sync", op: op || "msg", room: pageOf(), sessionId: idOf(), body: body || {} });
  };

  window.tickSync = function () {
    const now = Date.now();
    if (!Sync.sessionId) Sync.connect();
    Sync.roomId = pageOf();
    if (now - Sync.lastPatch < PATCH_MS) return;
    Sync.lastPatch = now;
    bus(presence());
    prune();
  };

  try {
    const live = new BroadcastChannel(CH);
    live.addEventListener("message", function (ev) {
      const m = ev.data;
      if (!m || m.type !== "sync") return;
      if (m.op === "presence") applyPeer(m);
      if (m.op === "leave" && m.sessionId) {
        delete Sync.peers[m.sessionId];
        Object.keys(Sync.occupancy).forEach(function (r) { delete Sync.occupancy[r][m.sessionId]; });
      }
    });
  } catch (e) {}

  addEventListener("beforeunload", function () {
    bus({ type: "sync", op: "leave", sessionId: idOf(), room: pageOf() });
  });

  window.syncChat = function (text) {
    const low = String(text || "").trim().toLowerCase();
    if (low === "/here" || low === "/room") {
      const names = Sync.listRoom();
      if (typeof logLine === "function") {
        logLine((names.length ? names.join(", ") : "just you") + " · " + Sync.transport);
      }
      return true;
    }
    if (low.indexOf("/net ") === 0) {
      const parts = low.slice(5).split(/\s+/);
      Sync.connect({ transport: parts[0], host: parts[1] || "" });
      if (typeof logLine === "function") logLine("Transport " + Sync.transport + (Sync.host ? " @ " + Sync.host : " (broadcast)"));
      return true;
    }
    return false;
  };

  window.Sync = Sync;
})();
