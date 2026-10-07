/**
 * Grøfta: a block of ground cut across a trench. Between the two banks the
 * trench is laid up in its order: the pipe in its bedding, the fill over it,
 * and the topsoil. Each can be drawn out of the cut face like a drawer. The
 * one under the pointer comes out furthest and the ones next to it follow,
 * each a little less. At rest they stand stepped, the pipe furthest out. The
 * slider is the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * on the cut face, which never moves.
 */
const {
  Cam, facing, fit, hull, poly, prism, proj, rings, tdone, tset, tval, tween,
  disposer, mk, pointer, put, register, solid,
} = HL;

const X1 = 54, TOP = 42, Y0 = 30, Y1 = 62, PY = 46, PZ = 15, PR = 6, STUB = 12, DRAW = 24;
// From the bottom up: [name, z0, z1, how far out at rest]. The pipe lies in the first layer, and is the first item.
const LAYERS = [["omfylling", 6, 25, 0], ["masser", 25, 35, 5], ["matjord", 35, TOP, 10]];
const NAMES = ["rør", ...LAYERS.map((l) => l[0])], REST = [8, ...LAYERS.map((l) => l[3])], SHARE = [1, 0.45, 0.18, 0.06];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 2.1);
  fit(C, [[0, 0, 0], [0, 78, 0], [X1, 78, 0], [X1 + DRAW + STUB + 10, PY, 0], [0, 0, TOP], [0, 78, TOP], [X1, 0, TOP]], 200, 166);
  const P = proj(C), front = facing(C);

  // Back to front: the far bank, the trench floor, the layers from the bottom up with the pipe in the first, then the near bank.
  const g = mk("g", {}, svg);
  const block = (y0, y1, z0, z1) => { const [r, i] = rings(0, y0, X1, y1, 3, 1.4); put(solid(g), prism(P, front, r, i, z0, z1)); };
  block(0, Y0, 0, TOP);
  block(Y0, Y1, 0, 6);
  const items = [];
  LAYERS.forEach((l, k) => {
    items[k + 1] = { el: solid(g), t: tween(REST[k + 1]) };
    if (k === 0) {
      const grp = mk("g", {}, g);
      items[0] = { el: { sil: mk("path", { class: "sil" }, grp) }, end: mk("path", { class: "sil" }, grp), bore: mk("path", { class: "nf lo" }, grp), t: tween(REST[0]) };
    }
  });
  block(Y1, 78, 0, TOP);

  /** A circle across the pipe at x, as screen points. */
  const round = (x, r) => Array.from({ length: 18 }, (_, k) => P(x, PY + r * Math.cos(k / 18 * Math.PI * 2), PZ + r * Math.sin(k / 18 * Math.PI * 2)));
  let drawn = "";

  function draw(now) {
    const out = items.map((it) => tval(it.t, now)), key = out.map((o) => o.toFixed(2)).join();
    if (key === drawn) return;
    drawn = key;
    LAYERS.forEach((l, k) => {
      const [r, i] = rings(out[k + 1], Y0 + 1, X1 + out[k + 1], Y1 - 1, 2.4, 1.2);
      put(items[k + 1].el, prism(P, front, r, i, l[1], l[2]));
    });
    // The pipe always stands proud of its bedding, however far that has been drawn.
    const x = X1 + out[1] + STUB * 0.4 + out[0];
    items[0].el.sil.setAttribute("d", poly(hull(round(X1 * 0.4, PR).concat(round(x, PR)))));
    items[0].end.setAttribute("d", poly(round(x, PR)));
    items[0].bore.setAttribute("d", poly(round(x, PR - 2.2)));
  }

  const B = register(stage, (_dt, now) => {
    draw(now);
    return items.some((it) => !tdone(it.t, now));
  });
  bag.add(B.unregister);

  /**
   * What the point lies on, on the cut face as it stands shut: the point is carried along the line of sight
   * to the plane x = X1, and read there by its place across the trench and its height.
   */
  function hit([sx, sy]) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    const y = X1 - (sx - C.ox) / (C.S * c), z = ((X1 + y) * s * C.k - (sy - C.oy) / C.S) / zf;
    if (y < Y0 - 3 || y > Y1 + 3 || z < 0 || z > TOP + 34) return -1;
    if (Math.hypot(y - PY, z - PZ) < PR + 3) return 0;
    return z < LAYERS[0][2] ? 1 : z < LAYERS[1][2] ? 2 : 3;
  }

  let act = -1;
  /** Draws item a out (-1 lets them back to rest). The stagger spreads out from the item drawn, or the one let go. */
  function pull(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    items.forEach((it, i) => {
      tset(it.t, a < 0 ? REST[i] : Math.max(REST[i], DRAW * SHARE[Math.abs(i - a)]), now, Math.abs(i - from) * stag);
      // One bright mark: the pipe at rest, whatever is drawn out under the pointer.
      it.el.sil.classList.toggle("hi", a < 0 ? i === 0 : i === a);
    });
    items[0].end.classList.toggle("hi", a <= 0);
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  items[0].el.sil.classList.add("hi");
  items[0].end.classList.add("hi");

  bag.add(pointer(stage, { move: (p) => pull(hit(p)), leave: () => pull(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "grofta",
  means: "A trench cut across: the pipe, its bedding, the fill and the topsoil each draw out of the face, the one under the pointer furthest.",
  rules: [1, 2, 5, 8],
  range: [0, 60, 140],
  mount,
});
