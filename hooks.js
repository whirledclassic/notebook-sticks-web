/* Late hooks: chat, gear fx, jobs/houses, maker, moderation. */
(function () {
  function wrap() {
    if (typeof sendChat === "function" && !sendChat.__nbHooked) {
      const orig = sendChat;
      window.sendChat = function (raw) {
        const text = String(raw || "").trim();
        if (!text) return;
        if (window.memberChat && window.memberChat(text)) return;
        if (window.accountChat && window.accountChat(text)) return;
        if (window.payChat && window.payChat(text)) return;
        if (window.adminChat && window.adminChat(text)) return;
        if (window.replayChat && window.replayChat(text)) return;
        if (window.gearChat && window.gearChat(text)) return;
        if (window.coreChat && window.coreChat(text)) return;
        if (window.purposeChat && window.purposeChat(text)) return;
        if (window.realmChat && window.realmChat(text)) return;
        if (window.clubChat && window.clubChat(text)) return;
        if (window.syncChat && window.syncChat(text)) return;
        if (window.roomChat && window.roomChat(text)) return;
        if (window.houseChat && window.houseChat(text)) return;
        if (window.packChat && window.packChat(text)) return;
        if (window.playChat && window.playChat(text)) return;
        if (window.toysChat && window.toysChat(text)) return;
        if (window.makerChat && window.makerChat(text)) return;
        if (window.socialChat && window.socialChat(text)) return;
        orig(text);
        if (window.Account && text.charAt(0) !== "/") Account.bump("chats");
        if (window.purposeNote && text.charAt(0) !== "/") purposeNote("chat");
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
        if (window.tickPurpose) window.tickPurpose(dt);
        if (window.tickCore) window.tickCore(dt);
        if (window.tickGear) window.tickGear(dt);
        if (window.tickMaker) window.tickMaker(dt);
        if (window.tickNetPlay) window.tickNetPlay(dt);
        if (window.tickFill) window.tickFill(dt);
        if (window.tickToys) window.tickToys(dt);
        if (window.tickPlay) window.tickPlay(dt);
        if (window.tickPack) window.tickPack(dt);
        if (window.tickRealm) window.tickRealm(dt);
        if (window.tickRooms) window.tickRooms(dt);
        if (window.tickSync) window.tickSync(dt);
        if (window.tickBits) window.tickBits(dt);
      };
      tickFun.__nbHooked = true;
    }
    if (typeof drawFun === "function" && !drawFun.__nbHooked) {
      const origDraw = drawFun;
      window.drawFun = function (g) {
        origDraw(g);
        if (window.drawReplay) window.drawReplay(g);
        if (window.drawPurpose) window.drawPurpose(g);
        if (window.drawCore) window.drawCore(g);
        if (window.drawGear) window.drawGear(g);
        if (window.drawGearWorld) window.drawGearWorld(g);
        if (window.drawMaker) window.drawMaker(g);
        if (window.drawBits) window.drawBits(g);
        if (window.drawToys) window.drawToys(g);
        if (window.drawRooms) window.drawRooms(g);
      };
      drawFun.__nbHooked = true;
    }
  }
  setInterval(wrap, 250);
  wrap();
})();
