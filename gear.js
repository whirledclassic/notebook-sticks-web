/* Animated doodle weapons + CC0 slash sheet (tbbk / OpenGameArt). */
(function () {
  const GEAR = [
    { id: "sword", name: "Ink blade", cost: 36 },
    { id: "saber", name: "Neon saber", cost: 48 },
    { id: "flame", name: "Matchstick", cost: 42 },
    { id: "startrail", name: "Star trail", cost: 38 },
    { id: "orb", name: "Glow orb", cost: 30 },
    { id: "cape-spark", name: "Spark cape", cost: 44 }
  ];
  const slashes = [];
  const sheet = new Image();
  sheet.crossOrigin = "anonymous";
  sheet.src = "https://opengameart.org/sites/default/files/pixel_art_sword_slash_sprites.png";
  function hue(t, a) { return "hsl(" + (((t * 40) + a) % 360) + " 80% 48%)"; }
  function swing(p, now) {
    const t = now / 1000;
    if (p.pose === "wave" || p.pose === "dance") return Math.sin(t * 14) * 0.9;
    if (p.walking) return Math.sin(t * 10) * 0.28;
    return Math.sin(t * 2) * 0.08;
  }
  function blade(g, ang, color, glow, sit) {
    g.save(); g.translate(14, -28 + sit); g.rotate(ang);
    if (glow) { g.strokeStyle = glow; g.globalAlpha = 0.45; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(4, -46); g.stroke(); g.globalAlpha = 1; }
    g.strokeStyle = color; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(0, 6); g.lineTo(0, -4); g.stroke();
    g.beginPath(); g.moveTo(-7, -4); g.lineTo(8, -4); g.stroke();
    g.beginPath(); g.moveTo(0, -4); g.lineTo(3, -48); g.lineTo(6, -8); g.closePath(); g.stroke();
    g.restore();
  }
  function drawGear(g, extra, sit, p, now) {
    const t = now / 1000;
    const ang = -0.7 + swing(p || { pose: "stand" }, now);
    if (extra === "sword") blade(g, ang, "#1b1b1b", "rgba(201,162,39,.55)", sit);
    if (extra === "saber") blade(g, ang, hue(t, 180), hue(t, 200), sit);
    if (extra === "flame") {
      blade(g, ang, "#c23b22", "rgba(221,107,32,.6)", sit);
      g.save(); g.translate(16, -70 + sit + Math.sin(t * 12) * 3);
      g.strokeStyle = hue(t, 20); g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 8); g.quadraticCurveTo(-6, -4, 0, -14); g.quadraticCurveTo(6, -4, 0, 8); g.stroke();
      g.restore();
    }
    if (extra === "startrail") {
      for (let i = 0; i < 5; i++) {
        const a = t * 3 + i * 1.2;
        g.beginPath(); g.strokeStyle = hue(t, i * 50); g.lineWidth = 1.8;
        g.arc(Math.cos(a) * 22, -36 + sit + Math.sin(a * 1.4) * 10, 3, 0, Math.PI * 2); g.stroke();
      }
    }
    if (extra === "orb") {
      g.strokeStyle = hue(t, 280); g.lineWidth = 2.4;
      g.beginPath(); g.arc(16, -24 + sit, 7 + Math.sin(t * 5) * 2, 0, Math.PI * 2); g.stroke();
    }
    if (extra === "cape-spark") {
      g.strokeStyle = hue(t, 40);
      g.beginPath(); g.moveTo(0, -40 + sit); g.lineTo(-18, -6 + sit + Math.sin(t * 6) * 4); g.lineTo(0, -14 + sit); g.stroke();
    }
  }
  function wrapExtras() {
    if (typeof extraPath !== "function" || extraPath.__gear) return;
    const orig = extraPath;
    window.extraPath = function (g, extra, sit) {
      orig(g, extra, sit);
      drawGear(g, extra, sit, window.__nbDrawWho || { pose: "stand" }, performance.now());
    };
    extraPath.__gear = true;
  }
  function wrapDrawStick() {
    if (typeof drawStick !== "function" || drawStick.__gear) return;
    const orig = drawStick;
    window.drawStick = function (g, p, now, scale) {
      window.__nbDrawWho = p;
      orig(g, p, now, scale);
      if (p && (p.pose === "wave" || p.pose === "dance") && /sword|saber|flame/.test(p.extra || "")) {
        if (!p.__slashAt || now - p.__slashAt > 220) {
          p.__slashAt = now;
          slashes.push({ x: p.x + (p.facing || 1) * 28, y: p.y - 40, t: now, face: p.facing || 1 });
        }
      }
    };
    drawStick.__gear = true;
  }
  window.tickGear = function () { wrapExtras(); wrapDrawStick(); };
  window.drawGear = function (g) { window.drawGearWorld(g); };
  window.drawGearWorld = function (g) {
    const now = performance.now();
    for (let i = slashes.length - 1; i >= 0; i--) {
      const s = slashes[i], age = (now - s.t) / 280;
      if (age > 1) { slashes.splice(i, 1); continue; }
      g.save(); g.translate(s.x, s.y); g.scale(s.face < 0 ? -1 : 1, 1);
      if (sheet.complete && sheet.naturalWidth) {
        const frame = Math.min(8, Math.floor(age * 9));
        const fw = 64, fh = 47, cols = 3;
        g.drawImage(sheet, (frame % cols) * fw, Math.floor(frame / cols) * fh, fw, fh, -28, -30, fw, fh);
      } else {
        g.strokeStyle = hue(now / 1000, 20); g.globalAlpha = 1 - age; g.lineWidth = 4 - age * 2;
        g.beginPath(); g.arc(0, 0, 10 + age * 26, -0.9, 0.9); g.stroke();
      }
      g.restore();
    }
  };
  window.gearSlash = function () {
    if (!state || !state.me) return;
    slashes.push({ x: state.me.x + (state.me.facing || 1) * 28, y: state.me.y - 40, t: performance.now(), face: state.me.facing || 1 });
    if (typeof setPose === "function") setPose("wave");
  };
  window.gearChat = function (raw) {
    if (/^\/(slash|swing)$/i.test(String(raw || "").trim())) { window.gearSlash(); return true; }
    return false;
  };
  function injectShop() {
    if (typeof renderShop !== "function" || renderShop.__gear) return;
    const orig = renderShop;
    window.renderShop = function () {
      orig();
      const box = document.getElementById("shop");
      if (!box || !box.classList.contains("show")) return;
      const have = ((state && state.wallet && state.wallet.extras) || []);
      box.insertAdjacentHTML("beforeend", "<div class='sub'>Animated gear · Q or /slash</div>" + GEAR.map(function (it) {
        const own = have.indexOf(it.id) >= 0;
        return "<button data-gear='" + it.id + "' " + (own ? "disabled" : "") + ">" + it.name + " · " + (own ? "yours" : it.cost + " pencils") + "</button>";
      }).join(""));
    };
    renderShop.__gear = true;
    const shop = document.getElementById("shop");
    if (shop) shop.addEventListener("click", function (e) {
      const id = e.target && e.target.dataset && e.target.dataset.gear; if (!id) return;
      const item = GEAR.find(function (g) { return g.id === id; });
      if (!item || !state.wallet) return;
      if ((state.wallet.extras || []).indexOf(id) >= 0) return;
      if (window.canPay && !canPay(item.cost, 0)) { if (typeof logLine === "function") logLine("Need " + item.cost + " pencils."); return; }
      if (window.payMoney) payMoney(-item.cost, 0, item.name);
      else if (window.payInk) payInk(-item.cost, item.name);
      state.wallet.extras = state.wallet.extras || []; state.wallet.extras.push(id);
      state.me.extra = id;
      if (typeof net === "function") net({ type: "look", color: state.me.color, hat: state.me.hat, extra: id });
      renderShop();
    });
  }
  function bind() {
    if (typeof EXTRAS !== "undefined") GEAR.forEach(function (g) { if (EXTRAS.indexOf(g.id) < 0) EXTRAS.push(g.id); });
    injectShop(); wrapExtras(); wrapDrawStick();
    addEventListener("keydown", function (e) {
      if (!state || state.chatting) return;
      if (e.key.toLowerCase() === "q") window.gearSlash();
    });
  }
  setInterval(function () { wrapExtras(); wrapDrawStick(); injectShop(); }, 500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
