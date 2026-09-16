/* Presence helpers used by Studio kits and second-tab play. */
(function () {
  const CAT = "ns-doodle-catalog-v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(CAT) || "{}"); } catch (e) { return {}; }
  }
  function save(map) {
    try { localStorage.setItem(CAT, JSON.stringify(map)); } catch (e) {}
  }
  window.nbRememberDoodle = function (item) {
    if (!item || !item.id) return;
    const map = load();
    map[item.id] = item;
    save(map);
  };
  window.nbFindDoodle = function (id) {
    if (!id) return null;
    return load()[id] || null;
  };
  window.nbAnnounce = function () {
    if (typeof net !== "function" || !state || !state.me) return;
    net({
      type: "look",
      color: state.me.color,
      hat: state.me.hat,
      extra: state.me.extra,
      kit: state.me.kit || null,
      walkStyle: state.me.walkStyle || "stroll"
    });
  };
  window.tickNetPlay = function () {};
  window.NetPlay = { remember: window.nbRememberDoodle, find: window.nbFindDoodle, announce: window.nbAnnounce };
})();
