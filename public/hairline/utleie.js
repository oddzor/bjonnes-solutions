/**
 * Utleie: three machines parked in a row on a yard, to be picked from. A plate
 * compactor with its handle, a tracked dumper with its skip, and a compact
 * excavator with its cab and arm. The one under the pointer drives out of the
 * row, and the ones beside it nose out after it, a little less. At rest the
 * excavator already stands a step forward. The slider is the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * on the machines' parking places, which never move.
 */
const {
  Cam, facing, fillet, fit, hull, open, poly, prism, proj, ringAt, rings, rrect, tdone, tset, tval, tween,
  disposer, mk, pointer, put, register, solid,
} = HL;

const GAP = 48, OUT = 26, REST = [0, 4, 12], SHARE = [1, 0.3, 0.1], NAMES = ["plate", "dumper", "graver"];
// The excavator's arm, in its own upright plane: along each part and across it.
const BOOM = fillet([[-3, -3], [-3, 3], [13, 6.5], [30, 2.2], [30, -2.2]], [2, 2, 4, 2, 2]);
const STICK = fillet([[-3.5, -2], [-3.5, 2.6], [4, 3.8], [26, 1.9], [26, -1.9]], [1.6, 2, 2, 1.8, 1.8]);
const BUCKET = fillet([[-2, -3], [-2, 3], [1.5, 6], [11, 8.5], [12.5, 3], [9, -4.5], [3, -6]], [1.2, 1.2, 1.4, 0.7, 2.6, 3, 2.6]);

/**
 * Machine i moved y out of the row, as its solids from the back to the front: each [sil, crease, bright at rest, a bar].
 * A machine stands on x from its place minus 12 to plus 12, and faces +y.
 */
function machine(P, front, i, y) {
  const cx = i * GAP, out = [];
  const box = (x0, y0, x1, y1, z0, z1, r, mark) => {
    const [ring, inner] = rings(cx + x0, y + y0, cx + x1, y + y1, r, 1);
    const s = prism(P, front, ring, inner, z0, z1);
    out.push([s.sil, s.crease, mark]);
  };
  if (i === 0) {
    // The handle: a bow from the plate's back corners, up and back.
    const bar = [[-8, 4, 12], [-8, -10, 33], [8, -10, 33], [8, 4, 12]].map((q) => P(cx + q[0], y + q[1], q[2]));
    out.push([open(bar), "", false, true]);
    box(-11, 0, 11, 28, 0, 4, 3.4);
    box(-8, 7, 8, 22, 4, 18, 3);
  } else if (i === 1) {
    box(-12, 0, -6, 32, 0, 6, 3); box(6, 0, 12, 32, 0, 6, 3);
    box(-9, 2, 9, 30, 6, 10, 2);
    box(-8, 1, 8, 10, 10, 21, 2);
    // The skip: wider at its rim than at its foot, and open.
    const at = (ring, z) => ringAt(P, ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + y })), z);
    const foot = rrect(-8, 13, 8, 30, 2), rim = rrect(-12, 11, 12, 37, 3), lip = rrect(-10.4, 12.6, 10.4, 35.4, 2);
    out.push([poly(hull(at(foot, 10).concat(at(rim, 25)))), poly(at(lip, 25))]);
  } else {
    box(-12, 0, -6, 32, 0, 7, 3.4); box(6, 0, 12, 32, 0, 7, 3.4);
    box(-11, 3, 11, 28, 7, 16, 4);
    box(-10, 6, -1, 19, 16, 31, 2);
    // Boom, stick and bucket: three plates in the plane x = cx + 4, each the hull of its two sides.
    const frames = [[20, 17, 1.02, BOOM], [35.7, 42.6, -1.17, STICK], [45.9, 18.7, 0, BUCKET]];
    frames.forEach(([oy, oz, th, shape], k) => {
      const c = Math.cos(th), s = Math.sin(th);
      const side = (w) => shape.map((q) => (k === 2 ? P(cx + 4 + w, y + oy - q[1], oz - q[0]) : P(cx + 4 + w, y + oy + q[0] * c - q[1] * s, oz + q[0] * s + q[1] * c)));
      out.push([poly(hull(side(2.4).concat(side(-2.4)))), "", k === 2]);
    });
  }
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 1.6);
  fit(C, [[-20, -18, -4], [116, 80, -4], [116, -18, -4], [-20, 80, -4], [96, 30, 46]], 200, 166);
  const P = proj(C), front = facing(C);

  // Back to front: the yard, then the machines along the row, each nearer than the last.
  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-20, -18, 116, 80, 10, 2.2);
  put(solid(g), prism(P, front, pr, pi, -4, 0));
  const row = REST.map((rest, i) => {
    const grp = mk("g", {}, g), shapes = machine(P, front, i, rest);
    const els = shapes.map(() => solid(grp));
    // A bar is a line, not a plate: it covers nothing behind it.
    shapes.forEach((s, k) => { if (s[3]) els[k].sil.classList.add("nf"); });
    return { els, marks: shapes.map((s) => !!s[2]), t: tween(rest), drawn: NaN };
  });

  function draw(i, y) {
    const m = row[i];
    if (y === m.drawn) return;
    m.drawn = y;
    machine(P, front, i, y).forEach(([sil, crease], k) => put(m.els[k], { sil, crease }));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    row.forEach((m, i) => { draw(i, tval(m.t, now)); if (!tdone(m.t, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // Each parking place on screen, at the middle of a machine standing in it.
  const places = REST.map((_, i) => P(i * GAP, 16, 10));

  /** The machine whose place is nearest the point across the row, while the point is over the yard; -1 outside. */
  function hit([x, y]) {
    let best = -1, near = 26;
    places.forEach((p, i) => { const d = Math.abs(x - p[0]) + Math.max(0, Math.abs(y - p[1]) - 46) * 3; if (d < near) { near = d; best = i; } });
    return best;
  }

  let act = -1;
  /** Drives machine a out (-1 parks them again). The stagger spreads out from the machine picked, or the one let go. */
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    row.forEach((m, i) => {
      tset(m.t, a < 0 ? REST[i] : Math.max(REST[i], OUT * SHARE[Math.abs(i - a)]), now, Math.abs(i - from) * stag);
      // One bright mark: the excavator's bucket at rest, the whole of the machine picked otherwise.
      m.els.forEach((el, k) => { el.sil.classList.toggle("hi", a < 0 ? m.marks[k] : i === a); });
    });
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  row.forEach((m) => m.els.forEach((el, k) => el.sil.classList.toggle("hi", m.marks[k])));

  bag.add(pointer(stage, { move: (p) => pick(hit(p)), leave: () => pick(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "utleie",
  means: "Three machines parked in a row: the one under the pointer drives out, and the ones beside it nose out after it.",
  rules: [1, 2, 5, 9],
  range: [0, 70, 160],
  mount,
});
