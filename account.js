/* Persistent doodle accounts in this browser. Wallet, friends, stats, optional PIN. */
(function () {
  const KEY = "ns-account-v2";
  function emptyStats() {
    return { gamesWon: 0, gamesLost: 0, gamesDraw: 0, highfives: 0, waves: 0, chats: 0, gifts: 0 };
  }
  function emptyAccount(name) {
    return {
      name: name || "Doodle",
      pin: "",
      created: Date.now(),
      lastSeen: Date.now(),
      look: { color: "#1b1b1b", hat: "none", extra: "none" },
      friends: [],
      pending: [],
      blocked: [],
      stats: emptyStats()
    };
  }
  function loadStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && raw.accounts) return raw;
    } catch (e) {}
    return { current: "", accounts: {} };
  }
  function saveStore(store) {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }
  function keyName(name) { return String(name || "doodle").trim().toLowerCase().slice(0, 16); }
  const Account = {
    store: loadStore(),
    current: null,
    list: function () {
      return Object.values(this.store.accounts).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
    },
    get: function (name) {
      return this.store.accounts[keyName(name)] || null;
    },
    ensure: function (name) {
      const k = keyName(name);
      if (!this.store.accounts[k]) this.store.accounts[k] = emptyAccount(name);
      this.store.accounts[k].name = name;
      this.store.current = k;
      this.current = this.store.accounts[k];
      return this.current;
    },
    unlock: function (name, pin) {
      const acc = this.get(name);
      if (!acc) return this.ensure(name);
      if (acc.pin && String(pin || "") !== String(acc.pin)) return null;
      this.store.current = keyName(name);
      this.current = acc;
      acc.lastSeen = Date.now();
      saveStore(this.store);
      return acc;
    },
    setPin: function (pin) {
      if (!this.current) return;
      this.current.pin = String(pin || "").slice(0, 8);
      this.flush();
    },
    applyLook: function (look) {
      if (!this.current || !look) return;
      this.current.look = {
        color: look.color || this.current.look.color,
        hat: look.hat || this.current.look.hat,
        extra: look.extra || this.current.look.extra
      };
      this.flush();
    },
    friends: function () {
      return (this.current && this.current.friends) ? this.current.friends.slice() : [];
    },
    isFriend: function (name) {
      const n = keyName(name);
      return this.friends().some((f) => keyName(f.name) === n);
    },
    addFriend: function (name) {
      if (!this.current || !name) return false;
      if (keyName(name) === keyName(this.current.name)) return false;
      if (this.isFriend(name)) return false;
      this.current.friends.push({ name: name, added: Date.now() });
      this.current.pending = (this.current.pending || []).filter((p) => keyName(p) !== keyName(name));
      this.flush();
      return true;
    },
    removeFriend: function (name) {
      if (!this.current) return;
      this.current.friends = this.current.friends.filter((f) => keyName(f.name) !== keyName(name));
      this.flush();
    },
    askFriend: function (name) {
      if (!this.current || !name) return;
      const n = keyName(name);
      if (this.isFriend(name)) return;
      if (!(this.current.pending || []).some((p) => keyName(p) === n)) {
        this.current.pending = this.current.pending || [];
        this.current.pending.push(name);
        this.flush();
      }
    },
    bump: function (stat, n) {
      if (!this.current) return;
      if (!this.current.stats) this.current.stats = emptyStats();
      this.current.stats[stat] = (this.current.stats[stat] || 0) + (n || 1);
      this.flush();
    },
    flush: function () {
      if (this.current) {
        this.current.lastSeen = Date.now();
        this.store.accounts[keyName(this.current.name)] = this.current;
        this.store.current = keyName(this.current.name);
      }
      saveStore(this.store);
    },
    exportSave: function () {
      return JSON.stringify({ version: 2, exported: Date.now(), store: this.store }, null, 2);
    },
    importSave: function (text) {
      const data = JSON.parse(text);
      if (!data || !data.store || !data.store.accounts) throw new Error("Not a notebook save.");
      this.store = data.store;
      saveStore(this.store);
      this.current = this.store.accounts[this.store.current] || null;
      return true;
    }
  };
  window.Account = Account;

  function paintBootAccounts() {
    const box = document.getElementById("saved-accounts");
    if (!box) return;
    const list = Account.list();
    if (!list.length) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = "<label>Saved doodles</label><div class='row' id='accounts'></div>";
    const row = box.querySelector("#accounts");
    list.slice(0, 8).forEach((acc) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = acc.name + (acc.pin ? " \ud83d\udd12" : "");
      b.onclick = function () {
        const nameEl = document.getElementById("name");
        const pinEl = document.getElementById("pin");
        if (nameEl) nameEl.value = acc.name;
        if (pinEl && acc.pin) pinEl.focus();
        if (typeof state !== "undefined" && state.me) {
          state.me.name = acc.name;
          state.me.color = acc.look.color;
          state.me.hat = acc.look.hat;
          state.me.extra = acc.look.extra;
          if (typeof fillChoices === "function") bootUILook();
          if (typeof paintPreview === "function") paintPreview();
        }
      };
      row.appendChild(b);
    });
  }
  function bootUILook() {
    if (typeof fillChoices !== "function" || typeof state === "undefined") return;
    fillChoices(document.getElementById("colors"), COLORS, state.me.color, (c) => { state.me.color = c; }, true);
    fillChoices(document.getElementById("hats"), HATS, state.me.hat, (h) => { state.me.hat = h; }, false);
  }
  window.__nbOpenAccount = function (name, pin) {
    const acc = Account.get(name);
    if (acc && acc.pin && String(pin || "") !== String(acc.pin)) return { ok: false, error: "Wrong PIN for that doodle." };
    const live = Account.unlock(name, pin) || Account.ensure(name);
    if (typeof state !== "undefined" && state.me) {
      state.me.name = live.name;
      if (live.look) {
        state.me.color = live.look.color || state.me.color;
        state.me.hat = live.look.hat || state.me.hat;
        state.me.extra = live.look.extra || state.me.extra;
      }
    }
    Account.flush();
    return { ok: true, account: live };
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paintBootAccounts);
  else paintBootAccounts();
})();
