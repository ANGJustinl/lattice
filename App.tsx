import React, { useState } from 'react';
import GenerativeSketch, { SketchSettings, ColorMode, TopologyMode, ShapeMode } from './components/GenerativeSketch';
import FormulaOverlay from './components/FormulaOverlay';
import { Maximize2, MousePointer2, Sliders, Zap, Activity, Palette, Hexagon, Aperture, Wind, Orbit, Network, Layers, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  
  const [settings, setSettings] = useState<SketchSettings>({
    mouseControl: false,
    complexity: 6,
    depth: 5,
    strands: 1,
    speed: 1,
    jitter: 1,
    colorMode: 'electric',
    shapeMode: 'circle',
    
    harmonics: 0,
    harmonicStrength: 0.5,
    twist: 0,
    fractalNoise: false,

    useSuperformula: false,
    superM: 6,
    superN1: 1,
    superN2: 1,
    superN3: 1,

    topology: 'lattice',
    wormhole: 0
  });

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const updateSetting = <K extends keyof SketchSettings>(key: K, value: SketchSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-screen h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background Canvas */}
      <div className="absolute inset-0 z-0">
        <GenerativeSketch settings={settings} />
      </div>

      {/* Persistent Controls - Top Right Toggle */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <button 
          onClick={toggleOverlay}
          className="p-2 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full transition-colors border border-white/10 mb-4"
          aria-label="Toggle Controls"
        >
          {showOverlay ? <Maximize2 size={20} /> : <Sliders size={20} />}
        </button>

        {/* Formula Display - Always visible if showOverlay is true, or you can make it independent */}
        <FormulaOverlay settings={settings} visible={showOverlay} />
      </div>

      {/* Floating Overlay Card - Left Side */}
      <div 
        className={`absolute top-4 left-4 z-10 w-96 max-h-[95vh] overflow-y-auto scrollbar-hide transition-all duration-500 ease-in-out transform ${
          showOverlay ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <h1 className="text-xl font-light tracking-[0.2em] uppercase text-white/90">
              Lattice <span className="text-cyan-400 text-xs tracking-normal align-top">EXP</span>
            </h1>
          </div>

          <div className="space-y-6">
            
            {/* --- TOPOLOGY & STRUCTURE --- */}
            <div>
               <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-cyan-400/80 font-bold">
                <Network size={12} />
                <span>Topology Mode</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['lattice', 'dna', 'neural', 'particles'] as TopologyMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('topology', mode)}
                    className={`px-1 py-2 text-[10px] rounded border transition-all capitalize ${
                      settings.topology === mode
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* --- BASE GEOMETRY (Classic Modes) --- */}
            <div className={`transition-opacity duration-300 ${settings.useSuperformula ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-gray-400/80 font-bold">
                <Hexagon size={12} />
                <span>Base Geometry {settings.useSuperformula && "(Overridden)"}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['circle', 'star', 'gear', 'spiral'] as ShapeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('shapeMode', mode)}
                    className={`px-1 py-2 text-[10px] rounded border transition-colors capitalize ${
                      settings.shapeMode === mode
                        ? 'bg-white/20 border-white text-white'
                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* --- SUPERFORMULA ENGINE --- */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 relative overflow-hidden">
               {/* Highlight indicator when active */}
               {settings.useSuperformula && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>}
               
               <div className="flex items-center justify-between mb-3 pl-2">
                 <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-purple-400/80 font-bold">
                  <Orbit size={12} />
                  <span>Superformula Engine</span>
                 </div>
                 <button 
                    onClick={() => updateSetting('useSuperformula', !settings.useSuperformula)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${settings.useSuperformula ? 'bg-purple-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.useSuperformula ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
               </div>
              
              <div className={`space-y-3 pl-2 transition-all duration-300 ${settings.useSuperformula ? 'opacity-100' : 'opacity-30 pointer-events-none blur-[1px]'}`}>
                 {/* M - Symmetry */}
                 <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Symmetry (m)</span>
                    <span className="font-mono text-purple-400">{settings.superM}</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="1"
                    value={settings.superM}
                    onChange={(e) => updateSetting('superM', parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
                
                {/* N1, N2, N3 */}
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { l: 'n1', v: settings.superN1, k: 'superN1' },
                     { l: 'n2', v: settings.superN2, k: 'superN2' },
                     { l: 'n3', v: settings.superN3, k: 'superN3' }
                   ].map((item) => (
                      <div key={item.k} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>{item.l}</span>
                          <span className="font-mono text-purple-400">{item.v.toFixed(1)}</span>
                        </div>
                        <input
                          type="range" min="0.1" max="10" step="0.1"
                          value={item.v}
                          onChange={(e) => updateSetting(item.k as any, parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                        />
                      </div>
                   ))}
                </div>
              </div>
            </div>

            {/* --- FRACTAL DEFORMATION --- */}
            <div>
               <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-pink-400/80 font-bold">
                <Aperture size={12} />
                <span>Deformation</span>
              </div>
              
              <div className="space-y-4 p-3 bg-white/5 rounded-lg border border-white/5">
                 {/* Wormhole */}
                 <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1"><Wind size={10}/> Wormhole Bend</span>
                    <span className="font-mono text-pink-400">{settings.wormhole.toFixed(1)}</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.1"
                    value={settings.wormhole}
                    onChange={(e) => updateSetting('wormhole', parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-400"
                  />
                </div>

                {/* Harmonics */}
                <div className="flex gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Harmonics</span>
                      <span className="font-mono text-pink-400">{settings.harmonics}</span>
                    </div>
                    <input
                      type="range" min="0" max="12" step="1"
                      value={settings.harmonics}
                      onChange={(e) => updateSetting('harmonics', parseInt(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-400"
                    />
                  </div>
                   <div className="space-y-1 flex-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Strength</span>
                      <span className="font-mono text-pink-400">{settings.harmonicStrength.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0" max="2" step="0.1"
                      value={settings.harmonicStrength}
                      onChange={(e) => updateSetting('harmonicStrength', parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-400"
                    />
                  </div>
                </div>

                 {/* Twist & Noise */}
                <div className="flex gap-4 items-center">
                    <div className="space-y-1 flex-1">
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Twist</span>
                            <span className="font-mono text-pink-400">{settings.twist.toFixed(1)}</span>
                        </div>
                        <input
                            type="range" min="-1" max="1" step="0.1"
                            value={settings.twist}
                            onChange={(e) => updateSetting('twist', parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-400"
                        />
                    </div>
                    <button 
                        onClick={() => updateSetting('fractalNoise', !settings.fractalNoise)}
                        className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${settings.fractalNoise ? 'border-pink-500 bg-pink-500/20 text-pink-300' : 'border-white/10 bg-white/5 text-gray-500'}`}
                    >
                        <Activity size={16} />
                        <span className="text-[9px] mt-1">Noise</span>
                    </button>
                </div>
              </div>
            </div>

             {/* --- CORE SETTINGS --- */}
             <div>
              <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-green-400/80 font-bold">
                <Layers size={12} />
                <span>Core System</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  {/* Speed */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Flow Speed</span>
                      <span className="font-mono text-green-400">{settings.speed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min="0.1" max="5" step="0.1"
                      value={settings.speed}
                      onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-400"
                    />
                  </div>
                   {/* Depth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Depth</span>
                      <span className="font-mono text-green-400">{settings.depth.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="1" max="10" step="0.5"
                      value={settings.depth}
                      onChange={(e) => updateSetting('depth', parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-400"
                    />
                  </div>
                   {/* Jitter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Chaos</span>
                      <span className="font-mono text-green-400">{settings.jitter.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0" max="2" step="0.1"
                      value={settings.jitter}
                      onChange={(e) => updateSetting('jitter', parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-400"
                    />
                  </div>
                   {/* Complexity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Resolution</span>
                      <span className="font-mono text-green-400">{settings.complexity}</span>
                    </div>
                    <input
                      type="range" min="3" max="30" step="1"
                      value={settings.complexity}
                      onChange={(e) => updateSetting('complexity', parseInt(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-400"
                    />
                  </div>
              </div>
            </div>

            {/* --- PALETTE --- */}
             <div>
              <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-yellow-400/80 font-bold">
                <Palette size={12} />
                <span>Palette</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(['classic', 'rainbow', 'toxic', 'electric', 'thermal'] as ColorMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('colorMode', mode)}
                    className={`px-1 py-2 text-[8px] rounded border transition-colors capitalize ${
                      settings.colorMode === mode
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {mode.slice(0,4)}
                  </button>
                ))}
              </div>
            </div>

             {/* Mouse Control Toggle */}
             <button 
                onClick={() => updateSetting('mouseControl', !settings.mouseControl)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all mt-4 ${
                  settings.mouseControl 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MousePointer2 size={16} />
                  <span>Interactive Focus</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${settings.mouseControl ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
            </button>

          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] text-gray-600 font-mono">LATTICE GEN-4</span>
            <div className="flex gap-2">
                 <Hexagon size={12} className="text-gray-700" />
                 <Sparkles size={12} className="text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;