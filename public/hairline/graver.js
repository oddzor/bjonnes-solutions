/**
 * Graver: a compact excavator. Two tracks carry a house with a cab beside the
 * boom; the boom, the stick and the bucket are three plates in one upright
 * plane. The pointer is put on the ground, and the house slews towards it
 * while the arm reaches until the bucket's lip stands on that point. At rest
 * the arm is half out with the bucket lifted, and a dashed line drops from its
 * lip to the spot it would dig. The slider is the reach, the farthest the lip
 * goes from the slew ring.
 *
 * The pattern: a continuous input. Three springs (slew, reach, height), a
 * reach clamped at both ends, and a hit test on the ground plane.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, open, poly, prism, proj, rad, ringAt, rings, run, seg, unproj,
  spring, stepS, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const NEAR = 29, FAR = 54, LB = 42, LS = 32, AU = 7, AZ = 21, TK = 2.6, TKB = 5.5;
// The slew is measured from the line of sight. Seen along it the arm is one line, so it keeps DEAD away from it.
const VIEW = rad(45), SWING = rad(88), DEAD = rad(20), REST = { a: rad(-52), r: 41, z: 17 };
// Each plate in its own plane: along the part and across it.
const BOOM = fillet([[-4, -3.6], [-4, 3.6], [LB * 0.46, 8.4], [LB + 2.5, 2.6], [LB + 2.5, -2.6]], [2.6, 2.6, 5, 2.4, 2.4]);
const STICK = fillet([[-4.5, -2.4], [-4.5, 3], [5, 4.6], [LS + 2, 2.2], [LS + 2, -2.2]], [1.8, 2.2, 2.4, 2, 2]);
// The bucket hangs from its pin: along is down, across is towards the machine, where its mouth opens and its lip points.
const LIP = [12, 9.5];
const BUCKET = fillet([[-2, -3], [-2, 3], [1.5, 6.5], LIP, [13.5, 3], [10, -5], [3, -6.5]], [1.4, 1.4, 1.6, 0.7, 3, 3.4, 3]);

/** A convex polygon drawn in by b, about its centre: close enough to an inset for a crease. */
function inset(pts, b) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map((p) => { const d = Math.hypot(p[0] - cx, p[1] - cy); return [cx + (p[0] - cx) * (1 - b / d), cy + (p[1] - cy) * (1 - b / d)]; });
}

