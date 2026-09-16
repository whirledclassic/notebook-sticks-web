/* Doodle Maker + closet slots + player bazaar + extra districts. */
(function () {
  const KIT_KEY = "ns-kit-v1:";
  const ITEM_KEY = "ns-doodles-v1:";
  const BAZAAR_KEY = "ns-bazaar-v1";
  const SLOTS = ["hat", "hold", "shirt", "legs", "shoes"];
  const STOCK = {
    hat: [
      { id: "none", name: "Bare" }, { id: "cap", name: "Cap" }, { id: "bow", name: "Bow" },
      { id: "antenna", name: "Antenna" }, { id: "halo", name: "Halo" }, { id: "horns", name: "Horns" },
      { id: "flower", name: "Flower" }, { id: "crown", name: "Crown" }, { id: "fez", name: "Fez" },
      { id: "top", name: "Top hat" }, { id: "party", name: "Party" }, { id: "prop", name: "Propeller" }
    ],
    hold: [
      { id: "none", name: "Empty" }, { id: "pencil", name: "Pencil" }, { id: "cup", name: "Cup" },
      { id: "balloon", name: "Balloon" }, { id: "flag", name: "Flag" }, { id: "book", name: "Book" },
      { id: "umbrella", name: "Umbrella" }, { id: "sword", name: "Blade" }, { id: "flowerstem", name: "Stem" }
    ],
    shirt: [
      { id: "none", name: "Bare" }, { id: "tee", name: "Tee" }, { id: "hoodie", name: "Hoodie" },
      { id: "vest", name: "Vest" }, { id: "stripe", name: "Stripes" }, { id: "overalls", name: "Overalls" }
    ],
    legs: [
      { id: "none", name: "Sticks" }, { id: "shorts", name: "Shorts" }, { id: "pants", name: "Pants" },
      { id: "skirt", name: "Skirt" }, { id: "cuffs", name: "Cuffs" }
    ],
    shoes: [
      { id: "none", name: "Bare" }, { id: "boots", name: "Boots" }, { id: "dots", name: "Dots" },
      { id: "long", name: "Long" }
    ]
  };
  const PAGES = [
    { id: "studio", name: "Studio" },
    { id: "bazaar", name: "Bazaar" },
    { id: "park", name: "Park" },
    { id: "cafe", name: "Cafe" },
    { id: "dock", name: "Dock" }
  ];
  const PLACES = {
    studio: [
      { id: "easel", name: "Easel", kind: "sign", x: 720, y: 520, r: 170, hint: "Draw a hat, shirt, hold, legs." },
      { id: "rack", name: "Costume rack", kind: "lockers", x: 1680, y: 480, r: 160, hint: "Try stock pieces." },
      { id: "mirror", name: "Tall mirror", kind: "frame", x: 2400, y: 620, r: 160, hint: "Look at the doodle." },
      { id: "bin", name: "Scrap bin", kind: "crumple", x: 1100, y: 1300, r: 150, hint: "Erase a draft." }
    ],
    bazaar: [
      { id: "stalls", name: "Stall row", kind: "counter", x: 700, y: 520, r: 200, hint: "Buy player doodles." },
      { id: "my-stall", name: "Your stall", kind: "desk", x: 1900, y: 560, r: 170, hint: "List something you drew." },
      { id: "board", name: "Price board", kind: "list", x: 1400, y: 1200, r: 160, hint: "Ink in, ink out." },
      { id: "bell", name: "Shop bell", kind: "sign", x: 2500, y: 1100, r: 140, hint: "Ping the page." }
    ],
    park: [
      { id: "oak", name: "Ink oak", kind: "clip", x: 620, y: 480, r: 180, hint: "A tree made of loops." },
      { id: "pond", name: "Puddle pond", kind: "ring", x: 1600, y: 900, r: 200, hint: "Skip a stone. Or don't." },
      { id: "path", name: "Winding path", kind: "scribble", x: 2400, y: 500, r: 170, hint: "Good for a swagger." },
      { id: "picnic", name: "Picnic blot", kind: "bench", x: 900, y: 1400, r: 150, hint: "Sit. Eat imaginary crumbs." }
    ],
    cafe: [
      { id: "bar-cafe", name: "Counter", kind: "counter", x: 620, y: 480, r: 180, hint: "One ink drip." },
      { id: "booths", name: "Booths", kind: "bench", x: 1600, y: 520, r: 170, hint: "Whisper booth." },
      { id: "specials", name: "Specials", kind: "list", x: 2400, y: 480, r: 150, hint: "Today: graphite foam." },
      { id: "patio", name: "Patio", kind: "hop", x: 1400, y: 1300, r: 180, hint: "Outside is still paper." }
    ],
    dock: [
      { id: "pier", name: "Pier", kind: "sign", x: 700, y: 700, r: 180, hint: "End of the notebook." },
      { id: "boat", name: "Folded boat", kind: "stamp", x: 1700, y: 900, r: 170, hint: "F still throws planes." },
      { id: "crate", name: "Crate pile", kind: "grid", x: 2400, y: 600, r: 160, hint: "Mislabelled on purpose." },
      { id: "lamp", name: "Dock lamp", kind: "star", x: 1100, y: 1400, r: 150, hint: "It hums." }
    ]
  };
  const EXTRA_ON = {
    cover: [
      { id: "kiosk", name: "Tour kiosk", kind: "sign", x: 2680, y: 480, r: 150, hint: "/park /cafe /dock /studio /bazaar" },
      { id: "stoop", name: "Studio stoop", kind: "desk", x: 2800, y: 1400, r: 160, hint: "Doodle Maker this way." }
    ],
    shop: [{ id: "fitting2", name: "Closet", kind: "lockers", x: 2500, y: 520, r: 150, hint: "Shirts and legs too." }],
    gallery: [{ id: "vendor", name: "Weekend stall", kind: "counter", x: 700, y: 1300, r: 150, hint: "Bazaar overflow." }]
  };
  const Maker = { slot: "hat", strokes: [], draft: null, name: "untitled", price: 12, tab: "wear" };
  function nkey() { return String((state && state.me && state.me.name) || "doodle").toLowerCase().slice(0, 16); }
  function loadKit() {
    try { const k = JSON.parse(localStorage.getItem(KIT_KEY + nkey()) || "null"); if (k && typeof k === "object") return k; } catch (e) {}
    return { hat: "none", hold: "none", shirt: "none", legs: "none", shoes: "none" };
  }
  function saveKit(kit) { try { localStorage.setItem(KIT_KEY + nkey(), JSON.stringify(kit)); } catch (e) {} if (state && state.me) state.me.kit = kit; }
  function loadMine() { try { return JSON.parse(localStorage.getItem(ITEM_KEY + nkey()) || "[]"); } catch (e) { return []; } }
  function saveMine(list) { try { localStorage.setItem(ITEM_KEY + nkey(), JSON.stringify(list.slice(0, 40))); } catch (e) {} }
  function loadBazaar() { try { return JSON.parse(localStorage.getItem(BAZAAR_KEY) || "[]"); } catch (e) { return []; } }
  function saveBazaar(list) { try { localStorage.setItem(BAZAAR_KEY, JSON.stringify(list.slice(0, 80))); } catch (e) {} }
  function bus(msg) {
    try { const b = new BroadcastChannel("notebook-sticks-web"); b.postMessage(Object.assign({ from: window.__nbPlayerId || "maker", type: "maker" }, msg)); b.close(); } catch (e) {}
  }
  function kitOf(p) { return (p && p.kit) || (p === (state && state.me) ? loadKit() : { hat: p && p.hat, hold: p && p.extra, shirt: "none", legs: "none", shoes: "none" }); }
  function findCustom(id) {
    if (!id || String(id).indexOf("d-") !== 0) return null;
    const mine = loadMine().find(function (it) { return it.id === id; });
    if (mine) return mine;
    return loadBazaar().map(function (l) { return l.item; }).find(function (it) { return it && it.id === id; }) || null;
  }
  function applyKit(slot, id) {
    const kit = loadKit(); kit[slot] = id; saveKit(kit);
    if (slot === "hat" && state && state.me && STOCK.hat.some(function (s) { return s.id === id; })) { state.me.hat = id; if (typeof syncLook === "function") syncLook(); }
    if (typeof paintPreview === "function") paintPreview(); paint();
  }
  function injectPages() {
    if (!state || !state.pages) return;
    PAGES.forEach(function (pg) { if (!state.pages.some(function (p) { return p.id === pg.id; })) state.pages.push(pg); });
  }
  function mergePlaces() {
    if (!state || !state.me) return;
    const extra = (PLACES[state.me.page] ? [] : (EXTRA_ON[state.me.page] || []));
    extra.forEach(function (pl) { if (!state.places.some(function (p) { return p.id === pl.id; })) state.places.push(pl); });
  }
  function go(id) {
    if (!state || !state.me) return;
    if (!PAGES.some(function (p) { return p.id === id; })) return;
    state.me.page = id; state.me.x = 760; state.me.y = 640; state.me.walking = false; state.goal = null;
    state.places = (PLACES[id] || []).map(function (p) { return Object.assign({}, p); });
    if (typeof bakePaper === "function") bakePaper();
    if (typeof drawPages === "function") drawPages();
    if (typeof refreshWho === "function") refreshWho();
    paint();
    if (typeof logLine === "function") logLine("Turned to " + PAGES.find(function (p) { return p.id === id; }).name + ".");
  }
  const prevLocal = window.goLocalPage;
  window.goLocalPage = function (id) {
    if (PAGES.some(function (p) { return p.id === id; })) { go(id); return; }
    if (typeof prevLocal === "function") prevLocal(id);
  };
  function drawStock(g, slot, id, sit) {
    if (!id || id === "none") return;
    g.beginPath();
    if (slot === "shirt") {
      if (id === "tee") { g.moveTo(-12, -40 + sit); g.lineTo(12, -40 + sit); g.lineTo(10, -12 + sit); g.lineTo(-10, -12 + sit); g.closePath(); g.stroke(); }
      else if (id === "hoodie") { g.moveTo(-14, -42 + sit); g.lineTo(14, -42 + sit); g.lineTo(12, -10 + sit); g.lineTo(-12, -10 + sit); g.closePath(); g.stroke(); g.beginPath(); g.arc(0, -48 + sit, 8, Math.PI, 0); g.stroke(); }
      else if (id === "vest") { g.moveTo(-11, -40 + sit); g.lineTo(-8, -12 + sit); g.moveTo(11, -40 + sit); g.lineTo(8, -12 + sit); g.moveTo(-8, -24 + sit); g.lineTo(8, -24 + sit); g.stroke(); }
      else if (id === "stripe") { g.moveTo(-10, -34 + sit); g.lineTo(10, -34 + sit); g.moveTo(-10, -24 + sit); g.lineTo(10, -24 + sit); g.moveTo(-10, -14 + sit); g.lineTo(10, -14 + sit); g.stroke(); }
      else if (id === "overalls") { g.moveTo(-6, -40 + sit); g.lineTo(-8, -8 + sit); g.moveTo(6, -40 + sit); g.lineTo(8, -8 + sit); g.moveTo(-10, -18 + sit); g.lineTo(10, -18 + sit); g.stroke(); }
    } else if (slot === "legs") {
      if (id === "shorts") { g.strokeRect(-12, -10 + sit, 10, 10); g.strokeRect(2, -10 + sit, 10, 10); }
      else if (id === "pants") { g.moveTo(-11, -10 + sit); g.lineTo(-13, 12 + sit); g.moveTo(11, -10 + sit); g.lineTo(13, 12 + sit); g.stroke(); }
      else if (id === "skirt") { g.moveTo(-6, -10 + sit); g.lineTo(-16, 6 + sit); g.lineTo(16, 6 + sit); g.lineTo(6, -10 + sit); g.stroke(); }
      else if (id === "cuffs") { g.moveTo(-14, 8 + sit); g.lineTo(-8, 8 + sit); g.moveTo(8, 8 + sit); g.lineTo(14, 8 + sit); g.stroke(); }
    } else if (slot === "shoes") {
      if (id === "boots") { g.strokeRect(-16, 10 + sit, 8, 5); g.strokeRect(8, 10 + sit, 8, 5); }
      else if (id === "dots") { g.arc(-12, 12 + sit, 2.4, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(12, 12 + sit, 2.4, 0, Math.PI * 2); g.stroke(); }
      else if (id === "long") { g.moveTo(-13, 6 + sit); g.lineTo(-13, 14 + sit); g.moveTo(13, 6 + sit); g.lineTo(13, 14 + sit); g.stroke(); }
    } else if (slot === "hold") {
      g.save(); g.translate(16, -20 + sit);
      if (id === "pencil") { g.moveTo(0, 8); g.lineTo(4, -18); g.stroke(); }
      else if (id === "cup") { g.strokeRect(-5, -6, 10, 10); g.beginPath(); g.arc(5, -1, 4, -1.2, 1.2); g.stroke(); }
      else if (id === "balloon") { g.arc(0, -16, 7, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(0, -9); g.lineTo(0, 6); g.stroke(); }
      else if (id === "flag") { g.moveTo(0, 8); g.lineTo(0, -18); g.lineTo(14, -12); g.lineTo(0, -6); g.stroke(); }
      else if (id === "book") { g.strokeRect(-8, -10, 14, 12); g.beginPath(); g.moveTo(-1, -10); g.lineTo(-1, 2); g.stroke(); }
      else if (id === "umbrella") { g.moveTo(0, 8); g.lineTo(0, -10); g.stroke(); g.beginPath(); g.arc(0, -8, 12, Math.PI, 0); g.stroke(); }
      else if (id === "flowerstem") { g.moveTo(0, 6); g.lineTo(0, -10); g.stroke(); g.beginPath(); g.arc(0, -14, 4, 0, Math.PI * 2); g.stroke(); }
      g.restore();
    }
  }
  function drawCustom(g, item, slot, sit) {
    if (!item || !item.strokes) return;
    const box = slot === "hat" ? { x: -22, y: -78 + sit, w: 44, h: 28 } : slot === "hold" ? { x: 8, y: -36 + sit, w: 28, h: 32 } : slot === "shirt" ? { x: -16, y: -44 + sit, w: 32, h: 34 } : slot === "legs" ? { x: -16, y: -12 + sit, w: 32, h: 26 } : { x: -18, y: 6 + sit, w: 36, h: 12 };
    item.strokes.forEach(function (s) {
      if (!s.pts || s.pts.length < 2) return;
      g.strokeStyle = s.color || item.color || "#1b1b1b"; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath();
      g.moveTo(box.x + s.pts[0][0] * box.w, box.y + s.pts[0][1] * box.h);
      for (let i = 1; i < s.pts.length; i++) g.lineTo(box.x + s.pts[i][0] * box.w, box.y + s.pts[i][1] * box.h);
      g.stroke();
    });
  }
  function drawKitOn(g, p) {
    const kit = kitOf(p); const sit = (p.pose === "sit" || p.pose === "sleep") ? 16 : 0;
    SLOTS.forEach(function (slot) {
      const id = kit[slot] || "none"; if (id === "none") return;
      if (String(id).indexOf("d-") === 0) drawCustom(g, findCustom(id), slot, sit); else drawStock(g, slot, id, sit);
    });
  }
  function wrapDraw() {
    if (typeof drawStick !== "function" || drawStick.__kit) return;
    const orig = drawStick;
    window.drawStick = function (g, p, now, scale) {
      orig(g, p, now, scale); if (!p) return;
      g.save(); g.translate(p.x, p.y); g.scale((p.facing || 1) * (scale || 1), scale || 1);
      g.strokeStyle = p.color || "#1b1b1b"; g.lineWidth = 2.6; g.lineCap = "round"; drawKitOn(g, p); g.restore();
    };
    drawStick.__kit = true;
  }
  function slotButtons(slot) {
    const kit = loadKit(); const mine = loadMine().filter(function (it) { return it.slot === slot; });
    return "<div class='sub'>" + slot + "</div><div class='row'>" +
      STOCK[slot].map(function (s) { return "<button class='hat walk" + (kit[slot] === s.id ? " on" : "") + "' data-wear='" + slot + ":" + s.id + "'>" + s.name + "</button>"; }).join("") +
      mine.map(function (it) { return "<button class='hat walk" + (kit[slot] === it.id ? " on" : "") + "' data-wear='" + slot + ":" + it.id + "'>" + (it.name || "doodle") + "</button>"; }).join("") + "</div>";
  }
  function paintStudio() {
    const box = document.getElementById("studio-box"); if (!box) return;
    if (!state || state.me.page !== "studio") { box.classList.remove("show"); return; }
    box.classList.add("show");
    box.innerHTML = "<b>Doodle Maker</b><div class='sub'>Wear stock or draw your own and list it at the Bazaar.</div>" +
      "<div class='row'>" + SLOTS.map(function (s) { return "<button data-slot='" + s + "' class='" + (Maker.slot === s ? "on" : "") + "'>" + s + "</button>"; }).join("") + "</div>" +
      slotButtons(Maker.slot) +
      "<canvas id='maker-pad' width='220' height='160'></canvas>" +
      "<input id='maker-name' maxlength='16' placeholder='item name' value='" + (Maker.name || "") + "'/>" +
      "<div class='row'><button data-saveitem='1'>Save doodle</button><button data-clearpad='1'>Clear pad</button></div>" +
      "<div class='sub'>Draw on the pad. Saved items can be sold at Bazaar.</div>";
    const padEl = document.getElementById("maker-pad"); if (padEl) bindPad(padEl); paintPad();
  }
  function paintBazaar() {
    const box = document.getElementById("bazaar-box"); if (!box) return;
    const page = state && state.me ? state.me.page : "";
    const listings = loadBazaar(); const mine = loadMine();
    if (page !== "bazaar" && page !== "shop") { box.classList.remove("show"); return; }
    box.classList.add("show");
    box.innerHTML = "<b>Player bazaar</b><div class='sub'>" + listings.length + " listings · drafts " + mine.length + "</div>" +
      mine.map(function (it) { return "<div class='store-card'><b>" + (it.name || "untitled") + "</b> · " + it.slot + "<button data-list='" + it.id + "'>Sell for 12 ink</button></div>"; }).join("") +
      (listings.length ? listings.map(function (l) {
        const mineL = String(l.seller || "").toLowerCase() === nkey();
        return "<div class='store-card'><b>" + ((l.item && l.item.name) || "doodle") + "</b> · " + (l.item && l.item.slot) + " · " + l.price + " ink · " + l.seller +
          (mineL ? "<button data-unlist='" + l.id + "'>Unlist</button>" : "<button data-buyitem='" + l.id + "'>Buy</button>") + "</div>";
      }).join("") : "<div class='sub'>No stalls yet. Draw in Studio, then list here.</div>");
  }
  function paintWhere() {
    const box = document.getElementById("where-box"); if (!box || !box.classList.contains("show") || !state) return;
    box.innerHTML = "<b>Places</b><div class='sub'>Jump a page or walk to a scribble.</div>" +
      (state.pages || []).map(function (p) { return "<button data-gopage='" + p.id + "' class='" + (p.id === state.me.page ? "on" : "") + "'>" + p.name + "</button>"; }).join("") +
      "<div class='sub'>On this page</div>" +
      (state.places || []).map(function (pl) { return "<button data-gowalk='" + pl.id + "'>" + pl.name + "</button>"; }).join("");
  }
  function paint() { injectPages(); mergePlaces(); if (state && state.me && !state.me.kit) state.me.kit = loadKit(); paintStudio(); paintBazaar(); paintWhere(); wrapDraw(); }
  function bindPad(c) {
    if (c.__bound) return; c.__bound = true;
    const pos = function (e) { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    c.addEventListener("mousedown", function (e) { Maker.draft = { color: (state && state.me && state.me.color) || "#1b1b1b", pts: [pos(e)] }; e.preventDefault(); });
    c.addEventListener("mousemove", function (e) { if (!Maker.draft) return; Maker.draft.pts.push(pos(e)); paintPad(); });
    addEventListener("mouseup", function () { if (!Maker.draft) return; if (Maker.draft.pts.length > 2) Maker.strokes.push(Maker.draft); Maker.draft = null; paintPad(); });
  }
  function paintPad() {
    const c = document.getElementById("maker-pad"); if (!c) return;
    const g = c.getContext("2d"); g.fillStyle = "#f4eed8"; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#c7d8ea"; g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
    g.save(); g.translate(c.width / 2, c.height - 18); g.scale(1.1, 1.1); g.strokeStyle = "#bbb"; g.lineWidth = 2;
    g.beginPath(); g.arc(0, -56, 12, 0, Math.PI * 2); g.moveTo(0, -44); g.lineTo(0, -10);
    g.moveTo(0, -32); g.lineTo(-14, -16); g.moveTo(0, -32); g.lineTo(14, -16);
    g.moveTo(0, -10); g.lineTo(-12, 10); g.moveTo(0, -10); g.lineTo(12, 10); g.stroke(); g.restore();
    Maker.strokes.concat(Maker.draft ? [Maker.draft] : []).forEach(function (s) {
      if (!s.pts || s.pts.length < 2) return;
      g.strokeStyle = s.color || "#1b1b1b"; g.lineWidth = 2.4; g.lineCap = "round"; g.beginPath();
      g.moveTo(s.pts[0][0] * c.width, s.pts[0][1] * c.height);
      for (let i = 1; i < s.pts.length; i++) g.lineTo(s.pts[i][0] * c.width, s.pts[i][1] * c.height);
      g.stroke();
    });
  }
  function saveItem() {
    if (!Maker.strokes.length) { if (typeof logLine === "function") logLine("Draw something first."); return; }
    const nameEl = document.getElementById("maker-name");
    const item = { id: "d-" + Date.now().toString(36), name: ((nameEl && nameEl.value) || "untitled").trim().slice(0, 16), slot: Maker.slot, color: (state && state.me && state.me.color) || "#1b1b1b", strokes: Maker.strokes, author: (state && state.me && state.me.name) || "Doodle" };
    const list = loadMine(); list.unshift(item); saveMine(list); applyKit(item.slot, item.id); Maker.strokes = [];
    if (typeof logLine === "function") logLine("Saved " + item.name + " (" + item.slot + ")."); paint();
  }
  function listItem(id) {
    const item = loadMine().find(function (it) { return it.id === id; }); if (!item) return;
    const listings = loadBazaar(); if (listings.some(function (l) { return l.item && l.item.id === id; })) return;
    listings.unshift({ id: "l-" + Date.now().toString(36), seller: (state && state.me && state.me.name) || "Doodle", price: 12, item: item });
    saveBazaar(listings); bus({ kind: "list", listings: listings });
    if (typeof logLine === "function") logLine("Listed " + item.name + " for 12 ink."); paint();
  }
  function unlist(id) { saveBazaar(loadBazaar().filter(function (l) { return l.id !== id; })); paint(); }
  function buyListing(id) {
    const listings = loadBazaar(); const row = listings.find(function (l) { return l.id === id; });
    if (!row || !row.item || String(row.seller || "").toLowerCase() === nkey()) return;
    const cost = row.price || 12;
    if (!state.wallet || state.wallet.ink < cost) { if (typeof logLine === "function") logLine("Need " + cost + " ink."); return; }
    if (window.payInk) payInk(-cost, row.item.name); else state.wallet.ink -= cost;
    const mine = loadMine(); if (!mine.some(function (it) { return it.id === row.item.id; })) { mine.unshift(row.item); saveMine(mine); }
    applyKit(row.item.slot, row.item.id); saveBazaar(listings.filter(function (l) { return l.id !== id; })); bus({ kind: "sold", id: id });
    if (typeof logLine === "function") logLine("Bought " + row.item.name + " from " + row.seller + "."); paint();
  }
  window.makerChat = function (raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (t === "/studio" || t === "/maker") { go("studio"); return true; }
    if (t === "/bazaar" || t === "/stall") { go("bazaar"); return true; }
    if (t === "/park") { go("park"); return true; }
    if (t === "/cafe") { go("cafe"); return true; }
    if (t === "/dock") { go("dock"); return true; }
    if (t === "/where") { const box = document.getElementById("where-box"); if (box) { box.classList.toggle("show"); paintWhere(); } return true; }
    return false;
  };
  window.tickMaker = function () { injectPages(); mergePlaces(); wrapDraw(); };
  window.drawMaker = function (g) {
    if (!state || !state.me) return;
    if (state.me.page === "bazaar") { g.fillStyle = "#1b1b1b"; g.font = "22px Comic Sans MS, cursive"; g.fillText("PLAYER BAZAAR — list what you drew", 140, 58); }
    if (state.me.page === "studio") { g.fillStyle = "#1b1b1b"; g.font = "22px Comic Sans MS, cursive"; g.fillText("STUDIO — hat · hold · shirt · legs · shoes", 140, 58); }
  };
  function bind() {
    wrapDraw();
    const studioBtn = document.getElementById("studio-toggle"); if (studioBtn) studioBtn.onclick = function () { go("studio"); };
    const bazaarBtn = document.getElementById("bazaar-toggle"); if (bazaarBtn) bazaarBtn.onclick = function () { go("bazaar"); };
    const whereBtn = document.getElementById("where-toggle");
    if (whereBtn) whereBtn.onclick = function () { const box = document.getElementById("where-box"); if (!box) return; box.classList.toggle("show"); paintWhere(); };
    document.addEventListener("click", function (e) {
      const t = e.target; if (!t || !t.dataset) return;
      if (t.dataset.slot) { Maker.slot = t.dataset.slot; Maker.strokes = []; paintStudio(); }
      if (t.dataset.wear) { const parts = t.dataset.wear.split(":"); applyKit(parts[0], parts.slice(1).join(":")); }
      if (t.dataset.saveitem) saveItem();
      if (t.dataset.clearpad) { Maker.strokes = []; paintPad(); }
      if (t.dataset.list) listItem(t.dataset.list);
      if (t.dataset.unlist) unlist(t.dataset.unlist);
      if (t.dataset.buyitem) buyListing(t.dataset.buyitem);
      if (t.dataset.gopage) {
        const id = t.dataset.gopage;
        if (PAGES.some(function (p) { return p.id === id; }) || id === "home" || id === "street") { if (window.goLocalPage) window.goLocalPage(id); }
        else if (typeof net === "function") net({ type: "page", page: id });
      }
      if (t.dataset.gowalk && state) {
        const pl = (state.places || []).find(function (p) { return p.id === t.dataset.gowalk; });
        if (pl) state.goal = { x: pl.x, y: pl.y + 24, sit: pl.kind === "bench" };
      }
    });
    const pages = document.getElementById("pages");
    if (pages) pages.addEventListener("click", function (e) {
      const id = e.target && e.target.dataset && e.target.dataset.page;
      if (id && PAGES.some(function (p) { return p.id === id; })) { e.stopPropagation(); go(id); }
    }, true);
    try {
      const ch = new BroadcastChannel("notebook-sticks-web");
      ch.onmessage = function (ev) {
        const msg = ev.data; if (!msg || msg.type !== "maker") return;
        if (msg.kind === "list" && msg.listings) saveBazaar(msg.listings);
        if (msg.kind === "sold" && msg.id) unlist(msg.id); paint();
      };
    } catch (e) {}
    paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind();
  setInterval(function () { injectPages(); mergePlaces(); wrapDraw(); }, 800);
  window.Maker = Maker;
})();
