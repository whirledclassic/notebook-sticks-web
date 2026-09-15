/* Bind the local player id and strip the self-clone the client used to draw. */
(function () {
  function bindId() {
    if (typeof state === "undefined" || !state) return;
    const id = window.__nbPlayerId;
    if (id) state.id = id;
    if (state.others && id) state.others.delete(id);
    if (state.others && state.me) {
      for (const [oid, p] of state.others) {
        if (p && state.me && oid === state.me.id) state.others.delete(oid);
      }
    }
  }
  setInterval(bindId, 200);
  addEventListener("load", bindId);
})();
