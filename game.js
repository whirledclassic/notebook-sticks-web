/* Play loop from whirledclassic/notebook-sticks public/game.js */
(function () {
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/gh/whirledclassic/notebook-sticks@b8cb29f8a6af0aac40ce984355e5d7a659527b48/public/game.js";
  s.onerror = function () {
    var t = document.createElement("script");
    t.src = "https://raw.githubusercontent.com/whirledclassic/notebook-sticks/b8cb29f8a6af0aac40ce984355e5d7a659527b48/public/game.js";
    document.body.appendChild(t);
  };
  document.body.appendChild(s);
})();
