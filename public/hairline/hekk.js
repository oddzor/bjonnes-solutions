/**
 * Hekk: a house on its plot, with a hedge along the two near sides. The hedge
 * has grown out, every stretch to its own height. The pointer is put on the
 * plot, and the hedge near it is cut down to one level, the nearest stretches
 * all the way and the next ones less. Taking the pointer away lets it grow out
 * again. The slider is the radius, in stretches.
 *
 * The pattern: a continuous field. A spring per stretch, a falloff by
 * distance, a hit test on one plane that never moves, and a rest that is uneven.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, rings, unproj, spring, stepS,
  disposer, mk, pointer, put, register, solid,
} = HL;

const STEP = 12, CUT = 7, EDGE = 84, W = 46, D = 34, WALL = 22, EAVE = 20, RIDGE = 38, OUT = 4;
// The stretches, from the far end of one side round the corner to the far end of the other, and how far each has grown.
const GROWN = [15, 19, 13, 21, 16, 12, 18, 22, 14, 17, 20, 13, 16];
const SPOTS = GROWN.map((h, n) => (n < 6 ? { x: EDGE, y: 6 + n * STEP, h } : { x: EDGE - (n - 6) * STEP, y: 6 + 6 * STEP, h }));

/** The share of the cut at u radii from the pointer: all of it to .4, then less, none from 1. */
const falloff = (u) => (u <= 0.4 ? 1 : u >= 1 ? 0 : 1 - (u - 0.4) / 0.6);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value * STEP, over = null;

  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-12, -12, -4], [98, 92, -4], [98, -12, -4], [-12, 92, -4], [0, 0, RIDGE + 4]], 200, 166);
  const P = proj(C), front = facing(C);

  // Back to front: the plot, the house and its roof, then the hedge by ascending x + y.
  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-12, -12, 98, 92, 10, 2.2);
  put(solid(g), prism(P, front, pr, pi, -4, 0));
  const [wr, wi] = rings(0, 0, W, D, 1.5, 1);
  put(solid(g), prism(P, front, wr, wi, 0, WALL));
  const gable = (x) => [[x, -OUT, EAVE], [x, D / 2, RIDGE], [x, D + OUT, EAVE]].map((q) => P(q[0], q[1], q[2]));
  mk("path", { class: "sil", d: poly(hull(gable(-OUT).concat(gable(W + OUT)))) }, g);
  mk("path", { class: "nf lo", d: open(gable(W + OUT - 1.6)) }, g);

  const tall = GROWN.indexOf(Math.max(...GROWN));
  const hedge = SPOTS.map((sp, n) => ({ n, sp, depth: sp.x + sp.y })).sort((a, b) => a.depth - b.depth).map(({ n, sp }) => {
    const [ring, inner] = rings(sp.x - 5.4, sp.y - 5.4, sp.x + 5.4, sp.y + 5.4, 3, 1.1);
    return { n, sp, ring, inner, s: spring(sp.h, { eps: 0.03 }), el: solid(g), drawn: NaN };
  });

  let named = -1;
  function draw(b) {
    const h = b.s.x;
    if (h !== b.drawn) { b.drawn = h; put(b.el, prism(P, front, b.ring, b.inner, 0, h)); }
    // One bright mark: the tallest stretch at rest, the one under the pointer otherwise.
    b.el.sil.classList.toggle("hi", over ? b.n === named : b.n === tall);
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const b of hedge) { if (stepS(b.s, dt)) moving = true; draw(b); }
    return moving;
  });
  bag.add(B.unregister);

  function retarget() {
    named = -1;
    let near = R;
    for (const b of hedge) {
      if (!over) { b.s.t = b.sp.h; continue; }
      const d = Math.hypot(b.sp.x - over[0], b.sp.y - over[1]);
      b.s.t = b.sp.h - (b.sp.h - CUT) * falloff(d / R);
      if (d < near) { near = d; named = b.n; }
    }
    read.textContent = named < 0 ? "rest" : "hekk " + (named + 1);
    B.wake();
  }

  // The pointer is put on the plane of the cut hedge, which is where the hedge ends up under it.
  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], CUT); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * STEP; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "hekk",
  means: "A house with an overgrown hedge on two sides: the hedge near the pointer is cut down to one level.",
  rules: [1, 3, 5, 8],
  range: [1.2, 2.4, 4],
  mount,
});
