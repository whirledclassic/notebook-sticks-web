/* Walk-up social: friends, waves, high-fives, follow, gifts, nearby prompt. */
(function () {
  const NEAR = 92;
  const HIGHFIVE = 54;
  const Social = {
    followId: null,
    lastPrompt: "",
    pulses: [],
    incoming: []
  };
  function people() {
    if (typeof everyone !== "function") return [state.me];
    return everyone();
  }
  function nearestOther() {
    let best = null, bestD = 1e9;
    for (const p of people()) {
      if (p === state.me || (p.id && typeof isMe === "function" && isMe(p.id))) continue;
      const d = Math.hypot(p.x - state.me.x, p.y - state.me.y);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best && bestD < 160 ? { person: best, dist: bestD } : null;
  }
  function onlineNames() {
    const set = new Set();
    for (const p of people()) if (p && p.name) set.add(String(p.name).toLowerCase());
    return set;
  }
  function log(text) {
    if (typeof logLine === "function") logLine(text);
  }
  function closePanels(except) {
    ["look", "friends", "social-panel", "member-box", "game-panel"].forEach((id) => {
      if (id === except) return;
      const el = document.getElementById(id);
      if (el) el.classList.remove("show");
    });
    if (except !== "look") state.lookOpen = false;
  }
  function renderFriends() {
    const box = document.getElementById("friends");
    if (!box || !window.Account) return;
    const friends = Account.friends();
    const pending = (Account.current && Account.current.pending) || [];
    const online = onlineNames();
    const stats = (Account.current && Account.current.stats) || {};
    box.innerHTML =
      "<b>Friends</b><div class='sub'>" + friends.length + " saved \u00b7 " +
      (stats.highfives || 0) + " high-fives \u00b7 " + (stats.gamesWon || 0) + " wins</div>" +
      (friends.length ? friends.map((f) => {
        const on = online.has(String(f.name).toLowerCase());
        return `<button data-friend="${f.name}"><span class="${on ? "online" : "offline"}">\u25cf</span> ${f.name}${on ? "<span class='pill'>here</span>" : ""}</button>`;
      }).join("") : "<div class='sub'>Walk up to someone and tap Friend.</div>") +
      (pending.length ? "<div class='sub'>Pending</div>" + pending.map((n) =>
        `<button data-accept="${n}">Accept ${n}</button>`).join("") : "") +
      "<div class='sub'>Click a friend to whisper. /friend Name \u00b7 /unfriend Name</div>" +
      "<button data-export='1'>Download save</button>" +
      "<button data-import='1'>Load save file</button>";
  }
  function showPrompt(html, actions) {
    const box = document.getElementById("prompt-box");
    if (!box) return;
    box.innerHTML = html + "<div class='acts'></div>";
    const acts = box.querySelector(".acts");
    (actions || []).forEach((a) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = a.label;
      b.onclick = function () { a.run(); };
      acts.appendChild(b);
    });
    box.classList.add("show");
  }
  function hidePrompt() {
    const box = document.getElementById("prompt-box");
    if (box) box.classList.remove("show");
  }
  function waveAt(p) {
    if (typeof setPose === "function") setPose("wave");
    if (window.Account) Account.bump("waves");
    if (typeof net === "function") net({ type: "social", kind: "wave", to: p.id, toName: p.name });
    log("You waved at " + p.name + ".");
    Social.pulses.push({ x: p.x, y: p.y - 70, text: "\ud83d\udc4b", life: 1.1 });
    setTimeout(function () { if (state.me.pose === "wave") setPose("stand"); }, 900);
  }
  function highFive(p) {
    if (Math.hypot(p.x - state.me.x, p.y - state.me.y) > HIGHFIVE + 20) {
      log("Step closer for a high-five.");
      return;
    }
    if (typeof setPose === "function") setPose("wave");
    if (window.Account) Account.bump("highfives");
    if (typeof net === "function") net({ type: "social", kind: "highfive", to: p.id, toName: p.name });
    if (window.addPop) addPop((state.me.x + p.x) / 2, (state.me.y + p.y) / 2 - 80, "SLAP");
    if (window.Sfx) Sfx.slap();
    log("High-five with " + p.name + "!");
  }
  function whisper(p) {
    const chat = document.getElementById("chat");
    if (!chat) return;
    chat.value = "/w " + p.name + " ";
    chat.focus();
    state.chatting = true;
  }
  function giftInk(p, amount) {
    amount = amount || 5;
    if (typeof net === "function") net({ type: "social", kind: "gift", to: p.id, toName: p.name, amount: amount });
    if (window.Account) Account.bump("gifts");
  }
  function addFriend(p) {
    if (!window.Account) return;
    if (Account.isFriend(p.name)) { log(p.name + " is already a friend."); return; }
    if (typeof net === "function") net({ type: "social", kind: "friend-ask", to: p.id, toName: p.name });
    if (window.Sfx) Sfx.friend();
    log("Friend request sent to " + p.name + ".");
  }
  function follow(p) {
    Social.followId = p.id || p.name;
    log("Following " + p.name + ". Walk or press E to stop.");
  }
  function interactMenu() {
    const near = nearestOther();
    const table = window.Minigames && Minigames.nearestTable ? Minigames.nearestTable() : null;
    const actions = [];
    let title = "Nothing in reach. Walk up to a doodle or a game table.";
    if (near && near.dist < NEAR) {
      const p = near.person;
      const pal = window.Account && Account.isFriend(p.name) ? " \u00b7 friend" : "";
      title = "<b>" + p.name + "</b> <span class='sub'>" + Math.round(near.dist) + " steps" + pal + "</span>";
      actions.push({ label: "Wave", run: function () { waveAt(p); } });
      actions.push({ label: "High-five", run: function () { highFive(p); } });
      actions.push({ label: "Whisper", run: function () { whisper(p); hidePrompt(); } });
      actions.push({ label: Account && Account.isFriend(p.name) ? "Unfriend" : "Friend", run: function () {
        if (Account && Account.isFriend(p.name)) { Account.removeFriend(p.name); log("Unfriended " + p.name + "."); }
        else addFriend(p);
        renderFriends();
      }});
      actions.push({ label: "Follow", run: function () { follow(p); hidePrompt(); } });
      actions.push({ label: "Gift 5 ink", run: function () { giftInk(p, 5); hidePrompt(); } });
      actions.push({ label: "Tic-tac-toe", run: function () { if (window.Minigames) Minigames.challenge(p, "ttt"); hidePrompt(); } });
      actions.push({ label: "RPS", run: function () { if (window.Minigames) Minigames.challenge(p, "rps"); hidePrompt(); } });
    }
    if (table) {
      if (!near || near.dist >= NEAR) title = "<b>" + table.name + "</b> <span class='sub'>" + table.hint + "</span>";
      actions.push({ label: "Play here", run: function () { if (window.Minigames) Minigames.useTable(table); hidePrompt(); } });
    }
    if (Social.followId) {
      actions.push({ label: "Stop following", run: function () { Social.followId = null; hidePrompt(); } });
    }
    if (!actions.length) {
      showPrompt("<b>Look around</b><div class='sub'>" + title + "</div>", []);
      setTimeout(hidePrompt, 1600);
      return;
    }
    showPrompt(title, actions);
  }
  function handleSocial(msg) {
    if (!msg || msg.type !== "social") return;
    const fromName = msg.name || "Someone";
    if (msg.kind === "wave") {
      log(fromName + " waved at you.");
      Social.pulses.push({ x: state.me.x, y: state.me.y - 70, text: "\ud83d\udc4b", life: 1.1 });
      if (window.Sfx) Sfx.wave();
    }
    if (msg.kind === "highfive") {
      log(fromName + " high-fived you!");
      if (window.Account) Account.bump("highfives");
      if (window.addPop) addPop(state.me.x, state.me.y - 80, "SLAP");
      if (window.Sfx) Sfx.slap();
      if (typeof setPose === "function") setPose("wave");
    }
    if (msg.kind === "friend-ask") {
      if (window.Account) Account.askFriend(fromName);
      log(fromName + " wants to be friends. Open Friends to accept.");
      renderFriends();
    }
    if (msg.kind === "friend-yes") {
      if (window.Account) Account.addFriend(fromName);
      if (window.Sfx) Sfx.friend();
      log(fromName + " is your friend now.");
      renderFriends();
    }
    if (msg.kind === "gift") {
      log(fromName + " slipped you " + (msg.amount || 5) + " ink.");
      if (window.Sfx) Sfx.buy();
    }
    if (msg.kind === "challenge") {
      Social.incoming.push(msg);
      log(fromName + " challenged you to " + (msg.game === "rps" ? "rock-paper-scissors" : "tic-tac-toe") + ". Press E.");
    }
  }
  window.handleSocial = handleSocial;
  window.tickSocial = function () {
    if (Social.followId && !state.chatting) {
      const p = people().find((o) => o.id === Social.followId || o.name === Social.followId);
      if (p && Math.hypot(p.x - state.me.x, p.y - state.me.y) > 70) {
        state.goal = { x: p.x - 40 * (p.facing || 1), y: p.y + 10, sit: false };
      }
    }
    for (const p of Social.pulses) p.life -= 0.016;
    Social.pulses = Social.pulses.filter((p) => p.life > 0);
    const box = document.getElementById("prompt-box");
    if (box && box.classList.contains("show")) return;
    const near = nearestOther();
    const table = window.Minigames && Minigames.nearestTable ? Minigames.nearestTable() : null;
    const hint = document.getElementById("hint");
    if (hint) {
      if (near && near.dist < NEAR) hint.textContent = "E \u00b7 talk to " + near.person.name + "  \u00b7  high-five, friend, or play";
      else if (table) hint.textContent = "E \u00b7 sit at " + table.name;
      else hint.textContent = "Visit scribbles for stamps. E = interact. F = airplane. Friends saves with your name.";
    }
  };
  window.drawSocial = function (g) {
    for (const p of Social.pulses) {
      g.font = "22px Comic Sans MS, cursive";
      g.globalAlpha = Math.max(0, p.life);
      g.fillText(p.text, p.x, p.y);
      g.globalAlpha = 1;
    }
    const near = nearestOther();
    if (near && near.dist < NEAR) {
      g.strokeStyle = "rgba(43,108,176,.35)";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(near.person.x, near.person.y - 20, 36, 0, Math.PI * 2);
      g.stroke();
    }
  };
  function sendChatHook(raw) {
    const text = String(raw || "").trim();
    const mFriend = text.match(/^\/friend\s+(.+)/i);
    const mUn = text.match(/^\/unfriend\s+(.+)/i);
    const mW = text.match(/^\/w(?:hisper)?\s+(\S+)\s+(.+)/i);
    const mGift = text.match(/^\/gift\s+(\S+)\s+(\d+)/i);
    if (mFriend && window.Account) {
      const target = people().find((p) => p.name.toLowerCase() === mFriend[1].toLowerCase()) || { name: mFriend[1] };
      addFriend(target);
      return true;
    }
    if (mUn && window.Account) {
      Account.removeFriend(mUn[1]);
      log("Unfriended " + mUn[1] + ".");
      renderFriends();
      return true;
    }
    if (mGift) {
      const target = people().find((p) => p.name.toLowerCase() === mGift[1].toLowerCase());
      if (target) giftInk(target, Number(mGift[2]) || 5);
      else log("Cannot see " + mGift[1] + " on this page.");
      return true;
    }
    if (mW) {
      if (typeof net === "function") net({ type: "social", kind: "whisper", toName: mW[1], text: mW[2] });
      log("[whisper you \u2192 " + mW[1] + "] " + mW[2]);
      return true;
    }
    return false;
  }
  window.socialChat = sendChatHook;
  function bind() {
    const friendsBtn = document.getElementById("friends-toggle");
    if (friendsBtn) friendsBtn.onclick = function () {
      const el = document.getElementById("friends");
      const open = el && !el.classList.contains("show");
      closePanels(open ? "friends" : "");
      if (el) el.classList.toggle("show", open);
      if (open) renderFriends();
    };
    const interactBtn = document.getElementById("interact-toggle");
    if (interactBtn) interactBtn.onclick = interactMenu;
    const friends = document.getElementById("friends");
    if (friends) friends.addEventListener("click", function (e) {
      const name = e.target.dataset.friend;
      const acc = e.target.dataset.accept;
      if (name) {
        const p = people().find((o) => o.name === name);
        if (p) whisper(p);
        else {
          const chat = document.getElementById("chat");
          if (chat) { chat.value = "/w " + name + " "; chat.focus(); }
        }
      }
      if (acc && window.Account) {
        Account.addFriend(acc);
        if (typeof net === "function") net({ type: "social", kind: "friend-yes", toName: acc });
        log("You and " + acc + " are friends.");
        renderFriends();
      }
      if (e.target.dataset.export) {
        const blob = new Blob([Account.exportSave()], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "notebook-sticks-save.json";
        a.click();
      }
      if (e.target.dataset.import) {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = "application/json";
        inp.onchange = function () {
          const file = inp.files && inp.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function () {
            try { Account.importSave(String(reader.result)); log("Save loaded. Re-open the notebook to use it."); renderFriends(); }
            catch (err) { log("Could not read that save."); }
          };
          reader.readAsText(file);
        };
        inp.click();
      }
    });
    addEventListener("keydown", function (e) {
      if (state.chatting || document.activeElement === document.getElementById("chat")) return;
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        const box = document.getElementById("prompt-box");
        if (box && box.classList.contains("show")) hidePrompt();
        else interactMenu();
      }
      if (e.key.toLowerCase() === "q") {
        const el = document.getElementById("friends");
        const open = el && !el.classList.contains("show");
        closePanels(open ? "friends" : "");
        if (el) el.classList.toggle("show", open);
        if (open) renderFriends();
      }
    });
    setInterval(renderFriends, 4000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.Social = Social;
  window.socialInteract = interactMenu;
  window.renderFriends = renderFriends;
})();
