import { AbsoluteFill } from "remotion";
import { Excavator, GROUND_Y } from "./Excavator";
import { colors } from "./theme";

export const DIG_WIDTH = 960;
export const DIG_HEIGHT = 460;

/**
 * Tight crop of the excavator at work. The frame ends exactly at ground level,
 * so on the page it can stand on a section border.
 */
export const DigLoop: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.fjell800 }}>
      <svg viewBox={`0 0 ${DIG_WIDTH} ${DIG_HEIGHT}`} width="100%" height="100%">
        <g transform={`translate(-150 ${DIG_HEIGHT - GROUND_Y})`}>
          <Excavator />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
