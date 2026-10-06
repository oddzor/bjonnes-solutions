import { loadFont } from "@remotion/google-fonts/Archivo";
import {
  AbsoluteFill,
  Loop,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BLAST_FRAMES, BLAST_HEIGHT, BLAST_WIDTH, Blast } from "./Blast";
import { colors } from "./theme";

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

export const PROMO_FRAMES = 420;
const BLAST_SCALE = 1080 / BLAST_WIDTH;

const headline: React.CSSProperties = {
  fontFamily,
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: "-0.02em",
  whiteSpace: "nowrap",
  color: colors.stein50,
};

/** Lines rise into place one after another. */
const Lines: React.FC<{
  lines: string[];
  size: number;
  stagger?: number;
  color?: string;
}> = ({ lines, size, stagger = 8, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div>
      {lines.map((line, i) => {
        const enter = spring({
          frame: frame - i * stagger,
          fps,
          config: { damping: 200 },
        });
        return (
          <div key={line} style={{ overflow: "hidden" }}>
            <div
              style={{
                ...headline,
                fontSize: size,
                color: color ?? headline.color,
                transform: `translateY(${(1 - enter) * 100}%)`,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Scene: React.FC<{ children: React.ReactNode; duration: number }> = ({
  children,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [duration - 8, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ padding: 80, opacity }}>{children}</AbsoluteFill>;
};

/** Square clip for social media and pitch decks. The blast runs along the bottom throughout. */
export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.fjell900 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 90,
          width: BLAST_WIDTH,
          height: BLAST_HEIGHT,
          transform: `scale(${BLAST_SCALE})`,
          transformOrigin: "bottom left",
        }}
      >
        <Loop durationInFrames={BLAST_FRAMES}>
          <Blast />
        </Loop>
      </div>

      <Sequence durationInFrames={120}>
        <Scene duration={120}>
          <Lines lines={["Fjell", "i veien?"]} size={170} />
        </Scene>
      </Sequence>

      <Sequence from={120} durationInFrames={100}>
        <Scene duration={100}>
          <Lines lines={["Vi flytter", "det."]} size={170} color={colors.signal500} />
        </Scene>
      </Sequence>

      <Sequence from={220} durationInFrames={100}>
        <Scene duration={100}>
          <Lines lines={["Sprengning", "Graving", "Maskinutleie"]} size={120} />
        </Scene>
      </Sequence>

      <Sequence from={320}>
        <AbsoluteFill style={{ padding: 80 }}>
          <Lines lines={["Ring Bjønnes Solutions"]} size={64} />
          <div style={{ height: 24 }} />
          <Lines lines={["469 49 292"]} size={168} color={colors.signal500} stagger={0} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
