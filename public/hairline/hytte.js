/**
 * Hytte: a cabin with a pitched roof and a chimney, a spruce beside it. Its
 * door and its two shutters are plates on hinges. The one under the pointer
 * swings wide open, and the others follow in turn, each a little less. At rest
 * the cabin is shut up, with the door left ajar. The slider is the stagger,
 * in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * on the three openings in the walls, which never move.
 */
const {
  Cam, circ, facing, fit, hull, open, poly, prism, proj, rad, ringAt, rings, tdone, tset, tval, tween,
  disposer, mk, pointer, put, register, solid,
} = HL;

const W = 56, D = 40, WALL = 26, EAVE = 24, RIDGE = 46, OUT = 4;
const WIDE = 96, SHARE = [1, 0.42, 0.16], NAMES = ["luke 1", "luke 2", "dør"];
/**
 * The three leaves, round the corner from the far shutter to the door. Each hangs on the wall at `hinge` [x, y],
 * runs `w` along the unit vector `along` when shut, swings out along `out`, and stands from z0 to z1.
 */
const LEAVES = [
  { hinge: [W, 9], along: [0, 1], out: [1, 0], w: 9, z0: 9, z1: 19, rest: 0 },
  { hinge: [W, 31], along: [0, -1], out: [1, 0], w: 9, z0: 9, z1: 19, rest: 12 },
  { hinge: [18, D], along: [1, 0], out: [0, 1], w: 12, z0: 0, z1: 19, rest: 28 },
];

/** Leaf l swung th degrees: its four corners on the ground plan, as world points. */
function leaf(l, th) {
  const c = Math.cos(rad(th)), s = Math.sin(rad(th));
  const end = [l.hinge[0] + l.w * (l.along[0] * c + l.out[0] * s), l.hinge[1] + l.w * (l.along[1] * c + l.out[1] * s)];
  return [[...l.hinge, l.z0], [...end, l.z0], [...end, l.z1], [...l.hinge, l.z1]];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 2.05);
  fit(C, [[-30, -12, -4], [70, 64, -4], [70, -12, -4], [-30, 64, -4], [0, 0, RIDGE + 8], [-18, 44, 50]], 200, 166);
  const P = proj(C), front = facing(C), at = (q) => P(q[0], q[1], q[2]);

  // Back to front: the ground, the spruce behind the corner, the walls and their openings, the leaves, then the roof over them.
  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-30, -12, 70, 64, 10, 2.2);
  put(solid(g), prism(P, front, pr, pi, -4, 0));
  const ringOn = (r, z) => circ(r, 14).map((q) => P(-18 + q.u, 44 + q.v, z));
  const cone = (z0, z1, r) => mk("path", { class: "sil", d: poly(hull(ringOn(r, z0).concat(ringOn(0.7, z1)))) }, g);
  cone(0, 10, 2.2); cone(8, 28, 12); cone(20, 38, 9.5); cone(31, 47, 7);

  const [wr, wi] = rings(0, 0, W, D, 1.5, 1);
  put(solid(g), prism(P, front, wr, wi, 0, WALL));
  const leaves = LEAVES.map((l) => {
    mk("path", { class: "nf lo", d: poly(leaf(l, 0).map(at)) }, g);
    return { l, a: tween(l.rest), drawn: NaN };
  });
  for (const lf of leaves) lf.el = mk("path", { class: "sil" }, g);

  // The roof: two gable ends joined, the near one drawn in as its crease.
  const gable = (x) => [[x, -OUT, EAVE], [x, D / 2, RIDGE], [x, D + OUT, EAVE]].map(at);
  mk("path", { class: "sil", d: poly(hull(gable(-OUT).concat(gable(W + OUT)))) }, g);
  mk("path", { class: "nf lo", d: open(gable(W + OUT - 1.6)) }, g);
  const [cr, ci] = rings(36, 25, 44, 32, 1.2, 0.9);
  put(solid(g), prism(P, front, cr, ci, 35, 55));

  function draw(lf, th) {
    if (th === lf.drawn) return;
    lf.drawn = th;
    lf.el.setAttribute("d", poly(leaf(lf.l, th).map(at)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const lf of leaves) { draw(lf, tval(lf.a, now)); if (!tdone(lf.a, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // The middle of each opening, shut: where the pointer is tested.
  const mids = LEAVES.map((l) => P(l.hinge[0] + l.along[0] * l.w / 2, l.hinge[1] + l.along[1] * l.w / 2, (l.z0 + l.z1) / 2));

  /** The opening nearest the point, within reach of it; -1 outside. */
  function hit([x, y]) {
    let best = -1, near = 26;
    mids.forEach((m, i) => { const d = Math.hypot(x - m[0], y - m[1]); if (d < near) { near = d; best = i; } });
    return best;
  }

  let act = -1;
  /** Opens leaf a wide (-1 shuts the cabin up again). The stagger spreads out from the leaf opened, or the one let go. */
  function swing(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    leaves.forEach((lf, i) => {
      tset(lf.a, a < 0 ? lf.l.rest : Math.max(lf.l.rest, WIDE * SHARE[Math.abs(i - a)]), now, Math.abs(i - from) * stag);
      // One bright mark: the door left ajar at rest, the leaf under the pointer otherwise.
      lf.el.classList.toggle("hi", a < 0 ? i === 2 : i === a);
    });
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  leaves[2].el.classList.add("hi");

  bag.add(pointer(stage, { move: (p) => swing(hit(p)), leave: () => swing(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "hytte",
  means: "A cabin shut up for the season: the door or shutter under the pointer swings open, and the others follow in turn.",
  rules: [1, 2, 5, 8],
  range: [0, 70, 160],
  mount,
});
