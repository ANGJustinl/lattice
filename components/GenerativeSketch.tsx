import React, { useEffect, useRef } from 'react';
import { P5Instance } from '../types';

declare global {
  interface Window {
    p5: any;
  }
}

export type ShapeMode = 'circle' | 'star' | 'gear' | 'spiral';
export type TopologyMode = 'lattice' | 'dna' | 'neural' | 'particles';
export type ColorMode = 'classic' | 'rainbow' | 'toxic' | 'electric' | 'thermal';

export interface SketchSettings {
  mouseControl: boolean;
  complexity: number;
  depth: number;
  strands: number;
  speed: number;
  jitter: number;
  colorMode: ColorMode;
  shapeMode: ShapeMode; // Restored
  
  // Fractal Parameters
  harmonics: number;
  harmonicStrength: number;
  twist: number;
  fractalNoise: boolean;

  // Superformula (New)
  useSuperformula: boolean;
  superM: number;  // Symmetry
  superN1: number; // Shape 1
  superN2: number; // Shape 2
  superN3: number; // Shape 3
  
  // Environment (New)
  topology: TopologyMode;
  wormhole: number; // Curvature of the tunnel
}

interface GenerativeSketchProps {
  settings: SketchSettings;
}

class ShapeObject {
  p: P5Instance;
  centX: number;
  centY: number;
  tilt: number;
  rAng: number;
  ns: number;
  rShift: number;
  topNum: number;
  aryXY: [number, number][];
  driftX: number; // For wormhole effect
  driftY: number;

  constructor(p: P5Instance, centX: number, centY: number, tilt: number, ns: number, rShift: number, topNum: number) {
    this.p = p;
    this.centX = centX;
    this.centY = centY;
    this.tilt = tilt;
    this.rAng = 0;
    this.ns = ns;
    this.rShift = rShift;
    this.topNum = topNum;
    this.aryXY = [];
    this.driftX = 0;
    this.driftY = 0;
  }

  // Superformula Algorithm
  // https://en.wikipedia.org/wiki/Superformula
  superformula(phi: number, m: number, n1: number, n2: number, n3: number): number {
    const a = 1;
    const b = 1;
    
    const t1 = Math.abs((1/a) * Math.cos(m * phi / 4));
    const term1 = Math.pow(t1, n2);
    
    const t2 = Math.abs((1/b) * Math.sin(m * phi / 4));
    const term2 = Math.pow(t2, n3);
    
    const r = Math.pow(term1 + term2, -1 / n1);
    
    // Clamp to prevent infinity issues in extreme parameters
    if (Math.abs(r) > 10) return 10;
    return r;
  }

