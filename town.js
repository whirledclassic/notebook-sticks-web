/* Extra town pages on top of maker.js */
(function () {
  const EXTRA_PAGES = [
    { id: "library", name: "Library" }, { id: "arcade", name: "Arcade" }, { id: "plaza", name: "Plaza" },
    { id: "attic", name: "Attic" }, { id: "beach", name: "Beach" }, { id: "rooftop", name: "Rooftop" },
    { id: "museum", name: "Museum" }
  ];
  const EXTRA_PLACES = {
    library: [
      { id: "stacks", name: "Stacks", kind: "list", x: 620, y: 480, r: 180, hint: "Shh. Paper talking." },
      { id: "carrel", name: "Carrel", kind: "desk", x: 1600, y: 560, r: 160, hint: "Doodle quietly." },
      { id: "atlas", name: "Atlas stand", kind: "frame", x: 2400, y: 520, r: 160, hint: "Maps of missing pages." },
      { id: "returns", name: "Returns cart", kind: "grid", x: 1100, y: 1300, r: 150, hint: "Someone left a hat." }
    ],
    arcade: [
      { id: "cabinets", name: "Cabinets", kind: "lockers", x: 700, y: 520, r: 180, hint: "Beep. Boop. Paper." },
      { id: "prize", name: "Prize counter", kind: "counter", x: 1800, y: 500, r: 170, hint: "Tickets are stamps." },
      { id: "dancepad", name: "Dance pad", kind: "hop", x: 2400, y: 1100, r: 160, hint: "X still dances." },
      { id: "change", name: "Change machine", kind: "sign", x: 900, y: 1300, r: 150, hint: "Ink in." }
    ],
    plaza: [
      { id: "fountain2", name: "Plaza fountain", kind: "fountain", x: 1600, y: 700, r: 200, hint: "Toss a pencil." },
      { id: "steps", name: "Wide steps", kind: "bench", x: 700, y: 500, r: 170, hint: "People-watch." },
      { id: "kiosk2", name: "News kiosk", kind: "sign", x: 2500, y: 520, r: 150, hint: "/where from here." },
      { id: "busk", name: "Busker ring", kind: "ring", x: 1200, y: 1300, r: 160, hint: "Dance for ink." }
    ],
    attic: [
      { id: "trunk", name: "Trunk", kind: "crumple", x: 700, y: 600, r: 170, hint: "Old hats." },
      { id: "beam", name: "Rafter", kind: "scribble", x: 1700, y: 420, r: 180, hint: "Graphite dust." },
      { id: "window", name: "Attic window", kind: "frame", x: 2400, y: 560, r: 160, hint: "Looks onto Cover." },
      { id: "box", name: "Labelled box", kind: "grid", x: 1200, y: 1300, r: 150, hint: "MISC / DO NOT OPEN." }
    ],
    beach: [
      { id: "shore", name: "Shore line", kind: "scribble", x: 800, y: 1200, r: 200, hint: "The margin got wet." },
      { id: "umbrella2", name: "Beach umbrella", kind: "star", x: 1600, y: 520, r: 170, hint: "Hold one too." },
      { id: "shell", name: "Shell pile", kind: "ring", x: 2400, y: 900, r: 160, hint: "Tiny hats." },
      { id: "towel", name: "Towel", kind: "bench", x: 700, y: 500, r: 150, hint: "Pose sleep." }
    ],
    rooftop: [
      { id: "ledge", name: "Ledge", kind: "sign", x: 700, y: 480, r: 170, hint: "Do not fall off the page." },
      { id: "tank", name: "Water tank", kind: "ring", x: 1700, y: 560, r: 170, hint: "A coffee ring." },
      { id: "antenna2", name: "Antenna", kind: "star", x: 2500, y: 500, r: 150, hint: "Wear one." },
      { id: "deckchair", name: "Deck chair", kind: "bench", x: 1300, y: 1300, r: 160, hint: "Yellow wash sunset." }
    ],
    museum: [
      { id: "plinth", name: "Plinth", kind: "sign", x: 700, y: 560, r: 170, hint: "A serious stick." },
      { id: "wing", name: "West wing", kind: "frame", x: 1700, y: 480, r: 180, hint: "Do not touch." },
      { id: "gift", name: "Gift shop", kind: "counter", x: 2500, y: 1100, r: 160, hint: "Bazaar annex." },
      { id: "bench3", name: "Quiet bench", kind: "bench", x: 1100, y: 1300, r: 150, hint: "Sit with the art." }
    ]
  };
  function inject() {
    if (!state || !state.pages) return;
    EXTRA_PAGES.forEach(function (pg) {
      if (!state.pages.some(function (p) { return p.id === pg.id; })) state.pages.push(pg);
    });
  }
  const prevLocal = window.goLocalPage;
  window.goLocalPage = function (id) {
    if (EXTRA_PLACES[id] && state && state.me) {
      state.me.page = id; state.me.x = 760; state.me.y = 640; state.me.walking = false; state.goal = null;
      state.places = EXTRA_PLACES[id].map(function (p) { return Object.assign({}, p); });
      if (typeof bakePaper === "function") bakePaper();
      if (typeof drawPages === "function") drawPages();
      if (typeof refreshWho === "function") refreshWho();
      if (typeof logLine === "function") logLine("Turned to " + (EXTRA_PAGES.find(function (p) { return p.id === id; }) || { name: id }).name + ".");
      return;
    }
    if (typeof prevLocal === "function") prevLocal(id);
  };
  const prevChat = window.makerChat;
  window.makerChat = function (raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (EXTRA_PLACES[t.replace(/^\//, "")]) { window.goLocalPage(t.replace(/^\//, "")); return true; }
    if (typeof prevChat === "function") return prevChat(raw);
    return false;
  };
  const prevDraw = window.drawMaker;
  window.drawMaker = function (g) {
    if (typeof prevDraw === "function") prevDraw(g);
    if (!state || !state.me) return;
    const titles = {
      library: "LIBRARY \u2014 quiet stacks", arcade: "ARCADE \u2014 tickets are stamps", plaza: "PLAZA \u2014 meet in the middle",
      attic: "ATTIC \u2014 leftover props", beach: "BEACH \u2014 wet margin", rooftop: "ROOFTOP \u2014 do not fall off the page",
      museum: "MUSEUM \u2014 do not touch the doodles"
    };
    if (titles[state.me.page]) { g.fillStyle = "#1b1b1b"; g.font = "22px Comic Sans MS, cursive"; g.fillText(titles[state.me.page], 140, 58); }
  };
  setInterval(inject, 800);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject); else inject();
})();
