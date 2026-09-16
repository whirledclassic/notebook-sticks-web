/* Membership checkout in pencils / erasers. */
(function () {
  const CODES = { PLUS: "plus", MEMBER: "plus", STICKPLUS: "plus", PATRON: "patron", GOLD: "patron" };
  const COST = { plus: 80, patron: 200 };
  const ERASERS = { plus: 0, patron: 4 };
  const RANK = { free: 0, plus: 1, patron: 2 };
  function readLoose() { try { return localStorage.getItem("ns-member") || "free"; } catch (e) { return "free"; } }
  function tier() {
    const acc = window.Account && Account.current && Account.current.member;
    const wal = (typeof state !== "undefined" && state.wallet && state.wallet.member);
    const loose = window.__nbMember || readLoose();
    const list = [acc, wal, loose].filter(Boolean);
    let best = "free";
    list.forEach(function (t) { if ((RANK[t] || 0) > (RANK[best] || 0)) best = t; });
    return best;
  }
  function receipts() { try { return JSON.parse(localStorage.getItem("ns-pay-log") || "[]"); } catch (e) { return []; } }
  function noteReceipt(row) {
    const log = receipts(); log.unshift(row);
    try { localStorage.setItem("ns-pay-log", JSON.stringify(log.slice(0, 20))); } catch (e) {}
  }
  function persistWalletMember(t) {
    if (typeof state !== "undefined" && state.wallet) {
      state.wallet.member = t;
      if (state.me) state.me.member = t;
      try { localStorage.setItem("ns-wallet:" + (state.me && state.me.name || "doodle").toLowerCase(), JSON.stringify(state.wallet)); } catch (e) {}
    }
    try { localStorage.setItem("ns-member", t); } catch (e) {}
    if (window.Account && Account.current) { Account.current.member = t; Account.current.memberAt = Date.now(); Account.flush(); }
    window.__nbMember = t;
  }
  function grantLook(t) {
    if (typeof state === "undefined" || !state.wallet) return;
    const w = state.wallet;
    w.hats = w.hats || []; w.extras = w.extras || []; w.colors = w.colors || [];
    if (RANK[t] >= 1) { if (w.hats.indexOf("ribbon") < 0) w.hats.push("ribbon"); if (w.extras.indexOf("pin") < 0) w.extras.push("pin"); }
    if (RANK[t] >= 2) { if (w.hats.indexOf("star") < 0) w.hats.push("star"); if (w.hats.indexOf("crown") < 0) w.hats.push("crown"); if (w.colors.indexOf("#c9a227") < 0) w.colors.push("#c9a227"); }
  }
  function setTier(t, how) {
    if (!RANK[t]) t = "free";
    persistWalletMember(t); grantLook(t);
    if (window.applyWallet && state.wallet) applyWallet(state.wallet);
    if (typeof net === "function") net({ type: "member", tier: t });
    paint();
    if (typeof logLine === "function") logLine("Membership is now " + t + (how ? " · " + how : "") + ".");
    if (window.__nbBanner) window.__nbBanner(t === "free" ? "Back to free" : t.toUpperCase() + " is active", "ok");
    return t;
  }
  function pencils() { const w = state && state.wallet; if (!w) return 0; return (w.pencils != null ? w.pencils : w.ink) || 0; }
  function erasers() { const w = state && state.wallet; return (w && w.erasers) || 0; }
  function checkout(t) {
    t = t === "patron" ? "patron" : "plus";
    if ((RANK[tier()] || 0) >= RANK[t]) { if (typeof logLine === "function") logLine("Already " + tier() + "."); return false; }
    const cost = COST[t], rub = ERASERS[t] || 0;
    if (pencils() < cost || erasers() < rub) {
      if (typeof logLine === "function") logLine("Need " + cost + " pencils" + (rub ? " and " + rub + " erasers" : "") + " for " + t + ".");
      if (window.__nbBanner) window.__nbBanner("Not enough pencils/erasers", "warn");
      return false;
    }
    if (window.payMoney) payMoney(-cost, -rub, t + " pass");
    else if (window.payInk) payInk(-cost, t + " pass");
    else if (state.wallet) state.wallet.ink -= cost;
    noteReceipt({ t: Date.now(), tier: t, cost: cost, erasers: rub });
    setTier(t, cost + " pencils");
    return true;
  }
  function paint() {
    const t = tier(); window.__nbMember = t;
    const badge = document.getElementById("member-badge");
    if (badge) { badge.textContent = t; badge.dataset.tier = t; }
    const box = document.getElementById("member-box"); if (!box) return;
    const log = receipts().slice(0, 3).map(function (r) { return "<div class='sub'>" + (r.tier || "") + " · " + (r.cost || 0) + " pencils</div>"; }).join("");
    if (t === "patron") { box.innerHTML = "<b>Patron pass</b><div class='sub'>Club + Margin · +8 pencils/min</div>" + log; return; }
    if (t === "plus") { box.innerHTML = "<b>Plus pass</b><div class='sub'>Club · ribbon + pin · +4 pencils/min</div><button data-pay='patron'>Upgrade Patron · 200 pencils + 4 erasers</button>" + log; return; }
    box.innerHTML = "<b>Membership desk</b><div class='sub'>Pencils checkout. Rooms need Plus.</div><button data-pay='plus'>Buy Plus · 80 pencils</button><button data-pay='patron'>Buy Patron · 200 pencils + 4 erasers</button><p class='fine'>" + pencils() + " pencils · " + erasers() + " erasers</p>" + log;
  }
  window.__nbPaintMember = paint; window.__nbMember = tier();
  window.__nbRedeem = function (code) {
    const t = CODES[String(code || "").trim().toUpperCase()];
    if (!t) return false;
    noteReceipt({ t: Date.now(), tier: t, cost: 0 }); setTier(t, "code"); return t;
  };
  window.__nbBuyTier = function (t) { return checkout(t); };
  window.__nbTier = tier;
  window.memberChat = function (raw) {
    const text = String(raw || "").trim();
    const m = text.match(/^\/member(?:\s+(\S+))?$/i);
    if (!m) return false;
    if (!m[1]) { paint(); const box = document.getElementById("member-box"); if (box) box.classList.add("show"); return true; }
    if (!window.__nbRedeem(m[1]) && typeof logLine === "function") logLine("Try /member PLUS or /member PATRON");
    return true;
  };
  document.addEventListener("click", function (e) {
    const t = e.target; if (!t) return;
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
