// Procedural dot-matrix globe + starfield (canvas 2D). Used as the always-available
// background layer under the looping video. Land mask: 180x90 grid, 1 bit per cell.
const LAND = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAfvAAAAAAAAAAAAAAAAAAAAAAAAx37///+AAAAAGoABAAAAAAAAAAAAAIe8P///wAA8AAAAAA0AAAAAAAAAAAwADw////4AAIAAAAAAHAAAAAAAAAAALivwAf//wAAAAADAAP/wAHIAAAAAADsj38AH/+gAAAAAEAH///OAAAAgBgAAfw3/gB/+gAAAgAMHe///+/9gBAP/7/nbdrwD/+AAAH/Ag7H////////8H//////g8H/gAAAf/6//f////////Mf/////9H4D4A+AA+ev///////////AP/////4A0B4AAAD5/////////////Af1////gHgA4AAAP5///////////LwAHgD///gH0AAAAAG4/////////+AMAABAC///4D+AAAAGCx/////////4A4AAAAB////n/gAAAOCR/////////4A4AAAAAf///3/wAAAbH//////////9AgAAAAAP/////gAAADf//////////9AAAAAAAF////0YAAAB///////////8AAAAAAAD////8EAAAB///v///////5AAAAAAAD////+AAAAB/f5f///////wAAAAAAAD////gAAAAfxnwP///////jgAAAAAAD///+AAAAAPCb3///////+AAAAAAAAD///8AAAAAfCJf//////+ECAAAAAAAB///8AAAAAGDRf///////mMAAAAAAAA///8AAAAAH+Ai///////E8AAAAAAAAf//wAAAAAP/AA///////BgAAAAAAAAP//gAAAAAf/73///////gAAAAAAAAAD/AQAAAAAf//9/f/////gAAAAAAAAAF+AQAAAAB///+/n/////AAAAAAAAAAC+AAAAAAB///+fwH///+AAAAAAAAAAAeAwAAAAD////f/D///8gAAAAAAAAAAeGEAAAAD////v+B/j/AAAAAAAAAAAAPMAwAAAD////n+AfB+gAAAAAAAAAAAD8AAAAAD////34AeBfAgAAAAAAAAAAAPAAAAAH////3gAcAfAgAAAAAAAAAAADAAAAAD////6AAcAfgwAAAAAAAAAAABBwAAAD////8wAMATAIAAAAAAAAAAAAr/AAAB/////gAIASAAAAAAAAAAAAAAH/gAAA/////gACAAAIAAAAAAAAAAAAH/8AAAYH///AAAAsGAAAAAAAAAAAAAH/+AAAAB//+AAAAUOAAAAAAAAAAAAAP/+AAAAB//8AAAAc+gAAAAAAAAAAAAP//gAAAD//4AAAAMeBgAAAAAAAAAAAP//8AAAB//wAAAAGdCuAAAAAAAAAAAf///AAAA//wAAAACAAHgAAAAAAAAAAP///gAAA//wAAAAB4AHggAAAAAAAAAH///AAAAf/wAAAAACIDQIAAAAAAAAAH//+AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//8AAAA//wgAAAAAHxgBAAAAAAAAAA//8AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/gAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/wAAAAf/DAAAAAH//4AAAAAAAAAAAf/AAAAAf+DAAAAAH//8AAAAAAAAAAAf/AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/8AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/gAAAAAAAAAAAAACAP4AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB+AAAAAAAAAAAAAAAAAAAGAAAAAAAAB6AAAAAAAAAAAAAAAAAwAMAAAAAAAAA8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAACAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAA8AAf/8d/AAAAAAAAAAAAkAAAAAAACP/+H//////AAAAAAAAAAA+AAAAIf////+////////AAAAAAAOMKPAAAB///////////////gAAAH/8D//8AAAH//////////////4AAAF/////8AAAP///////////////4AAIf/////gwBwf///////////////4AAAH//////AAD////////////////wAAA///////+f//////////////////A/wH///////////////////////////////////////////////////////////////////////////////////////";

