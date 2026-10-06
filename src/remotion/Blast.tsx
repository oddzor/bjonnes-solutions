import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Excavator, GROUND_Y } from "./Excavator";
import { colors } from "./theme";

export const BLAST_WIDTH = 1600;
export const BLAST_HEIGHT = 440;
export const BLAST_FRAMES = 300;
/** A frame where the round has gone off and the rock lies still. Shown when motion is reduced. */
export const BLAST_SETTLED_FRAME = 230;

// The bench: rock stands from FACE_X to the right edge, TOP_Y high. The round takes it back to BACK_X.
const FLOOR_Y = 438;
const TOP_Y = 170;
const FACE_X = 760;
const BACK_X = 1400;
const HOLES = [850, 950, 1050, 1150, 1250, 1350];
const HOLE_DEPTH = 240;
const SECTION = (BACK_X - FACE_X) / HOLES.length;

// Timeline, in frames: drill, charge, fire hole by hole from the free face inwards, then reset.
const DRILL_START = 10;
const DRILL_GAP = 9;
const CHARGE_START = 72;
const FIRE_START = 128;
const FIRE_GAP = 7;
const DELAY_MS = 25;
const RESET_START = 264;

const fireFrame = (hole: number) => FIRE_START + hole * FIRE_GAP;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const progress = (frame: number, from: number, length: number) =>
  interpolate(frame, [from, from + length], [0, 1], clamp);

/** Height of the settled rock pile above the floor at x. */
const pileHeight = (x: number) => {
  if (x < 1050) return 190 * Easing.out(Easing.quad)(Math.max(0, (x - 520) / 530));
  return 190 - 20 * ((x - 1050) / 350);
};

// The blasted rock, cut into pieces. Each piece knows where it starts and where it comes to rest.
const COLS = 10;
const ROWS = 5;
const CELL_W = (BACK_X - FACE_X + 20) / COLS;
const CELL_H = (FLOOR_Y - TOP_Y) / ROWS;
const fragments = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const r = (salt: string) => random(`${salt}-${i}`);
  const cx = FACE_X - 20 + (col + 0.5) * CELL_W;
  const cy = TOP_Y + (row + 0.5) * CELL_H;
  const corners = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5],
  ].map(([x, y], c) => [
    (x + (r(`x${c}`) - 0.5) * 0.3) * CELL_W * 0.86,
    (y + (r(`y${c}`) - 0.5) * 0.3) * CELL_H * 0.86,
  ]);
  const hole = Math.min(HOLES.length - 1, Math.max(0, Math.floor((cx - FACE_X) / SECTION)));
  const restX = 540 + (((col + 0.5) / COLS) * 0.82 + r("rx") * 0.18) * 840;
  const layer = (ROWS - 1 - row + r("ry")) / ROWS;
  return {
    cx,
    cy,
    points: corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "),
    release: fireFrame(hole) + r("t") * 4,
    restX,
    restY: FLOOR_Y - 24 - layer * Math.max(0, pileHeight(restX) - 44),
    spin: (r("spin") - 0.5) * 150,
    heave: 46 * (1 - row / ROWS),
  };
});

/**
 * A bench blast in section, as a line drawing: holes are drilled and charged, the round fires
 * hole by hole with a delay between each, and the rock comes to rest as a pile on the floor.
 * The frame ends at floor level, so on the page the floor can double as a section border.
 */
