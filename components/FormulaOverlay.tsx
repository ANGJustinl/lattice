import React from 'react';
import { SketchSettings } from './GenerativeSketch';

interface FormulaOverlayProps {
  settings: SketchSettings;
  visible: boolean;
}

const FormulaOverlay: React.FC<FormulaOverlayProps> = ({ settings, visible }) => {
  if (!visible) return null;

  const {
    depth, jitter, harmonics, harmonicStrength, twist, 
    fractalNoise, useSuperformula, superM, superN1, superN2, superN3, wormhole,
    shapeMode, speed, topology
  } = settings;

  // Helper to colorize numbers
  const Val = ({ v, color = "text-cyan-400" }: { v: number | string, color?: string }) => (
    <span className={`font-bold ${color}`}>{typeof v === 'number' ? v.toFixed(2) : v}</span>
  );

  return (
    <div className="flex flex-col items-end space-y-2 pointer-events-none select-none">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl text-[10px] font-mono leading-relaxed shadow-2xl max-w-xs md:max-w-md text-right transition-all duration-300">
        <div className="text-gray-500 mb-2 border-b border-white/10 pb-1 flex justify-between">
            <span>GEN_EQ_SOLVER_V4.1</span>
            <span className="animate-pulse text-green-500">RUNNING</span>
        </div>

        {/* 1. Global Vector */}
        <div className="mb-1">
          <span className="text-gray-400">P(θ,t) = </span>
          <span className="text-white">Center</span>
          <span className="text-gray-500"> + </span>
          <span className="text-yellow-300">R(θ)</span>
          <span className="text-gray-500"> · </span>
          <span className="text-white">[cos(Φ), sin(Φ)]</span>
        </div>

        {/* 2. Angle Calculation with Twist */}
        <div className="pl-4 border-r-2 border-gray-800 pr-2 my-1">
           <div className="text-gray-400">
              Φ = θ + <span className="text-pink-400">Twist</span>(<Val v={twist} color="text-pink-400"/> · depth)
           </div>
        </div>

        {/* 3. Radius Components */}
        <div className="mb-1 mt-2 text-gray-400">
            R(θ) = <span className="text-green-400">Base</span> · <span className="text-purple-400">Shape</span> · <span className="text-pink-400">Mod</span> · <span className="text-blue-400">Noise</span>
        </div>

        {/* Base Depth Curve */}
        <div className="pl-4 border-r-2 border-green-900/50 pr-2 text-gray-500">
           <span className="text-green-400">Base</span> = (3W) · (1 - cos(t))^<Val v={depth} color="text-green-400"/>
        </div>

        {/* Shape Function (Conditional) */}
        <div className="pl-4 border-r-2 border-purple-900/50 pr-2 mt-1 text-gray-500">
          {useSuperformula ? (
             <>
                <span className="text-purple-400">Shape</span> = Superformula(
                m=<Val v={superM} color="text-purple-400"/>, 
                n=[<Val v={superN1} color="text-purple-400"/>, <Val v={superN2} color="text-purple-400"/>, <Val v={superN3} color="text-purple-400"/>]
                )
             </>
          ) : (
             <>
                <span className="text-purple-400">Shape</span> = Geometry.<span className="uppercase text-purple-300">{shapeMode}</span>_FN(θ)
             </>
          )}
        </div>

        {/* Harmonics */}
        <div className="pl-4 border-r-2 border-pink-900/50 pr-2 mt-1 text-gray-500">
           <span className="text-pink-400">Mod</span> = 1 + <Val v={harmonicStrength} color="text-pink-400"/> · sin(<Val v={harmonics} color="text-pink-400"/>θ + t)
        </div>

        {/* Noise/Chaos */}
        <div className="pl-4 border-r-2 border-blue-900/50 pr-2 mt-1 text-gray-500">
           <span className="text-blue-400">Noise</span> = 1 + <Val v={jitter} color="text-blue-400"/> · {fractalNoise ? 'Fractal(4-Oct)' : 'Perlin'}(t · <Val v={speed}/>)
        </div>
        
        {/* Wormhole Offset */}
        {wormhole > 0 && (
             <div className="mt-2 pt-2 border-t border-white/5 text-gray-400">
                <span className="text-red-400">Wormhole Offset</span>: 
                Δxy = Noise(depth) · <Val v={wormhole} color="text-red-400"/>
             </div>
        )}

        {/* Topology */}
        <div className="mt-2 text-right text-[9px] text-gray-600 uppercase tracking-widest">
            Topology: <span className="text-cyan-600 font-bold">{topology}</span>
        </div>

      </div>
    </div>
  );
};

export default FormulaOverlay;
