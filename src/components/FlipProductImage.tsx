import React, { useState } from "react";
import { motion } from "motion/react";
import { Ruler, Sparkles, Box, Compass, RefreshCw } from "lucide-react";

interface FlipProductImageProps {
  image: string;
  name: string;
  pieces: number;
  theme: string;
  itemNumber: string;
  price: number;
  dimensions: string;
  rating: number;
  themeColor: 'amber' | 'red' | 'emerald' | 'cyan';
  onClick?: () => void;
}

export default function FlipProductImage({
  image,
  name,
  pieces,
  theme,
  itemNumber,
  price,
  dimensions,
  rating,
  themeColor,
  onClick
}: FlipProductImageProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Setup theme-based neon drafting styles
  const colorMap = {
    amber: {
      border: "border-amber-400/40 hover:border-amber-400",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
      text: "text-amber-400",
      bg: "bg-amber-950/20",
      badge: "bg-amber-500 text-neutral-950"
    },
    red: {
      border: "border-red-600/40 hover:border-red-500",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
      text: "text-red-400",
      bg: "bg-red-950/20",
      badge: "bg-red-600 text-white"
    },
    emerald: {
      border: "border-emerald-500/40 hover:border-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      text: "text-emerald-400",
      bg: "bg-emerald-950/20",
      badge: "bg-emerald-500 text-neutral-950"
    },
    cyan: {
      border: "border-cyan-500/45 hover:border-cyan-400",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
      text: "text-cyan-400",
      bg: "bg-cyan-950/20",
      badge: "bg-cyan-500 text-neutral-950"
    }
  };

  const currentTheme = colorMap[themeColor];

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full h-48 select-none" style={{ perspective: "1000px" }}>
      {/* 3D Rotator Container */}
      <motion.div
        className="w-full h-full relative cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        
        {/* ================= FRONT SIDE (REAL IMAGE) ================= */}
        <div 
          className="absolute inset-0 w-full h-full rounded-t-lg overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          onClick={onClick}
        >
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          {/* Theme overlay on badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            <span className={`bg-neutral-950/90 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur border border-neutral-800`}>
              {theme}
            </span>
          </div>

          {/* Pieces indicator (Front) */}
          <span className="absolute bottom-2 right-2 bg-neutral-950/85 text-neutral-350 font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800">
            {pieces} PCS
          </span>

          {/* Quick interactive flip trigger button on front */}
          <button
            title="View Blueprints"
            onClick={handleFlip}
            className="absolute top-2.5 right-2.5 bg-neutral-950/85 hover:bg-neutral-900 border border-neutral-800 p-1.5 rounded-full text-neutral-400 hover:text-white transition backdrop-blur z-20 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================= BACK SIDE (BLUEPRINT) ================= */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-t-lg bg-neutral-950 border-b-2 border-neutral-900 p-4 flex flex-col justify-between overflow-hidden transition-all ${currentTheme.border} ${currentTheme.glow}`}
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)" 
          }}
          onClick={handleFlip}
        >
          {/* Drafting Blueprint Grid Overlay lines */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

          {/* Blueprint Header */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5 z-10">
            <div className="flex items-center gap-1.5">
              <Compass className={`w-3.5 h-3.5 ${currentTheme.text} animate-spin`} style={{ animationDuration: '8s' }} />
              <span className="font-mono text-[9px] text-neutral-500 uppercase font-bold tracking-widest">
                CAD SCHEMATIC File {itemNumber || "42115"}
              </span>
            </div>
            
            <button
              onClick={handleFlip}
              className={`text-[8px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 px-1.5 py-0.5 rounded text-neutral-400 hover:text-white font-mono flex items-center gap-1 font-bold`}
            >
              <RefreshCw className="w-2.5 h-2.5" /> PHOTO
            </button>
          </div>

          {/* Structural specs drafting elements */}
          <div className="space-y-1.5 my-1.5 font-mono z-10 flex-grow flex flex-col justify-center">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500 uppercase tracking-wider font-semibold">MODEL NAME:</span>
              <span className={`font-bold hover:underline transition truncate max-w-[140px] text-neutral-200`}>
                {name}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500 uppercase tracking-wider font-semibold">SCALE BLOCKS:</span>
              <span className={`${currentTheme.text} font-black`}>
                {pieces} units
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500 uppercase tracking-wider font-semibold">BLOCK SPACING:</span>
              <div className="flex items-center gap-1 text-neutral-300">
                <Ruler className="w-3 h-3 text-neutral-500" />
                <span className="text-[9px] font-bold">{dimensions || "Custom Layout"}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500 uppercase tracking-wider font-semibold">INTEGRITY CHECK:</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                ● ONLINE (PASS)
              </span>
            </div>
          </div>

          {/* Blueprint Footer with telemetry */}
          <div className="border-t border-neutral-900 pt-1.5 flex items-center justify-between text-[8px] font-mono z-10 text-neutral-500">
            <span>COORDS: X-{Math.round(price * 0.12)} // Y-{pieces % 100}</span>
            <span className={`${currentTheme.text} font-bold tracking-widest uppercase`}>
              DOUBLE VIP REWARD ACTIVE
            </span>
          </div>

          {/* Glowing bottom structural support visual bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neutral-600 to-transparent opacity-30" />
        </div>

      </motion.div>
    </div>
  );
}
