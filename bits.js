/* Extra world bits — lanterns, books, crates, balloons, rugs.
   Drawn in code so Pages needs no image pack. */
(function () {
  const BITS = {
    cover: [
      { k: "lantern", x: 520, y: 640 }, { k: "lantern", x: 1480, y: 380 },
      { k: "crate", x: 1860, y: 880 }, { k: "rug", x: 1100, y: 980 },
      { k: "balloon", x: 640, y: 420, c: "#e11d48" },
      { k: "balloon", x: 700, y: 460, c: "#2b6cb0" },
      { k: "book", x: 2340, y: 1180 }, { k: "book", x: 2380, y: 1200 }
    ],
    plaza: [
      { k: "lantern", x: 900, y: 520 }, { k: "lantern", x: 2200, y: 520 },
      { k: "rug", x: 1600, y: 1100 }, { k: "crate", x: 1240, y: 760 },
      { k: "balloon", x: 1500, y: 480, c: "#c9a227" }
    ],
    park: [
      { k: "lantern", x: 800, y: 700 }, { k: "balloon", x: 1400, y: 500, c: "#2f855a" },
      { k: "crate", x: 2000, y: 900 }
    ],
    cafe: [
      { k: "book", x: 700, y: 520 }, { k: "book", x: 760, y: 540 },
      { k: "lantern", x: 1700, y: 400 }, { k: "rug", x: 1200, y: 900 }
    ],
    library: [
      { k: "book", x: 600, y: 500 }, { k: "book", x: 640, y: 520 }, { k: "book", x: 680, y: 500 },
      { k: "lantern", x: 1600, y: 420 }, { k: "rug", x: 1100, y: 1000 }
    ],
    beach: [
      { k: "crate", x: 900, y: 1200 }, { k: "balloon", x: 1600, y: 700, c: "#dd6b20" },
      { k: "lantern", x: 2100, y: 900 }
    ],
    club: [
      { k: "lantern", x: 700, y: 480 }, { k: "lantern", x: 2100, y: 480 },
      { k: "rug", x: 1400, y: 900 }, { k: "balloon", x: 1800, y: 420, c: "#6b46c1" }
    ],
    arcade: [
      { k: "crate", x: 900, y: 800 }, { k: "lantern", x: 2000, y: 500 },
      { k: "balloon", x: 1200, y: 420, c: "#e11d48" }
    ]
  };

  function list() {
    const page = (typeof state !== "undefined" && state && state.me && state.me.page) || "cover";
    return BITS[page] || BITS.cover;
  }

  function lantern(g, x, y, t) {
    g.save();
    g.translate(x, y);
    g.fillStyle = "#1b1b1b";
    g.fillRect(-2, -36, 4, 28);
    const glow = 0.55 + Math.sin(t * 3) * 0.15;
    g.fillStyle = "rgba(255,200,80," + glow + ")";
    g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c9a227";
    g.fillRect(-7, -6, 14, 10);
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 2; g.strokeRect(-7, -6, 14, 10);
    g.restore();
  }
  function crate(g, x, y) {
    g.fillStyle = "#b7791f";
    g.fillRect(x - 16, y - 14, 32, 28);
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 2;
    g.strokeRect(x - 16, y - 14, 32, 28);
    g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x + 16, y); g.stroke();
  }
  function rug(g, x, y) {
    g.fillStyle = "#c23b22";
    g.beginPath(); g.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#ffd56a";
    g.beginPath(); g.ellipse(x, y, 28, 8, 0, 0, Math.PI * 2); g.fill();
  }
  function balloon(g, x, y, c, t) {
    g.save();
    g.translate(x, y + Math.sin(t * 2 + x) * 4);
    g.fillStyle = c || "#e11d48";
    g.beginPath(); g.ellipse(0, -10, 10, 13, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, 3); g.quadraticCurveTo(6, 14, 0, 22); g.stroke();
    g.restore();
  }
  function book(g, x, y) {
    g.fillStyle = "#2b6cb0";
    g.fillRect(x - 12, y - 4, 24, 8);
    g.fillStyle = "#f4eed8";
    g.fillRect(x - 10, y - 2, 20, 4);
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 1.5;
    g.strokeRect(x - 12, y - 4, 24, 8);
  }

  let clock = 0;
  window.tickBits = function (dt) { clock += dt || 0.016; };
  window.drawBits = function (g) {
    if (!g) return;
    list().forEach(function (b) {
      if (b.k === "lantern") lantern(g, b.x, b.y, clock);
      else if (b.k === "crate") crate(g, b.x, b.y);
      else if (b.k === "rug") rug(g, b.x, b.y);
      else if (b.k === "balloon") balloon(g, b.x, b.y, b.c, clock);
      else if (b.k === "book") book(g, b.x, b.y);
    });
  };
})();
