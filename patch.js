/* Bind the local player id and strip the self-clone the client used to draw. */
(function () {
  function bindId() {
    if (typeof state === "undefined" || !state) return;
    const id = window.__nbPlayerId;
    if (id) {
      state.id = id;
      if (state.me) state.me.id = id;
    }
    if (!state.others) return;
    const mine = state.id || id;
    if (mine) state.others.delete(mine);
    if (state.me && state.me.id) state.others.delete(state.me.id);
    for (const [oid, p] of [...state.others]) {
      if (!p) { state.others.delete(oid); continue; }
      if (mine && (oid === mine || p.id === mine)) state.others.delete(oid);
    }
  }
  setInterval(bindId, 120);
  addEventListener("load", bindId);
})();