export const Blast: React.FC<{ background?: string }> = ({ background = colors.fjell900 }) => {
  const frame = useCurrentFrame();
  const reset = progress(frame, RESET_START, BLAST_FRAMES - RESET_START - 4);
  const rock = {
    stroke: colors.stein400,
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  } as const;

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <svg viewBox={`0 0 ${BLAST_WIDTH} ${BLAST_HEIGHT}`} width="100%" height="100%">
        {/* Rock that stays standing, with a few fissures */}
        <path d={`M ${BACK_X} ${TOP_Y} H ${BLAST_WIDTH}`} {...rock} />
        <path
          d="M 1452 214 l 44 78 M 1528 196 l 30 120 l -22 62 M 1470 340 l 50 54"
          {...rock}
          stroke={colors.fjell600}
        />
        <path
          d={`M ${BACK_X} ${TOP_Y} L ${BACK_X - 8} ${FLOOR_Y}`}
          {...rock}
          opacity={progress(frame, fireFrame(HOLES.length - 1), 8) * (1 - reset)}
        />

        {/* The bench before the round: free face and top surface, removed section by section */}
        <path
          d={`M ${FACE_X} ${TOP_Y} L ${FACE_X - 30} ${FLOOR_Y}`}
          {...rock}
          opacity={frame < fireFrame(0) ? 1 : reset}
        />
        {HOLES.map((_, i) => (
          <path
            key={i}
            d={`M ${FACE_X + i * SECTION} ${TOP_Y} h ${SECTION}`}
            {...rock}
            opacity={frame < fireFrame(i) ? 1 : reset}
          />
        ))}

        {/* Excavator working the floor in front of the bench */}
        <g transform={`translate(40 ${FLOOR_Y - GROUND_Y * 0.42}) scale(0.42)`}>
          <Excavator fill={background} cycle={frame / BLAST_FRAMES} heap={false} />
        </g>

        {/* Bore holes: drilled, charged from the bottom, tied together and fired in turn */}
        {HOLES.map((x, i) => {
          const fired = frame - fireFrame(i);
          if (fired >= 0) return null;
          const drilled = progress(frame, DRILL_START + i * DRILL_GAP, 12);
          const charged = progress(frame, CHARGE_START + i * 5, 14);
          const bottom = { x: x - 12, y: TOP_Y + HOLE_DEPTH };
          return (
            <g key={x}>
              <line
                x1={x}
                y1={TOP_Y}
                x2={x - 12 * drilled}
                y2={TOP_Y + HOLE_DEPTH * drilled}
                stroke={colors.stal500}
                strokeWidth={3}
                strokeDasharray="2 9"
                opacity={drilled > 0 ? 1 : 0}
                strokeLinecap="round"
              />
              <line
                x1={bottom.x}
                y1={bottom.y}
                x2={bottom.x + 9 * charged}
                y2={bottom.y - HOLE_DEPTH * 0.75 * charged}
                stroke={colors.signal500}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={charged > 0 ? 1 : 0}
              />
              <text
                x={x}
                y={TOP_Y - 30}
                textAnchor="middle"
                fontFamily="var(--font-archivo), Archivo, sans-serif"
                fontSize={21}
                fontWeight={600}
                fill={colors.stein400}
                opacity={charged}
              >
                {i * DELAY_MS} ms
              </text>
            </g>
          );
        })}

        {/* Firing line along the collars, out to the shot firer on the right */}
        {HOLES.map((x, i) => {
          if (frame >= fireFrame(i)) return null;
          const tied = progress(frame, CHARGE_START + 20 + i * 4, 10);
          const next = HOLES[i + 1] ?? 1570;
          return (
            <line
              key={x}
              x1={x}
              y1={TOP_Y - 9}
              x2={x + (next - x) * tied}
              y2={TOP_Y - 9}
              stroke={colors.signal700}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={tied > 0 ? 1 : 0}
            />
          );
        })}

        {/* The rock itself, thrown forward and settling into a pile */}
        <g opacity={1 - reset}>
          {fragments.map((piece, i) => {
            if (frame < piece.release) return null;
            const t = Easing.out(Easing.cubic)(progress(frame, piece.release, 36));
            const x = piece.cx + (piece.restX - piece.cx) * t;
            const y =
              piece.cy + (piece.restY - piece.cy) * t - piece.heave * Math.sin(Math.PI * t);
            return (
              <polygon
                key={i}
                points={piece.points}
                transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(piece.spin * t).toFixed(1)}) scale(${1 - 0.08 * t})`}
                {...rock}
                strokeWidth={2.5}
                fill={background}
              />
            );
          })}
        </g>

        {/* Flash at each collar as its hole goes, and the dust that follows */}
        {HOLES.map((x, i) => {
          const fired = frame - fireFrame(i);
          if (fired < 0 || fired > 44) return null;
          return (
            <g key={x}>
              {fired <= 10 && (
                <>
                  <line
                    x1={x}
                    y1={TOP_Y}
                    x2={x - 12}
                    y2={TOP_Y + HOLE_DEPTH}
                    stroke={colors.signal400}
                    strokeWidth={9}
                    strokeLinecap="round"
                    opacity={Math.max(0, 1 - fired / 6)}
                  />
                  <circle
                    cx={x}
                    cy={TOP_Y}
                    r={12 + fired * 9}
                    fill="none"
                    stroke={colors.signal400}
                    strokeWidth={4}
                    opacity={1 - fired / 10}
                  />
                </>
              )}
              {[0, 1, 2].map((puff) => (
                <circle
                  key={puff}
                  cx={x - 46 + puff * 34 + random(`puff-${i}-${puff}`) * 20}
                  cy={TOP_Y - 14 - fired * (1.6 + puff * 0.5)}
                  r={16 + fired * (0.8 + puff * 0.2)}
                  fill="none"
                  stroke={colors.stein600}
                  strokeWidth={2}
                  opacity={Math.max(0, 0.7 * (1 - fired / 44))}
                />
              ))}
            </g>
          );
        })}

        {/* Floor */}
        <path d={`M 0 ${FLOOR_Y} H ${BLAST_WIDTH}`} {...rock} stroke={colors.fjell600} />
      </svg>
    </AbsoluteFill>
  );
};
