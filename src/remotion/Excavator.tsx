import { Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "./theme";

// One dig cycle. The last keyframe equals the first so the clip loops cleanly.
export const DIG_CYCLE_FRAMES = 240;
const KEYFRAMES = [0, 60, 110, 160, 200, 240];
const BOOM = [-45, -22, -22, -55, -40, -45];
const STICK = [95, 90, 125, 120, 70, 95];
const BUCKET = [20, 10, 70, 80, -10, 20];

const BOOM_PIVOT = { x: 480, y: 560 };
const BOOM_LENGTH = 330;
const STICK_LENGTH = 230;
export const GROUND_Y = 700;

const rad = (deg: number) => (deg * Math.PI) / 180;

type Point = { x: number; y: number };

/**
 * Side view of a compact excavator running a dig cycle, as a line drawing in a
 * 1200 × 700 coordinate space with the ground at y = GROUND_Y.
 * Render it inside an <svg> and position it with a transform.
 * `fill` should match the background so parts in front hide the ones behind.
 * `cycle` (0 to 1) sets the position in the dig cycle; by default it follows the clip's own frame.
 */
export const Excavator: React.FC<Look & { cycle?: number }> = ({ cycle, ...look }) => {
  const clipFrame = useCurrentFrame() % DIG_CYCLE_FRAMES;
  const frame = cycle === undefined ? clipFrame : (cycle % 1) * DIG_CYCLE_FRAMES;
  return <ExcavatorPose frame={frame} {...look} />;
};

type Look = { stroke?: string; fill?: string; heap?: boolean };

/**
 * The same drawing held at one frame of the dig cycle. It needs no Remotion clip around it,
 * so it also works in ordinary page SVG.
 */
export const ExcavatorPose: React.FC<Look & { frame: number }> = ({
  frame,
  stroke = colors.stein400,
  fill = colors.fjell800,
  heap = true,
}) => {
  const options = { easing: Easing.inOut(Easing.cubic) };
  const boom = interpolate(frame, KEYFRAMES, BOOM, options);
  const stick = interpolate(frame, KEYFRAMES, STICK, options);
  const bucket = interpolate(frame, KEYFRAMES, BUCKET, options);

  const boomCylinderTop: Point = {
    x: BOOM_PIVOT.x + 150 * Math.cos(rad(boom)) - 10 * Math.sin(rad(boom)),
    y: BOOM_PIVOT.y + 150 * Math.sin(rad(boom)) + 10 * Math.cos(rad(boom)),
  };
  const stickLug: Point = {
    x: BOOM_LENGTH - 50 * Math.cos(rad(stick)),
    y: -50 * Math.sin(rad(stick)),
  };

  const load = interpolate(frame, [95, 108, 188, 200], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outline = {
    stroke,
    fill,
    strokeWidth: 7,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  } as const;
  const cylinder = (from: Point, to: Point) => (
    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} {...outline} strokeWidth={5} />
  );

  return (
    <g>
      {/* Spoil heap the bucket empties onto */}
      {heap && (
        <path
          d="M 930 700 Q 965 642 1004 634 Q 1042 642 1080 700"
          {...outline}
          stroke={colors.signal700}
        />
      )}

      {/* Dozer blade, as on a compact machine */}
      <path d="M 560 664 L 606 652 M 600 628 Q 622 664 606 700" {...outline} fill="none" />

      {/* Undercarriage */}
      <rect x={180} y={628} width={380} height={72} rx={36} {...outline} />
      {[222, 296, 370, 444, 518].map((cx) => (
        <circle key={cx} cx={cx} cy={664} r={17} {...outline} strokeWidth={5} />
      ))}
      <rect x={325} y={604} width={130} height={24} {...outline} />

      {/* House, counterweight and cab */}
      <path
        d="M 210 604 L 210 528 Q 210 500 238 500 L 404 500 L 404 604 Z"
        {...outline}
      />
      <rect x={404} y={424} width={108} height={180} rx={8} {...outline} />
      <rect x={422} y={442} width={72} height={78} rx={3} {...outline} strokeWidth={5} />

      {cylinder({ x: 502, y: 594 }, boomCylinderTop)}

      <g transform={`translate(${BOOM_PIVOT.x} ${BOOM_PIVOT.y}) rotate(${boom})`}>
        {cylinder({ x: 150, y: -50 }, stickLug)}
        <path d="M -16 -20 L 150 -52 L 334 -15 L 334 15 L 150 -6 L -16 22 Z" {...outline} />
        <g transform={`translate(${BOOM_LENGTH} 0) rotate(${stick})`}>
          <path d="M -56 -9 L 0 -22 L 232 -10 L 232 10 L 0 22 L -56 9 Z" {...outline} />
          <g transform={`translate(${STICK_LENGTH} 0) rotate(${bucket})`}>
            <path d="M 0 -18 C 62 -42 112 -10 97 47 L 80 41 L 18 18 Z" {...outline} />
            <path d="M 22 20 L 76 40 L 62 12 Z" fill={colors.signal700} opacity={load} />
          </g>
        </g>
      </g>

      {/* Soil falling from the bucket onto the heap */}
      {Array.from({ length: 6 }, (_, i) => {
        const t = (frame - 186 - i * 4) / 13;
        if (t <= 0 || t >= 1) return null;
        return (
          <circle
            key={i}
            cx={990 + ((i % 3) - 1) * 14}
            cy={500 + 140 * t * t}
            r={5}
            fill={colors.signal700}
          />
        );
      })}
    </g>
  );
};