export function startGlobe(cv, still) {
  const ctx = cv.getContext('2d');
  if (!ctx) return () => {};
  const W = 180, H = 90, land = new Uint8Array(W * H);
  const bin = atob(LAND);
  for (let i = 0; i < W * H; i++) land[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  const isLand = (lat, lon) => {
    let c = Math.floor(((lon + 180) / 360) * W) % W; if (c < 0) c += W;
    const r = Math.max(0, Math.min(H - 1, Math.floor(((90 - lat) / 180) * H)));
    return land[r * W + c] === 1;
  };
  const D = Math.PI / 180, STEP = 2.7, pts = [];
  let ring = 0;
  for (let lat = -87; lat <= 87; lat += STEP, ring++) {
    const cl = Math.cos(lat * D), n = Math.max(1, Math.round((360 * cl) / STEP));
    for (let i = 0; i < n; i++) {
      const lon = -180 + ((i + (ring % 2) * 0.5) * 360) / n;
      pts.push({ lon: lon * D, sl: Math.sin(lat * D), cl, land: isLand(lat, lon) });
    }
  }
  const stars = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.25, p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.6 }));
  const CITIES = [[19, 72.8], [51.5, -0.1], [40.7, -74], [35.7, 139.7], [-33.9, 151.2], [-33.9, 18.4], [1.3, 103.8], [25.2, 55.3]];
  const ARCS = [[0, 1], [2, 3], [4, 5], [6, 7], [1, 2]];
  let w = 0, h = 0, dpr = 1, R = 0, cx = 0, cy = 0, raf = 0;
  const TILT = 0.42, t0 = performance.now();

  const resize = () => {
    const parent = cv.parentElement;
    w = parent ? parent.clientWidth : (cv.clientWidth || window.innerWidth);
    h = parent ? parent.clientHeight : (cv.clientHeight || window.innerHeight);
    if (!w || w > 4000) w = window.innerWidth || 1280;
    if (!h || h > 4000) h = window.innerHeight || 800;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nw = Math.round(w * dpr);
    const nh = Math.round(h * dpr);
    if (cv.width !== nw) cv.width = nw;
    if (cv.height !== nh) cv.height = nh;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(w * 0.29, h * 0.47); cx = w * 0.5; cy = h * 0.66;
  };
  const proj = (lon, sl, cl, rot, k) => {
    const l = lon - rot, x0 = cl * Math.sin(l), z0 = cl * Math.cos(l);
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const y = sl * ct - z0 * st, z = sl * st + z0 * ct;
    return [cx + x0 * R * k, cy - y * R * k, z];
  };
  const ll = (la, lo) => [Math.sin(la * D), Math.cos(la * D), lo * D];

  const frame = (now) => {
    const t = still ? 2.2 : (now - t0) / 1000, rot = t * 0.1;
    ctx.clearRect(0, 0, w, h);
    // stars
    for (const s of stars) {
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      ctx.fillStyle = 'rgba(220,210,255,' + a.toFixed(3) + ')';
      ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
    }
    // rim glow (breathing)
    const br = 0.5 + 0.5 * Math.sin(t * 1.1);
    let g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * (1.32 + 0.04 * br));
    g.addColorStop(0, 'rgba(139,92,246,' + (0.32 + 0.12 * br).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.34, 0, 6.2832); ctx.fill();
    // body
    g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#150a2e'); g.addColorStop(1, '#05030c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
    // lattice (wireframe)
    ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(167,139,250,0.14)';
    ctx.beginPath();
    for (let la = -60; la <= 60; la += 30) {
      let pen = false;
      for (let lo = -180; lo <= 180; lo += 6) {
        const p = proj(lo * D, Math.sin(la * D), Math.cos(la * D), rot, 1);
        if (p[2] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false;
      }
    }
    for (let lo = -180; lo < 180; lo += 30) {
      let pen = false;
      for (let la = -84; la <= 84; la += 6) {
        const p = proj(lo * D, Math.sin(la * D), Math.cos(la * D), rot, 1);
        if (p[2] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false;
      }
    }
    ctx.stroke();
    // dots, bucketed by alpha so we fill few paths
    const rr = Math.max(0.8, R / 230);
    const B = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], O = [new Path2D(), new Path2D()];
    for (const p of pts) {
      const q = proj(p.lon, p.sl, p.cl, rot, 1);
      if (q[2] <= 0) continue;
      if (p.land) {
        const b = Math.min(3, Math.floor(q[2] * 4)), r = rr * (0.7 + 0.8 * q[2]);
        B[b].moveTo(q[0] + r, q[1]); B[b].arc(q[0], q[1], r, 0, 6.2832);
      } else {
        const b = q[2] > 0.5 ? 1 : 0, r = rr * 0.42;
        O[b].moveTo(q[0] + r, q[1]); O[b].arc(q[0], q[1], r, 0, 6.2832);
      }
    }
    ctx.fillStyle = 'rgba(124,92,214,0.22)'; ctx.fill(O[0]);
    ctx.fillStyle = 'rgba(124,92,214,0.4)'; ctx.fill(O[1]);
    const LA = [0.2, 0.34, 0.55, 0.78];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(176,148,255,' + LA[i] + ')'; ctx.fill(B[i]); }
    // light arcs between cities (pulsing head)
    ARCS.forEach((a, k) => {
      const A = ll(CITIES[a[0]][0], CITIES[a[0]][1]), Bc = ll(CITIES[a[1]][0], CITIES[a[1]][1]);
      const v = (la, lo) => [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
      const pa = v(Math.asin(A[0]), A[2]), pb = v(Math.asin(Bc[0]), Bc[2]);
      const om = Math.acos(Math.max(-1, Math.min(1, pa[0] * pb[0] + pa[1] * pb[1] + pa[2] * pb[2]))) || 1e-3;
      const head = (t * 0.22 + k * 0.21) % 1.25;
      ctx.lineWidth = 1.4;
      for (let s = 0; s < 24; s++) {
        const u = s / 24; if (u > head || u < head - 0.35) continue;
        const f = (u - (head - 0.35)) / 0.35;
        const w1 = Math.sin((1 - u) * om) / Math.sin(om), w2 = Math.sin(u * om) / Math.sin(om);
        const lift = 1 + 0.16 * Math.sin(Math.PI * u);
        const X = (w1 * pa[0] + w2 * pb[0]) * lift, Y = (w1 * pa[1] + w2 * pb[1]) * lift, Z = (w1 * pa[2] + w2 * pb[2]) * lift;
        const l = Math.atan2(X, Z) , cl = Math.hypot(X, Z), sl = Y;
        const p = proj(l, sl, cl, rot, 1);
        if (p[2] < 0.02) continue;
        ctx.fillStyle = 'rgba(214,194,255,' + (0.15 + 0.85 * f).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p[0], p[1], 1 + 1.4 * f, 0, 6.2832); ctx.fill();
      }
    });
    // orbiting satellite on a tilted ring
    const inc = 0.9, Ro = R * 1.22, ang = t * 0.45;
    ctx.strokeStyle = 'rgba(167,139,250,0.16)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let a = 0; a <= 6.3; a += 0.1) {
      const X = Ro * Math.cos(a), Y = Ro * Math.sin(a) * Math.sin(inc) * 0.35, Z = Math.sin(a);
      if (Z < 0 && Math.hypot(X, Y) < R) continue;
      a === 0 ? ctx.moveTo(cx + X, cy + Y) : ctx.lineTo(cx + X, cy + Y);
    }
    ctx.stroke();
    const sx = cx + Ro * Math.cos(ang), sy = cy + Ro * Math.sin(ang) * Math.sin(inc) * 0.35, sz = Math.sin(ang);
    if (!(sz < 0 && Math.hypot(sx - cx, sy - cy) < R)) {
      g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
      g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 12, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
    }
    // soft scrim keeps the headline readable over the dots
    g = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w * 0.34, 320));
    g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (!still) raf = requestAnimationFrame(frame);
  };
  resize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { resize(); if (still) frame(performance.now()); }) : null;
  const roTarget = cv.parentElement || cv;
  if (ro) ro.observe(roTarget); else window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); else window.removeEventListener('resize', resize); };
}
