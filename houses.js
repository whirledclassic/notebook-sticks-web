/* Buy a lot. Own a room. Membership required to buy or enter. */
(function () {
  const KEY = "ns-house-v1:";
  const LOTS = [
    { id: "a1", name: "Margin cottage", cost: 60, x: 620, y: 560, need: "plus" },
    { id: "a2", name: "Graph loft", cost: 80, x: 1320, y: 560, need: "plus" },
    { id: "a3", name: "Comic flat", cost: 95, x: 2020, y: 560, need: "plus" },
    { id: "b1", name: "Club suite", cost: 140, x: 620, y: 1180, need: "plus" },
    { id: "b2", name: "Gallery house", cost: 170, x: 1320, y: 1180, need: "plus" },
    { id: "b3", name: "Patron villa", cost: 220, x: 2020, y: 1180, need: "patron" }
  ];
  const FURN = [
    { id: "bed", name: "Bed", cost: 25 }, { id: "desk", name: "Desk", cost: 20 },
    { id: "plant", name: "Plant", cost: 12 }, { id: "lamp", name: "Lamp", cost: 15 },
    { id: "rug", name: "Rug", cost: 18 }, { id: "poster", name: "Poster", cost: 10 },
    { id: "sofa", name: "Sofa", cost: 30 }
  ];
  const RANK = { free: 0, plus: 1, patron: 2 };
  const House = { mode: "walk", placing: null, stroke: null };
  function nkey() { return String((state && state.me && state.me.name) || "doodle").toLowerCase().slice(0, 16); }
  function load() {
    try { const h = JSON.parse(localStorage.getItem(KEY + nkey()) || "null"); if (h && h.lot) return h; } catch (e) {}
    return null;
  }
  function save(h) { try { localStorage.setItem(KEY + nkey(), JSON.stringify(h)); } catch (e) {} }
  function tier() {
    if (typeof window.__nbTier === "function") return window.__nbTier() || "free";
    const w = state && state.wallet && state.wallet.member;
    return w || window.__nbMember || "free";
  }
  function memberOk(need) {
    need = need || "plus";
    return (RANK[tier()] || 0) >= (RANK[need] || 1);
  }
  function deny(need) {
    const msg = (need === "patron")
      ? "Patron pass required for that lot. Member desk · 200 ink."
      : "Plus membership required to buy or enter a room. Member · 80 ink.";
    if (typeof logLine === "function") logLine(msg);
    if (window.__nbBanner) window.__nbBanner("Membership required", "warn");
    const box = document.getElementById("member-box");
    if (box) { box.classList.add("show"); if (window.__nbPaintMember) window.__nbPaintMember(); }
  }
  function injectPages() {
    if (!state || !state.pages) return;
    if (!state.pages.some(function (p) { return p.id === "street"; })) state.pages.push({ id: "street", name: "Street" });
    const home = state.pages.findIndex(function (p) { return p.id === "home"; });
    if (load() && memberOk("plus")) {
      if (home < 0) state.pages.push({ id: "home", name: "My room" });
    } else if (home >= 0) {
      state.pages.splice(home, 1);
    }
  }
  function go(id) {
    if (!state || !state.me) return;
    if (id === "home" && !memberOk("plus")) { deny("plus"); id = "street"; }
    if (id === "home" && !load()) { if (typeof logLine === "function") logLine("Buy a lot on Street first."); id = "street"; }
    state.me.page = id; state.me.x = 720; state.me.y = 640; state.me.walking = false;
    if (id === "street") {
      state.places = LOTS.map(function (l) {
        return { id: l.id, name: l.name, kind: "sign", x: l.x, y: l.y, r: 160, hint: memberOk(l.need) ? (l.cost + " ink") : (l.need + " pass") };
      });
    } else {
      state.places = [
        { id: "door", name: "Front door", kind: "sign", x: 400, y: 420, r: 140, hint: "Street." },
        { id: "wall", name: "Doodle wall", kind: "grid", x: 1600, y: 500, r: 180, hint: "Draw." }
      ];
    }
    if (typeof bakePaper === "function") bakePaper();
    if (typeof drawPages === "function") drawPages();
    if (typeof refreshWho === "function") refreshWho();
    paint();
  }
  window.goLocalPage = go;
  function buyLot(lot) {
    if (!lot) return;
    if (!memberOk(lot.need)) { deny(lot.need); return; }
    if (load()) { if (typeof logLine === "function") logLine("You already own a room."); return; }
    if (!state.wallet || state.wallet.ink < lot.cost) { if (typeof logLine === "function") logLine("Need " + lot.cost + " ink."); return; }
    if (window.payInk) payInk(-lot.cost, lot.name); else state.wallet.ink -= lot.cost;
    save({ lot: lot.id, title: lot.name, owner: state.me.name, strokes: [], stuff: [] });
    injectPages();
    if (typeof drawPages === "function") drawPages();
    go("home");
  }
  function paint() {
    const box = document.getElementById("house-panel");
    if (!box) return;
    const h = load();
    const page = state && state.me ? state.me.page : "";
    const t = tier();
    if (page === "street") {
      box.classList.add("show");
      box.innerHTML = "<b>Street</b><div class='sub'>" + (memberOk("plus") ? "One room per doodle. Pay ink." : "Look around. A Plus pass (80 ink) unlocks buying a room.") + "</div>" +
        LOTS.map(function (l) {
          const mine = h && h.lot === l.id;
          const locked = !memberOk(l.need);
          const label = mine ? "yours" : locked ? l.need + " locked" : l.cost + " ink";
          return "<button data-lot='" + l.id + "' " + (mine || locked ? "disabled" : "") + ">" + l.name + " · " + label + "</button>";
        }).join("") +
        (h && memberOk("plus") ? "<button data-home='1'>Go home</button>" : "") +
        (memberOk("plus") ? "" : "<button data-needpass='1'>Get Plus · 80 ink</button>");
      return;
    }
    if (page === "home" && h && memberOk("plus")) {
      box.classList.add("show");
      box.innerHTML = "<b>" + h.title + "</b><div class='sub'>" + House.mode + " · " + t + " · " + (h.strokes || []).length + " doodles</div>" +
        "<button data-mode='walk'>Walk</button><button data-mode='doodle'>Doodle walls</button>" +
        FURN.map(function (f) { return "<button data-furn='" + f.id + "'>" + f.name + " · " + f.cost + "</button>"; }).join("") +
        "<button data-erase='1'>Erase last doodle</button><button data-street='1'>Street</button>";
      return;
    }
    box.classList.remove("show");
  }
  window.paintHouse = paint;
  function drawFurn(g, s) {
    const x = s.x, y = s.y;
    g.strokeStyle = "#1b1b1b"; g.lineWidth = 2.4; g.beginPath();
    if (s.id === "bed") g.strokeRect(x - 40, y - 18, 80, 36);
    else if (s.id === "desk") g.strokeRect(x - 36, y - 10, 72, 20);
    else if (s.id === "plant") g.arc(x, y - 8, 12, 0, Math.PI * 2);
    else if (s.id === "lamp") { g.moveTo(x, y + 16); g.lineTo(x, y - 18); }
    else if (s.id === "rug") g.ellipse(x, y, 50, 18, 0, 0, Math.PI * 2);
    else if (s.id === "poster") g.strokeRect(x - 22, y - 28, 44, 36);
    else if (s.id === "sofa") g.strokeRect(x - 50, y - 14, 100, 28);
    g.stroke();
  }
  window.tickHouses = function () { injectPages(); };
  window.drawHouses = function (g) {
    if (!state || !state.me) return;
    if (state.me.page === "street") {
      const h = load();
      LOTS.forEach(function (lot) {
        g.strokeStyle = "#1b1b1b"; g.lineWidth = 3;
        g.strokeRect(lot.x - 90, lot.y - 80, 180, 140);
        g.beginPath(); g.moveTo(lot.x - 100, lot.y - 80); g.lineTo(lot.x, lot.y - 140); g.lineTo(lot.x + 100, lot.y - 80); g.closePath(); g.stroke();
        g.fillStyle = "#1b1b1b"; g.font = "14px Comic Sans MS, cursive"; g.textAlign = "center";
        const label = (h && h.lot === lot.id) ? "YOURS" : memberOk(lot.need) ? (lot.cost + " ink") : lot.need.toUpperCase();
        g.fillText(label, lot.x, lot.y + 80);
      });
    }
    if (state.me.page === "home" && memberOk("plus")) {
      const h = load(); if (!h) return;
      (h.strokes || []).forEach(function (s) {
        if (!s.pts || s.pts.length < 2) return;
        g.strokeStyle = s.color || "#1b1b1b"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath();
        g.moveTo(s.pts[0][0], s.pts[0][1]);
        for (let i = 1; i < s.pts.length; i++) g.lineTo(s.pts[i][0], s.pts[i][1]);
        g.stroke();
      });
      (h.stuff || []).forEach(function (s) { drawFurn(g, s); });
    }
  };
  window.houseChat = function (raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (t === "/home") {
      if (!memberOk("plus")) deny("plus");
      else if (load()) go("home");
      else if (typeof logLine === "function") logLine("Buy a lot on Street first.");
      return true;
    }
    if (t === "/street") { go("street"); return true; }
    return false;
  };
  window.tickPurpose = function (dt) { if (window.tickJobs) window.tickJobs(dt); window.tickHouses(); };
  window.drawPurpose = function (g) { window.drawHouses(g); };
  function bind() {
    const btn = document.getElementById("house-toggle");
    if (btn) btn.onclick = function () {
      if (load() && memberOk("plus")) go("home");
      else go("street");
    };
    const box = document.getElementById("house-panel");
    if (box) box.addEventListener("click", function (e) {
      const t = e.target;
      if (t.dataset.needpass) {
        if (window.__nbBuyTier) window.__nbBuyTier("plus");
        else deny("plus");
        paint();
        return;
      }
      if (t.dataset.lot) buyLot(LOTS.find(function (l) { return l.id === t.dataset.lot; }));
      if (t.dataset.home) go("home");
      if (t.dataset.street) go("street");
      if (t.dataset.mode) House.mode = t.dataset.mode;
      if (t.dataset.furn) {
        if (!memberOk("plus")) { deny("plus"); return; }
        const item = FURN.find(function (f) { return f.id === t.dataset.furn; });
        const h = load();
        if (!item || !h) return;
        if (!state.wallet || state.wallet.ink < item.cost) return;
        if (window.payInk) payInk(-item.cost, item.name);
        House.placing = item.id; House.mode = "place";
      }
      if (t.dataset.erase) { const h = load(); if (h && h.strokes && h.strokes.length) { h.strokes.pop(); save(h); } }
      paint();
    });
    const pages = document.getElementById("pages");
    if (pages) pages.addEventListener("click", function (e) {
      if (e.target.dataset.page === "home" || e.target.dataset.page === "street") go(e.target.dataset.page);
    });
    const canvas = document.getElementById("game");
    if (canvas) {
      canvas.addEventListener("mousedown", function (e) {
        if (!state || state.me.page !== "home" || !memberOk("plus")) return;
        const pt = { x: e.clientX + (state.cam.x || 0), y: e.clientY + (state.cam.y || 0) };
        if (House.mode === "place" && House.placing) {
          const h = load(); if (!h) return;
          h.stuff = h.stuff || []; h.stuff.push({ id: House.placing, x: pt.x, y: pt.y }); save(h);
          House.placing = null; House.mode = "walk"; paint(); return;
        }
        if (House.mode === "doodle") {
          House.stroke = { color: state.me.color || "#1b1b1b", pts: [[pt.x, pt.y]] };
          state.goal = null;
        }
      }, true);
      canvas.addEventListener("mousemove", function (e) {
        if (!House.stroke) return;
        House.stroke.pts.push([e.clientX + (state.cam.x || 0), e.clientY + (state.cam.y || 0)]);
      });
      addEventListener("mouseup", function () {
        if (!House.stroke) return;
        const h = load(); if (h) { h.strokes = h.strokes || []; h.strokes.push(House.stroke); save(h); }
        House.stroke = null;
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.House = House;
})();