/** A rounded footprint turned by th about the slew ring, as [ring, inner]. */
const turned = (th, u0, v0, u1, v1, r, b) => rings(u0, v0, u1, v1, r, b).map((ring) => ring.map((q) => {
  const c = Math.cos(th), s = Math.sin(th);
  return { u: q.u * c - q.v * s, v: q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c };
}));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  // Fitted to the arm at full reach on either side and straight ahead, and to the elbow at its highest.
  const C = Cam(45, 0.5, 2.4), E = (FAR + 8) * Math.SQRT1_2;
  fit(C, [[E, -E, 0], [-E, E, 0], [E, E, 0], [-18, -18, 0], [4, 4, AZ + LB + 6]], 200, 166);
  const P = proj(C), front = facing(C);

  // Back to front: the far track, the near track, the dig spot and its drop, then the house, the cab and the arm.
  const g = mk("g", {}, svg);
  for (const y of [-14, 6]) {
    const [tr, ti] = rings(-22, y, 22, y + 8, 4, 1.2);
    put(solid(g), prism(P, front, tr, ti, 0, 8));
  }
  const spot = flatDot(g, C, 1.3, "dot m"), drop = mk("path", { class: "nf dash" }, g);
  const house = solid(g), cab = solid(g), glass = mk("path", { class: "nf lo" }, cab.g);
  const arm = mk("g", {}, g), ram = mk("path", { class: "nf" }, arm);
  const parts = [BOOM, STICK, BUCKET].map((shape, k) => {
    const el = solid(arm);
    // The one bright mark: the bucket, which is what follows the pointer.
    if (k === 2) el.sil.classList.add("hi");
    return { el, shape, crease: inset(shape, k === 2 ? 1.6 : 1.3), tk: k === 2 ? TKB : TK };
  });

  const sa = spring(REST.a), sr = spring(REST.r), sz = spring(REST.z);
  let drawn = "";

  function draw() {
    const a = sa.x + VIEW, r = sr.x, z = sz.x, key = a.toFixed(4) + r.toFixed(2) + z.toFixed(2);
    if (key === drawn) return;
    drawn = key;
    const c = Math.cos(a), s = Math.sin(a);
    // u runs out along the arm and w across it; the side with w > 0 faces the camera while the arm is right of the view.
    const W = (u, w, h) => P(u * c - w * s, u * s + w * c, h), nearW = sa.x < 0 ? 1 : -1;

    // Two links: from the boom's foot to the bucket's pin, elbow up.
    const pu = r + LIP[1], pz = z + LIP[0], d = clamp(Math.hypot(pu - AU, pz - AZ), LB - LS + 3, LB + LS - 1);
    const base = Math.atan2(pz - AZ, pu - AU), up = base + Math.acos((LB * LB + d * d - LS * LS) / (2 * LB * d));
    const eu = AU + LB * Math.cos(up), ez = AZ + LB * Math.sin(up), down = Math.atan2(pz - ez, pu - eu);
    const frames = [[AU, AZ, up], [eu, ez, down], [pu, pz, 0]];

    parts.forEach((p, k) => {
      const [ou, oz, th] = frames[k], ct = Math.cos(th), st = Math.sin(th);
      const at = (q, w) => (k === 2 ? W(ou - q[1], w, oz - q[0]) : W(ou + q[0] * ct - q[1] * st, w, oz + q[0] * st + q[1] * ct));
      const both = p.shape.map((q) => at(q, p.tk)).concat(p.shape.map((q) => at(q, -p.tk)));
      put(p.el, { sil: poly(hull(both)), crease: poly(p.crease.map((q) => at(q, nearW * p.tk))) });
    });
    ram.setAttribute("d", seg(W(13, 0, 17), W(AU + LB * 0.4 * Math.cos(up), 0, AZ + LB * 0.4 * Math.sin(up) - 2)));

    const [hr, hi] = turned(a, -17, -12, 13, 12, 5, 1.4), [cr, ci] = turned(a, -3, 3.4, 12, 12, 2.6, 1.1);
    put(house, prism(P, front, hr, hi, 9, 19));
    put(cab, prism(P, front, cr, ci, 19, 38));
    // The window: a band under the roof, on the sides of the cab that face the camera.
    glass.setAttribute("d", open(ringAt(P, run(cr, front), 31)));
    // The cab stands on the w > 0 side of the arm: whichever is nearer the camera is painted last.
    if (nearW > 0) arm.after(cab.g); else cab.g.after(arm);

    const foot = W(r, 0, 0);
    place(spot, foot);
    drop.setAttribute("d", z > 4 ? seg(W(r, 0, z), foot) : "");
  }

  const B = register(stage, (dt) => {
    const moving = [sa, sr, sz].map((sp) => stepS(sp, dt)).some(Boolean);
    draw();
    return moving;
  });
  bag.add(B.unregister);

  let over = null;
  function retarget() {
    if (!over) { sa.t = REST.a; sr.t = Math.min(REST.r, reach); sz.t = REST.z; read.textContent = "rest"; return B.wake(); }
    // Wrapped about the line of sight, so the one seam lies behind the machine.
    let a = Math.atan2(over[1], over[0]) - VIEW;
    a = clamp(Math.atan2(Math.sin(a), Math.cos(a)), -SWING, SWING);
    sa.t = Math.abs(a) < DEAD ? (a < 0 ? -DEAD : DEAD) : a;
    sr.t = clamp(Math.hypot(over[0], over[1]), NEAR, reach);
    sz.t = 2.5;
    read.textContent = (sr.t / 10).toFixed(1).replace(".", ",") + " m";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "graver",
  means: "A compact excavator: the house slews and the arm reaches until the bucket stands on the ground under the pointer.",
  rules: [1, 3, 5, 8],
  range: [36, 45, 54],
  mount,
});
