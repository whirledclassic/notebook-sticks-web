/* Living stick figures + walk styles.
   Replaces drawStick after game.js loads. Hats / extras stay on the original helpers. */
(function () {
  const WALKS = ["stroll", "march", "skip", "sneak", "bounce", "swagger", "waddle", "strut", "shuffle", "prance"];
  const SPEEDS = {
    stroll: 1, march: 1.06, skip: 1.1, sneak: 0.58, bounce: 1.14,
    swagger: 0.88, waddle: 0.7, strut: 1.02, shuffle: 0.52, prance: 1.12
  };
  const PARAMS = {
    stroll:  { rate: 9.2,  bob: 4.4, stride: 11, lift: 10, arm: 8,  lean: 0.05, crouch: 0,  hop: 0,  sway: 2.2, wide: 0 },
    march:   { rate: 11.6, bob: 3.0, stride: 10, lift: 16, arm: 15, lean: 0.02, crouch: 0,  hop: 0,  sway: 0.4, wide: 0 },
    skip:    { rate: 8.5,  bob: 3.2, stride: 10, lift: 9,  arm: 9,  lean: 0.00, crouch: 0,  hop: 11, sway: 1.4, wide: 0 },
    sneak:   { rate: 6.1,  bob: 1.5, stride: 6,  lift: 4,  arm: 3.5,lean: 0.14, crouch: 11, hop: 0,  sway: 1.0, wide: 1 },
    bounce:  { rate: 10.8, bob: 7.6, stride: 9,  lift: 12, arm: 10, lean: 0.00, crouch: 2,  hop: 5,  sway: 2.0, wide: 0 },
    swagger: { rate: 7.5,  bob: 3.6, stride: 13, lift: 8,  arm: 7,  lean: -0.07,crouch: 0,  hop: 0,  sway: 7.2, wide: 2 },
    waddle:  { rate: 8.0,  bob: 2.4, stride: 6,  lift: 5,  arm: 5,  lean: 0.03, crouch: 1,  hop: 0,  sway: 8.4, wide: 6 },
    strut:   { rate: 8.8,  bob: 3.8, stride: 14, lift: 11, arm: 11, lean: -0.09,crouch: 0,  hop: 0,  sway: 3.1, wide: 1 },
    shuffle: { rate: 12.4, bob: 1.1, stride: 4,  lift: 3,  arm: 3,  lean: 0.09, crouch: 6,  hop: 0,  sway: 2.0, wide: 2 },
    prance:  { rate: 10.2, bob: 5.8, stride: 11, lift: 18, arm: 12, lean: -0.04,crouch: 0,  hop: 6,  sway: 3.4, wide: 0 }
  };

  function hashName(name) {
    const s = String(name || "Doodle");
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0) / 4294967296;
  }
  function styleOf(p) {
    const raw = (p && p.walkStyle) || "stroll";
    return WALKS.indexOf(raw) >= 0 ? raw : "stroll";
  }
  function paramsOf(p) { return PARAMS[styleOf(p)] || PARAMS.stroll; }
  function seedOf(p) { return hashName((p && p.name) || "") + ((p && p.id) ? hashName(p.id) * 0.37 : 0); }

  function limb(g, x0, y0, x1, y1, x2, y2) {
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  }

  function blinkState(t, seed) {
    const cycle = 3.1 + seed * 2.4;
    const phase = (t + seed * 17) % cycle;
    if (phase < 0.07) return 1;
    if (phase < 0.12) return 0.55;
    if ((t + seed * 40) % (11 + seed * 8) < 0.16) return 0.85;
    return 0;
  }

  function breath(t, seed, sleep) {
    const rate = sleep ? 1.15 : 2.05 + seed * 0.4;
    return 0.5 + 0.5 * Math.sin(t * rate + seed * 6.2);
  }

  window.WALKS = WALKS;
  window.walkSpeedMul = function (style) { return SPEEDS[style] || 1; };

  window.drawStick = function drawStickLive(g, p, now, scale) {
    const t = now / 1000;
    const seed = seedOf(p);
    const pose = p.pose || "stand";
    const sitting = pose === "sit";
    const sleeping = pose === "sleep";
    const dancing = pose === "dance";
    const waving = pose === "wave";
    const moving = (p.walking || dancing) && !sitting && !sleeping;
    const st = paramsOf(p);
    const rate = dancing ? 13.6 : st.rate;
    const phase = t * rate + seed * 12.6;
    const contact = Math.sin(phase);
    const pass = Math.sin(phase + Math.PI);
    const liftL = Math.max(0, -contact);
    const liftR = Math.max(0, contact);
    const br = breath(t, seed, sleeping);
    const weight = moving
      ? Math.sin(phase) * st.sway
      : Math.sin(t * 1.15 + seed * 5) * (1.6 + seed);
    const hop = moving ? Math.abs(Math.sin(phase)) * st.hop : 0;
    const idleBob = Math.sin(t * 2.15 + seed * 8) * 1.15 + br * 1.35;
    const walkBob = moving ? Math.abs(Math.sin(phase)) * st.bob + hop : 0;
    const bob = sitting || sleeping ? br * 0.7 : walkBob || idleBob;
    const crouch = (sitting || sleeping ? 16 : 0) + (moving ? st.crouch : sitting ? 0 : 2 * (1 - br));
    const lean = moving ? st.lean + contact * 0.03 : Math.sin(t * 0.9 + seed * 3) * 0.03;
    const facing = p.facing || 1;
    const blink = blinkState(t, seed);
    const chest = 1 + br * 0.045;
    const headY = -56 + crouch - br * 1.1;
    const neckY = -42 + crouch;
    const hipY = -10 + crouch + (moving ? Math.abs(Math.sin(phase)) * 1.2 : 0);
    const shoulderY = -32 + crouch + (1 - br) * 1.1;

    g.save();
    g.translate(p.x + weight * 0.35, p.y - bob);
    g.scale(facing * (scale || 1), scale || 1);
    g.rotate(lean);
    g.strokeStyle = p.color || "#1b1b1b";
    g.lineWidth = 3.2;
    g.lineCap = "round";
    g.lineJoin = "round";

    g.save();
    g.translate(0, headY + 56 - crouch);
    g.scale(1 + br * 0.02, chest);
    g.beginPath();
    g.arc(0, -56 + crouch, 14, 0, Math.PI * 2);
    g.stroke();
    g.restore();

    if (sleeping) {
      g.beginPath();
      g.arc(-5, headY - 2, 2.2, 0.15, Math.PI - 0.15);
      g.stroke();
      g.beginPath();
      g.arc(5, headY - 2, 2.2, 0.15, Math.PI - 0.15);
      g.stroke();
    } else if (blink > 0.7) {
      g.beginPath();
      g.moveTo(-7, headY - 2);
      g.lineTo(-2, headY - 2);
      g.moveTo(2, headY - 2);
      g.lineTo(7, headY - 2);
      g.stroke();
    } else {
      const open = 1 - blink;
      g.beginPath();
      g.arc(-5, headY - 2, 1.7 * open + 0.4, 0, Math.PI * 2);
      g.arc(5, headY - 2, 1.7 * open + 0.4, 0, Math.PI * 2);
      g.fillStyle = p.color || "#1b1b1b";
      g.fill();
      g.fillStyle = "#f4eed8";
      g.beginPath();
      g.arc(-5.5, headY - 2.6, 0.55, 0, Math.PI * 2);
      g.arc(4.5, headY - 2.6, 0.55, 0, Math.PI * 2);
      g.fill();
    }

    if (!sleeping && !sitting) {
      const smile = waving || dancing ? 0.9 : 0.15 + br * 0.25;
      g.beginPath();
      g.arc(0, headY + 4, 5.5, 0.15 + smile * 0.2, Math.PI - 0.15 - smile * 0.2);
      g.stroke();
    }

    if (sleeping) {
      g.beginPath();
      g.moveTo(0, neckY);
      g.lineTo(22, neckY + 20);
      g.stroke();
      limb(g, 8, neckY + 12, -10, neckY + 24, -16, neckY + 28);
      limb(g, 14, neckY + 16, 30, neckY + 22, 34, neckY + 30);
      g.restore();
      g.font = "13px Comic Sans MS, cursive";
      g.fillStyle = p.color || "#1b1b1b";
      g.textAlign = "center";
      const z = 0.6 + 0.4 * Math.sin(t * 2.2 + seed);
      g.globalAlpha = 0.45 + z * 0.55;
      g.fillText("z z", p.x + 26 + Math.sin(t * 1.4) * 3, p.y - 74 - z * 8);
      g.globalAlpha = 1;
      label(g, p);
      return;
    }

    if (sitting) {
      g.beginPath();
      g.moveTo(0, neckY);
      g.lineTo(0, hipY - 4);
      g.stroke();
      const fidget = Math.sin(t * 2.4 + seed * 4) * 2;
      limb(g, 0, shoulderY, -16, shoulderY + 12 + fidget, -20, shoulderY + 16);
      limb(g, 0, shoulderY, 14, shoulderY + 16, 18, shoulderY + 20 + fidget * 0.5);
      limb(g, 0, hipY - 4, -18, hipY + 8, -16, hipY + 14);
      limb(g, 0, hipY - 4, 20, hipY + 8, 24, hipY + 12);
    } else {
      g.beginPath();
      g.moveTo(0, neckY);
      g.lineTo(0, hipY);
      g.stroke();

      const armAmp = dancing ? st.arm + 10 : waving ? 4 : (moving ? st.arm : 3.2 + br * 1.4);
      const wave = waving ? Math.sin(t * 13.5 + seed) * 14 : dancing ? Math.sin(t * 14) * 10 : 0;
      const armL = moving ? pass * armAmp : Math.sin(t * 1.7 + seed * 3) * 2.4;
      const armR = moving ? contact * armAmp : Math.sin(t * 1.7 + seed * 3 + Math.PI) * 2.4;
      const handLy = shoulderY + 16 + armL;
      const handRy = shoulderY + 16 + armR - (waving ? 18 : 0) + wave;
      const elbowL = { x: -9 - (moving ? 0 : 1), y: shoulderY + 8 + armL * 0.45 };
      const elbowR = { x: 9 + (moving ? 0 : 1), y: shoulderY + 8 + armR * 0.45 - (waving ? 10 : 0) };
      limb(g, 0, shoulderY, elbowL.x, elbowL.y, -15 + (dancing ? Math.sin(phase) * 4 : 0), handLy);
      limb(g, 0, shoulderY, elbowR.x, elbowR.y, 15 + (dancing ? Math.cos(phase) * 4 : 0), handRy);

      const stride = moving ? st.stride : 2.2;
      const lift = moving ? st.lift : 1.2;
      const wide = st.wide;
      const hipSpread = 0;
      const kneeLy = hipY + 8 - liftL * lift * 0.55;
      const kneeRy = hipY + 8 - liftR * lift * 0.55;
      const footLx = -stride * contact - wide;
      const footRx = stride * contact + wide;
      const footLy = 12 - liftL * lift + (moving && liftL < 0.15 ? 1.2 : 0);
      const footRy = 12 - liftR * lift + (moving && liftR < 0.15 ? 1.2 : 0);
      limb(g, hipSpread, hipY, -6 - wide * 0.3 + footLx * 0.35, kneeLy, footLx, footLy);
      limb(g, hipSpread, hipY, 6 + wide * 0.3 + footRx * 0.35, kneeRy, footRx, footRy);

      if (moving && liftL < 0.12) {
        g.globalAlpha = 0.18;
        g.beginPath();
        g.ellipse(footLx, footLy + 2, 7, 2.2, 0, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
      }
      if (moving && liftR < 0.12) {
        g.globalAlpha = 0.18;
        g.beginPath();
        g.ellipse(footRx, footRy + 2, 7, 2.2, 0, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
      }
    }

    const hatBob = sitting || sleeping ? crouch : crouch - br * 1.4 - (moving ? Math.sin(phase * 2) * 0.8 : 0);
    if (typeof hat === "function") hat(g, p.hat, hatBob);
    if (window.extraPath) extraPath(g, p.extra, hatBob);

    g.restore();
    label(g, p, sitting ? 8 : 0);
    if (p.chat && Date.now() < (p.chatUntil || 0)) {
      if (typeof bubble === "function") bubble(g, p.x, p.y - 96 + (sitting ? 8 : 0), p.chat);
    }
  };

  function label(g, p, sit) {
    g.font = "13px Comic Sans MS, cursive";
    g.fillStyle = p.color || "#1b1b1b";
    g.textAlign = "center";
    const tag = p.member === "patron" ? " ★" : p.member === "plus" ? " +" : "";
    g.fillText((p.name || "Doodle") + tag, p.x, p.y + 26 + (sit || 0));
  }

  window.setWalkStyle = function (style) {
    if (!state || !state.me) return;
    if (WALKS.indexOf(style) < 0) style = "stroll";
    state.me.walkStyle = style;
    if (typeof persist === "function") persist();
    if (typeof net === "function") {
      net({ type: "look", name: state.me.name, color: state.me.color, hat: state.me.hat, extra: state.me.extra, walkStyle: style });
    }
    if (typeof paintPreview === "function") paintPreview();
    if (typeof logLine === "function") logLine("Walk style: " + style + ".");
  };
})();
