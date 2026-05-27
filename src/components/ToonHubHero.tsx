import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Box, Compass } from "lucide-react";

const IMAGES = [
  { 
    src: '/src/assets/images/lego_ninjago_mech_1779239741341.png', 
    bg: 'radial-gradient(circle at 50% 30%, #0d1e15 0%, #010403 100%)', 
    borderGlow: 'rgba(16, 185, 129, 0.48)', // Emerald Neon
    themeText: 'text-emerald-400',
    title: 'LLOYD GREEN MECH',
    desc: 'The legendary Ninjago Titan with high-grade carbon-fiber build plates. Dual giant dragon katanas break right through conventional visual mainframe bounds.',
    badge: 'SHAPE BREAK',
    specialBreakKey: true
  },
  { 
    src: '/src/assets/images/lego_batman_1779670840910.png', 
    bg: 'radial-gradient(circle at 50% 30%, #11101d 0%, #030206 100%)', 
    borderGlow: 'rgba(251, 191, 36, 0.4)', // Amber Gold
    themeText: 'text-amber-400',
    title: 'BATMAN DRAFT',
    desc: 'The Defender of Gotham with heavy tactical plates. Equipped with double-wing batarangs and high-tension utility gadgets.',
    badge: 'LUXURY ED.'
  },
  { 
    src: '/src/assets/images/lego_cosmic_villain_1779670943011.png', 
    bg: 'radial-gradient(circle at 50% 30%, #20040c 0%, #050103 100%)', 
    borderGlow: 'rgba(239, 68, 68, 0.4)', // Vader Crimson
    themeText: 'text-red-500',
    title: 'COSMIC COMMANDER',
    desc: 'Premium space commander build utilizing custom obsidian bricks. Complete with translucent crimson light blade hardware.',
    badge: 'COLLECTIBLE'
  },
  { 
    src: '/src/assets/images/lego_harrypotter_1779670894416.png', 
    bg: 'radial-gradient(circle at 50% 30%, #1c0527 0%, #04010a 100%)', 
    borderGlow: 'rgba(168, 85, 247, 0.4)', // Purple Magic
    themeText: 'text-purple-400',
    title: 'MYSTIC WIZARD',
    desc: 'Relive classic wizarding heritage. Complete with a miniature study desk, buildable wooden wand, and signature round lens detailing.',
    badge: 'EXCLUSIVE'
  },
  { 
    src: '/src/assets/images/lego_ironman_1779670915352.png', 
    bg: 'radial-gradient(circle at 50% 30%, #071f30 0%, #010408 100%)', 
    borderGlow: 'rgba(6, 182, 212, 0.4)', // Arc Cyan
    themeText: 'text-cyan-400',
    title: 'MARK-LXXXV SPEC',
    desc: 'Technologically superior mechanical suit render. Includes multi-joint stabilization and a gorgeous luminescent laser arc reactor.',
    badge: 'STEM CAD'
  },
];

