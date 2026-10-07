// Loads the Hairline engine and its figures from public/hairline. The kernel is the file shipped
// with the hairline-create skill, unchanged; a figure is the file that skill writes and checks.

export interface HairlineHandle {
  set: (value: number) => void;
  destroy: () => void;
}

export interface HairlineHost {
  stage: HTMLElement;
  svg: SVGSVGElement;
  read: { textContent: string | null };
}

export interface HairlineFigure {
  name: string;
  means: string;
  /** The figure's own number at intensity 0, 0.5 and 1. The page shows it at the middle one. */
  range: [number, number, number];
  mount: (host: HairlineHost, value: number) => HairlineHandle;
}

export interface HairlineKernel {
  inject: (root: Document) => void;
  mk: (tag: string, attrs: Record<string, string>, parent: Element) => SVGElement;
}

declare global {
  interface Window {
    HL?: HairlineKernel;
    hairline?: (figure: HairlineFigure) => void;
  }
}

const BASE = "/hairline";
const waiting = new Map<string, (figure: HairlineFigure) => void>();
const figures = new Map<string, Promise<HairlineFigure>>();
let kernel: Promise<HairlineKernel> | undefined;

function script(src: string, module: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    if (module) el.type = "module";
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

function loadKernel(): Promise<HairlineKernel> {
  kernel ??= script(`${BASE}/kernel.js`, false).then(() => {
    if (!window.HL) throw new Error("The Hairline kernel did not define HL");
    // Every figure file ends by handing itself to this function.
    window.hairline = (figure) => waiting.get(figure.name)?.(figure);
    return window.HL;
  });
  return kernel;
}

/** The engine and one figure, each fetched once however many times it is asked for. */
export async function loadFigure(name: string): Promise<{ kernel: HairlineKernel; figure: HairlineFigure }> {
  const loadedKernel = await loadKernel();
  if (!figures.has(name)) {
    figures.set(
      name,
      new Promise<HairlineFigure>((resolve, reject) => {
        waiting.set(name, resolve);
        script(`${BASE}/${name}.js`, true).catch(reject);
      }),
    );
  }
  const figure = await figures.get(name);
  if (!figure) throw new Error(`Hairline figure ${name} is missing`);
  return { kernel: loadedKernel, figure };
}
