/* Dual wallet: pencils (common) and erasers (rarer). ink stays as a pencils alias. */
(function () {
  function norm(w) {
    if (!w) w = {};
    if (w.pencils == null) w.pencils = (w.ink != null ? w.ink : 40);
    if (w.erasers == null) w.erasers = 3;
    if (w.ink != null && w.ink > (w.pencils || 0)) w.pencils = w.ink;
    w.ink = w.pencils;
    return w;
  }
  function persist() {
    if (!state || !state.wallet) return;
    norm(state.wallet);
    try {
      const name = String((state.me && state.me.name) || "doodle").toLowerCase();
      localStorage.setItem("ns-wallet:" + name, JSON.stringify(state.wallet));
    } catch (e) {}
    paint();
  }
  function paint() {
    const w = (state && state.wallet) ? norm(state.wallet) : { pencils: 0, erasers: 0 };
    const el = document.getElementById("ink");
    if (el) el.textContent = (w.pencils || 0) + " pencils · " + (w.erasers || 0) + " erasers";
  }
  function pay(pencils, erasers, reason) {
    if (!state.wallet) state.wallet = norm({});
    const w = norm(state.wallet);
    pencils = Math.round(Number(pencils) || 0);
    erasers = Math.round(Number(erasers) || 0);
    if (pencils < 0 && w.pencils + pencils < 0) return false;
    if (erasers < 0 && w.erasers + erasers < 0) return false;
    w.pencils += pencils;
    w.erasers += erasers;
    w.ink = w.pencils;
    persist();
    const bits = [];
    if (pencils) bits.push((pencils > 0 ? "+" : "") + pencils + " pencils");
    if (erasers) bits.push((erasers > 0 ? "+" : "") + erasers + " erasers");
    if (bits.length && typeof logLine === "function") logLine(bits.join(" · ") + (reason ? " · " + reason : ""));
    if (window.addPop && state.me && bits.length) addPop(state.me.x, state.me.y - 80, bits[0]);
    if (window.Sfx && (pencils > 0 || erasers > 0) && Sfx.buy) Sfx.buy();
    if (window.paintHouse) window.paintHouse();
    if (window.__nbPaintMember) window.__nbPaintMember();
    return true;
  }
  window.normWallet = norm;
  window.paintMoney = paint;
  window.payMoney = pay;
  window.payInk = function (n, reason) {
    const job = n > 0 && /run|shift|fill|hang|duty|job|mail|plot|hop/i.test(String(reason || ""));
    return pay(n, job ? 1 : 0, reason);
  };
  window.canPay = function (pencils, erasers) {
    const w = (state && state.wallet) ? norm(state.wallet) : { pencils: 0, erasers: 0 };
    return w.pencils >= (pencils || 0) && w.erasers >= (erasers || 0);
  };
  const prevApply = window.applyWallet;
  window.applyWallet = function (w) {
    const prev = (state && state.wallet) || {};
    w = w || {};
    if (w.pencils == null) w.pencils = (w.ink != null ? w.ink : (prev.pencils || 0));
    if (w.erasers == null) w.erasers = (prev.erasers != null ? prev.erasers : 3);
    w.ink = w.pencils;
    if (prevApply) prevApply(w);
    else if (state) state.wallet = w;
    paint();
  };
  window.renderInk = function () { paint(); };
  setInterval(function () {
    if (state && state.wallet) {
      norm(state.wallet);
      const el = document.getElementById("ink");
      if (el && el.textContent.indexOf("pencil") < 0) paint();
    }
  }, 400);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
