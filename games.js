/* Walk-up table games: tic-tac-toe and rock-paper-scissors. Second tab or NPC. */
(function () {
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const RPS = ["rock", "paper", "scissors"];
  const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };
  const Minigames = { session: null, npcTimer: 0 };
  function log(text) { if (typeof logLine === "function") logLine(text); }
  function myId() {
    return (typeof state !== "undefined" && state && (state.id || (state.me && state.me.id))) || window.__nbPlayerId;
  }
  function send(msg) { if (typeof net === "function") net(Object.assign({ type: "game" }, msg)); }
  function panel() { return document.getElementById("game-panel"); }
  function showPanel(on) { const el = panel(); if (el) el.classList.toggle("show", !!on); }
  function nearestTable() {
    if (typeof state === "undefined" || !state.places) return null;
    let best = null, bestD = 1e9;
    for (const pl of state.places) {
      if (pl.kind !== "table") continue;
      const d = Math.hypot(pl.x - state.me.x, pl.y - state.me.y);
      if (d < pl.r && d < bestD) { best = pl; bestD = d; }
    }
    return best;
  }
  Minigames.nearestTable = nearestTable;
  function winnerOf(board) {
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(Boolean)) return "draw";
    return null;
  }
  function finish(session, result) {
    session.status = "done";
    session.winner = result;
    const me = myId();
    const iWon = (result === "x" && session.hostId === me) || (result === "o" && session.guestId === me) ||
      (result === "host" && session.hostId === me) || (result === "guest" && session.guestId === me);
    const draw = result === "draw";
    if (window.Account) {
      if (draw) Account.bump("gamesDraw");
      else if (iWon) Account.bump("gamesWon");
      else Account.bump("gamesLost");
    }
    if (iWon) {
      log("You won. +8 ink.");
      if (window.addPop) addPop(state.me.x, state.me.y - 80, "+8");
      if (window.Sfx) Sfx.win();
    } else if (draw) {
      log("Draw. Nobody erased the page.");
      if (window.Sfx) Sfx.mark();
    } else {
      log("Lost that one.");
      if (window.Sfx) Sfx.lose();
    }
    if (typeof net === "function" && iWon) net({ type: "gamewin" });
    render();
  }
  function newTtt(host, guest, table) {
    return {
      id: "g-" + Date.now().toString(36), kind: "ttt", page: state.me.page,
      table: table ? table.id : "open",
      hostId: host.id, hostName: host.name,
      guestId: guest ? guest.id : null, guestName: guest ? guest.name : null,
      board: ["", "", "", "", "", "", "", "", ""], turn: host.id,
      status: guest ? "playing" : "open", winner: null
    };
  }
  function newRps(host, guest, table) {
    return {
      id: "g-" + Date.now().toString(36), kind: "rps", page: state.me.page,
      table: table ? table.id : "open",
      hostId: host.id, hostName: host.name,
      guestId: guest ? guest.id : null, guestName: guest ? guest.name : null,
      hostPick: "", guestPick: "",
      status: guest ? "playing" : "open", winner: null
    };
  }
  function npcPartner() {
    const list = (typeof everyone === "function") ? everyone() : [];
    const npc = list.find((p) => p !== state.me && String(p.id || "").indexOf("npc-") === 0);
    if (npc) return npc;
    return { id: "npc-Binder", name: "Binder", x: state.me.x + 40, y: state.me.y };
  }
  function start(kind, partner, table) {
    const host = { id: myId(), name: state.me.name };
    const guest = partner ? { id: partner.id, name: partner.name } : null;
    const vsNpc = guest && String(guest.id).indexOf("npc-") === 0;
    const session = kind === "rps" ? newRps(host, guest, table) : newTtt(host, guest, table);
    if (vsNpc) {
      session.guestId = guest.id;
      session.guestName = guest.name;
      session.status = "playing";
      session.npc = true;
    }
    Minigames.session = session;
    send({ action: "open", session: session });
    render();
    showPanel(true);
    log((kind === "rps" ? "Rock-paper-scissors" : "Tic-tac-toe") + " vs " + (session.guestName || "anyone who sits down") + ".");
  }
  Minigames.challenge = function (person, kind) {
    if (!person) return;
    if (String(person.id || "").indexOf("npc-") === 0) { start(kind, person, nearestTable()); return; }
    send({ action: "challenge", game: kind, to: person.id, toName: person.name });
    start(kind, person, nearestTable());
  };
  Minigames.useTable = function (table) {
    if (!table) table = nearestTable();
    if (!table) { log("No table nearby."); return; }
    const kind = table.id === "rps" || table.game === "rps" ? "rps" : "ttt";
    const others = (typeof everyone === "function" ? everyone() : []).filter((p) => {
      if (p === state.me) return false;
      return Math.hypot(p.x - table.x, p.y - table.y) < table.r + 40;
    });
    const live = others.find((p) => String(p.id || "").indexOf("npc-") !== 0);
    const partner = live || others[0] || npcPartner();
    start(kind, partner, table);
    if (typeof setPose === "function") setPose("sit");
  };
  function applyRemote(session) {
    if (!session) return;
    const mine = myId();
    if (Minigames.session && Minigames.session.id === session.id) {
      Minigames.session = session; render(); showPanel(true); return;
    }
    if (session.status === "open" && session.page === state.me.page && !Minigames.session) {
      const table = nearestTable();
      if (table && session.table === table.id) {
        session.guestId = mine; session.guestName = state.me.name; session.status = "playing";
        Minigames.session = session;
        send({ action: "join", session: session });
        render(); showPanel(true);
        log("You sat down across from " + session.hostName + ".");
      }
    }
    if (session.hostId === mine || session.guestId === mine) {
      Minigames.session = session; render(); showPanel(true);
    }
  }
  function playTtt(index) {
    const s = Minigames.session;
    if (!s || s.kind !== "ttt" || s.status !== "playing") return;
    if (s.turn !== myId()) { log("Not your mark."); return; }
    if (s.board[index]) return;
    s.board[index] = s.hostId === myId() ? "x" : "o";
    if (window.Sfx) Sfx.mark();
    const w = winnerOf(s.board);
    if (w) finish(s, w === "draw" ? "draw" : w);
    else s.turn = s.turn === s.hostId ? s.guestId : s.hostId;
    send({ action: "sync", session: s });
    render();
    if (s.npc && s.status === "playing" && s.turn === s.guestId) queueNpc();
  }
  function playRps(pick) {
    const s = Minigames.session;
    if (!s || s.kind !== "rps" || s.status !== "playing") return;
    if (s.hostId === myId()) s.hostPick = pick; else s.guestPick = pick;
    if (window.Sfx) Sfx.click();
    if (s.npc && !s.guestPick) s.guestPick = RPS[Math.floor(Math.random() * 3)];
    if (s.hostPick && s.guestPick) {
      if (s.hostPick === s.guestPick) finish(s, "draw");
      else if (BEATS[s.hostPick] === s.guestPick) finish(s, "host");
      else finish(s, "guest");
    }
    send({ action: "sync", session: s });
    render();
  }
  function queueNpc() {
    const s = Minigames.session;
    if (!s || !s.npc || s.kind !== "ttt") return;
    setTimeout(function () {
      if (!Minigames.session || Minigames.session.id !== s.id || s.status !== "playing") return;
      const empties = s.board.map((v, i) => v ? -1 : i).filter((i) => i >= 0);
      if (!empties.length) return;
      const choice = empties[Math.floor(Math.random() * empties.length)];
      s.board[choice] = "o";
      const w = winnerOf(s.board);
      if (w) finish(s, w === "draw" ? "draw" : w);
      else s.turn = s.hostId;
      send({ action: "sync", session: s });
      render();
    }, 420 + Math.random() * 500);
  }
  function render() {
    const el = panel();
    if (!el) return;
    const s = Minigames.session;
    if (!s) {
      el.innerHTML = "<b>Table games</b><div class='sub'>Walk to a tic-tac table or odds table and press E.</div>";
      return;
    }
    const vs = s.guestName || "waiting…";
    let html = "<b>" + (s.kind === "rps" ? "Rock paper scissors" : "Tic-tac-toe") + "</b>";
    html += "<div class='sub'>" + s.hostName + " vs " + vs;
    if (s.status === "playing") html += " \u00b7 " + (s.turn === myId() ? "your turn" : "their turn");
    if (s.status === "done") {
      const winName = s.winner === "draw" ? "draw" :
        s.winner === "x" || s.winner === "host" ? s.hostName :
        s.winner === "o" || s.winner === "guest" ? s.guestName : s.winner;
      html += " \u00b7 " + winName;
    }
    html += "</div>";
    if (s.kind === "ttt") {
      html += "<div id='ttt-board'>";
      for (let i = 0; i < 9; i++) {
        const glyph = s.board[i] === "x" ? "X" : s.board[i] === "o" ? "O" : "";
        html += "<button data-cell='" + i + "'" + (s.status !== "playing" || s.board[i] ? " disabled" : "") + ">" + glyph + "</button>";
      }
      html += "</div>";
    } else {
      html += "<div class='rps-row'>";
      ["\u270a rock", "\u270b paper", "\u270c\ufe0f scissors"].forEach((label, i) => {
        html += "<button data-rps='" + RPS[i] + "'>" + label + "</button>";
      });
      html += "</div>";
      if (s.hostPick || s.guestPick) {
        html += "<div class='sub'>" + s.hostName + ": " + (s.hostPick || "\u2026") + " \u00b7 " + (s.guestName || "?") + ": " +
          (s.hostPick && s.guestPick ? (s.guestPick || "\u2026") : "hidden") + "</div>";
      }
    }
    html += "<button data-leave='1'>Leave table</button>";
    el.innerHTML = html;
  }
  function handleGame(msg) {
    if (!msg || msg.type !== "game") return;
    if (msg.action === "challenge" && msg.to === myId()) log((msg.name || "Someone") + " wants to play. Walk to a table or press E.");
    if (msg.session) applyRemote(msg.session);
  }
  window.handleGame = handleGame;
  window.tickGames = function () {};
  window.drawGames = function (g) {
    if (typeof state === "undefined" || !state.places) return;
    for (const pl of state.places) {
      if (pl.kind !== "table") continue;
      const s = Minigames.session;
      if (s && s.table === pl.id && s.status === "playing") {
        g.font = "13px Comic Sans MS, cursive"; g.fillStyle = "#1b1b1b"; g.textAlign = "center";
        g.fillText("in play", pl.x, pl.y + 48);
      }
    }
  };
  function bind() {
    const el = panel();
    if (!el) return;
    el.addEventListener("click", function (e) {
      if (e.target.dataset.cell != null) playTtt(Number(e.target.dataset.cell));
      if (e.target.dataset.rps) playRps(e.target.dataset.rps);
      if (e.target.dataset.leave) {
        if (Minigames.session) send({ action: "leave", session: Minigames.session });
        Minigames.session = null; showPanel(false);
        if (typeof setPose === "function") setPose("stand");
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.Minigames = Minigames;
})();
