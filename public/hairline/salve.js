/**
 * Salve: a quarry bench being shot. A row of seven blocks stands in front of
 * the higher rock behind it, each with a bore hole in its top; the far end has
 * already gone and lies as broken rock on the floor. Left alone the round goes
 * off by itself: hole after hole the blocks break in four and are thrown
 * forward, lie a while, and stand up again. The hole under the pointer fires
 * at once, and the round spreads from it to the holes within reach. The slider
 * is the delay between two holes, in ms.
 *
 * The pattern: discrete items with an idle loop. Tweens, a stagger by
 * distance, a reach clamped to two holes, and a hit test on the bench's rest pose.
 */
const {
  Cam, clamp, facing, fit, lerp, prism, proj, rings, unproj, reducedMotion, tdone, tset, tval, tween,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const N = 7, BW = 18, FOOT = 16.6, DEPTH = 26, HB = 54, WALL = -34, REACH = 2, IDLE = 2600;
// Neither the bench top nor its free face is level, and the last hole has gone: that is the rest pose.
const TOP = [35, 32, 37, 33, 38, 34, 36], FACE = [26, 30, 25, 29, 24, 28, 26], REST = [0, 0, 0, 0, 0, 0, 1], NEXT = 5;
const X0 = -10, X1 = N * BW + 10, Y0 = WALL - 6, Y1 = 84;
// Where the four pieces of a block start, as [back or front, bottom or top], and where each comes down: back to front.
const PIECES = [[0, 0, 24], [0, 1, 39], [1, 0, 52], [1, 1, 66]];
/** A number from 0 to 1 that is always the same for the same piece. */
const odd = (i, j, salt) => { const v = Math.sin(i * 12.9898 + j * 78.233 + salt * 37.719) * 43758.5453; return v - Math.floor(v); };

/** Piece j of block i, thrown by v (0 in the bench, 1 on the floor): its rings and the heights it stands between. */
function piece(i, j, v) {
  const [fore, upper, land] = PIECES[j], half = FACE[i] / 2, tall = TOP[i] / 2;
  const x = i * BW + BW / 2 + (odd(i, j, 1) - 0.5) * 9 * v, y = lerp(half * (fore + 0.5), land + odd(i, j, 2) * 7, v);
  const z = lerp(upper * tall, 0, v) + (16 + 14 * upper + odd(i, j, 3) * 8) * Math.sin(Math.PI * v);
  const w = FOOT / 2 - (1 + odd(i, j, 5) * 3.4) * v, d = half / 2 - 0.4 - (0.4 + odd(i, j, 6) * 3.2) * v, h = tall - 0.4 - (tall - 9 - odd(i, j, 4) * 4) * v;
  return { rings: rings(x - w, y - d, x + w, y + d, 2.6, 1), z, h };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let delay = value;

  // Fitted to the floor and to the rock behind, with room over the bench for the pieces at the top of their throw.
  const C = Cam(45, 0.5, 1.42);
  fit(C, [[X0, Y0, -4], [X1, Y1, -4], [X1, Y0, -4], [X0, Y1, -4], [X0, Y0, HB + 6], [X1, Y0, HB + 6]], 200, 166);
  const P = proj(C), front = facing(C);

  // Back to front: the floor, the standing rock with the next row marked out, then the blocks by ascending x.
  const g = mk("g", {}, svg);
  const [fr, fi] = rings(X0, Y0, X1, Y1, 9, 2.2);
  put(solid(g), prism(P, front, fr, fi, -4, 0));
  const [wr, wi] = rings(-4, WALL, N * BW + 4, -1.4, 4, 1.6);
  put(solid(g), prism(P, front, wr, wi, 0, HB));
  for (let i = 0; i < N; i++) place(flatDot(g, C, 0.7, "dot off"), P(i * BW + BW / 2, WALL / 2 - 2, HB));

  const blocks = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g), whole = solid(grp), bits = PIECES.map(() => solid(grp));
    const x0 = i * BW + (BW - FOOT) / 2, [ring, inner] = rings(x0, 0, x0 + FOOT, FACE[i], 3.2, 1.3);
    const hole = flatDot(grp, C, 0.95, "dot m");
    place(hole, P(i * BW + BW / 2, FACE[i] / 2, TOP[i]));
    blocks.push({ whole, bits, hole, solidD: prism(P, front, ring, inner, 0, TOP[i]), t: tween(REST[i]), drawn: NaN });
  }

  function draw(i, v) {
    const b = blocks[i];
    if (v === b.drawn) return;
    b.drawn = v;
    // Standing, the block is one solid; once its hole has gone it is four pieces in the air or on the floor.
    const broken = v > 0.004;
    put(b.whole, broken ? { sil: "", crease: "" } : b.solidD);
    b.hole.setAttribute("class", broken ? "fo nf" : i === NEXT && mark ? "dot" : "dot m");
    b.bits.forEach((el, j) => {
      if (!broken) return put(el, { sil: "", crease: "" });
      const q = piece(i, j, v);
      put(el, prism(P, front, q.rings[0], q.rings[1], q.z, q.z + q.h));
    });
  }

  let act = -1, mark = true, since = -1, turn = 0;
  /** Sends every block to where it belongs: thrown if the whole round goes or its hole is within reach of a, standing otherwise. */
  function shoot(a, from, now, step, all) {
    blocks.forEach((b, i) => {
      tset(b.t, all || (a >= 0 && Math.abs(i - a) <= REACH) ? 1 : REST[i], now, Math.abs(i - from) * step);
      b.bits.forEach((el) => el.sil.classList.toggle("hi", act >= 0 && i === act));
      b.drawn = NaN;
    });
  }

  const B = register(stage, (_dt, now) => {
    // Left alone, the round goes off and stands up again in turn, a different hole first each time.
    const idle = act < 0 && !reducedMotion();
    if (idle) {
      if (since < 0) since = now;
      const n = Math.floor((now - since) / IDLE);
      if (n !== turn) {
        turn = n;
        if (n % 2) shoot(-1, (n * 3) % (N - 1), now, delay * 1.6, true); else shoot(-1, N - 1, now, 30, false);
      }
    }
    let moving = idle;
    blocks.forEach((b, i) => { draw(i, tval(b.t, now)); if (!tdone(b.t, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  /**
   * The hole under a point, from the rest pose alone: the point is put on the plane of the bench top, and
   * what falls in front of the free face is carried back along the line of sight to the face.
   */
  function hit([sx, sy]) {
    const [wx, wy] = unproj(C, sx, sy, 35), over = Math.max(0, wy - DEPTH), x = wx - over;
    if (wy < -5 || over > 70 || x < -7 || x > N * BW + 7) return -1;
    return clamp(Math.floor(x / BW), 0, N - 1);
  }

  /** Fires hole a (-1 gives the bench back to its own round). The delay spreads out from the hole fired, or the one let go. */
  function fire(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    // One bright mark: the next hole to go at rest, the fired block's pieces under the pointer.
    mark = a < 0;
    since = -1; turn = 0;
    shoot(a, from, now, delay, false);
    read.textContent = a < 0 ? "rest" : "hull " + (a + 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => fire(hit(p)), leave: () => fire(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { delay = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "salve",
  means: "A quarry bench being shot: hole after hole the rock breaks and is thrown forward, and the hole under the pointer fires at once.",
  rules: [1, 2, 3, 7],
  range: [10, 35, 80],
  mount,
});