  getFractalNoise(x: number, octaves: number = 3): number {
    let noiseVal = 0;
    let amp = 1;
    let freq = 1;
    let maxAmp = 0;
    
    for (let i = 0; i < octaves; i++) {
      noiseVal += this.p.noise(x * freq) * amp;
      maxAmp += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return noiseVal / maxAmp;
  }

  update(
    width: number, 
    height: number, 
    rRate: number, 
    settings: SketchSettings
  ) {
    const { 
      depth, jitter, harmonics, harmonicStrength, twist, 
      fractalNoise, useSuperformula, superM, superN1, superN2, superN3, wormhole,
      shapeMode 
    } = settings;

    this.rAng += rRate;
    
    // Base radius with depth perspective
    // Using a steeper curve for more "tunnel" feel
    const depthFactor = Math.pow(1 - this.p.cos(this.rAng), depth);
    const r = (width * 3 + this.rShift) * depthFactor;
    
    // Wormhole Logic: Drift center based on depth and time
    // As rAng increases (object gets closer), the drift reduces (anchored to screen center)
    // As rAng is small (object is far), drift is high
    const driftIntensity = (1 - depthFactor) * wormhole * (width / 2);
    this.driftX = (this.p.noise(this.ns + this.rAng * 0.5) - 0.5) * driftIntensity;
    this.driftY = (this.p.noise(this.ns + 100 + this.rAng * 0.5) - 0.5) * driftIntensity;

    const twistAngle = this.rAng * twist * 5;

    this.aryXY = [];
    for (let i = 0; i < this.topNum; i++) {
      let angle = this.tilt + twistAngle + (2 * this.p.PI / this.topNum) * i;
      
      // Calculate Radius Modifier (Shape)
      let shapeRadius = 1;

      if (useSuperformula) {
        // Apply Superformula
        shapeRadius = this.superformula(angle, superM, superN1, superN2, superN3);
      } else {
        // Classic Shape Modes
        if (shapeMode === 'star') {
          shapeRadius = (i % 2 === 0) ? 1.2 : 0.8;
        } else if (shapeMode === 'gear') {
          shapeRadius = (i % 2 === 0) ? 1.05 : 0.95;
        } else if (shapeMode === 'spiral') {
          // Spirals modify the angle based on depth/radius
          angle += r * 0.005;
        }
      }
      
      // Apply Harmonics (Stacked Sine Waves)
      if (harmonics > 0 && harmonicStrength > 0) {
        const phase = this.p.frameCount * 0.02 + this.ns;
        // Superimpose harmonic wave
        const harmonicVal = this.p.sin(angle * harmonics + phase);
        // If using superformula, blend them. If not, multiply.
        shapeRadius *= (1 + harmonicVal * harmonicStrength);
      }

      // Apply Jitter/Noise
      let noiseMultiplier = 1;
      const noiseInput = this.ns + i * 0.5;
      const rawNoise = fractalNoise 
        ? this.getFractalNoise(noiseInput, 4) 
        : this.p.noise(noiseInput);
      
      if (jitter > 0) {
          const noiseComponent = rawNoise * 0.8 + 0.2; 
          noiseMultiplier = 1 + (noiseComponent - 1) * jitter;
          if (jitter > 1.5) noiseMultiplier += (this.p.random(1) - 0.5) * (jitter - 1.5);
      }

      const finalR = r * shapeRadius * noiseMultiplier;
      
      this.aryXY[i] = [
        this.centX + this.driftX + finalR * this.p.cos(angle),
        this.centY + this.driftY + finalR * this.p.sin(angle)
      ];
    }
  }
}

const GenerativeSketch: React.FC<GenerativeSketchProps> = ({ settings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!window.p5 || !containerRef.current) return;

    const sketch = (p: P5Instance) => {
      let _aryObject: ShapeObject[] = [];
      let _count = 0;
      let _aryInitNs: number[] = [];
      let _aryRShift: number[] = [];
      let _nsSpeed = 0;
      let _freqCount = 1;
      
      const resetParams = () => {
        _count = 0;
        _aryObject = [];
        _aryInitNs = [];
        _aryRShift = [];
        
        for (let i = 0; i < 20; i++) {
          _aryInitNs[i] = p.random(100);
          _aryRShift[i] = p.random(p.width / 2);
        }
        
        _nsSpeed = p.random(10, 100) + 1;
      };

      p.setup = () => {
        const size = Math.min(p.windowWidth, p.windowHeight);
        p.createCanvas(size, size);
        p.frameRate(30);
        p.noFill();
        p.strokeWeight(p.width / 600);
        p.strokeJoin(p.ROUND);
        p.colorMode((p as any).HSB, 360, 100, 100, 1);
        resetParams();
      };

      p.draw = () => {
        p.background(0); // Clear background
        
        const currentSettings = settingsRef.current;
        const { 
          mouseControl, complexity, strands, speed, 
          colorMode, topology, harmonics, shapeMode 
        } = currentSettings;
        
        const _rRate = (2 * p.PI / 720) * speed;

        // Spawn new shapes
        if (_count % _freqCount === 0) {
          while (_aryInitNs.length < strands) {
             _aryInitNs.push(p.random(100));
             _aryRShift.push(p.random(p.width / 2));
          }

          for (let i = 0; i < strands; i++) {
            let targetX, targetY;
            
            if (mouseControl) {
               targetX = p.mouseX === 0 ? p.width/2 : p.mouseX;
               targetY = p.mouseY === 0 ? p.height/2 : p.mouseY;
            } else {
               // Base subtle movement
               targetX = p.width / 2; 
               targetY = p.height / 2;
            }

            const tilt = 5 * p.PI * p.noise(_aryInitNs[i] + p.frameCount / 120);
            const ns = _aryInitNs[i] + _count / (_nsSpeed / speed);
            
            // Adjust complexity
            // 1. Harmonics or Superformula need high res
            // 2. 'Star' mode needs double complexity to look correct (spikes)
            let effectiveComplexity = complexity;
            if (currentSettings.useSuperformula || harmonics > 0) {
              effectiveComplexity = Math.max(complexity, 60); 
            } else if (shapeMode === 'star') {
              effectiveComplexity = Math.max(3, complexity) * 2;
            }
            
            _aryObject.unshift(new ShapeObject(
              p, targetX, targetY, tilt, ns, _aryRShift[i], effectiveComplexity
            ));
          }
        }
        
        // Update objects
        for (let i = _aryObject.length - 1; i >= 0; i--) {
          _aryObject[i].update(p.width, p.height, _rRate, currentSettings);
          if (_aryObject[i].rAng > p.PI / 2) {
            _aryObject.pop();
          }
        }

        // Render Topology
        if (_aryObject.length >= 2) {
          for (let i = 0; i < _aryObject.length - 1; i++) {
            const currentObj = _aryObject[i];
            const nextObj = _aryObject[i + 1];
            
            // Apply Color Mode
            let hueBase = 0;
            if (colorMode === 'rainbow') hueBase = (p.frameCount * speed + i * 5) % 360;
            else if (colorMode === 'toxic') hueBase = (p.frameCount * speed + i * 10) % 100 + 80;
            else if (colorMode === 'electric') hueBase = 200 + p.noise(i * 0.1) * 60;
            else if (colorMode === 'thermal') hueBase = p.noise(i * 0.1 + p.frameCount * 0.05) * 60; // Red/Orange/Yellow
            
            if (colorMode === 'classic') p.stroke(0, 0, 100, 0.9);
            else if (colorMode === 'thermal') p.stroke(hueBase, 100, 100, 0.9);
            else p.stroke(hueBase, 80, 100, 0.9);

            const vertices = Math.min(currentObj.topNum, nextObj.topNum);
            
            // Skip rendering if particles mode (handled separately or not at all for lines)
            if (topology === 'particles') {
               p.strokeWeight(p.width / 300);
               p.beginShape((p as any).POINTS);
               for (let j = 0; j < vertices; j++) {
                 p.vertex(currentObj.aryXY[j][0], currentObj.aryXY[j][1]);
               }
               p.endShape();
               p.strokeWeight(p.width / 600); // Reset
               continue; 
            }

            // Neural / Web Logic (Distance Based)
            if (topology === 'neural') {
              p.beginShape((p as any).LINES);
              for (let j = 0; j < vertices; j += 2) { // Optimization: skip every other vertex
                 const v1 = currentObj.aryXY[j];
                 // Connect to random points in next layer if close enough
                 for (let k = 0; k < vertices; k += 5) {
                    const v2 = nextObj.aryXY[k];
                    const d = p.int(Math.abs(v1[0] - v2[0]) + Math.abs(v1[1] - v2[1])); // Manhattan distance approx
                    if (d < p.width / 5) {
                      p.vertex(v1[0], v1[1]);
                      p.vertex(v2[0], v2[1]);
                    }
                 }
              }
              p.endShape();
              continue;
            }

            // Lattice / DNA Rendering
            for (let j = 0; j < vertices; j++) {
              let next_j = j + 1;
              if (next_j === vertices) next_j = 0; 

              if (topology === 'dna') {
                 // DNA: Cross connections only
                 if (j % 2 === 0) {
                   p.beginShape((p as any).LINES);
                   p.vertex(currentObj.aryXY[j][0], currentObj.aryXY[j][1]);
                   p.vertex(nextObj.aryXY[next_j][0], nextObj.aryXY[next_j][1]);
                   p.endShape();
                 } else {
                   p.beginShape((p as any).LINES);
                   p.vertex(currentObj.aryXY[next_j][0], currentObj.aryXY[next_j][1]);
                   p.vertex(nextObj.aryXY[j][0], nextObj.aryXY[j][1]);
                   p.endShape();
                 }
              } else {
                // Default Lattice (Quad Strip)
                // Using LINES for better performance than QUAD_STRIP with many vertices
                p.beginShape();
                p.vertex(currentObj.aryXY[j][0], currentObj.aryXY[j][1]);
                p.vertex(nextObj.aryXY[j][0], nextObj.aryXY[j][1]);
                p.vertex(nextObj.aryXY[next_j][0], nextObj.aryXY[next_j][1]);
                p.vertex(currentObj.aryXY[next_j][0], currentObj.aryXY[next_j][1]);
                p.endShape();
              }
            }
          }
        }
        _count++;
      };

      p.windowResized = () => {
        const size = Math.min(p.windowWidth, p.windowHeight);
        p.createCanvas(size, size);
        p.strokeWeight(size / 600);
      };

      p.mouseReleased = () => {
        if (!settingsRef.current.mouseControl) {
           resetParams();
        }
      };
    };

    const p5Instance = new window.p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center bg-black overflow-hidden"
    />
  );
};

export default GenerativeSketch;