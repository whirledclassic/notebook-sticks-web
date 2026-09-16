/* Slim HUD: one status chip, Map panel, More overflow. */
(function () {
  const PANELS = ["look","friends","member-box","shop","game-panel","admin-box","replay-box","job-panel","house-panel","party-box","mail-box","trade-box","profile-box","store-box","more-box","studio-box","bazaar-box","where-box","pack-box","quest-box"];

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
      "<b>More</b>" +
      "<div class='sub'>Everything else lives here.</div>" +
      "<button data-jump='pose-wave'>Wave</button>" +
      "<button data-jump='pose-sit'>Sit</button>" +
      "<button data-jump='pose-dance'>Dance</button>" +
      "<button data-jump='look-toggle'>Look</button>" +
      "<button data-jump='bazaar-toggle'>Bazaar</button>" +
      "<button data-jump='friends-toggle'>Friends</button>" +
      "<button data-jump='party-toggle'>Party</button>" +
      "<button data-jump='pack-toggle'>Pack</button>" +
      "<button data-jump='quest-toggle'>Today</button>" +
      "<button data-jump='mail-toggle'>Mail</button>" +
      "<button data-jump='jobs-toggle'>Jobs</button>" +
      "<button data-jump='house-toggle'>Home</button>" +
      "<button data-jump='member-toggle'>Member</button>" +
      "<button data-jump='store-toggle'>Store</button>" +
      "<button data-jump='replay-toggle'>Replay</button>" +
      "<div class='sub'>/studio /bazaar /plaza /beach /where</div>";
  }

  function pageLabel() {
    if (typeof pageName === "function" && state && state.me) return pageName(state.me.page);
    return (state && state.me && state.me.page) || "Cover";
  }

  function paintStatus() {
    const el = document.getElementById("status");
    if (!el || typeof state === "undefined" || !state || !state.me) return;
    const spot = typeof nearestPlace === "function" ? nearestPlace() : null;
    const loot = typeof nearestToy === "function" ? nearestToy() : null;
    const n = 1 + (state.others ? state.others.size : 0);
    const party = window.Core && Core.party && Core.party.length ? " · party " + (Core.party.length + 1) : "";
    el.textContent = pageLabel() + " · " + n + " here" + party + (loot ? " · pick " + loot.drop.name : spot ? " · " + spot.name : "");
    el.title = loot ? "Talk / E picks up " + loot.drop.name : (spot ? (spot.hint || spot.name) : "Walk the page");
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
