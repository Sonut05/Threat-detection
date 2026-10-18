// Procedural dot-matrix globe + starfield (canvas 2D). Used as the always-available
// background layer under the looping video. Land mask: 180x90 grid, 1 bit per cell.
const LAND = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAfvAAAAAAAAAAAAAAAAAAAAAAAAx37///+AAAAAGoABAAAAAAAAAAAAAIe8P///wAA8AAAAAA0AAAAAAAAAAAwADw////4AAIAAAAAAHAAAAAAAAAAALivwAf//wAAAAADAAP/wAHIAAAAAADsj38AH/+gAAAAAEAH///OAAAAgBgAAfw3/gB/+gAAAgAMHe///+/9gBAP/7/nbdrwD/+AAAH/Ag7H////////8H//////g8H/gAAAf/6//f////////Mf/////9H4D4A+AA+ev///////////AP/////4A0B4AAAD5/////////////Af1////gHgA4AAAP5///////////LwAHgD///gH0AAAAAG4/////////+AMAABAC///4D+AAAAGCx/////////4A4AAAAB////n/gAAAOCR/////////4A4AAAAAf///3/wAAAbH//////////9AgAAAAAP/////gAAADf//////////9AAAAAAAF////0YAAAB///////////8AAAAAAAD////8EAAAB///v///////5AAAAAAAD////+AAAAB/f5f///////wAAAAAAAD////gAAAAfxnwP///////jgAAAAAAD///+AAAAAPCb3///////+AAAAAAAAD///8AAAAAfCJf//////+ECAAAAAAAB///8AAAAAGDRf///////mMAAAAAAAA///8AAAAAH+Ai///////E8AAAAAAAAf//wAAAAAP/AA///////BgAAAAAAAAP//gAAAAAf/73///////gAAAAAAAAAD/AQAAAAAf//9/f/////gAAAAAAAAAF+AQAAAAB///+/n/////AAAAAAAAAAC+AAAAAAB///+fwH///+AAAAAAAAAAAeAwAAAAD////f/D///8gAAAAAAAAAAeGEAAAAD////v+B/j/AAAAAAAAAAAAPMAwAAAD////n+AfB+gAAAAAAAAAAAD8AAAAAD////34AeBfAgAAAAAAAAAAAPAAAAAH////3gAcAfAgAAAAAAAAAAADAAAAAD////6AAcAfgwAAAAAAAAAAABBwAAAD////8wAMATAIAAAAAAAAAAAAr/AAAB/////gAIASAAAAAAAAAAAAAAH/gAAA/////gACAAAIAAAAAAAAAAAAH/8AAAYH///AAAAsGAAAAAAAAAAAAAH/+AAAAB//+AAAAUOAAAAAAAAAAAAAP/+AAAAB//8AAAAc+gAAAAAAAAAAAAP//gAAAD//4AAAAMeBgAAAAAAAAAAAP//8AAAB//wAAAAGdCuAAAAAAAAAAAf///AAAA//wAAAACAAHgAAAAAAAAAAP///gAAA//wAAAAB4AHggAAAAAAAAAH///AAAAf/wAAAAACIDQIAAAAAAAAAH//+AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//8AAAA//wgAAAAAHxgBAAAAAAAAAA//8AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/gAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/wAAAAf/DAAAAAH//4AAAAAAAAAAAf/AAAAAf+DAAAAAH//8AAAAAAAAAAAf/AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/8AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/gAAAAAAAAAAAAACAP4AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB+AAAAAAAAAAAAAAAAAAAGAAAAAAAAB6AAAAAAAAAAAAAAAAAwAMAAAAAAAAA8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAACAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAA8AAf/8d/AAAAAAAAAAAAkAAAAAAACP/+H//////AAAAAAAAAAA+AAAAIf////+////////AAAAAAAOMKPAAAB///////////////gAAAH/8D//8AAAH//////////////4AAAF/////8AAAP///////////////4AAIf/////gwBwf///////////////4AAAH//////AAD////////////////wAAA///////+f//////////////////A/wH///////////////////////////////////////////////////////////////////////////////////////";

