/* Paid shifts. Earn ink for clothes and a room. */
(function () {
  const JOBS = [
    { id: "mail", name: "Mail run", page: "pocket", pay: [12, 20], blurb: "Stamp matching envelopes.", need: 6 },
    { id: "plot", name: "Plot shift", page: "graph", pay: [14, 24], blurb: "Tap 1 through 8.", need: 8 },
    { id: "drip", name: "Ink fill", page: "shop", pay: [10, 18], blurb: "Catch drips.", need: 8 },
    { id: "hang", name: "Gallery hang", page: "gallery", pay: [12, 22], blurb: "Match frames to walls.", need: 4 },
    { id: "hop", name: "Hop duty", page: "cover", pay: [10, 16], blurb: "Hit the lit square.", need: 10 }
  ];
  const CLOTHES = [
    { kind: "hat", id: "beanie", name: "Beanie", cost: 32 },
    { kind: "hat", id: "visor", name: "Visor", cost: 28 },
    { kind: "hat", id: "bandana", name: "Bandana", cost: 26 },
    { kind: "extra", id: "apron", name: "Work apron", cost: 40 },
    { kind: "extra", id: "vest", name: "Vest", cost: 45 },
    { kind: "extra", id: "headphones", name: "Headphones", cost: 38 },
    { kind: "extra", id: "boots", name: "Boots", cost: 36 },
    { kind: "extra", id: "tail", name: "Ink tail", cost: 50 }
  ];
  const SPOTS = {
    cover: { id: "jobs", name: "Job board", kind: "sign", x: 980, y: 420, r: 140, hint: "Work a shift." },
    pocket: { id: "mailjob", name: "Mail desk", kind: "stamp", x: 900, y: 900, r: 150, hint: "Mail run." },
    graph: { id: "plotjob", name: "Plot shift", kind: "origin", x: 900, y: 520, r: 150, hint: "Plot numbers." },
    shop: { id: "dripjob", name: "Ink vat", kind: "counter", x: 1400, y: 1300, r: 150, hint: "Catch drips." },
    gallery: { id: "hangjob", name: "Hang line", kind: "frame", x: 900, y: 1100, r: 150, hint: "Hang frames." }
  };
  const Jobs = { cur: null };
  function key() { return String((state && state.me && state.me.name) || "doodle").toLowerCase().slice(0, 16); }
  function persist() {
    if (!state || !state.wallet) return;
    try { localStorage.setItem("ns-wallet:" + key(), JSON.stringify(state.wallet)); } catch (e) {}
    if (window.applyWallet) applyWallet(state.wallet);
    else if (window.renderInk) renderInk();
  }
  function payInk(n, reason) {
    n = Math.round(Number(n) || 0);
    if (!state.wallet) state.wallet = { ink: 40, hats: [], colors: [], extras: ["none"], stamps: [], member: "free" };
    state.wallet.ink = Math.max(0, (state.wallet.ink || 0) + n);
    persist();
    if (typeof logLine === "function") logLine((n >= 0 ? "+" : "") + n + " ink" + (reason ? " · " + reason : ""));
    if (window.addPop && state.me) addPop(state.me.x, state.me.y - 80, (n >= 0 ? "+" : "") + n);
    if (window.Sfx && n > 0 && Sfx.buy) Sfx.buy();
    paint();
    if (window.paintHouse) window.paintHouse();
    return true;
  }
  window.payInk = payInk;
  function owned(kind, id) {
    const w = (state && state.wallet) || {};
    const bag = kind === "hat" ? w.hats : kind === "extra" ? w.extras : w.colors;
    return (bag || []).indexOf(id) >= 0;
  }
  function buyItem(item) {
    if (!item || owned(item.kind, item.id)) return;
    if ((state.wallet.ink || 0) < item.cost) { if (typeof logLine === "function") logLine("Need " + item.cost + " ink."); return; }
    payInk(-item.cost, item.name);
    const bag = item.kind === "hat" ? "hats" : item.kind === "extra" ? "extras" : "colors";
    state.wallet[bag] = state.wallet[bag] || [];
    state.wallet[bag].push(item.id);
    persist();
  }
  function inject() {
    if (!state || !state.me || !state.places) return;
    const pl = SPOTS[state.me.page];
    if (pl && !state.places.some(function (p) { return p.id === pl.id; })) state.places.push(pl);
  }
  function start(def) {
    if (!def) return;
    const job = { def: def, t: 18, score: 0, need: def.need, items: [], step: 1 };
    if (def.id === "mail") {
      const c = ["#c23b22", "#2b6cb0", "#2f855a", "#b7791f", "#6b46c1"];
      job.target = c[Math.floor(Math.random() * c.length)];
      job.items = c.concat(c.slice(0, 3)).map(function (col) { return { c: col, done: false }; });
    }
    if (def.id === "drip") job.items = [{ life: 1, x: 40 }];
    if (def.id === "hang") { job.held = null; job.slots = [null, null, null, null]; job.labels = ["A", "B", "C", "D"]; }
    if (def.id === "hop") job.lit = 0;
    Jobs.cur = job;
    paint();
    const box = document.getElementById("job-panel");
    if (box) box.classList.add("show");
  }
  function end(ok) {
    const job = Jobs.cur; Jobs.cur = null;
    if (ok && job) {
      const pay = Math.min(job.def.pay[1], job.def.pay[0] + Math.round((job.score || 0) * 1.1));
      payInk(pay, job.def.name);
    } else if (job && typeof logLine === "function") logLine("Shift over.");
    paint();
  }
  function paint() {
    const box = document.getElementById("job-panel");
    if (!box) return;
    const job = Jobs.cur;
    if (!job) {
      const page = state && state.me ? state.me.page : "";
      box.innerHTML = "<b>Jobs</b><div class='sub'>Work. Earn ink. Buy clothes and a room.</div>" +
        JOBS.map(function (j) {
          return "<button data-start='" + j.id + "'>" + j.name + " · " + j.pay[0] + "–" + j.pay[1] + " · " + j.page + (j.page === page ? " · here" : "") + "</button>";
        }).join("");
      return;
    }
    let html = "<b>" + job.def.name + "</b><div class='sub'>" + job.def.blurb + " · " + Math.ceil(Math.max(0, job.t)) + "s · " + job.score + "/" + job.need + "</div>";
    if (job.def.id === "mail") {
      html += "<div class='job-row'>";
      job.items.forEach(function (it, i) {
        html += "<button data-mail='" + i + "' " + (it.done ? "disabled" : "") + " style='color:" + it.c + "'>✉</button>";
      });
      html += "</div>";
    }
    if (job.def.id === "plot") {
      html += "<div class='job-row'>";
      for (let n = 1; n <= 8; n++) html += "<button data-plot='" + n + "'>" + n + "</button>";
      html += "</div>";
    }
    if (job.def.id === "drip") {
      html += "<div class='drip-stage'>";
      job.items.forEach(function (d, i) {
        html += "<button class='drip' data-drip='" + i + "' style='left:" + d.x + "%'>•</button>";
      });
      html += "</div>";
    }
    if (job.def.id === "hang") {
      html += "<div class='job-row'>";
      ["A", "B", "C", "D"].forEach(function (lab) { html += "<button data-hold='" + lab + "'>Frame " + lab + "</button>"; });
      html += "</div><div class='job-row'>";
      ["A", "B", "C", "D"].forEach(function (lab, i) { html += "<button data-slot='" + i + "'>Wall " + lab + "</button>"; });
      html += "</div>";
    }
    if (job.def.id === "hop") {
      html += "<div class='job-row hop-row'>";
      for (let i = 0; i < 4; i++) html += "<button data-hop='" + i + "' class='" + (job.lit === i ? "on" : "") + "'>" + (i + 1) + "</button>";
      html += "</div>";
    }
    html += "<button data-quit='1'>Clock out</button>";
    box.innerHTML = html;
  }
  function click(e) {
    const t = e.target, job = Jobs.cur;
    if (t.dataset.start) { start(JOBS.find(function (j) { return j.id === t.dataset.start; })); return; }
    if (t.dataset.quit) { end(false); return; }
    if (!job) return;
    if (t.dataset.mail != null) {
      const it = job.items[Number(t.dataset.mail)];
      if (!it || it.done) return;
      if (it.c === job.target) { it.done = true; job.score++; } else job.t -= 1.4;
      if (job.score >= job.need) end(true); else paint();
    }
    if (t.dataset.plot) {
      if (Number(t.dataset.plot) === job.step) { job.step++; job.score++; } else job.t -= 1;
      if (job.step > 8) end(true); else paint();
    }
    if (t.dataset.drip != null) {
      job.items.splice(Number(t.dataset.drip), 1); job.score++;
      if (job.score >= job.need) end(true); else paint();
    }
    if (t.dataset.hold) job.held = t.dataset.hold;
    if (t.dataset.slot != null && job.held) {
      const i = Number(t.dataset.slot);
      if (job.labels[i] === job.held) job.score++;
      job.slots[i] = job.held; job.held = null;
      if (job.slots.every(Boolean)) end(job.score >= 3); else paint();
    }
    if (t.dataset.hop != null) {
      if (Number(t.dataset.hop) === job.lit) { job.score++; job.lit = Math.floor(Math.random() * 4); } else job.t -= 1;
      if (job.score >= job.need) end(true); else paint();
    }
  }
  window.tickJobs = function (dt) {
    inject();
    const job = Jobs.cur;
    if (job) {
      job.t -= dt || 0.016;
      if (job.def.id === "drip") {
        job.items.forEach(function (d) { d.life -= 0.4 * (dt || 0.016); });
        job.items = job.items.filter(function (d) { return d.life > 0; });
        if (!job.items.length) job.items.push({ life: 1, x: 20 + Math.random() * 70 });
      }
      if (job.t <= 0) end(job.score >= Math.ceil(job.need * 0.6));
    }
    if (typeof extraPath === "function" && !extraPath.__j) {
      const orig = extraPath;
      window.extraPath = function (g, extra, sit) {
        if (extra === "apron") { g.beginPath(); g.moveTo(-10, -40 + sit); g.lineTo(10, -40 + sit); g.lineTo(8, -8 + sit); g.lineTo(-8, -8 + sit); g.closePath(); g.stroke(); return; }
        if (extra === "vest") { g.beginPath(); g.moveTo(-11, -40 + sit); g.lineTo(-8, -8 + sit); g.moveTo(11, -40 + sit); g.lineTo(8, -8 + sit); g.stroke(); return; }
        if (extra === "headphones") { g.beginPath(); g.arc(-14, -56 + sit, 5, 0, Math.PI * 2); g.arc(14, -56 + sit, 5, 0, Math.PI * 2); g.moveTo(-14, -62 + sit); g.quadraticCurveTo(0, -74 + sit, 14, -62 + sit); g.stroke(); return; }
        if (extra === "boots") { g.beginPath(); g.strokeRect(-16, 10 + sit, 10, 8); g.strokeRect(6, 10 + sit, 10, 8); return; }
        if (extra === "tail") { g.beginPath(); g.moveTo(0, -8 + sit); g.quadraticCurveTo(18, 4 + sit, 16, 18 + sit); g.stroke(); return; }
        orig(g, extra, sit);
      };
      extraPath.__j = true;
    }
    if (typeof hat === "function" && !hat.__j) {
      const origH = hat;
      window.hat = function (g, kind, sit) {
        const y = -68 + sit;
        if (kind === "beanie") { g.beginPath(); g.arc(0, y + 6, 14, Math.PI, 0); g.stroke(); return; }
        if (kind === "visor") { g.beginPath(); g.moveTo(-16, y + 4); g.lineTo(18, y + 4); g.stroke(); return; }
        if (kind === "bandana") { g.beginPath(); g.moveTo(-14, y + 6); g.lineTo(14, y + 6); g.stroke(); return; }
        origH(g, kind, sit);
      };
      hat.__j = true;
    }
    if (typeof HATS !== "undefined") ["beanie", "visor", "bandana"].forEach(function (h) { if (HATS.indexOf(h) < 0) HATS.push(h); });
    if (typeof EXTRAS !== "undefined") ["apron", "vest", "headphones", "boots", "tail"].forEach(function (h) { if (EXTRAS.indexOf(h) < 0) EXTRAS.push(h); });
    if (typeof renderShop === "function" && !renderShop.__j) {
      const origS = renderShop;
      window.renderShop = function () {
        origS();
        const box = document.getElementById("shop");
        if (!box || !box.classList.contains("show")) return;
        box.insertAdjacentHTML("beforeend", "<div class='sub'>Work clothes</div>" + CLOTHES.map(function (it) {
          const have = owned(it.kind, it.id);
          return "<button data-cloth='" + it.id + "' " + (have ? "disabled" : "") + ">" + it.name + " · " + (have ? "yours" : it.cost + " ink") + "</button>";
        }).join(""));
      };
      renderShop.__j = true;
      const shop = document.getElementById("shop");
      if (shop) shop.addEventListener("click", function (e) {
        const id = e.target.dataset.cloth;
        if (!id) return;
        buyItem(CLOTHES.find(function (c) { return c.id === id; }));
        renderShop();
      });
    }
  };
  window.purposeChat = function (raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (t === "/job" || t === "/jobs") {
      const el = document.getElementById("job-panel");
      if (el) { el.classList.toggle("show"); paint(); }
      return true;
    }
    if (t === "/home" || t === "/street") return window.houseChat ? window.houseChat(raw) : false;
    return false;
  };
  function bind() {
    const btn = document.getElementById("jobs-toggle");
    if (btn) btn.onclick = function () {
      const el = document.getElementById("job-panel");
      if (!el) return;
      el.classList.toggle("show");
      paint();
    };
    const box = document.getElementById("job-panel");
    if (box) box.addEventListener("click", click);
    addEventListener("keydown", function (e) {
      if (!state || state.chatting || document.activeElement && document.activeElement.id === "chat") return;
      if (e.key.toLowerCase() !== "e") return;
      const pl = SPOTS[state.me.page];
      if (!pl) return;
      const d = Math.hypot(pl.x - state.me.x, pl.y - state.me.y);
      if (d < pl.r) start(JOBS.find(function (j) { return j.page === state.me.page; }) || JOBS[0]);
    });
    paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.Jobs = Jobs;
})();
