/**
 * Felling: three spruces in a row on a clearing, each a trunk under three
 * stacked cones. The nearest one is already down. The tree under the pointer
 * is felled: it hinges at its foot and comes down along the clearing, while
 * the trees still standing lean away from it in turn. A dot on the ground
 * marks the next tree to go. The slider is the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * on the trees' resting axes, so a tree falling out from under the pointer
 * cannot change the choice.
 */
const {
  Cam, facing, fit, hull, poly, prism, proj, rad, rings, tdone, tset, tval, tween,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

// y is the foot's place in the row, h the height, rest the lean in degrees: 86 is down.
const TREES = [{ y: 0, h: 58, rest: 3 }, { y: 27, h: 45, rest: -4 }, { y: 54, h: 66, rest: 86 }];
const DOWN = 86, SWAY = 7, NEXT = 0;
// Each cone as [foot, top, radius at the foot], in shares of the tree's height.
const CONES = [[0.16, 0.6, 0.23], [0.42, 0.82, 0.18], [0.66, 1, 0.13]];

/** A tree leaning th degrees towards +x: the trunk and the three cones, as path strings from the foot up. */
function tree(P, t, th) {
  const s = Math.sin(rad(th)), c = Math.cos(rad(th));
  // A circle of radius r round the axis, a along it.
  const ring = (a, r) => Array.from({ length: 14 }, (_, k) => {
    const f = (k / 14) * Math.PI * 2, u = r * Math.sin(f);
    return P(a * s + u * c, t.y + r * Math.cos(f), a * c - u * s);
  });
  const cone = (a0, a1, r0, r1) => poly(hull(ring(a0, r0).concat(ring(a1, r1))));
  return [cone(0, t.h * 0.2, 2.3, 2.3), ...CONES.map(([a0, a1, r]) => cone(t.h * a0, t.h * a1, t.h * r + 2, 0.7))];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-16, -16, -4], [84, 70, -4], [84, -16, -4], [-16, 70, -4], [0, 0, 62], [4, 54, 68]], 200, 166);
  const P = proj(C), front = facing(C);

  // Back to front: the clearing, the mark, then the trees up the row, each nearer than the last.
  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-16, -16, 84, 70, 10, 2.2);
  put(solid(g), prism(P, front, pr, pi, -4, 0));
  const mark = flatDot(g, C, 1.4, "dot");
  place(mark, P(9, TREES[NEXT].y + 5, 0));

  const trees = TREES.map((t) => {
    const grp = mk("g", {}, g);
    return { t, parts: [0, 1, 2, 3].map(() => mk("path", { class: "sil" }, grp)), a: tween(t.rest), drawn: NaN };
  });

  function draw(tr, th) {
    if (th === tr.drawn) return;
    tr.drawn = th;
    tree(P, tr.t, th).forEach((d, k) => tr.parts[k].setAttribute("d", d));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const tr of trees) { draw(tr, tval(tr.a, now)); if (!tdone(tr.a, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // Each tree's resting axis on screen, from its foot to its top. They never move, and nothing draws them.
  const axes = TREES.map((t) => {
    const s = Math.sin(rad(t.rest)), c = Math.cos(rad(t.rest));
    return [P(0, t.y, 0), P(t.h * s, t.y, t.h * c)];
  });

  /** The tree whose resting axis is nearest the point, within a crown's width; -1 outside. */
  function hit([x, y]) {
    let best = -1, near = 24;
    axes.forEach(([a, b], i) => {
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy);
      if (d < near) { near = d; best = i; }
    });
    return best;
  }

  let act = -1;
  /** Fells tree a (-1 stands them up again). The stagger spreads out from the tree felled, or the one let go. */
  function fell(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    trees.forEach((tr, i) => {
      const down = tr.t.rest > 45, lean = a < 0 || i === a || down ? 0 : (i < a ? -SWAY : SWAY) / Math.abs(i - a);
      tset(tr.a, i === a ? DOWN : tr.t.rest + lean, now, Math.abs(i - from) * stag);
      tr.parts.forEach((p) => p.classList.toggle("hi", i === a));
    });
    // One bright mark: the dot by the next tree at rest, the felled tree under the pointer.
    mark.setAttribute("class", a < 0 ? "dot" : "dot m");
    read.textContent = a < 0 ? "rest" : "tre " + (a + 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => fell(hit(p)), leave: () => fell(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "felling",
  means: "Three spruces on a clearing: the one under the pointer is felled, and the ones still standing lean away from it.",
  rules: [1, 2, 5, 8],
  range: [0, 70, 160],
  mount,
});
