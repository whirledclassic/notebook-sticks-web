/* In-browser stand-in for the Node + ws server. GitHub Pages has no backend. */
(function () {
  const WORLD = { w: 3200, h: 2100 };
  const RANGE = 420;
  const PAGES = [
    { id: "cover", name: "Cover" },
    { id: "graph", name: "Graph" },
    { id: "comic", name: "Comic" },
    { id: "pocket", name: "Pocket" },
    { id: "gallery", name: "Gallery" },
    { id: "back", name: "Back page" },
    { id: "shop", name: "Ink shop" },
    { id: "club", name: "Club" },
    { id: "margin", name: "Margin" }
  ];
  const MEMBER_PAGES = { club: "plus", margin: "patron" };
  function spawn() { return { x: 720 + Math.random() * 280, y: 560 + Math.random() * 180 }; }
  const born = spawn();
  const me = {
    id: "local-" + Math.random().toString(36).slice(2, 10),
    name: "Doodle", color: "#1b1b1b", hat: "none", extra: "none", member: "free",
    page: "cover", x: born.x, y: born.y, facing: 1, walking: false, pose: "stand",
    chat: "", chatUntil: 0
  };
  window.__nbPlayerId = me.id;
  const others = new Map();
  const marks = { cover: [], graph: [], comic: [], pocket: [], gallery: [], back: [], shop: [], club: [], margin: [] };
  const PLACES = {
    cover: [
      { id: "title", name: "Title block", kind: "sign", x: 420, y: 260, r: 150, hint: "The front of the book." },
      { id: "lockers", name: "Locker row", kind: "lockers", x: 1680, y: 240, r: 160, hint: "Drawn metal. Empty." },
      { id: "coffee", name: "Coffee ring plaza", kind: "ring", x: 780, y: 900, r: 180, hint: "The fountain is a stain." },
      { id: "bench", name: "Quiet bench", kind: "bench", x: 2100, y: 720, r: 140, hint: "Sit with C." },
      { id: "hop", name: "Hopscotch", kind: "hop", x: 1280, y: 1280, r: 160, hint: "F throws a plane. Hop." },
      { id: "desk", name: "Member desk", kind: "desk", x: 2400, y: 1280, r: 160, hint: "Plus and Patron sign here." }
    ],
    graph: [
      { id: "origin", name: "The origin", kind: "origin", x: 560, y: 1050, r: 150, hint: "(0, 0) more or less." },
      { id: "triangles", name: "Triangle village", kind: "triangles", x: 1680, y: 420, r: 180, hint: "Houses with three walls." },
      { id: "pi", name: "Pi fountain", kind: "fountain", x: 2300, y: 1200, r: 160, hint: "It never ends." },
      { id: "axis", name: "Scribble axis", kind: "scribble", x: 1100, y: 1600, r: 140, hint: "Someone plotted a secret." }
    ],
    comic: [
      { id: "panel1", name: "Panel one", kind: "panel", x: 520, y: 380, r: 170, hint: "Once upon a line." },
      { id: "panel2", name: "Panel two", kind: "panel", x: 1600, y: 380, r: 170, hint: "Then somebody waved." },
      { id: "panel3", name: "Panel three", kind: "panel", x: 2600, y: 380, r: 170, hint: "Cut to wide." },
      { id: "splash", name: "Splash page", kind: "splash", x: 1500, y: 1300, r: 220, hint: "The big frame." }
    ],
    pocket: [
      { id: "clips", name: "Paperclip park", kind: "clip", x: 520, y: 520, r: 160, hint: "Bent silver trees." },
      { id: "stamp", name: "Stamp corner", kind: "stamp", x: 2200, y: 360, r: 150, hint: "Postage due." },
      { id: "crumple", name: "Crumpled courtyard", kind: "crumple", x: 1200, y: 1280, r: 190, hint: "Someone gave up." }
    ],
    gallery: [
      { id: "frame1", name: "First hanging", kind: "frame", x: 520, y: 480, r: 160, hint: "A doodle someone liked." },
      { id: "frame2", name: "Gold frame", kind: "frame", x: 1500, y: 420, r: 170, hint: "Members get a second look." },
      { id: "frame3", name: "Sketch wall", kind: "grid", x: 2400, y: 500, r: 180, hint: "Leave a /mark." },
      { id: "bench2", name: "Gallery bench", kind: "bench", x: 1500, y: 1300, r: 150, hint: "Sit and stare." }
    ],
    shop: [
      { id: "counter", name: "Shop counter", kind: "counter", x: 900, y: 520, r: 200, hint: "Buy with ink." },
      { id: "fitting", name: "Fitting box", kind: "sign", x: 1900, y: 900, r: 160, hint: "Try it on." }
    ],
    back: [
      { id: "yearbook", name: "Yearbook wall", kind: "grid", x: 500, y: 360, r: 170, hint: "Leave a note." },
      { id: "phones", name: "Phone numbers", kind: "list", x: 2100, y: 320, r: 150, hint: "All fake." },
      { id: "exam", name: "Final exam panic", kind: "scribble", x: 1100, y: 1250, r: 190, hint: "Breathe. Dance. Sleep." }
    ],
    club: [
      { id: "lounge", name: "Gold lounge", kind: "lounge", x: 900, y: 600, r: 200, hint: "Plus members only. Extra stamp ink." },
      { id: "stage", name: "Tiny stage", kind: "sign", x: 2000, y: 500, r: 160, hint: "Dance. The paper likes it." },
      { id: "booth", name: "Booth", kind: "bench", x: 1600, y: 1200, r: 150, hint: "Sit and brag." },
      { id: "bar", name: "Ink bar", kind: "counter", x: 500, y: 1300, r: 160, hint: "A free drip if you hang out." }
    ],
    margin: [
      { id: "asterisk", name: "Asterisk grove", kind: "star", x: 700, y: 500, r: 170, hint: "Footnotes live here." },
      { id: "aside", name: "Side note", kind: "list", x: 1900, y: 400, r: 150, hint: "Patron scribbles." },
      { id: "arrow", name: "See below", kind: "scribble", x: 1400, y: 1300, r: 180, hint: "The real plot." },
      { id: "footnote", name: "Footnote 1", kind: "sign", x: 2400, y: 1100, r: 150, hint: "See also: everything." }
    ]
  };
  const CATALOG = [
    { kind: "hat", id: "halo", name: "Halo", cost: 40 },
    { kind: "hat", id: "horns", name: "Horns", cost: 35 },
    { kind: "hat", id: "flower", name: "Flower", cost: 25 },
    { kind: "hat", id: "crown", name: "Crown", cost: 80 },
    { kind: "hat", id: "fez", name: "Fez", cost: 45 },
    { kind: "hat", id: "top", name: "Top hat", cost: 60 },
    { kind: "hat", id: "party", name: "Party hat", cost: 28 },
    { kind: "hat", id: "prop", name: "Propeller", cost: 42 },
    { kind: "hat", id: "ribbon", name: "Plus ribbon", cost: 0, member: "plus" },
    { kind: "hat", id: "star", name: "Patron star", cost: 0, member: "patron" },
    { kind: "color", id: "#6b46c1", name: "Violet ink", cost: 20 },
    { kind: "color", id: "#b7791f", name: "Gold ink", cost: 20 },
    { kind: "color", id: "#dd6b20", name: "Orange ink", cost: 20 },
    { kind: "color", id: "#0f766e", name: "Teal ink", cost: 20 },
    { kind: "color", id: "#e11d48", name: "Rose ink", cost: 50 },
    { kind: "color", id: "#c9a227", name: "Patron gold", cost: 0, member: "patron" },
    { kind: "extra", id: "glasses", name: "Glasses", cost: 30 },
    { kind: "extra", id: "scarf", name: "Scarf", cost: 35 },
    { kind: "extra", id: "pack", name: "Backpack", cost: 50 },
    { kind: "extra", id: "cape", name: "Cape", cost: 55 },
    { kind: "extra", id: "bowtie", name: "Bow tie", cost: 22 },
    { kind: "extra", id: "sash", name: "Sash", cost: 48 },
    { kind: "extra", id: "pin", name: "Member pin", cost: 0, member: "plus" }
  ];
  const FREE_HATS = ["none", "cap", "bow", "antenna"];
  const FREE_COLORS = ["#1b1b1b", "#c23b22", "#2b6cb0", "#2f855a"];
  const LINES = ["A pencil rolled under the binding.", "The margin yawned.", "Club ribbon inked itself gold.", "A footnote escaped the margin.", "Gallery lights dimmed one notch.", "Someone framed a coffee stain."];
  function emptyWallet() { return { ink: 40, hats: FREE_HATS.slice(), colors: FREE_COLORS.slice(), extras: ["none"], extra: "none", stamps: [], member: "free" }; }
  function loadWallet(name) {
    try {
      const w = JSON.parse(localStorage.getItem("ns-wallet:" + name.toLowerCase()) || "null");
      const out = w || emptyWallet();
      if (!out.hats) out.hats = FREE_HATS.slice();
      if (!out.colors) out.colors = FREE_COLORS.slice();
      if (!out.extras) out.extras = ["none"];
      if (!out.stamps) out.stamps = [];
      if (!out.member) out.member = localStorage.getItem("ns-member") || "free";
      return out;
    } catch (e) { return emptyWallet(); }
  }
  function saveWallet(name, w) {
    localStorage.setItem("ns-wallet:" + name.toLowerCase(), JSON.stringify(w));
    try { localStorage.setItem("ns-member", w.member || "free"); } catch (e) {}
    window.__nbMember = w.member || "free";
    return { ink: w.ink, hats: w.hats, colors: w.colors, extras: w.extras, extra: w.extra || "none", stamps: w.stamps, member: w.member || "free" };
  }
  function rank(t) { return t === "patron" ? 2 : t === "plus" ? 1 : 0; }
  function view(p) { return { id: p.id, name: p.name, color: p.color, hat: p.hat, extra: p.extra || "none", member: p.member || "free", page: p.page, x: p.x, y: p.y, facing: p.facing, walking: p.walking, pose: p.pose, chat: p.chat, chatUntil: p.chatUntil }; }
  function isSelf(id) { return !!id && (id === me.id || id === window.__nbPlayerId); }
  function crowd() { return [...others.values()].filter(function (p) { return p && p.page === me.page && !isSelf(p.id); }).map(view); }
  function bindClient() {
    window.__nbPlayerId = me.id;
    if (typeof state !== "undefined" && state) {
      state.id = me.id;
      if (state.me) state.me.id = me.id;
      if (state.others) {
        state.others.delete(me.id);
        for (const [oid, p] of [...state.others]) {
          if (!p || isSelf(p.id) || oid === me.id) state.others.delete(oid);
        }
      }
    }
  }
  let sock = null; let bus = null;
  try { bus = new BroadcastChannel("notebook-sticks-web"); } catch (e) {}
  function emit(msg) { bindClient(); if (sock && sock.onmessage) sock.onmessage({ data: JSON.stringify(msg) }); }
  function broadcast(msg) { if (bus) bus.postMessage(Object.assign({ from: me.id }, msg)); }
  if (bus) {
    bus.onmessage = function (ev) {
      const msg = ev.data;
      if (!msg || isSelf(msg.from)) return;
      if (msg.type === "hello" || msg.type === "move") {
        const raw = msg.player || msg;
        if (isSelf(raw.id) || isSelf(msg.from)) return;
        const p = Object.assign(others.get(msg.from) || { id: msg.from }, raw);
        p.id = msg.from;
        if (isSelf(p.id)) return;
        others.set(msg.from, p);
        if (msg.type === "hello") emit({ type: "join", player: view(p) });
      }
      if (msg.type === "leave") { others.delete(msg.from); emit({ type: "leave", id: msg.from }); }
      if (msg.type === "chat" && (msg.shout || (others.get(msg.from) || {}).page === me.page)) emit(msg);
      if (msg.type === "plane" && (others.get(msg.from) || {}).page === me.page) emit(msg);
      if (msg.type === "mark" && msg.page === me.page) { marks[me.page].push(msg.mark); emit({ type: "mark", mark: msg.mark }); }
    };
  }
  function grantMemberItems(w) {
    if (rank(w.member) >= 1) {
      if (w.hats.indexOf("ribbon") < 0) w.hats.push("ribbon");
      if (w.extras.indexOf("pin") < 0) w.extras.push("pin");
    }
    if (rank(w.member) >= 2) {
      if (w.hats.indexOf("star") < 0) w.hats.push("star");
      if (w.hats.indexOf("crown") < 0) w.hats.push("crown");
      if (w.colors.indexOf("#c9a227") < 0) w.colors.push("#c9a227");
    }
  }
  function handle(msg) {
    if (msg.type === "join") {
      me.name = String(msg.name || "Doodle").slice(0, 16);
      me.color = msg.color || me.color;
      me.hat = msg.hat || me.hat;
      me.page = "cover";
      const pos = spawn(); me.x = pos.x; me.y = pos.y;
      const w = loadWallet(me.name);
      grantMemberItems(w);
      me.member = w.member || "free";
      window.__nbPlayerId = me.id;
      bindClient();
      emit({ type: "welcome", id: me.id, you: view(me), catalog: CATALOG, wallet: saveWallet(me.name, w), pages: PAGES, places: PLACES.cover, marks: marks.cover, players: crowd(), world: WORLD, range: RANGE });
      broadcast({ type: "hello", player: view(me) });
      seedNpcs();
      return;
    }
    if (msg.type === "move") {
      me.x = msg.x; me.y = msg.y; me.facing = msg.facing === -1 ? -1 : 1; me.walking = !!msg.walking;
      const here = (PLACES[me.page] || []).find(function (pl) { return Math.hypot(pl.x - me.x, pl.y - me.y) < pl.r; });
      if (here) {
        const w = loadWallet(me.name);
        const sid = me.page + ":" + here.id;
        if (w.stamps.indexOf(sid) < 0) {
          w.stamps.push(sid);
          const gain = 3 + ((me.page === "club" || me.page === "margin") ? 5 : 0);
          w.ink += gain;
          emit({ type: "stamp", place: here.name, ink: gain, wallet: saveWallet(me.name, w) });
        }
      }
      broadcast({ type: "move", player: view(me) });
      return;
    }
    if (msg.type === "page") {
      const next = PAGES.some(function (p) { return p.id === msg.page; }) ? msg.page : "cover";
      const need = MEMBER_PAGES[next];
      const w = loadWallet(me.name);
      if (need && rank(w.member) < rank(need)) {
        emit({ type: "event", text: next === "margin" ? "Margin is Patron-only. /member PATRON" : "Club is Plus-only. Join at the member desk or tap Member." });
        return;
      }
      me.page = next;
      const pos = spawn(); me.x = pos.x; me.y = pos.y; me.walking = false; me.pose = "stand";
      emit({ type: "page", page: me.page, you: view(me), pages: PAGES, places: PLACES[me.page] || [], marks: marks[me.page] || [], players: crowd(), world: WORLD, range: RANGE });
      seedNpcs();
      broadcast({ type: "hello", player: view(me) });
      return;
    }
    if (msg.type === "chat") {
      let text = String(msg.text || "").trim().slice(0, 140);
      if (!text) return;
      if (text.toLowerCase().indexOf("/member") === 0) {
        const code = text.split(/\s+/)[1] || "";
        const ok = window.__nbRedeem && window.__nbRedeem(code);
        const w = loadWallet(me.name);
        if (ok) { w.member = ok; me.member = ok; grantMemberItems(w); emit({ type: "wallet", wallet: saveWallet(me.name, w) }); emit({ type: "look", player: view(me) }); emit({ type: "event", text: "Membership is now " + ok + "." }); }
        else emit({ type: "event", text: "Try /member PLUS or /member PATRON" });
        return;
      }
      const shout = text.charAt(0) === "!";
      if (shout) text = text.slice(1).trim();
      me.chat = text; me.chatUntil = Date.now() + 5200;
      const w = loadWallet(me.name); w.ink += 1;
      emit({ type: "wallet", wallet: saveWallet(me.name, w) });
      emit({ type: "chat", id: me.id, name: me.name, text: text, until: me.chatUntil, shout: shout });
      broadcast({ type: "chat", id: me.id, name: me.name, text: text, until: me.chatUntil, shout: shout });
      return;
    }
    if (msg.type === "pose") { me.pose = msg.pose || "stand"; broadcast({ type: "move", player: view(me) }); return; }
    if (msg.type === "look") {
      me.color = msg.color || me.color; me.hat = msg.hat || me.hat; me.extra = msg.extra || me.extra;
      emit({ type: "look", player: view(me) });
      broadcast({ type: "hello", player: view(me) });
      return;
    }
    if (msg.type === "member" || msg.type === "memberbuy") {
      const w = loadWallet(me.name);
      const t = msg.tier === "patron" ? "patron" : "plus";
      if (msg.type === "memberbuy") {
        const cost = t === "patron" ? 200 : 80;
        if (w.ink < cost) { emit({ type: "event", text: "Not enough ink for " + t + "." }); return; }
        w.ink -= cost;
      }
      w.member = t; me.member = t; grantMemberItems(w);
      emit({ type: "wallet", wallet: saveWallet(me.name, w) });
      emit({ type: "look", player: view(me) });
      emit({ type: "event", text: "You are " + t + " now. Club is open" + (t === "patron" ? " and so is Margin." : ".") });
      return;
    }
    if (msg.type === "buy") {
      const item = CATALOG.find(function (c) { return c.kind === msg.kind && c.id === msg.id; });
      const w = loadWallet(me.name);
      if (!item) { emit({ type: "buy", ok: false, error: "Not in the shop." }); return; }
      if (item.member && rank(w.member) < rank(item.member)) { emit({ type: "buy", ok: false, error: "Need " + item.member + " membership." }); return; }
      const bag = item.kind === "hat" ? w.hats : item.kind === "color" ? w.colors : w.extras;
      if (bag.indexOf(item.id) >= 0) { emit({ type: "buy", ok: false, error: "You already have that." }); return; }
      if (w.ink < item.cost) { emit({ type: "buy", ok: false, error: "Not enough ink." }); return; }
      w.ink -= item.cost; bag.push(item.id);
      emit({ type: "buy", ok: true, item: item, wallet: saveWallet(me.name, w) });
      return;
    }
    if (msg.type === "plane") {
      emit({ type: "plane", name: me.name, x: me.x, y: me.y - 20, facing: me.facing });
      broadcast({ type: "plane", name: me.name, x: me.x, y: me.y - 20, facing: me.facing });
      return;
    }
    if (msg.type === "mark") {
      const text = String(msg.text || "").trim().slice(0, 48);
      if (!text) return;
      const mark = { id: me.id + Date.now(), x: me.x, y: me.y + 18, text: text, name: me.name, color: me.color, until: Date.now() + 8 * 60 * 1000 };
      marks[me.page].push(mark);
      emit({ type: "mark", mark: mark });
      broadcast({ type: "mark", page: me.page, mark: mark });
    }
  }
  function seedNpcs() {
    Array.from(others.keys()).forEach(function (id) { if (String(id).indexOf("npc-") === 0) others.delete(id); });
    const list = ({ cover: [["Margin", "cap"], ["Binder", "bow"]], graph: [["Graphie", "antenna"]], comic: [["Splash", "party"]], pocket: [["Clip", "cap"]], gallery: [["Curator", "top"]], shop: [["Till", "fez"]], back: [["Yearbook", "flower"]], club: [["Host", "ribbon"]], margin: [["Asterisk", "star"]] })[me.page] || [];
    const spots = PLACES[me.page] || [];
    list.forEach(function (n, i) {
      const s = spots[(i + 1) % Math.max(1, spots.length)] || { x: 1400, y: 900 };
      others.set("npc-" + n[0], { id: "npc-" + n[0], name: n[0], color: FREE_COLORS[(i + 1) % FREE_COLORS.length], hat: n[1], extra: "none", member: n[1] === "star" ? "patron" : n[1] === "ribbon" ? "plus" : "free", page: me.page, x: s.x + 90, y: s.y + 60, facing: -1, walking: false, pose: "stand", chat: "", chatUntil: 0 });
    });
  }
  setInterval(function () { emit({ type: "snap", t: Date.now(), players: crowd().map(function (p) { return { id: p.id, x: Math.round(p.x), y: Math.round(p.y), facing: p.facing, walking: p.walking, pose: p.pose }; }) }); }, 80);
  setInterval(function () { const w = loadWallet(me.name); w.ink += rank(w.member) >= 2 ? 8 : rank(w.member) >= 1 ? 4 : 2; emit({ type: "wallet", wallet: saveWallet(me.name, w) }); }, 60000);
  setInterval(function () { emit({ type: "event", text: LINES[Math.floor(Math.random() * LINES.length)] }); }, 45000);
  addEventListener("beforeunload", function () { broadcast({ type: "leave" }); });
  function FakeSocket() { sock = this; this.readyState = 0; var self = this; setTimeout(function () { self.readyState = 1; if (self.onopen) self.onopen(); }, 0); }
  FakeSocket.prototype.send = function (raw) { try { handle(JSON.parse(raw)); } catch (e) {} };
  FakeSocket.prototype.close = function () { this.readyState = 3; };
  window.WebSocket = function () { return new FakeSocket(); };
})();
