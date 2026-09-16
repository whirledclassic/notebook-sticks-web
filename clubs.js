/* Clubs = Nakama groups. Create / join / roster / group chat / hall flag.
   Shared across same-origin tabs via BroadcastChannel + localStorage. */
(function () {
  const KEY = "ns-clubs-v1";
  const MINE = "ns-club-mine-v1";
  const CH = "notebook-sticks-web";
  const COLORS = ["#c23b22", "#2b6cb0", "#2f855a", "#6b46c1", "#b7791f", "#0f766e", "#dd6b20"];

  const Clubs = { list: [], mineId: "" };

  function nameOf() {
    return String((typeof state !== "undefined" && state && state.me && state.me.name) || "Doodle").slice(0, 16);
  }
  function log(t) { if (typeof logLine === "function") logLine(t); }
  function load() {
    try { Clubs.list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { Clubs.list = []; }
    if (!Array.isArray(Clubs.list)) Clubs.list = [];
    try { Clubs.mineId = localStorage.getItem(MINE + ":" + nameOf().toLowerCase()) || ""; } catch (e) { Clubs.mineId = ""; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(Clubs.list.slice(0, 40))); } catch (e) {}
    try { localStorage.setItem(MINE + ":" + nameOf().toLowerCase(), Clubs.mineId || ""); } catch (e) {}
  }
  function bus(msg) {
    try {
      const ch = new BroadcastChannel(CH);
      ch.postMessage(Object.assign({ type: "realm", kind: "club", from: window.__nbPlayerId, name: nameOf() }, msg));
      ch.close();
    } catch (e) {}
  }

  Clubs.mine = function () {
    load();
    return Clubs.list.find(function (c) { return c.id === Clubs.mineId; }) || null;
  };
  Clubs.byName = function (tag) {
    load();
    const t = String(tag || "").toLowerCase();
    return Clubs.list.find(function (c) {
      return String(c.tag).toLowerCase() === t || String(c.name).toLowerCase() === t;
    }) || null;
  };

  Clubs.create = function (name, tag) {
    load();
    name = String(name || "").trim().slice(0, 18);
    tag = String(tag || name).trim().replace(/\s+/g, "").slice(0, 6).toUpperCase() || "INK";
    if (name.length < 2) { log("Club name too short."); return null; }
    if (Clubs.byName(tag) || Clubs.byName(name)) { log("That club already exists."); return null; }
    const club = {
      id: "g-" + Date.now().toString(36),
      name: name,
      tag: tag,
      motto: "Drawn together.",
      color: COLORS[Clubs.list.length % COLORS.length],
      founder: nameOf(),
      members: [{ name: nameOf(), role: "founder" }],
      created: Date.now()
    };
    Clubs.list.push(club);
    Clubs.mineId = club.id;
    save();
    bus({ op: "create", club: club });
    if (window.Realm) Realm.notify("group", "Club " + tag + " founded", name);
    log("Founded [" + tag + "] " + name + ".");
    return club;
  };

  Clubs.join = function (tag) {
    load();
    const club = Clubs.byName(tag);
    if (!club) { log("No club named " + tag + "."); return; }
    if (!club.members.some(function (m) { return m.name.toLowerCase() === nameOf().toLowerCase(); })) {
      club.members.push({ name: nameOf(), role: "member" });
    }
    Clubs.mineId = club.id;
    save();
    bus({ op: "join", id: club.id, who: nameOf() });
    if (window.Realm) Realm.notify("group", "Joined [" + club.tag + "]", club.name);
    log("Joined [" + club.tag + "] " + club.name + ".");
  };

  Clubs.leave = function () {
    load();
    const club = Clubs.mine();
    if (!club) { log("Not in a club."); return; }
    club.members = club.members.filter(function (m) { return m.name.toLowerCase() !== nameOf().toLowerCase(); });
    Clubs.mineId = "";
    save();
    bus({ op: "leave", id: club.id, who: nameOf() });
    log("Left [" + club.tag + "].");
  };

  function paint() {
    const box = document.getElementById("club-box");
    if (!box) return;
    load();
    const mine = Clubs.mine();
    box.innerHTML =
      "<b>Clubs</b>" +
      "<div class='sub'>" + (mine ? "[" + mine.tag + "] " + mine.name + " · " + mine.members.length + " members" : "solo") + "</div>" +
      (mine ? "<div class='sub'>" + (mine.motto || "") + "</div>" +
        mine.members.map(function (m) { return "<div class='sub'>" + m.name + " · " + m.role + "</div>"; }).join("") +
        "<button data-clubleave='1'>Leave club</button>" +
        "<button data-clubhall='1'>Walk to Club page</button>"
        : "<input id='club-name' maxlength='18' placeholder='new club name'/>" +
          "<input id='club-tag' maxlength='6' placeholder='TAG'/>" +
          "<button data-clubmake='1'>Found club</button>") +
      "<div class='sub'>Open clubs</div>" +
      (Clubs.list.length ? Clubs.list.map(function (c) {
        return "<button data-clubjoin='" + c.tag + "'>[" + c.tag + "] " + c.name + " · " + c.members.length + "</button>";
      }).join("") : "<div class='sub'>None yet. Found one.</div>") +
      "<div class='sub'>/club new Inkers INK · /g hello · /join INK</div>";
  }

  window.clubChat = function (text) {
    const m = String(text || "").trim();
    const low = m.toLowerCase();
    if (low === "/clubs" || low === "/club") {
      const box = document.getElementById("club-box");
      if (box) { if (window.closeHudPanels) closeHudPanels("club-box"); box.classList.add("show"); paint(); }
      return true;
    }
    const found = m.match(/^\/club\s+new\s+(\S+)(?:\s+(\S+))?/i);
    if (found) { Clubs.create(found[1], found[2] || found[1]); paint(); return true; }
    if (low.indexOf("/join ") === 0) { Clubs.join(m.slice(6).trim()); paint(); return true; }
    if (low === "/leave") { Clubs.leave(); paint(); return true; }
    return false;
  };

  document.addEventListener("click", function (e) {
    const t = e.target; if (!t) return;
    if (t.id === "club-toggle") {
      const box = document.getElementById("club-box"); if (!box) return;
      const on = !box.classList.contains("show");
      if (window.closeHudPanels) closeHudPanels(on ? "club-box" : "");
      box.classList.toggle("show", on);
      if (on) paint();
    }
    if (t.dataset && t.dataset.clubmake) {
      const n = document.getElementById("club-name");
      const g = document.getElementById("club-tag");
      Clubs.create(n && n.value, g && g.value);
      paint();
    }
    if (t.dataset && t.dataset.clubjoin) { Clubs.join(t.dataset.clubjoin); paint(); }
    if (t.dataset && t.dataset.clubleave) { Clubs.leave(); paint(); }
    if (t.dataset && t.dataset.clubhall && typeof net === "function") net({ type: "page", page: "club" });
  });

  try {
    const live = new BroadcastChannel(CH);
    live.addEventListener("message", function (ev) {
      const m = ev.data;
      if (!m || m.type !== "realm" || m.kind !== "club") return;
      load();
      if (m.op === "create" && m.club && !Clubs.byName(m.club.tag)) {
        Clubs.list.push(m.club);
        save();
      }
      if ((m.op === "join" || m.op === "leave") && m.id) {
        const club = Clubs.list.find(function (c) { return c.id === m.id; });
        if (club && m.who) {
          if (m.op === "join" && !club.members.some(function (x) { return x.name === m.who; })) {
            club.members.push({ name: m.who, role: "member" });
          }
          if (m.op === "leave") club.members = club.members.filter(function (x) { return x.name !== m.who; });
          save();
        }
      }
    });
  } catch (e) {}

  window.Clubs = Clubs;
  window.paintClubs = paint;
  load();
})();
