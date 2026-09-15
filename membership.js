/* Basic memberships: free, plus, patron. Codes or ink. No payment backend. */
(function () {
  const CODES = { PLUS: "plus", MEMBER: "plus", STICKPLUS: "plus", PATRON: "patron", GOLD: "patron" };
  function tier() {
    try { return localStorage.getItem("ns-member") || "free"; } catch (e) { return "free"; }
  }
  function setTier(t) {
    try { localStorage.setItem("ns-member", t); } catch (e) {}
    window.__nbMember = t;
    paint();
    if (typeof net === "function") net({ type: "member", tier: t });
  }
  function paint() {
    const t = window.__nbMember || tier();
    const badge = document.getElementById("member-badge");
    if (badge) {
      badge.textContent = t === "patron" ? "patron" : t === "plus" ? "plus" : "free";
      badge.dataset.tier = t;
    }
    const box = document.getElementById("member-box");
    if (!box) return;
    if (t === "patron") {
      box.innerHTML = "<b>Patron</b><div class='sub'>Club + Margin. +8 ink / min. Star hat, gold ink. Club stamps +5 bonus.</div>";
      return;
    }
    if (t === "plus") {
      box.innerHTML = "<b>Plus member</b><div class='sub'>Club page. Ribbon + pin. +4 ink / min. Club stamps +5 bonus.</div><button data-up='patron'>Upgrade to Patron · 200 ink</button><p class='fine'>Or chat /member PATRON</p>";
      return;
    }
    box.innerHTML = "<b>Membership</b><div class='sub'>Club lounge is members-only. Walk the member desk on Cover.</div><button data-up='plus'>Join Plus · 80 ink</button><button data-up='patron'>Join Patron · 200 ink</button><p class='fine'>Or chat /member PLUS or /member PATRON</p>";
  }
  window.__nbPaintMember = paint;
  window.__nbMember = tier();
  window.__nbRedeem = function (code) {
    const t = CODES[String(code || "").trim().toUpperCase()];
    if (!t) return false;
    setTier(t);
    return t;
  };
  window.__nbBuyTier = function (t) {
    if (typeof net === "function") net({ type: "memberbuy", tier: t });
    else setTier(t);
  };
  document.addEventListener("click", function (e) {
    const up = e.target && e.target.dataset && e.target.dataset.up;
    if (up) window.__nbBuyTier(up);
    if (e.target && e.target.id === "member-toggle") {
      const box = document.getElementById("member-box");
      if (box) box.classList.toggle("show");
    }
    if (e.target && e.target.id === "member-badge") {
      const box = document.getElementById("member-box");
      if (box) box.classList.toggle("show");
    }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
