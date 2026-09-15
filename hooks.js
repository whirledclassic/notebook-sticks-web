/* Late hooks: chat commands, replay ticks, moderation gates. */
(function () {
  function wrap() {
    if (typeof sendChat === "function" && !sendChat.__nbHooked) {
      const orig = sendChat;
      window.sendChat = function (raw) {
        const text = String(raw || "").trim();
        if (!text) return;
        if (window.adminChat && window.adminChat(text)) return;
        if (window.replayChat && window.replayChat(text)) return;
        if (window.socialChat && window.socialChat(text)) return;
        orig(text);
      };
      sendChat.__nbHooked = true;
    }
    if (typeof net === "function" && !net.__nbMod) {
      const prev = net;
      window.net = function (msg) {
        if (!msg) return;
        if (window.__nbKicked || window.__nbBanned) return;
        if (msg.type === "join" && window.Admin && Admin.isBanned(msg.name)) {
          if (window.__nbBanner) window.__nbBanner("That name is banned.", "warn");
          return;
        }
        if (msg.type === "chat" && state && state.me && window.Admin && Admin.isMuted(state.me.name)) {
          if (window.__nbBanner) window.__nbBanner("Muted — chat is blocked.", "warn");
          return;
        }
        prev(msg);
      };
      net.__nbMod = true;
    }
    if (typeof tickFun === "function" && !tickFun.__nbHooked) {
      const origTick = tickFun;
      window.tickFun = function (dt) {
        origTick(dt);
        if (window.tickReplay) window.tickReplay(dt);
      };
      tickFun.__nbHooked = true;
    }
    if (typeof drawFun === "function" && !drawFun.__nbHooked) {
      const origDraw = drawFun;
      window.drawFun = function (g) {
        origDraw(g);
        if (window.drawReplay) window.drawReplay(g);
      };
      drawFun.__nbHooked = true;
    }
  }
  setInterval(wrap, 250);
  wrap();
})();
