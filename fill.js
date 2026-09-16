/* Page fill: extra landmarks + baked scenery so districts are not empty paper. */
(function () {
  const MORE = {
    cover: [
      { id: "bus-stop", name: "Pencil stop", kind: "sign", x: 520, y: 1480, r: 150, hint: "Wait for a page that never comes." },
      { id: "newsstand", name: "Newsstand", kind: "stall", x: 1180, y: 420, r: 140, hint: "Yesterday's scribbles." },
      { id: "lamp-cover", name: "Street lamp", kind: "lamp", x: 1900, y: 1100, r: 130, hint: "It draws a circle of light." },
      { id: "mural", name: "Side mural", kind: "frame", x: 2500, y: 720, r: 150, hint: "Someone outlined a crowd." }
    ],
    graph: [
      { id: "plot", name: "Secret plot", kind: "scribble", x: 720, y: 420, r: 140, hint: "A line going somewhere." },
      { id: "gridbench", name: "Grid bench", kind: "bench", x: 2000, y: 700, r: 140, hint: "Sit on an axis." },
      { id: "compass", name: "Compass rose", kind: "star", x: 900, y: 1600, r: 150, hint: "N is up. Probably." }
    ],
    comic: [
      { id: "caption", name: "Caption box", kind: "sign", x: 700, y: 1200, r: 150, hint: "Meanwhile." },
      { id: "gutter", name: "Gutter", kind: "scribble", x: 2100, y: 900, r: 140, hint: "The space between panels." },
      { id: "inkwell", name: "Inkwell", kind: "ring", x: 2600, y: 1300, r: 140, hint: "Black and decisive." }
    ],
    pocket: [
      { id: "lint", name: "Lint nest", kind: "crumple", x: 900, y: 800, r: 140, hint: "Soft grey." },
      { id: "ticket", name: "Torn ticket", kind: "stamp", x: 1600, y: 500, r: 140, hint: "Admit one doodle." },
      { id: "odds-table", name: "Odds table", kind: "table", x: 1800, y: 1200, r: 160, hint: "E to play." }
    ],
    gallery: [
      { id: "docent", name: "Docent stand", kind: "sign", x: 900, y: 900, r: 140, hint: "Please do not lick the art." },
      { id: "sculpt", name: "Wire figure", kind: "star", x: 2000, y: 900, r: 150, hint: "A stick in a box." },
      { id: "cloak2", name: "Coat hook", kind: "lockers", x: 2600, y: 1200, r: 140, hint: "One scarf, no owner." }
    ],
    shop: [
      { id: "shelf", name: "Hat shelf", kind: "shelf", x: 1400, y: 420, r: 150, hint: "Try before you buy." },
      { id: "till2", name: "Spare till", kind: "counter", x: 2400, y: 1200, r: 150, hint: "Closed on purpose." },
      { id: "mirror-shop", name: "Cheap mirror", kind: "frame", x: 600, y: 1100, r: 140, hint: "You look like a line." }
    ],
    back: [
      { id: "doodle-wall", name: "Doodle wall", kind: "grid", x: 1500, y: 700, r: 160, hint: "/mark lives forever-ish." },
      { id: "nap", name: "Nap corner", kind: "bench", x: 2400, y: 1200, r: 140, hint: "Pose sleep." }
    ],
    club: [
      { id: "piano", name: "Paper piano", kind: "desk", x: 1400, y: 400, r: 150, hint: "Only three keys work." },
      { id: "vip", name: "VIP rope", kind: "scribble", x: 2400, y: 900, r: 140, hint: "It is a squiggle." }
    ],
    margin: [
      { id: "cite", name: "Citation", kind: "list", x: 800, y: 1100, r: 140, hint: "Ibid." },
      { id: "scrib", name: "Editor mark", kind: "scribble", x: 2200, y: 900, r: 150, hint: "Delete? Stet?" }
    ],
    studio: [
      { id: "sink", name: "Ink sink", kind: "ring", x: 500, y: 1100, r: 140, hint: "Rinse the brush." },
      { id: "stool", name: "Paint stool", kind: "bench", x: 1400, y: 700, r: 140, hint: "Sit and squint." },
      { id: "palette", name: "Palette table", kind: "desk", x: 2100, y: 1200, r: 150, hint: "Every blot is a color." },
      { id: "skylight", name: "Skylight", kind: "frame", x: 2800, y: 360, r: 150, hint: "North light, sort of." },
      { id: "cans", name: "Can shelf", kind: "shelf", x: 400, y: 420, r: 130, hint: "Turpentine is water." }
    ],
    bazaar: [
      { id: "rugs", name: "Rug pile", kind: "crumple", x: 500, y: 1100, r: 140, hint: "Soft paper." },
      { id: "lanterns", name: "Lantern string", kind: "lamp", x: 1200, y: 360, r: 140, hint: "They sway if you believe." },
      { id: "spice", name: "Spice stall", kind: "stall", x: 2300, y: 500, r: 150, hint: "Smells like pencil shavings." },
      { id: "scale", name: "Ink scale", kind: "desk", x: 2600, y: 1400, r: 140, hint: "Fair weights. Mostly." },
      { id: "awning", name: "Red awning", kind: "sign", x: 1000, y: 900, r: 140, hint: "Shade that is a hatch." }
    ],
    park: [
      { id: "swing", name: "Swing set", kind: "hop", x: 1100, y: 700, r: 150, hint: "One chain is longer." },
      { id: "kiosk-park", name: "Bird kiosk", kind: "stall", x: 2000, y: 1300, r: 140, hint: "Seed is graphite grit." },
      { id: "statue", name: "Hero statue", kind: "sign", x: 2800, y: 900, r: 150, hint: "A very proud stick." },
      { id: "bridge", name: "Puddle bridge", kind: "scribble", x: 500, y: 1000, r: 150, hint: "Three planks." },
      { id: "lamp-park", name: "Park lamp", kind: "lamp", x: 1900, y: 400, r: 130, hint: "Moths made of commas." }
    ],
    cafe: [
      { id: "grinder", name: "Grinder", kind: "counter", x: 1100, y: 400, r: 140, hint: "It only pretends to grind." },
      { id: "window-seat", name: "Window seat", kind: "bench", x: 2200, y: 900, r: 140, hint: "Watch Cover go by." },
      { id: "pastry", name: "Pastry case", kind: "grid", x: 900, y: 1100, r: 140, hint: "All the tarts are circles." },
      { id: "hook", name: "Coat hook", kind: "lockers", x: 2600, y: 1200, r: 130, hint: "Umbrellas welcome." },
      { id: "board-cafe", name: "Chalk board", kind: "list", x: 400, y: 800, r: 140, hint: "Soup: ink." }
    ],
    dock: [
      { id: "net", name: "Drying net", kind: "grid", x: 500, y: 400, r: 140, hint: "Caught a margin." },
      { id: "captain", name: "Captain stool", kind: "bench", x: 1200, y: 900, r: 140, hint: "The captain is an NPC." },
      { id: "rope", name: "Coil of rope", kind: "ring", x: 2100, y: 1300, r: 140, hint: "It is a spiral." },
      { id: "ferry", name: "Ferry sign", kind: "sign", x: 2800, y: 1100, r: 150, hint: "Next boat: never." },
      { id: "gull", name: "Gull post", kind: "lamp", x: 900, y: 400, r: 130, hint: "Screee. On paper." }
    ],
    library: [
      { id: "desk-lib", name: "Reference desk", kind: "counter", x: 1100, y: 400, r: 150, hint: "Cards in a tiny drawer." },
      { id: "kids", name: "Picture books", kind: "shelf", x: 2000, y: 1100, r: 150, hint: "Shorter stacks." },
      { id: "globe", name: "Globe", kind: "ring", x: 2800, y: 900, r: 140, hint: "The world is this notebook." },
      { id: "quiet", name: "Quiet sofa", kind: "bench", x: 500, y: 1200, r: 140, hint: "Shh is the dress code." },
      { id: "ladder", name: "Rolling ladder", kind: "scribble", x: 900, y: 900, r: 140, hint: "Do not climb off the page." }
    ],
    arcade: [
      { id: "pinball", name: "Pinball", kind: "cabinet", x: 1200, y: 900, r: 150, hint: "Tilt is a feature." },
      { id: "photo", name: "Photo booth", kind: "frame", x: 2100, y: 800, r: 140, hint: "Four poses, one ink." },
      { id: "ticket-bin", name: "Ticket bin", kind: "crumple", x: 500, y: 900, r: 140, hint: "Confetti that counts." },
      { id: "neon", name: "Neon arch", kind: "sign", x: 1600, y: 300, r: 150, hint: "OPEN in shaky caps." },
      { id: "stool-arc", name: "Stool row", kind: "bench", x: 2600, y: 500, r: 140, hint: "Sit. Mash. Repeat." }
    ],
    plaza: [
      { id: "clock", name: "Town clock", kind: "sign", x: 1600, y: 320, r: 150, hint: "It is always sketch o'clock." },
      { id: "bench-pl", name: "Long bench", kind: "bench", x: 2200, y: 1100, r: 150, hint: "Save a seat." },
      { id: "balloon-man", name: "Balloon cart", kind: "stall", x: 500, y: 900, r: 140, hint: "Hold one from Studio." },
      { id: "map-table", name: "Map table", kind: "desk", x: 900, y: 1600, r: 140, hint: "You are here. And here." },
      { id: "lamp-pl", name: "Twin lamps", kind: "lamp", x: 2800, y: 900, r: 130, hint: "They agree on dusk." }
    ],
    attic: [
      { id: "mannequin", name: "Mannequin", kind: "sign", x: 1100, y: 500, r: 140, hint: "Wears last season's hat." },
      { id: "records", name: "Record crate", kind: "grid", x: 2000, y: 1100, r: 140, hint: "All B-sides." },
      { id: "rocker", name: "Rocking chair", kind: "bench", x: 500, y: 1100, r: 140, hint: "It creaks in 4/4." },
      { id: "hatch", name: "Roof hatch", kind: "frame", x: 2800, y: 1200, r: 140, hint: "Rooftop is that way." }
    ],
    beach: [
      { id: "pier2", name: "Short pier", kind: "sign", x: 1200, y: 1500, r: 160, hint: "The paper ends in a splash." },
      { id: "castle", name: "Sand castle", kind: "triangles", x: 2000, y: 1300, r: 150, hint: "A triangle with flags." },
      { id: "cooler", name: "Cooler", kind: "grid", x: 500, y: 800, r: 130, hint: "Ice is white ink." },
      { id: "lifeguard", name: "Lifeguard chair", kind: "lamp", x: 2800, y: 600, r: 140, hint: "The ocean is a wash." },
      { id: "drift", name: "Driftwood", kind: "scribble", x: 1800, y: 1700, r: 150, hint: "Sit if you must." }
    ],
    rooftop: [
      { id: "garden", name: "Pot row", kind: "grid", x: 1100, y: 700, r: 140, hint: "Herbs that are loops." },
      { id: "chimney", name: "Chimney", kind: "sign", x: 2100, y: 400, r: 140, hint: "A rectangle that smokes." },
      { id: "hammock", name: "Hammock", kind: "bench", x: 600, y: 1100, r: 150, hint: "Between two pipes." },
      { id: "scope", name: "Tiny telescope", kind: "star", x: 2800, y: 1100, r: 140, hint: "Stars are asterisks." }
    ],
    museum: [
      { id: "armor", name: "Stick armor", kind: "lockers", x: 1100, y: 500, r: 140, hint: "Two lines and a bucket." },
      { id: "vase", name: "Broken vase", kind: "ring", x: 2100, y: 1100, r: 140, hint: "It was always like that." },
      { id: "audio", name: "Audio guide", kind: "desk", x: 500, y: 900, r: 140, hint: "Press 1 for charcoal." },
      { id: "east", name: "East wing", kind: "frame", x: 2800, y: 500, r: 150, hint: "More frames. Always more." }
    ]
  };

  function addMore(page, list) {
    const extra = MORE[page] || [];
    extra.forEach(function (pl) {
      if (!list.some(function (p) { return p.id === pl.id; })) list.push(Object.assign({}, pl));
    });
    return list;
  }
  function mergeTown() {
    if (!window.NB_TOWN || !window.NB_TOWN.places) return;
    Object.keys(MORE).forEach(function (page) {
      const cur = window.NB_TOWN.places[page] || [];
      window.NB_TOWN.places[page] = addMore(page, cur);
    });
  }
  function mergeLive() {
    if (!state || !state.me || !state.places) return;
    addMore(state.me.page, state.places);
  }
  function stroke(g, color, w) {
    g.strokeStyle = color || "#1b1b1b";
    g.fillStyle = color || "#1b1b1b";
    g.lineWidth = w || 2;
    g.lineCap = "round";
    g.lineJoin = "round";
  }
  function tree(g, x, y, s) {
    s = s || 1;
    stroke(g, "#2f855a", 2.2);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 36 * s); g.stroke();
    g.beginPath();
    g.moveTo(x, y - 44 * s); g.lineTo(x + 22 * s, y - 14 * s); g.lineTo(x - 22 * s, y - 14 * s); g.closePath(); g.stroke();
    g.beginPath();
    g.moveTo(x, y - 62 * s); g.lineTo(x + 16 * s, y - 36 * s); g.lineTo(x - 16 * s, y - 36 * s); g.closePath(); g.stroke();
  }
  function lamp(g, x, y) {
    stroke(g, "#1b1b1b", 2);
    g.beginPath(); g.moveTo(x, y + 30); g.lineTo(x, y - 40); g.stroke();
    g.beginPath(); g.arc(x, y - 48, 8, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 0.12; g.fillStyle = "#c9a227";
    g.beginPath(); g.arc(x, y - 48, 26, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  }
  function stall(g, x, y) {
    stroke(g, "#1b1b1b", 2);
    g.strokeRect(x - 40, y - 10, 80, 28);
    g.beginPath(); g.moveTo(x - 50, y - 10); g.lineTo(x, y - 36); g.lineTo(x + 50, y - 10); g.stroke();
    g.beginPath(); g.moveTo(x - 36, y + 18); g.lineTo(x - 36, y + 36); g.moveTo(x + 36, y + 18); g.lineTo(x + 36, y + 36); g.stroke();
  }
  function bush(g, x, y) {
    stroke(g, "#2f855a", 2);
    g.beginPath(); g.arc(x - 10, y, 10, 0, Math.PI * 2); g.arc(x + 8, y + 2, 9, 0, Math.PI * 2); g.arc(x, y - 8, 8, 0, Math.PI * 2); g.stroke();
  }
  function bird(g, x, y) {
    stroke(g, "#1b1b1b", 1.6);
    g.beginPath(); g.moveTo(x - 7, y); g.quadraticCurveTo(x, y - 6, x + 7, y); g.stroke();
  }
  function crate(g, x, y) {
    stroke(g, "#1b1b1b", 2);
    g.strokeRect(x - 16, y - 12, 32, 24);
    g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x + 16, y); g.stroke();
  }
  function wave(g, x, y, n) {
    stroke(g, "#2b6cb0", 1.8);
    g.beginPath(); g.moveTo(x, y);
    for (let i = 1; i <= (n || 6); i++) g.quadraticCurveTo(x + i * 28 - 14, y - 10 * (i % 2 ? 1 : -1), x + i * 28, y);
    g.stroke();
  }
  function shelf(g, x, y) {
    stroke(g, "#1b1b1b", 2);
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.moveTo(x - 50, y - 30 + i * 22); g.lineTo(x + 50, y - 30 + i * 22); g.stroke();
      for (let b = 0; b < 4; b++) g.strokeRect(x - 46 + b * 24, y - 48 + i * 22, 18, 18);
    }
  }
  function cabinet(g, x, y) {
    stroke(g, "#1b1b1b", 2.2);
    g.strokeRect(x - 22, y - 50, 44, 70);
    g.strokeRect(x - 16, y - 44, 32, 22);
    g.beginPath(); g.moveTo(x - 10, y + 4); g.lineTo(x + 10, y + 28); g.lineTo(x - 10, y + 28); g.closePath(); g.stroke();
  }
  function doodleSit(g, x, y, color) {
    stroke(g, color || "#1b1b1b", 1.8);
    g.beginPath(); g.arc(x, y - 16, 5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(x, y - 11); g.lineTo(x, y - 2); g.moveTo(x, y - 8); g.lineTo(x - 7, y); g.moveTo(x, y - 8); g.lineTo(x + 7, y); g.stroke();
    g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x - 6, y + 6); g.moveTo(x, y - 2); g.lineTo(x + 8, y + 6); g.stroke();
  }
  function pathDots(g, x0, y0, x1, y1, step) {
    stroke(g, "rgba(27,27,27,.28)", 1.5);
    const dx = x1 - x0, dy = y1 - y0, m = Math.hypot(dx, dy) || 1;
    const n = Math.floor(m / (step || 36));
    for (let i = 0; i <= n; i++) {
      const u = i / Math.max(1, n);
      g.beginPath(); g.arc(x0 + dx * u, y0 + dy * u, 2.2, 0, Math.PI * 2); g.stroke();
    }
  }
  function cloud(g, x, y) {
    stroke(g, "rgba(27,27,27,.35)", 1.6);
    g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.arc(x + 14, y + 2, 10, 0, Math.PI * 2); g.arc(x - 12, y + 3, 9, 0, Math.PI * 2); g.stroke();
  }
  function fence(g, x, y, w) {
    stroke(g, "#1b1b1b", 1.7);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke();
    for (let i = 0; i <= w; i += 22) { g.beginPath(); g.moveTo(x + i, y - 14); g.lineTo(x + i, y + 8); g.stroke(); }
  }
  function fillPage(g, page, w, h) {
    const seeded = function (n) { return function (i) { return ((n * 9301 + i * 49297) % 233280) / 233280; }; };
    if (page === "park" || page === "cover" || page === "plaza") {
      for (let i = 0; i < 18; i++) {
        const r = seeded(11)(i);
        tree(g, 180 + r * (w - 360), 280 + seeded(19)(i) * (h - 500), 0.7 + seeded(3)(i) * 0.7);
      }
      for (let i = 0; i < 10; i++) bush(g, 200 + seeded(7)(i) * (w - 400), 500 + seeded(13)(i) * (h - 700));
      pathDots(g, 200, 900, w - 200, 1100, 40);
    }
    if (page === "beach" || page === "dock") {
      g.globalAlpha = 0.28; g.fillStyle = "#b7d4e6"; g.fillRect(0, h * 0.62, w, h * 0.38); g.globalAlpha = 1;
      for (let i = 0; i < 8; i++) wave(g, 40 + i * 20, h * 0.64 + i * 28, 14);
      for (let i = 0; i < 9; i++) bird(g, 300 + i * 280, 180 + (i % 3) * 40);
    }
    if (page === "studio") {
      for (let i = 0; i < 6; i++) crate(g, 400 + i * 420, 1600);
      pathDots(g, 400, 600, 2600, 700, 48);
      doodleSit(g, 980, 760, "#2b6cb0"); doodleSit(g, 1760, 1280, "#c23b22");
    }
    if (page === "bazaar") {
      for (let i = 0; i < 8; i++) stall(g, 360 + (i % 4) * 700, 380 + Math.floor(i / 4) * 700);
      for (let i = 0; i < 5; i++) lamp(g, 500 + i * 500, 200);
      doodleSit(g, 860, 600, "#6b46c1"); doodleSit(g, 2100, 640, "#dd6b20");
    }
    if (page === "cafe") {
      for (let i = 0; i < 6; i++) { stroke(g, "#1b1b1b", 2); g.strokeRect(480 + (i % 3) * 700, 700 + Math.floor(i / 3) * 500, 70, 40); }
      doodleSit(g, 700, 560, "#1b1b1b"); doodleSit(g, 1680, 560, "#2f855a"); doodleSit(g, 1480, 1360, "#c23b22");
    }
    if (page === "library") {
      for (let i = 0; i < 5; i++) shelf(g, 420 + i * 540, 900);
      doodleSit(g, 1680, 620, "#1b1b1b"); doodleSit(g, 1180, 1360, "#2b6cb0");
    }
    if (page === "arcade") {
      for (let i = 0; i < 8; i++) cabinet(g, 420 + i * 320, 900);
      lamp(g, 1600, 240); doodleSit(g, 2480, 1180, "#6b46c1");
    }
    if (page === "attic") {
      for (let i = 0; i < 10; i++) crate(g, 300 + (i % 5) * 560, 1500 + Math.floor(i / 5) * 180);
      cloud(g, 900, 220); cloud(g, 1800, 180);
    }
    if (page === "rooftop") {
      fence(g, 80, 480, w - 160);
      for (let i = 0; i < 6; i++) cloud(g, 300 + i * 420, 160 + (i % 2) * 40);
      lamp(g, 400, 600); lamp(g, 2800, 600);
    }
    if (page === "museum" || page === "gallery") {
      for (let i = 0; i < 8; i++) { stroke(g, "#1b1b1b", 3); g.strokeRect(280 + (i % 4) * 720, 280 + Math.floor(i / 4) * 900, 160, 120); }
      doodleSit(g, 1180, 1360, "#1b1b1b");
    }
    if (page === "plaza") {
      lamp(g, 400, 600); lamp(g, 2800, 600); lamp(g, 1600, 1400);
      doodleSit(g, 760, 540, "#2b6cb0"); doodleSit(g, 1280, 1360, "#c23b22"); doodleSit(g, 2500, 560, "#2f855a");
    }
    if (page === "dock") {
      for (let i = 0; i < 6; i++) crate(g, 2200 + (i % 3) * 80, 700 + Math.floor(i / 3) * 50);
      fence(g, 200, 800, 900);
    }
    if (page === "cover") {
      lamp(g, 400, 500); lamp(g, 2400, 900); stall(g, 1200, 500);
      doodleSit(g, 2140, 760, "#1b1b1b"); pathDots(g, 400, 900, 2400, 900, 50);
    }
    if (page === "graph") { for (let i = 0; i < 12; i++) bird(g, 200 + i * 240, 180 + (i % 4) * 30); }
    if (page === "comic") { stroke(g, "#1b1b1b", 5); g.strokeRect(80, 80, w - 160, h - 160); }
  }
  const origKind = window.drawKind;
  window.drawKind = function (g, pl) {
    const k = pl && pl.kind;
    if (k === "tree") { tree(g, pl.x, pl.y, 1.1); if (typeof label === "function") label(g, pl); return; }
    if (k === "lamp") { lamp(g, pl.x, pl.y); if (typeof label === "function") label(g, pl); return; }
    if (k === "stall") { stall(g, pl.x, pl.y); if (typeof label === "function") label(g, pl); return; }
    if (k === "shelf") { shelf(g, pl.x, pl.y); if (typeof label === "function") label(g, pl); return; }
    if (k === "cabinet") { cabinet(g, pl.x, pl.y); if (typeof label === "function") label(g, pl); return; }
    if (typeof origKind === "function") origKind(g, pl);
    else if (typeof label === "function") label(g, pl);
  };
  function wrapBake() {
    if (typeof bakePaper !== "function" || bakePaper.__fill) return;
    const orig = bakePaper;
    window.bakePaper = function () {
      orig();
      if (!state || !state.paper) return;
      const g = state.paper.getContext("2d");
      fillPage(g, state.me.page, state.world.w, state.world.h);
      for (const pl of state.places) { if (window.drawKind) window.drawKind(g, pl); }
    };
    bakePaper.__fill = true;
  }
  window.tickFill = function () { wrapBake(); mergeTown(); mergeLive(); };
  mergeTown(); wrapBake();
  setInterval(function () { wrapBake(); mergeTown(); mergeLive(); }, 900);
})();
