/* Walk-style UI + persist even if game.js is an older build. */
(function () {
  function currentStyle() {
    if (state && state.me && state.me.walkStyle) return state.me.walkStyle;
    try {
      const saved = JSON.parse(localStorage.getItem("ns-look") || "{}");
      return saved.walkStyle || "stroll";
    } catch (e) { return "stroll"; }
  }
  function paintWalks() {
    if (typeof state === "undefined" || !state || !state.me) return;
    if (!state.me.walkStyle) state.me.walkStyle = currentStyle();
    const walks = window.WALKS || ["stroll", "march", "skip", "sneak", "bounce", "swagger", "waddle", "strut", "shuffle", "prance"];
    ["boot-walks", "look-walks"].forEach(function (id) {
      const root = document.getElementById(id);
      if (!root) return;
      const cur = state.me.walkStyle || "stroll";
      if (root.dataset.style === cur && root.childElementCount === walks.length) return;
      root.dataset.style = cur;
      root.innerHTML = "";
      walks.forEach(function (w) {
        const b = document.createElement("button");
        b.className = "hat walk" + (w === cur ? " on" : "");
        b.textContent = w;
        b.title = w;
        b.onclick = function () {
          if (window.setWalkStyle) setWalkStyle(w);
          else state.me.walkStyle = w;
          paintWalks();
          if (typeof persist === "function") persist();
          if (typeof paintPreview === "function") paintPreview();
        };
        root.appendChild(b);
      });
    });
  }
  function wrap() {
    if (typeof persist === "function" && !persist.__walk) {
      const orig = persist;
      window.persist = function () {
        orig();
        try {
          const raw = JSON.parse(localStorage.getItem("ns-look") || "{}");
          raw.walkStyle = (state && state.me && state.me.walkStyle) || "stroll";
          localStorage.setItem("ns-look", JSON.stringify(raw));
        } catch (e) {}
      };
      persist.__walk = true;
    }
    if (typeof sendChat === "function" && !sendChat.__walk) {
      const orig = sendChat;
      window.sendChat = function (raw) {
        const text = String(raw || "").trim();
        if (/^\/walk\s+/i.test(text)) {
          const w = (text.split(/\s+/)[1] || "stroll").toLowerCase();
          if (window.setWalkStyle) setWalkStyle(w);
          paintWalks();
          return;
        }
        orig(raw);
      };
      sendChat.__walk = true;
    }
    if (typeof net === "function" && !net.__walkStyle) {
      const orig = net;
      window.net = function (msg) {
        if (msg && state && state.me && (msg.type === "look" || msg.type === "move" || msg.type === "join")) {
          msg.walkStyle = state.me.walkStyle || "stroll";
        }
        orig(msg);
      };
      net.__walkStyle = true;
    }
    paintWalks();
  }
  setInterval(wrap, 400);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wrap);
  else wrap();
})();
