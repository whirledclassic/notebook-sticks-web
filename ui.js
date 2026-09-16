/* Basic HUD: Go, Draw, Me, Menu. One status word. */
(function () {
  const PANELS = ["look","friends","member-box","shop","game-panel","admin-box","replay-box","job-panel","house-panel","party-box","mail-box","trade-box","profile-box","store-box","more-box","studio-box","bazaar-box","where-box","pack-box","quest-box","club-box","board-box","notes-box"];

  function closePanels(except) {
    PANELS.forEach(function (id) {
      if (id === except) return;
      const el = document.getElementById(id);
      if (el) el.classList.remove("show");
    });
    if (except !== "look" && typeof state !== "undefined" && state) state.lookOpen = false;
  }

  function paintMore() {
    const box = document.getElementById("more-box"); if (!box) return;
    box.innerHTML =
      "<b>Menu</b>" +
      "<div class='sub'>Do</div>" +
      "<button data-jump='pose-wave'>Wave</button>" +
      "<button data-jump='pose-sit'>Sit</button>" +
      "<button data-jump='pose-dance'>Dance</button>" +
      "<div class='sub'>People</div>" +
      "<button data-jump='friends-toggle'>Friends</button>" +
      "<button data-jump='party-toggle'>Party</button>" +
      "<button data-jump='club-toggle'>Club</button>" +
      "<div class='sub'>Stuff</div>" +
      "<button data-jump='pack-toggle'>Bag</button>" +
      "<button data-jump='bazaar-toggle'>Shop</button>" +
      "<button data-jump='sfx-toggle'>Sound</button>";
  }

  function pageLabel() {
    if (typeof pageName === "function" && state && state.me) return pageName(state.me.page);
    return (state && state.me && state.me.page) || "Cover";
  }

  function paintStatus() {
    const el = document.getElementById("status");
    if (!el || typeof state === "undefined" || !state || !state.me) return;
    const loot = typeof nearestToy === "function" ? nearestToy() : null;
    const prop = window.nearestRoomProp ? nearestRoomProp() : null;
    if (loot) el.textContent = "Pick up " + loot.drop.name;
    else if (prop) el.textContent = "Use " + prop.label;
    else el.textContent = pageLabel();
  }

  function layout() {
    document.body.classList.toggle("phone", innerWidth < 820 || matchMedia("(pointer:coarse)").matches);
  }

  const prevRefresh = window.refreshWho;
  window.refreshWho = function () {
    if (typeof prevRefresh === "function") prevRefresh();
    paintStatus();
  };

  document.addEventListener("click", function (e) {
    const t = e.target; if (!t) return;
    if (t.id === "more-toggle") {
      const box = document.getElementById("more-box"); if (!box) return;
      const on = !box.classList.contains("show");
      closePanels(on ? "more-box" : "");
      box.classList.toggle("show", on);
      paintMore();
    }
    if (t.id === "where-toggle") closePanels("where-box");
    if (t.id === "studio-toggle") closePanels("studio-box");
    if (t.id === "profile-toggle") closePanels("profile-box");
    if (t.dataset && t.dataset.jump) {
      const more = document.getElementById("more-box");
      if (more) more.classList.remove("show");
      const btn = document.getElementById(t.dataset.jump);
      if (btn) btn.click();
    }
  }, true);

  addEventListener("resize", layout);
  addEventListener("orientationchange", layout);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", layout);
  else layout();
  setInterval(paintStatus, 700);
  window.closeHudPanels = closePanels;
})();
