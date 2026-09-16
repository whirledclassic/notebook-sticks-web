/* Make existing controls actually do the obvious thing. */
(function () {
  const PAGES = [
    ["cover", "Cover"], ["plaza", "Plaza"], ["park", "Park"], ["cafe", "Cafe"],
    ["library", "Library"], ["arcade", "Arcade"], ["beach", "Beach"],
    ["studio", "Studio"], ["bazaar", "Bazaar"], ["club", "Club"]
  ];

  function closeAll(keep) {
    if (window.closeHudPanels) closeHudPanels(keep || "");
  }

  function paintGo() {
    const box = document.getElementById("where-box");
    if (!box) return;
    const cur = state && state.me && state.me.page;
    const extra = (state && state.pages || []).filter(function (p) {
      return !PAGES.some(function (x) { return x[0] === p.id; });
    });
    box.innerHTML =
      "<b>Go</b>" +
      "<div class='sub'>Tap a page.</div>" +
      PAGES.map(function (p) {
        return "<button data-gopage='" + p[0] + "' class='" + (p[0] === cur ? "on" : "") + "'>" + p[1] + "</button>";
      }).join("") +
      (extra.length ? extra.map(function (p) {
        return "<button data-gopage='" + p.id + "' class='" + (p.id === cur ? "on" : "") + "'>" + p.name + "</button>";
      }).join("") : "") +
      "<div class='sub'>Walk, or type /plaza</div>";
  }

  function goPage(id) {
    if (!id || typeof net !== "function") return;
    net({ type: "page", page: id });
    closeAll("");
  }

  function doUse() {
    if (window.pickToy && window.nearestToy && nearestToy()) { pickToy(); return true; }
    if (window.useNearestRoom && window.nearestRoomProp && nearestRoomProp()) { useNearestRoom(); return true; }
    if (typeof setPose === "function" && state && state.me && state.places) {
      const bench = state.places.find(function (pl) {
        return pl.kind === "bench" && Math.hypot(pl.x - state.me.x, pl.y - state.me.y) < 90;
      });
      if (bench) {
        setPose(state.me.pose === "sit" ? "stand" : "sit");
        return true;
      }
    }
    const talk = document.getElementById("interact-toggle");
    if (talk) talk.click();
    return false;
  }

  window.tickFix = function () {
    if (typeof renderInk === "function") renderInk();
  };

  document.addEventListener("click", function (e) {
    const t = e.target;
    if (!t) return;
    if (t.id === "where-toggle") {
      const box = document.getElementById("where-box");
      if (!box) return;
      const on = !box.classList.contains("show");
      closeAll(on ? "where-box" : "");
      box.classList.toggle("show", on);
      if (on) paintGo();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    if (t.id === "status") {
      const btn = document.getElementById("where-toggle");
      if (btn) btn.click();
    }
    if (t.dataset && t.dataset.gopage) {
      goPage(t.dataset.gopage);
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, true);

  addEventListener("keydown", function (e) {
    if (!state || !state.me) return;
    if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
    if (e.key === "e" || e.key === "E") {
      doUse();
    }
  });

  window.paintGo = paintGo;
  window.fixUse = doUse;
})();