export function startGlobe(cv, still) {
  const ctx = cv.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  const W = 180, H = 90, land = new Uint8Array(W * H);
  const bin = atob(LAND);
  for (let i = 0; i < W * H; i++) land[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;

  const isLand = (lat, lon) => {
    let c = Math.floor(((lon + 180) / 360) * W) % W; if (c < 0) c += W;
    const r = Math.max(0, Math.min(H - 1, Math.floor(((90 - lat) / 180) * H)));
    return land[r * W + c] === 1;
  };

  // STEP = 3.3 balances crisp visual density with high performance (~3,500 points)
  const D = Math.PI / 180, STEP = 3.3, pts = [];
  let ring = 0;
  for (let lat = -87; lat <= 87; lat += STEP, ring++) {
    const cl = Math.cos(lat * D), n = Math.max(1, Math.round((360 * cl) / STEP));
    for (let i = 0; i < n; i++) {
      const lon = -180 + ((i + (ring % 2) * 0.5) * 360) / n;
      pts.push({ lon: lon * D, sl: Math.sin(lat * D), cl, land: isLand(lat, lon) });
    }
  }

  // Pre-bucketed stars (avoids per-frame string formatting for fillStyle)
  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.0 + 0.3,
    p: Math.random() * 6.28,
    s: 0.6 + Math.random() * 1.6
  }));
  const starBuckets = [[], [], []];
  stars.forEach((s, idx) => starBuckets[idx % 3].push(s));
  const STAR_COLORS = ['rgba(220,210,255,0.3)', 'rgba(220,210,255,0.55)', 'rgba(220,210,255,0.85)'];

  const CITIES = [[19, 72.8], [51.5, -0.1], [40.7, -74], [35.7, 139.7], [-33.9, 151.2], [-33.9, 18.4], [1.3, 103.8], [25.2, 55.3]];
  const ARCS = [[0, 1], [2, 3], [4, 5], [6, 7], [1, 2]];

  let w = 0, h = 0, dpr = 1, R = 0, cx = 0, cy = 0, raf = 0;
  const TILT = 0.42, t0 = performance.now();

  // Pre-allocated flat buffers for drawing points (eliminates GC pauses completely)
  const MAX_PER_BUCKET = 3000;
  const bucketX = Array.from({ length: 6 }, () => new Float32Array(MAX_PER_BUCKET));
  const bucketY = Array.from({ length: 6 }, () => new Float32Array(MAX_PER_BUCKET));
  const bucketR = Array.from({ length: 6 }, () => new Float32Array(MAX_PER_BUCKET));
  const bucketCount = new Int32Array(6);

  // Cached gradients (created once on resize, never inside frame loop)
  let bodyGrad = null, scrimGrad = null;

  // Pre-render satellite glow to tiny offscreen canvas once
  const satCv = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (satCv) {
    satCv.width = 24; satCv.height = 24;
    const sCtx = satCv.getContext('2d');
    if (sCtx) {
      const sg = sCtx.createRadialGradient(12, 12, 0, 12, 12, 12);
      sg.addColorStop(0, 'rgba(255,255,255,0.95)');
      sg.addColorStop(0.4, 'rgba(167,139,250,0.5)');
      sg.addColorStop(1, 'rgba(167,139,250,0)');
      sCtx.fillStyle = sg;
      sCtx.beginPath(); sCtx.arc(12, 12, 12, 0, 6.2832); sCtx.fill();
      sCtx.fillStyle = '#fff';
      sCtx.fillRect(10.5, 10.5, 3, 3);
    }
  }

  const resize = () => {
    const parent = cv.parentElement;
    w = parent ? parent.clientWidth : (cv.clientWidth || window.innerWidth);
    h = parent ? parent.clientHeight : (cv.clientHeight || window.innerHeight);
    if (!w || w > 4000) w = window.innerWidth || 1280;
    if (!h || h > 4000) h = window.innerHeight || 800;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap at 1.5 for ultra-smooth FPS
    const nw = Math.round(w * dpr);
    const nh = Math.round(h * dpr);
    if (cv.width !== nw) cv.width = nw;
    if (cv.height !== nh) cv.height = nh;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(w * 0.29, h * 0.47); cx = w * 0.5; cy = h * 0.66;

    // Cache static radial gradients
    bodyGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    bodyGrad.addColorStop(0, '#150a2e');
    bodyGrad.addColorStop(1, '#05030c');

    scrimGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w * 0.34, 320));
    scrimGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
    scrimGrad.addColorStop(1, 'rgba(0,0,0,0)');
  };

  const proj = (lon, sl, cl, rot, k) => {
    const l = lon - rot, x0 = cl * Math.sin(l), z0 = cl * Math.cos(l);
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const y = sl * ct - z0 * st, z = sl * st + z0 * ct;
    return [cx + x0 * R * k, cy - y * R * k, z];
  };

  const ll = (la, lo) => [Math.sin(la * D), Math.cos(la * D), lo * D];

  const frame = (now) => {
    const t = still ? 2.2 : (now - t0) * 0.001, rot = t * 0.1;
    ctx.clearRect(0, 0, w, h);

    // 1. Stars (batched by alpha bucket)
    for (let b = 0; b < 3; b++) {
      ctx.fillStyle = STAR_COLORS[b];
      const sList = starBuckets[b];
      for (let i = 0, slen = sList.length; i < slen; i++) {
        const s = sList[i];
        ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
      }
    }

    // 2. Rim glow (breathing)
    const br = 0.5 + 0.5 * Math.sin(t * 1.1);
    const rg = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * (1.32 + 0.04 * br));
    rg.addColorStop(0, 'rgba(139,92,246,' + (0.32 + 0.12 * br).toFixed(3) + ')');
    rg.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.34, 0, 6.2832); ctx.fill();

    // 3. Globe body (cached gradient)
    if (bodyGrad) {
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
    }

    // 4. Lattice (wireframe - step 12 for smooth 60fps)
    ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(167,139,250,0.14)';
    ctx.beginPath();
    for (let la = -60; la <= 60; la += 30) {
      let pen = false;
      const sla = Math.sin(la * D), cla = Math.cos(la * D);
      for (let lo = -180; lo <= 180; lo += 12) {
        const p = proj(lo * D, sla, cla, rot, 1);
        if (p[2] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false;
      }
    }
    for (let lo = -180; lo < 180; lo += 30) {
      let pen = false;
      const rlo = lo * D;
      for (let la = -84; la <= 84; la += 12) {
        const p = proj(rlo, Math.sin(la * D), Math.cos(la * D), rot, 1);
        if (p[2] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false;
      }
    }
    ctx.stroke();

    // 5. Dots: zero-allocation bucketed draw
    const rr = Math.max(0.8, R / 230);
    bucketCount.fill(0);
    const numPts = pts.length;
    for (let i = 0; i < numPts; i++) {
      const p = pts[i];
      const q = proj(p.lon, p.sl, p.cl, rot, 1);
      if (q[2] <= 0) continue;
      let bIdx, r;
      if (p.land) {
        const b = (q[2] * 4) | 0;
        bIdx = 2 + (b > 3 ? 3 : b);
        r = rr * (0.7 + 0.8 * q[2]);
      } else {
        bIdx = q[2] > 0.5 ? 1 : 0;
        r = rr * 0.42;
      }
      const idx = bucketCount[bIdx]++;
      if (idx < MAX_PER_BUCKET) {
        bucketX[bIdx][idx] = q[0];
        bucketY[bIdx][idx] = q[1];
        bucketR[bIdx][idx] = r;
      }
    }

    // Draw ocean buckets
    ctx.fillStyle = 'rgba(124,92,214,0.22)';
    ctx.beginPath();
    for (let i = 0, cnt = bucketCount[0]; i < cnt; i++) {
      const x = bucketX[0][i], y = bucketY[0][i], r = bucketR[0][i];
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832);
    }
    ctx.fill();

    ctx.fillStyle = 'rgba(124,92,214,0.4)';
    ctx.beginPath();
    for (let i = 0, cnt = bucketCount[1]; i < cnt; i++) {
      const x = bucketX[1][i], y = bucketY[1][i], r = bucketR[1][i];
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832);
    }
    ctx.fill();

    // Draw land buckets
    const LAND_COLORS = ['rgba(176,148,255,0.2)', 'rgba(176,148,255,0.34)', 'rgba(176,148,255,0.55)', 'rgba(176,148,255,0.78)'];
    for (let b = 0; b < 4; b++) {
      const bIdx = 2 + b;
      const cnt = bucketCount[bIdx];
      if (cnt === 0) continue;
      ctx.fillStyle = LAND_COLORS[b];
      ctx.beginPath();
      const bx = bucketX[bIdx], by = bucketY[bIdx], brArr = bucketR[bIdx];
      for (let i = 0; i < cnt; i++) {
        const x = bx[i], y = by[i], r = brArr[i];
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832);
      }
      ctx.fill();
    }

    // 6. Arcs between cities
    ARCS.forEach((a, k) => {
      const A = ll(CITIES[a[0]][0], CITIES[a[0]][1]), Bc = ll(CITIES[a[1]][0], CITIES[a[1]][1]);
      const v = (la, lo) => [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
      const pa = v(Math.asin(A[0]), A[2]), pb = v(Math.asin(Bc[0]), Bc[2]);
      const om = Math.acos(Math.max(-1, Math.min(1, pa[0] * pb[0] + pa[1] * pb[1] + pa[2] * pb[2]))) || 1e-3;
      const head = (t * 0.22 + k * 0.21) % 1.25;
      ctx.lineWidth = 1.4;
      for (let s = 0; s < 24; s += 2) {
        const u = s / 24; if (u > head || u < head - 0.35) continue;
        const f = (u - (head - 0.35)) / 0.35;
        const w1 = Math.sin((1 - u) * om) / Math.sin(om), w2 = Math.sin(u * om) / Math.sin(om);
        const lift = 1 + 0.16 * Math.sin(Math.PI * u);
        const X = (w1 * pa[0] + w2 * pb[0]) * lift, Y = (w1 * pa[1] + w2 * pb[1]) * lift, Z = (w1 * pa[2] + w2 * pb[2]) * lift;
        const l = Math.atan2(X, Z), cl = Math.hypot(X, Z), sl = Y;
        const p = proj(l, sl, cl, rot, 1);
        if (p[2] < 0.02) continue;
        ctx.fillStyle = 'rgba(214,194,255,' + (0.15 + 0.85 * f).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(p[0], p[1], 1 + 1.4 * f, 0, 6.2832); ctx.fill();
      }
    });

    // 7. Satellite orbit
    const inc = 0.9, Ro = R * 1.22, ang = t * 0.45;
    ctx.strokeStyle = 'rgba(167,139,250,0.16)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let a = 0; a <= 6.3; a += 0.2) {
      const X = Ro * Math.cos(a), Y = Ro * Math.sin(a) * Math.sin(inc) * 0.35, Z = Math.sin(a);
      if (Z < 0 && Math.hypot(X, Y) < R) continue;
      a === 0 ? ctx.moveTo(cx + X, cy + Y) : ctx.lineTo(cx + X, cy + Y);
    }
    ctx.stroke();

    const sx = cx + Ro * Math.cos(ang), sy = cy + Ro * Math.sin(ang) * Math.sin(inc) * 0.35, sz = Math.sin(ang);
    if (!(sz < 0 && Math.hypot(sx - cx, sy - cy) < R)) {
      if (satCv) {
        ctx.drawImage(satCv, sx - 12, sy - 12);
      } else {
        ctx.fillStyle = '#fff'; ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
      }
    }

    // 8. Soft scrim
    if (scrimGrad) {
      ctx.fillStyle = scrimGrad;
      ctx.fillRect(0, 0, w, h);
    }

    if (!still) raf = requestAnimationFrame(frame);
  };

  resize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { resize(); if (still) frame(performance.now()); }) : null;
  const roTarget = cv.parentElement || cv;
  if (ro) ro.observe(roTarget); else window.addEventListener('resize', resize);

  const onVis = () => {
    if (document.hidden) {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    } else if (!still && !raf) {
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVis);

  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVis);
    if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
  };
}
