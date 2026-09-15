/* Planes, pops, and hooks for social / table games. */
(function () {
  const planes = [];
  const pops = [];
  window.addPlane = function (msg) {
    planes.push({
      name: msg.name || "Doodle",
      x: msg.x, y: msg.y,
      vx: (msg.facing || 1) * 220,
      vy: -40,
      life: 3.2
    });
  };
  window.throwPlane = function () {
    if (typeof net === "function") net({ type: "plane" });
    else window.addPlane({ name: state.me.name, x: state.me.x, y: state.me.y - 20, facing: state.me.facing });
  };
  window.addPop = function (x, y, text) {
    pops.push({ x: x, y: y, text: text, life: 1.4 });
  };
  window.tickFun = function (dt) {
    for (const p of planes) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 18 * dt;
      p.life -= dt;
    }
    for (let i = planes.length - 1; i >= 0; i--) if (planes[i].life <= 0) planes.splice(i, 1);
    for (const p of pops) {
      p.y -= 36 * dt;
      p.life -= dt;
    }
    for (let i = pops.length - 1; i >= 0; i--) if (pops[i].life <= 0) pops.splice(i, 1);
    if (window.tickSocial) window.tickSocial(dt);
    if (window.tickGames) window.tickGames(dt);
  };
  window.drawFun = function (g) {
    g.save();
    for (const p of planes) {
      g.strokeStyle = "#1b1b1b";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(p.x - 14, p.y);
      g.lineTo(p.x + 16, p.y - 4);
      g.lineTo(p.x - 8, p.y + 8);
      g.closePath();
      g.stroke();
    }
    g.font = "14px Comic Sans MS, cursive";
    g.textAlign = "center";
    for (const p of pops) {
      g.globalAlpha = Math.max(0, p.life);
      g.fillStyle = "#c23b22";
      g.fillText(p.text, p.x, p.y);
    }
    g.globalAlpha = 1;
    g.restore();
    if (window.drawSocial) window.drawSocial(g);
    if (window.drawGames) window.drawGames(g);
  };
})();