export default function ToonHubHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload all assets
  useEffect(() => {
    IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });
  }, []);

  // Index Loop Offset calculation (circular distance map)
  const getLoopDiff = (index: number) => {
    const total = IMAGES.length;
    let diff = index - activeIndex;
    
    // Circular loop wrapping adjustments
    if (diff > total / 2) {
      diff -= total;
    } else if (diff < -total / 2) {
      diff += total;
    }
    return diff;
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    const total = IMAGES.length;
    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % total);
    } else {
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }
    // Damp tilt instantly
    setTilt({ x: 0, y: 0 });
  };

  // Pointer position evaluation for active card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Relative center offset (-0.5 to 0.5)
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    // Absolute 3D Tilt calculation (max 15 degrees angle)
    const rotateX = -py * 24; 
    const rotateY = px * 24;  

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    // Elegant slide damp on exit
    setTilt({ x: 0, y: 0 });
  };

  const currentItem = IMAGES[activeIndex];

  return (
    <div 
      className="relative w-full overflow-hidden transition-all duration-700 border-b border-neutral-900 bg-neutral-950 flex items-center justify-center font-sans tracking-tight"
      style={{ 
        backgroundImage: currentItem.bg,
        height: isMobile ? "680px" : "580px",
      }}
    >
      {/* Decorative Grid overlays */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40 pointer-events-none" />

      {/* Luxury Logo Label */}
      <div className="absolute top-6 left-6 z-40 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-[0.25em] font-mono">
          SUNTY DESIGN EXHIBIT CORE
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col lg:flex-row items-center justify-between gap-8 pt-12 lg:pt-0 relative z-30">
        
        {/* ================= LEFT SIDE: INFO HEADERS ================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 text-left shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-mono font-black tracking-widest px-3 py-1 rounded-full uppercase">
                  {currentItem.badge}
                </span>
                <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  CAD Render Online
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white leading-none uppercase tracking-tight">
                {currentItem.title}
              </h1>

              <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded" />

              <p className="text-neutral-400 text-sm leading-relaxed max-w-md font-sans">
                {currentItem.desc}
              </p>

              {/* Specs HUD bar elements */}
              <div className="grid grid-cols-2 gap-4 max-w-xs pt-2 text-xs font-mono">
                <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-900">
                  <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Physics System</span>
                  <span className="text-neutral-200 font-extrabold uppercase">SPR_900_STF</span>
                </div>
                <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-900">
                  <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">3D Tilt Axis</span>
                  <span className="text-white font-extrabold uppercase flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 animate-spin text-neutral-400" style={{ animationDuration: '6s' }} /> POSX_POSY
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls Overlay HUD */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => handleNavigate('prev')}
              className="w-11 h-11 border border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:text-white rounded-xl flex items-center justify-center hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer backdrop-blur"
              aria-label="Previous Slide"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            
            <div className="flex gap-1.5 font-mono text-xs text-neutral-500">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span>/</span>
              <span>{String(IMAGES.length).padStart(2, '0')}</span>
            </div>

            <button
              onClick={() => handleNavigate('next')}
              className="w-11 h-11 border border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:text-white rounded-xl flex items-center justify-center hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer backdrop-blur"
              aria-label="Next Slide"
            >
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE: DENSE 3D CAROUSEL EXHIBIT ================= */}
        <div 
          className="w-full lg:w-1/2 h-[380px] sm:h-[480px] relative flex items-center justify-center select-none"
          style={{ perspective: "1500px" }}
          ref={containerRef}
        >
          {IMAGES.map((item, index) => {
            const diff = getLoopDiff(index);
            const isVisible = Math.abs(diff) <= 1;

            // Compute exact geometric placements & zoom dimensions
            // Active center: diff === 0, Left side: diff === -1, Right side: diff === 1
            const xOffset = diff * (isMobile ? 180 : 255); 
            const scale = diff === 0 ? 1.05 : 0.82;
            const opacity = diff === 0 ? 1.0 : 0.38;
            const zIndex = diff === 0 ? 30 : 10;
            const translateZ = diff === 0 ? 60 : -140;

            return (
              <motion.div
                key={index}
                className="absolute shrink-0 cursor-grab active:cursor-grabbing flex flex-col justify-end p-5"
                style={{
                  width: isMobile ? "240px" : "300px",
                  height: isMobile ? "320px" : "400px",
                  transformStyle: "preserve-3d",
                  visibility: isVisible ? "visible" : "hidden",
                }}
                animate={{
                  x: xOffset,
                  scale: scale,
                  opacity: isVisible ? opacity : 0,
                  zIndex: zIndex,
                  z: translateZ,
                  // Enable active 3D Pointer tilts only on centered cards 
                  rotateX: diff === 0 ? tilt.x : 0,
                  rotateY: diff === 0 ? tilt.y : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 900, // rapid response spring stiffness
                  damping: 50,    // damping for clean control
                  mass: 0.3       // instant snappy movement with zero drag
                }}
                onMouseMove={diff === 0 ? handleMouseMove : undefined}
                onMouseLeave={diff === 0 ? handleMouseLeave : undefined}
                onClick={() => {
                  if (diff !== 0) {
                    setActiveIndex(index);
                    setTilt({ x: 0, y: 0 });
                  }
                }}
              >
                {/* 
                  1. Inner Card Background carrying the grid & border
                  By setting overflow-hidden on this component, we preserve beautifully rounded luxury borders, 
                  while the absolute positioned parent allows sibling elements to break out nicely!
                */}
                <div 
                  className="absolute inset-0 rounded-3xl overflow-hidden transition-all duration-300 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, transparent 30%, rgba(3, 2, 6, 0.95) 100%), ${item.bg}`,
                    border: `2px solid ${diff === 0 ? item.borderGlow : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: diff === 0 ? `0 25px 60px -15px ${item.borderGlow}` : "none",
                  }}
                >
                  {/* Micro CAD grid overlay inside the display card */}
                  <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#aaa_1px,transparent_1px),linear-gradient(to_bottom,#aaa_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                </div>

                {/* 
                  2. Toy Figurine Core Render (Shape-Breaking "破型" Engine)
                  When active (diff === 0), the figure is scaled up and positioned out of card boundaries!
                */}
                <div 
                  className="absolute inset-x-0 bottom-16 flex items-center justify-center p-1 pointer-events-none transition-all duration-300 transform-gpu"
                  style={{ 
                    top: diff === 0 ? "-55px" : "15px", // Shifts up dramatically on active cards breaking bounds
                    transform: `translateZ(65px) scale(${diff === 0 ? 1.25 : 0.92})`, // Extends out along Z axis & pops in size
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.92)] transition-all duration-350"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />

                  {/* Special Visual Pop-out / Frame Slicers for Ninjago specifically */}
                  {item.specialBreakKey && diff === 0 && (
                    <>
                      {/* Left energy blade trail slicing out */}
                      <div className="absolute -left-14 top-12 w-32 h-6 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-sm rotate-[32deg] pointer-events-none rounded-full animate-pulse" />
                      {/* Right energy blade trail slicing out */}
                      <div className="absolute -right-14 bottom-16 w-36 h-6 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-sm rotate-[-22deg] pointer-events-none rounded-full animate-pulse" />
                      
                      {/* Interactive Emerald Runes label bursting past limits */}
                      <div className="absolute -top-6 -right-6 font-mono text-[9px] text-emerald-400 font-extrabold tracking-widest bg-emerald-950/90 border border-emerald-500/35 px-2.5 py-1 rounded-lg rotate-12 uppercase shadow-lg shadow-emerald-950/50 animate-bounce">
                        NINJA_BREAKOUT ✔
                      </div>
                    </>
                  )}

                  {/* High Quality depth ring on active center */}
                  {diff === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-52 h-52 rounded-full border border-dashed border-white/10 animate-spin" style={{ animationDuration: '20s', transform: 'rotateX(75deg) translateZ(-40px)' }} />
                    </div>
                  )}
                </div>

                {/* 
                  3. Micro HUD Status overlay on active center card
                  Brought forward using translateZ for deep parallax visual distinction!
                */}
                <div 
                  className="relative z-10 w-full text-left space-y-1 mt-auto pointer-events-none"
                  style={{ transform: "translateZ(80px)" }}
                >
                  <span className={`text-[9px] font-mono font-black ${item.themeText} uppercase tracking-widest`}>
                    SPECIFICATION REGISTER
                  </span>
                  <p className="text-white font-black text-xs uppercase tracking-tight block truncate">
                    {item.title}
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono">
                    <span>SECTOR_0{index + 1}</span>
                    <span>ONLINE PASS ✔</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
