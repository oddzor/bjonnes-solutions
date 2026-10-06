import { Composition } from "remotion";
import { BLAST_FRAMES, BLAST_HEIGHT, BLAST_WIDTH, Blast } from "./Blast";
import { DIG_CYCLE_FRAMES } from "./Excavator";
import { DIG_HEIGHT, DIG_WIDTH, DigLoop } from "./DigLoop";
import { PROMO_FRAMES, Promo } from "./Promo";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BlastLoop"
        component={Blast}
        durationInFrames={BLAST_FRAMES}
        fps={FPS}
        width={BLAST_WIDTH}
        height={BLAST_HEIGHT}
      />
      <Composition
        id="DigLoop"
        component={DigLoop}
        durationInFrames={DIG_CYCLE_FRAMES}
        fps={FPS}
        width={DIG_WIDTH}
        height={DIG_HEIGHT}
      />
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={PROMO_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
