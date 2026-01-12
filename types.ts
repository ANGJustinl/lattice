export interface P5Instance {
  setup: () => void;
  draw: () => void;
  windowResized: () => void;
  mouseReleased: () => void;
  createCanvas: (w: number, h: number) => void;
  background: (c: number) => void;
  frameRate: (fps: number) => void;
  noFill: () => void;
  strokeWeight: (w: number) => void;
  stroke: (c: number, g?: number, b?: number, a?: number) => void;
  strokeJoin: (j: any) => void;
  beginShape: (kind?: any) => void;
  endShape: () => void;
  vertex: (x: number, y: number) => void;
  random: (min: number, max?: number) => number;
  noise: (x: number, y?: number) => number;
  int: (n: number) => number;
  cos: (n: number) => number;
  sin: (n: number) => number;
  width: number;
  height: number;
  windowWidth: number;
  windowHeight: number;
  frameCount: number;
  ROUND: any;
  PI: number;
  remove: () => void;
  mouseX: number;
  mouseY: number;
  colorMode: (mode: any, max1?: number, max2?: number, max3?: number, maxA?: number) => void;
}

export type P5WrapperProps = {
  className?: string;
};