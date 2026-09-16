/* Real-money membership via Stripe Payment Links. No cards stored here. */
(function () {
  const USD = { plus: 4.99, patron: 9.99 };
  const KEY = "ns-pay-links-v1";
  function links() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function saveLinks(obj) { try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {} }
  function pending() { try { return JSON.parse(localStorage.getItem("ns-pay-pending") || "null"); } catch (e) { return null; } }
  function setPending(row) { try { localStorage.setItem("ns-pay-pending", JSON.stringify(row)); } catch (e) {} }
  function grant(tier, how) {
    if (window.__nbRedeem) window.__nbRedeem(tier === "patron" ? "PATRON" : "PLUS");
    if (typeof logLine === "function") logLine("Paid membership granted · " + tier + " · " + (how || "card"));
    if (window.__nbBanner) window.__nbBanner((tier || "plus").toUpperCase() + " unlocked", "ok");
    try { localStorage.removeItem("ns-pay-pending"); } catch (e) {}
  }
  function checkout(tier) {
    tier = tier === "patron" ? "patron" : "plus";
    const url = (links()[tier] || "").trim();
    if (!url) {
      const box = document.getElementById("store-box");
      if (box) { box.classList.add("show"); paint(); }
      if (typeof logLine === "function") logLine("Need a Stripe Payment Link. /paylink " + tier + " https://buy.stripe.com/...");
      if (window.__nbBanner) window.__nbBanner("Set a Stripe link first", "warn");
      return false;
    }
    setPending({ tier: tier, token: Math.random().toString(36).slice(2, 10), t: Date.now(), usd: USD[tier] });
    try {
      const u = new URL(url);
      u.searchParams.set("client_reference_id", (pending() && pending().token) || "nb");
      location.href = u.toString();
    } catch (e) { location.href = url; }
    return true;
  }
  function claimReturn() {
    const q = new URLSearchParams(location.search);
    const paid = (q.get("paid") || q.get("tier") || "").toLowerCase();
    const session = q.get("session_id") || "";
    const wait = pending();
    if (paid === "plus" || paid === "patron") {
      grant(paid, session ? "stripe session" : "stripe return");
      history.replaceState({}, "", location.pathname + location.hash);
      return;
    }
    if (session && wait && Date.now() - wait.t < 36e5) {
      grant(wait.tier, "stripe session");
      history.replaceState({}, "", location.pathname + location.hash);
    }
  }
  function paint() {
    const box = document.getElementById("store-box"); if (!box) return;
    const L = links();
    const t = (window.__nbTier && window.__nbTier()) || window.__nbMember || "free";
    box.innerHTML = "<b>Pass store</b><div class='sub'>Pencils stay in-world. Cards go through Stripe — we never see the number.</div>" +
      "<div class='store-card'><b>Plus</b> · $" + USD.plus.toFixed(2) +
      "<div class='sub'>Club + rooms.</div><button data-card='plus'>Pay $" + USD.plus.toFixed(2) + "</button><button data-pencils='plus'>Pay 80 pencils</button></div>" +
      "<div class='store-card'><b>Patron</b> · $" + USD.patron.toFixed(2) +
      "<div class='sub'>Club + Margin + villa.</div><button data-card='patron'>Pay $" + USD.patron.toFixed(2) + "</button><button data-pencils='patron'>Pay pencils</button></div>" +
      "<p class='fine'>Now: " + t + ". Plus link " + (L.plus ? "ready" : "missing") + " · Patron link " + (L.patron ? "ready" : "missing") + ".</p>" +
      "<p class='fine'>Stripe → Payment Link → After payment redirect to this page with ?paid=plus or ?paid=patron</p>" +
      "<input id='paylink-in' placeholder='https://buy.stripe.com/...'/>" +
      "<button data-savelink='plus'>Save Plus link</button><button data-savelink='patron'>Save Patron link</button>";
  }
  window.Pay = { checkout: checkout, grant: grant, usd: USD, paint: paint };
  window.payChat = function (raw) {
    const text = String(raw || "").trim();
    const m = text.match(/^\/paylink\s+(plus|patron)\s+(\S+)/i);
    if (m) {
      const L = links(); L[m[1].toLowerCase()] = m[2]; saveLinks(L);
      if (typeof logLine === "function") logLine("Saved " + m[1] + " payment link."); paint(); return true;
    }
    if (/^\/store$/i.test(text)) {
      const el = document.getElementById("store-box");
      if (el) { el.classList.toggle("show"); paint(); } return true;
    }
    return false;
  };
  document.addEventListener("click", function (e) {
    const t = e.target; if (!t) return;
    if (t.id === "store-toggle") {
      const el = document.getElementById("store-box");
      if (el) { el.classList.toggle("show"); paint(); }
    }
    if (t.dataset && t.dataset.card) checkout(t.dataset.card);
    if (t.dataset && t.dataset.pencils && window.__nbBuyTier) window.__nbBuyTier(t.dataset.pencils);
    if (t.dataset && t.dataset.savelink) {
      const inp = document.getElementById("paylink-in");
      const url = inp && inp.value.trim();
      if (!url || url.indexOf("http") !== 0) return;
      const L = links(); L[t.dataset.savelink] = url; saveLinks(L); paint();
    }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { claimReturn(); paint(); });
  else { claimReturn(); paint(); }
})();
