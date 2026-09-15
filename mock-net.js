/* In-browser stand-in for the Node + ws server. GitHub Pages has no backend.
   Other tabs on this origin join through BroadcastChannel. */
(function () {
  const WORLD = { w: 3200, h: 2100 };
  const RANGE = 420;
  const PAGES = [
    { id: "cover", name: "Cover" },
    { id: "graph", name: "Graph" },
    { id: "comic", name: "Comic" },
    { id: "pocket", name: "Pocket" },
    { id: "back", name: "Back page" },
    { id: "shop", name: "Ink shop" }
  ];
  const PLACES = {
    cover: [
      { id: "title", name: "Title block", kind: "sign", x: 420, y: 260, r: 150, hint: "The front of the book." },
      { id: "lockers", name: "Locker row", kind: "lockers", x: 1680, y: 240, r: 160, hint: "Drawn metal. Empty." },
      { id: "coffee", name: "Coffee ring plaza", kind: "ring", x: 780, y: 900, r: 180, hint: "The fountain is a stain." },
      { id: "bench", name: "Quiet bench", kind: "bench", x: 2100, y: 720, r: 140, hint: "Sit with C." },
      { id: "hop", name: "Hopscotch", kind: "hop", x: 1280, y: 1280, r: 160, hint: "F throws a plane. Hop." }
    ],
    graph: [
      { id: "origin", name: "The origin", kind: "origin", x: 560, y: 1050, r: 150, hint: "(0, 0) more or less." },
      { id: "triangles", name: "Triangle village", kind: "triangles", x: 1680, y: 420, r: 180, hint: "Houses with three walls." },
      { id: "pi", name: "Pi fountain", kind: "fountain", x: 2300, y: 1200, r: 160, hint: "It never ends." }
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
    shop: [
      { id: "counter", name: "Shop counter", kind: "counter", x: 900, y: 520, r: 200, hint: "Buy with ink." },
      { id: "fitting", name: "Fitting box", kind: "sign", x: 1900, y: 900, r: 160, hint: "Try it on." }
    ],
    back: [
      { id: "yearbook", name: "Yearbook wall", kind: "grid", x: 500, y: 360, r: 170, hint: "Leave a note." },
      { id: "phones", name: "Phone numbers", kind: "list", x: 2100, y: 320, r: 150, hint: "All fake." },
      { id: "exam", name: "Final exam panic", kind: "scribble", x: 1100, y: 1250, r: 190, hint: "Breathe. Dance. Sleep." }
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
    { kind: "color", id: "#6b46c1", name: "Violet ink", cost: 20 },
    { kind: "color", id: "#b7791f", name: "Gold ink", cost: 20 },
    { kind: "color", id: "#dd6b20", name: "Orange ink", cost: 20 },
    { kind: "color", id: "#0f766e", name: "Teal ink", cost: 20 },
    { kind: "color", id: "#e11d48", name: "Rose ink", cost: 50 },
    { kind: "extra", id: "glasses", name: "Glasses", cost: 30 },
    { kind: "extra", id: "scarf", name: "Scarf", cost: 35 },
    { kind: "extra", id: "pack", name: "Backpack", cost: 50 },
    { kind: "extra", id: "cape", name: "Cape", cost: 55 },
    { kind: "extra", id: "bowtie", name: "Bow tie", cost: 22 }
  ];
  const FREE_HATS = ["none", "cap", "bow", "antenna"];
  const FREE_COLORS = ["#1b1b1b", "#c23b22", "#2b6cb0", "#2f855a"];
  const LINES = ["A pencil rolled under the binding.", "The margin yawned.", "Someone erased a secret.", "The coffee ring grew."];
  function emptyWallet() {
    return { ink: 40, hats: FREE_HATS.slice(), colors: FREE_COLORS.slice(), extras: ["none"], extra: "none", stamps: [] };
  }
  function loadWallet(name) {
    try {
      const w = JSON.parse(localStorage.getItem("ns-wallet:" + name.toLowerCase()) || "null");
      return w || emptyWallet();
    } catch { return emptyWallet(); }
  }
  function saveWallet(name, w) {
    localStorage.setItem("ns-wallet:" + name.toLowerCase(), JSON.stringify(w));
    return { ink: w.ink, hats: w.hats, colors: w.colors, extras: w.extras, extra: w.extra || "none", stamps: w.stamps };
  }
  const me = {
    id: "local-" + Math.random().toString(36).slice(2, 8),
    name: "Doodle", color: "#1b1b1b", hat: "none", extra: "none",
    page: "cover", x: 700, y: 560, facing: 1, walking: false, pose: "stand",
    chat: "", chatUntil: 0
  };
  const others = new Map();
  const marks = { cover: [], graph: [], comic: [], pocket: [], back: [], shop: [] };
  let sock = null;
  let bus = null;
  try { bus = new BroadcastChannel("notebook-sticks-web"); } catch {}
  function view(p) {
    return { id: p.id, name: p.name, color: p.color, hat: p.hat, extra: p.extra || "none", page: p.page, x: p.x, y: p.y, facing: p.facing, walking: p.walking, pose: p.pose, chat: p.chat, chatUntil: p.chatUntil };
  }
  function emit(msg) {
    if (sock && sock.onmessage) sock.onmessage({ data: JSON.stringify(msg) });
  }
  function snap() {
    return { pages: PAGES, places: PLACES[me.page] || [], marks: marks[me.page] || [], players: [view(me), ...[...others.values()].filter((p) => p.page === me.page).map(view)], world: WORLD, range: RANGE };
  }
  function broadcast(msg) {
    if (bus) bus.postMessage({ from: me.id, ...msg });
  }
  if (bus) {
    bus.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || msg.from === me.id) return;
      if (msg.type === "hello" || msg.type === "move") {
        others.set(msg.from, Object.assign(others.get(msg.from) || { id: msg.from }, msg.player || msg));
        if (msg.type === "hello") emit({ type: "join", player: others.get(msg.from) });
      }
      if (msg.type === "leave") { others.delete(msg.from); emit({ type: "leave", id: msg.from }); }
      if (msg.type === "chat" && (msg.shout || (others.get(msg.from) || {}).page === me.page)) emit(msg);
      if (msg.type === "plane" && (others.get(msg.from) || {}).page === me.page) emit(msg);
      if (msg.type === "mark" && msg.page === me.page) { marks[me.page].push(msg.mark); emit({ type: "mark", mark: msg.mark }); }
    };
  }
  function handle(msg) {
    if (msg.type === "join") {
      me.name = String(msg.name || "Doodle").slice(0, 16);
      me.color = msg.color || me.color;
      me.hat = msg.hat || me.hat;
      me.page = "cover";
      emit({ type: "welcome", id: me.id, you: view(me), catalog: CATALOG, wallet: saveWallet(me.name, loadWallet(me.name)), ...snap() });
      broadcast({ type: "hello", player: view(me) });
      seedNpcs();
      return;
    }
    if (msg.type === "move") {
      me.x = msg.x; me.y = msg.y; me.facing = msg.facing === -1 ? -1 : 1; me.walking = !!msg.walking;
      const here = (PLACES[me.page] || []).find((pl) => Math.hypot(pl.x - me.x, pl.y - me.y) < pl.r);
      if (here) {
        const w = loadWallet(me.name);
        const sid = me.page + ":" + here.id;
        if (!w.stamps.includes(sid)) {
          w.stamps.push(sid); w.ink += 3;
          emit({ type: "stamp", place: here.name, wallet: saveWallet(me.name, w) });
        }
      }
      broadcast({ type: "move", player: view(me) });
      return;
    }
    if (msg.type === "page") {
      me.page = PAGES.some((p) => p.id === msg.page) ? msg.page : "cover";
      me.x = 640 + Math.random() * 400; me.y = 560 + Math.random() * 200;
      me.walking = false; me.pose = "stand";
      emit({ type: "page", page: me.page, you: view(me), ...snap() });
      seedNpcs();
      broadcast({ type: "hello", player: view(me) });
      return;
    }
    if (msg.type === "chat") {
      let text = String(msg.text || "").trim().slice(0, 140);
      if (!text) return;
      const shout = text.startsWith("!");
      if (shout) text = text.slice(1).trim();
      me.chat = text; me.chatUntil = Date.now() + 5200;
      const w = loadWallet(me.name); w.ink += 1;
      emit({ type: "wallet", wallet: saveWallet(me.name, w) });
      emit({ type: "chat", id: me.id, name: me.name, text, until: me.chatUntil, shout });
      broadcast({ type: "chat", id: me.id, name: me.name, text, until: me.chatUntil, shout });
      return;
    }
    if (msg.type === "pose") { me.pose = msg.pose || "stand"; broadcast({ type: "move", player: view(me) }); return; }
    if (msg.type === "look") {
      me.color = msg.color || me.color; me.hat = msg.hat || me.hat; me.extra = msg.extra || me.extra;
      emit({ type: "look", player: view(me) });
      broadcast({ type: "hello", player: view(me) });
      return;
    }
    if (msg.type === "buy") {
      const item = CATALOG.find((c) => c.kind === msg.kind && c.id === msg.id);
      const w = loadWallet(me.name);
      if (!item) { emit({ type: "buy", ok: false, error: "Not in the shop." }); return; }
      const bag = item.kind === "hat" ? w.hats : item.kind === "color" ? w.colors : w.extras;
      if (bag.includes(item.id)) { emit({ type: "buy", ok: false, error: "You already have that." }); return; }
      if (w.ink < item.cost) { emit({ type: "buy", ok: false, error: "Not enough ink." }); return; }
      w.ink -= item.cost; bag.push(item.id);
      emit({ type: "buy", ok: true, item, wallet: saveWallet(me.name, w) });
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
      const mark = { id: me.id + Date.now(), x: me.x, y: me.y + 18, text, name: me.name, color: me.color, until: Date.now() + 8 * 60 * 1000 };
      marks[me.page].push(mark);
      emit({ type: "mark", mark });
      broadcast({ type: "mark", page: me.page, mark });
    }
  }
  function seedNpcs() {
    const names = ["Margin", "Binder", "Graphie"];
    const spots = PLACES[me.page] || [];
    names.forEach((name, i) => {
      const s = spots[i % Math.max(1, spots.length)] || { x: 800, y: 600 };
      others.set("npc-" + name, {
        id: "npc-" + name, name, color: FREE_COLORS[(i + 1) % FREE_COLORS.length],
        hat: FREE_HATS[i % FREE_HATS.length], extra: "none", page: me.page,
        x: s.x + (i - 1) * 50, y: s.y + 40, facing: 1, walking: false, pose: i === 0 ? "sit" : "stand",
        chat: "", chatUntil: 0
      });
    });
  }
  setInterval(() => {
    emit({ type: "snap", t: Date.now(), players: snap().players.map((p) => ({ id: p.id, x: Math.round(p.x), y: Math.round(p.y), facing: p.facing, walking: p.walking, pose: p.pose })) });
  }, 80);
  setInterval(() => {
    const w = loadWallet(me.name); w.ink += 2;
    emit({ type: "wallet", wallet: saveWallet(me.name, w) });
  }, 60000);
  setInterval(() => emit({ type: "event", text: LINES[Math.floor(Math.random() * LINES.length)] }), 45000);
  addEventListener("beforeunload", () => broadcast({ type: "leave" }));
  class FakeSocket {
    constructor() {
      sock = this;
      this.readyState = 0;
      setTimeout(() => { this.readyState = 1; if (this.onopen) this.onopen(); }, 0);
    }
    send(raw) { try { handle(JSON.parse(raw)); } catch {}
    }
    close() { this.readyState = 3; }
  }
  window.WebSocket = function () { return new FakeSocket(); };
})();
