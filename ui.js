/* Mobile HUD, more-menu, exclusive panels. */
(function () {
  function isPhone() { return innerWidth < 820 || matchMedia("(pointer:coarse)").matches; }
  function closePanels(except) {
    ["look","friends","member-box","shop","game-panel","admin-box","replay-box","job-panel","house-panel","party-box","mail-box","trade-box","profile-box","store-box","more-box"].forEach(function (id) {
      if (id === except) return;
      const el = document.getElementById(id);
      if (el) el.classList.remove("show");
    });
  }
  function paintMore() {
    const box = document.getElementById("more-box"); if (!box) return;
    box.innerHTML = "<b>More</b>" +
      "<button data-jump='jobs-toggle'>Jobs</button>" +
      "<button data-jump='house-toggle'>Home</button>" +
      "<button data-jump='party-toggle'>Party</button>" +
      "<button data-jump='mail-toggle'>Mail</button>" +
      "<button data-jump='replay-toggle'>Replay</button>" +
      "<button data-jump='store-toggle'>Store $</button>" +
      "<button data-jump='member-toggle'>Member</button>" +
      "<button data-jump='friends-toggle'>Friends</button>" +
      "<button data-jump='look-toggle'>Look</button>" +
      "<div class='sub'>Tap the page to walk. Left stick on phones.</div>";
  }
  function layout() {
    document.body.classList.toggle("phone", isPhone());
    ["jobs-toggle","house-toggle","party-toggle","mail-toggle","replay-toggle","admin-toggle","friends-toggle"].forEach(function (id) {
      const b = document.getElementById(id);
      if (b) b.classList.toggle("desk-only", isPhone());
    });
  }
  document.addEventListener("click", function (e) {
    const t = e.target; if (!t) return;
    if (t.id === "more-toggle") {
      const box = document.getElementById("more-box"); if (!box) return;
      const on = !box.classList.contains("show");
      closePanels(on ? "more-box" : "");
      box.classList.toggle("show", on);
      paintMore();
    }
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
})();
