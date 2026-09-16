/* Room instances + networked props.
   Pattern from Colyseus MMO demo (rooms, persistence, interactables)
   implemented on the Pages mock socket — original drawing code. */
(function () {
  const KEY = "ns-room-props-v1";
  const CH = "notebook-sticks-web";

  const Rooms = { props: {}, sparks: [] };

  function pageOf() {
    return (typeof state !== "undefined" && state && state.me && state.me.page) || "cover";
  }
  function nameOf() {
    return String((typeof state !== "undefined" && state && state.me && state.me.name) || "Doodle").slice(0, 16);
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (raw && typeof raw === "object") Rooms.props = raw;
    } catch (e) { Rooms.props = {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(Rooms.props)); } catch (e) {}
  }
  function bus(msg) {
    try {
      const ch = new BroadcastChannel(CH);
      ch.postMessage(Object.assign({ type: "realm", kind: "room", from: window.__nbPlayerId, name: nameOf(), page: pageOf() }, msg));
      ch.close();
    } catch (e) {}
  }

  const BLUEPRINTS = {
    cover: [
      { id: "board", kind: "board", x: 980, y: 420, label: "notice board" },
      { id: "well", kind: "well", x: 780, y: 900, label: "ink well" },
      { id: "flag", kind: "flag", x: 1680, y: 240, label: "locker flag" },
      { id: "post", kind: "post", x: 2100, y: 720, label: "bench post" }
    ],
    plaza: [
      { id: "fountain", kind: "well", x: 1600, y: 900, label: "plaza well" },
      { id: "board", kind: "board", x: 700, y: 500, label: "plaza board" }
    ],
    club: [
      { id: "banner", kind: "flag", x: 900, y: 520, label: "club banner" },
      { id: "stage", kind: "stage", x: 2000, y: 500, label: "tiny stage" }
    ],
    cafe: [
      { id: "urn", kind: "well", x: 880, y: 640, label: "coffee urn" },
      { id: "board", kind: "board", x: 1600, y: 420, label: "specials" }
    ],
    library: [
      { id: "desk", kind: "board", x: 720, y: 480, label: "card catalog" },
      { id: "lamp", kind: "post", x: 1800, y: 900, label: "reading lamp" }
    ],
    park: [
      { id: "tree", kind: "flag", x: 1100, y: 520, label: "ribbon tree" },
      { id: "well", kind: "well", x: 1900, y: 1100, label: "bird bath" }
    ],
    beach: [
      { id: "flag", kind: "flag", x: 600, y: 700, label: "tide flag" },
      { id: "chest", kind: "well", x: 2000, y: 1200, label: "drift chest" }
    ],
    arcade: [
      { id: "cabinet", kind: "stage", x: 1400, y: 700, label: "cabinet" },
      { id: "board", kind: "board", x: 700, y: 400, label: "high scores" }
    ]
  };

  function propsFor(page) {
    return BLUEPRINTS[page] || BLUEPRINTS.cover;
  }
  function stateOf(page, id) {
    if (!Rooms.props[page]) Rooms.props[page] = {};
    if (!Rooms.props[page][id]) Rooms.props[page][id] = { taps: 0, last: "", color: "#c23b22", text: "" };
    return Rooms.props[page][id];
  }

  function nearestProp() {
    if (typeof state === "undefined" || !state || !state.me) return null;
    const page = pageOf();
    let best = null, bestD = 88;
    propsFor(page).forEach(function (p) {
      const d = Math.hypot(p.x - state.me.x, p.y - state.me.y);
      if (d < bestD) { bestD = d; best = p; }
    });
    return best;
  }

  function useProp(prop) {
    if (!prop) return;
    const page = pageOf();
    const st = stateOf(page, prop.id);
    st.taps += 1;
    st.last = nameOf();
    if (prop.kind === "board") {
      st.text = nameOf() + " was here.";
      if (window.Realm) Realm.notify("room", "Wrote on the " + prop.label, page);
    }
    if (prop.kind === "well") {
      if (state.wallet) {
        state.wallet.ink = (state.wallet.ink || 0) + 1;
        if (typeof refreshWho === "function") refreshWho();
      }
      if (window.addPop) addPop(prop.x, prop.y - 40, "+1 ink");
    }
    if (prop.kind === "flag") {
      const club = window.Clubs && Clubs.mine();
      st.color = club ? club.color : ["#c23b22", "#2b6cb0", "#2f855a", "#b7791f"][st.taps % 4];
      st.text = club ? club.tag : nameOf();
    }
    if (prop.kind === "stage" && typeof setPose === "function") setPose("dance");
    if (prop.kind === "post" && typeof setPose === "function") setPose("sit");
    save();
    bus({ op: "tap", prop: prop.id, state: st });
    Rooms.sparks.push({ x: prop.x, y: prop.y - 30, life: 0.8, text: prop.label });
    if (typeof logLine === "function") logLine("Used " + prop.label + ".");
  }

  window.tickRooms = function (dt) {
    loadOnce();
    for (let i = Rooms.sparks.length - 1; i >= 0; i--) {
      Rooms.sparks[i].life -= dt;
      if (Rooms.sparks[i].life <= 0) Rooms.sparks.splice(i, 1);
    }
  };

  window.drawRooms = function (g) {
    if (!g || typeof state === "undefined" || !state || !state.me) return;
    const page = pageOf();
    const list = propsFor(page);
    list.forEach(function (p) {
      const st = stateOf(page, p.id);
      g.save();
      g.translate(p.x, p.y);
      if (p.kind === "board") {
        g.fillStyle = "#f4eed8";
        g.strokeStyle = "#1b1b1b";
        g.lineWidth = 3;
        g.fillRect(-36, -48, 72, 56);
        g.strokeRect(-36, -48, 72, 56);
        g.fillStyle = "#1b1b1b";
        g.font = "10px sans-serif";
        g.textAlign = "center";
        g.fillText(st.text ? st.text.slice(0, 14) : "board", 0, -18);
      } else if (p.kind === "well") {
        g.fillStyle = "#7ec8e3";
        g.beginPath(); g.ellipse(0, 8, 28, 12, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#1b1b1b"; g.lineWidth = 2; g.stroke();
        g.fillStyle = "#c9a227";
        g.fillRect(-4, -28, 8, 28);
      } else if (p.kind === "flag") {
        g.strokeStyle = "#1b1b1b"; g.lineWidth = 3;
        g.beginPath(); g.moveTo(0, 20); g.lineTo(0, -54); g.stroke();
        g.fillStyle = st.color || "#c23b22";
        g.beginPath(); g.moveTo(0, -54); g.lineTo(38, -40); g.lineTo(0, -26); g.closePath(); g.fill();
        if (st.text) {
          g.fillStyle = "#fff"; g.font = "9px sans-serif"; g.textAlign = "left";
          g.fillText(String(st.text).slice(0, 4), 4, -36);
        }
      } else if (p.kind === "stage") {
        g.fillStyle = "#6b46c1";
        g.fillRect(-50, -8, 100, 18);
        g.strokeStyle = "#1b1b1b"; g.strokeRect(-50, -8, 100, 18);
      } else {
        g.fillStyle = "#b7791f";
        g.fillRect(-6, -30, 12, 40);
        g.strokeStyle = "#1b1b1b"; g.strokeRect(-6, -30, 12, 40);
      }
      g.restore();
    });
    Rooms.sparks.forEach(function (s) {
      g.globalAlpha = Math.max(0, s.life);
      g.fillStyle = "#1b1b1b";
      g.font = "12px sans-serif";
      g.textAlign = "center";
      g.fillText(s.text, s.x, s.y - (1 - s.life) * 20);
      g.globalAlpha = 1;
    });
  };

  window.useNearestRoom = function () {
    const p = nearestProp();
    if (p) { useProp(p); return true; }
    return false;
  };

  window.roomChat = function (text) {
    const low = String(text || "").trim().toLowerCase();
    if (low === "/use" || low === "/tap") { window.useNearestRoom(); return true; }
    return false;
  };

  let loaded = false;
  function loadOnce() { if (!loaded) { load(); loaded = true; } }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "e" && e.key !== "E") return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (window.useNearestRoom && nearestProp()) {
      window.useNearestRoom();
    }
  });

  try {
    const live = new BroadcastChannel(CH);
    live.addEventListener("message", function (ev) {
      const m = ev.data;
      if (!m || m.type !== "realm" || m.kind !== "room" || !m.prop || !m.page) return;
      loadOnce();
      if (!Rooms.props[m.page]) Rooms.props[m.page] = {};
      if (m.state) Rooms.props[m.page][m.prop] = m.state;
      save();
    });
  } catch (e) {}

  window.Rooms = Rooms;
  window.nearestRoomProp = nearestProp;
})();
