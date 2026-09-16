/* Membership + ink checkout. Writes account, wallet, and badge together. */
(function () {
  const CODES = { PLUS: "plus", MEMBER: "plus", STICKPLUS: "plus", PATRON: "patron", GOLD: "patron" };
  const COST = { plus: 80, patron: 200 };
  const RANK = { free: 0, plus: 1, patron: 2 };
  function readLoose() {
    try { return localStorage.getItem("ns-member") || "free"; } catch (e) { return "free"; }
  }
  function tier() {
    const acc = window.Account && Account.current && Account.current.member;
    const wal = (typeof state !== "undefined" && state.wallet && state.wallet.member);
    const loose = window.__nbMember || readLoose();
    const list = [acc, wal, loose].filter(Boolean);
    let best = "free";
    list.forEach(function (t) { if ((RANK[t] || 0) > (RANK[best] || 0)) best = t; });
    return best;
  }
  function receipts() {
    try { return JSON.parse(localStorage.getItem("ns-pay-log") || "[]"); } catch (e) { return []; }
  }
  function noteReceipt(row) {
    const log = receipts(); log.unshift(row);
    try { localStorage.setItem("ns-pay-log", JSON.stringify(log.slice(0, 20))); } catch (e) {}
  }
  function persistWalletMember(t) {
    if (typeof state !== "undefined" && state.wallet) {
      state.wallet.member = t;
      if (state.me) state.me.member = t;
      try {
        const name = (state.me && state.me.name || "doodle").toLowerCase();
        localStorage.setItem("ns-wallet:" + name, JSON.stringify(state.wallet));
      } catch (e) {}
    }
    try { localStorage.setItem("ns-member", t); } catch (e) {}
    if (window.Account && Account.current) {
      Account.current.member = t;
      Account.current.memberAt = Date.now();
      Account.flush();
    }
    window.__nbMember = t;
  }
  function grantLook(t) {
    if (typeof state === "undefined" || !state.wallet) return;
    const w = state.wallet;
    w.hats = w.hats || []; w.extras = w.extras || []; w.colors = w.colors || [];
    if (RANK[t] >= 1) {
      if (w.hats.indexOf("ribbon") < 0) w.hats.push("ribbon");
      if (w.extras.indexOf("pin") < 0) w.extras.push("pin");
    }
    if (RANK[t] >= 2) {
      if (w.hats.indexOf("star") < 0) w.hats.push("star");
      if (w.hats.indexOf("crown") < 0) w.hats.push("crown");
      if (w.colors.indexOf("#c9a227") < 0) w.colors.push("#c9a227");
    }
  }
  function setTier(t, how) {
    if (!RANK[t]) t = "free";
    persistWalletMember(t);
    grantLook(t);
    if (window.applyWallet && state.wallet) applyWallet(state.wallet);
    if (typeof net === "function") net({ type: "member", tier: t });
    paint();
    if (typeof logLine === "function") logLine("Membership is now " + t + (how ? " · " + how : "") + ".");
    if (window.__nbBanner) window.__nbBanner(t === "free" ? "Back to free" : t.toUpperCase() + " is active", "ok");
    return t;
  }
  function ink() { return (typeof state !== "undefined" && state.wallet && state.wallet.ink) || 0; }
  function checkout(t) {
    t = t === "patron" ? "patron" : "plus";
    const have = RANK[tier()] || 0;
    if (have >= RANK[t]) { if (typeof logLine === "function") logLine("Already " + tier() + "."); return false; }
    const cost = COST[t];
    if (ink() < cost) {
      if (typeof logLine === "function") logLine("Need " + cost + " ink for " + t + ". Work a job.");
      if (window.__nbBanner) window.__nbBanner("Not enough ink · " + cost + " needed", "warn");
      return false;
    }
    if (window.payInk) payInk(-cost, t + " pass");
    else if (state.wallet) state.wallet.ink -= cost;
    noteReceipt({ t: Date.now(), tier: t, cost: cost, name: state && state.me && state.me.name });
    setTier(t, cost + " ink");
    return true;
  }
  function paint() {
    const t = tier();
    window.__nbMember = t;
    const badge = document.getElementById("member-badge");
    if (badge) { badge.textContent = t; badge.dataset.tier = t; }
    const box = document.getElementById("member-box");
    if (!box) return;
    const log = receipts().slice(0, 3).map(function (r) {
      return "<div class='sub'>" + (r.tier || "") + " · " + (r.cost || 0) + " ink</div>";
    }).join("");
    if (t === "patron") {
      box.innerHTML = "<b>Patron pass</b><div class='sub'>Club + Margin · +8 ink/min · star hat · gold ink</div><div class='sub'>Active on this doodle after refresh.</div>" + log;
      return;
    }
    if (t === "plus") {
      box.innerHTML = "<b>Plus pass</b><div class='sub'>Club · ribbon + pin · +4 ink/min</div><button data-pay='patron'>Upgrade Patron · 200 ink</button><p class='fine'>Code: /member PATRON</p>" + log;
      return;
    }
    box.innerHTML = "<b>Membership desk</b><div class='sub'>Ink checkout. Club needs Plus. Margin needs Patron.</div><button data-pay='plus'>Buy Plus · 80 ink</button><button data-pay='patron'>Buy Patron · 200 ink</button><p class='fine'>Or /member PLUS · you have " + ink() + " ink</p>" + log;
  }
  window.__nbPaintMember = paint;
  window.__nbMember = tier();
  window.__nbRedeem = function (code) {
    const t = CODES[String(code || "").trim().toUpperCase()];
    if (!t) return false;
    noteReceipt({ t: Date.now(), tier: t, cost: 0, name: "code" });
    setTier(t, "code");
    return t;
  };
  window.__nbBuyTier = function (t) { return checkout(t); };
  window.__nbTier = tier;
  window.memberChat = function (raw) {
    const text = String(raw || "").trim();
    const m = text.match(/^\/member(?:\s+(\S+))?$/i);
    if (!m) return false;
    if (!m[1]) { paint(); const box = document.getElementById("member-box"); if (box) box.classList.add("show"); return true; }
    const ok = window.__nbRedeem(m[1]);
    if (!ok && typeof logLine === "function") logLine("Try /member PLUS or /member PATRON");
    return true;
  };
  document.addEventListener("click", function (e) {
    const t = e.target;
    if (!t) return;
    if (t.dataset && t.dataset.pay) checkout(t.dataset.pay);
    if (t.dataset && t.dataset.up) checkout(t.dataset.up);
    if (t.id === "member-toggle" || t.id === "member-badge") {
      const box = document.getElementById("member-box");
      if (box) { box.classList.toggle("show"); if (box.classList.contains("show")) paint(); }
    }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
