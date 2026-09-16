/* Extra Cover density. Safe add-on so the front page is not empty lined paper. */
(function () {
  function ink(g, c, w) {
    g.strokeStyle = c || "#1b1b1b";
    g.fillStyle = c || "#1b1b1b";
    g.lineWidth = w || 2;
    g.lineCap = "round";
    g.lineJoin = "round";
  }
  function tree(g, x, y, s) {
    s = s || 1;
    ink(g, "#2f855a", 2.2);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 36 * s); g.stroke();
    g.beginPath();
    g.moveTo(x, y - 44 * s); g.lineTo(x + 22 * s, y - 14 * s); g.lineTo(x - 22 * s, y - 14 * s);
    g.closePath(); g.stroke();
    g.beginPath();
    g.moveTo(x, y - 62 * s); g.lineTo(x + 16 * s, y - 36 * s); g.lineTo(x - 16 * s, y - 36 * s);
    g.closePath(); g.stroke();
  }
  function house(g, x, y, bw, bh) {
    ink(g, "#1b1b1b", 2);
    g.strokeRect(x, y - bh, bw, bh);
    g.beginPath(); g.moveTo(x - 6, y - bh); g.lineTo(x + bw / 2, y - bh - 24); g.lineTo(x + bw + 6, y - bh); g.stroke();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.strokeRect(x + 10 + c * 22, y - bh + 14 + r * 26, 14, 14);
    g.strokeRect(x + bw / 2 - 8, y - 24, 16, 24);
  }
  function sit(g, x, y, c) {
    ink(g, c || "#1b1b1b", 1.7);
    g.beginPath(); g.arc(x, y - 16, 5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(x, y - 11); g.lineTo(x, y - 2); g.moveTo(x, y - 8); g.lineTo(x - 7, y); g.moveTo(x, y - 8); g.lineTo(x + 7, y); g.stroke();
    g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x - 6, y + 6); g.moveTo(x, y - 2); g.lineTo(x + 8, y + 6); g.stroke();
  }
  function lamp(g, x, y) {
    ink(g, "#1b1b1b", 2);
    g.beginPath(); g.moveTo(x, y + 30); g.lineTo(x, y - 40); g.stroke();
    g.beginPath(); g.arc(x, y - 48, 8, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 0.12; g.fillStyle = "#c9a227";
    g.beginPath(); g.arc(x, y - 48, 26, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  }
  function stall(g, x, y) {
    ink(g, "#1b1b1b", 2);
    g.strokeRect(x - 40, y - 10, 80, 28);
    g.beginPath(); g.moveTo(x - 50, y - 10); g.lineTo(x, y - 36); g.lineTo(x + 50, y - 10); g.stroke();
  }
  function paint(g, w, h) {
    for (let i = 0; i < 22; i++) {
      const r = ((i * 9301 + 49297) % 233280) / 233280;
      const s = ((i * 49297 + 9301) % 233280) / 233280;
      tree(g, 120 + r * (w - 240), 220 + s * (h - 380), 0.7 + (i % 4) * 0.2);
    }
    house(g, 200, 520, 150, 140);
    house(g, 960, 380, 190, 160);
    house(g, 1460, 520, 140, 120);
    house(g, 2260, 420, 170, 150);
    house(g, 2660, 980, 150, 130);
    house(g, 340, 1680, 180, 140);
    house(g, 1860, 1680, 200, 150);
    for (let i = 0; i < 8; i++) lamp(g, 300 + i * 340, 260 + (i % 2) * 900);
    stall(g, 860, 1280); stall(g, 1980, 1100); stall(g, 2520, 1480);
    const crowd = [
      [520, 940, "#1b1b1b"], [780, 980, "#2b6cb0"], [1120, 930, "#c23b22"],
      [1460, 1000, "#2f855a"], [1780, 940, "#6b46c1"], [2140, 760, "#1b1b1b"],
      [2480, 1020, "#dd6b20"], [640, 1480, "#0f766e"], [1320, 1520, "#b7791f"],
      [1960, 1540, "#e11d48"], [2740, 720, "#2b6cb0"], [420, 720, "#6b46c1"]
    ];
    crowd.forEach(function (c) { sit(g, c[0], c[1], c[2]); });
    ink(g, "rgba(27,27,27,.28)", 1.5);
    for (let x = 200; x < w - 160; x += 40) { g.beginPath(); g.arc(x, 940, 2.2, 0, Math.PI * 2); g.stroke(); }
  }
  function wrap() {
    if (typeof bakePaper !== "function" || bakePaper.__coverTown) return;
    const orig = bakePaper;
    window.bakePaper = function () {
      orig();
      if (!state || !state.paper || !state.me || state.me.page !== "cover") return;
      paint(state.paper.getContext("2d"), state.world.w, state.world.h);
    };
    bakePaper.__coverTown = true;
    if (state && state.me && state.me.page === "cover" && typeof bakePaper === "function") {
      try { bakePaper(); } catch (e) {}
    }
  }
  setInterval(wrap, 700);
  wrap();
})();
