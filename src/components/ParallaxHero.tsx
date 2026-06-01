import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowDown, Sparkles, ChevronRight, Play, Compass, Award } from 'lucide-react';

export default function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check window size for mobile adjustments
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor element visibility to freeze rendering loop when scrolled past (performance win!)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Silent and buttery Inertial Lerping loop using requestAnimationFrame
  useEffect(() => {
    if (!isInViewport) return;

    const handleScroll = () => {
      // Monitor current relative scroll inside page
      scrollTarget.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const lerpLoop = () => {
      // 0.08 interpolation speed gives the ultra-silky "physics inertia" damping lag
      const diff = scrollTarget.current - scrollCurrent.current;
      
      // Stop looping edits if they are microscopic
      if (Math.abs(diff) > 0.1) {
        scrollCurrent.current += diff * 0.085;
      } else {
        scrollCurrent.current = scrollTarget.current;
      }

      if (containerRef.current) {
        // Feed the smoothed scroll-y offset into CSS Custom Property
        containerRef.current.style.setProperty('--scroll-y', `${scrollCurrent.current}px`);
      }

      animationFrameId = requestAnimationFrame(lerpLoop);
    };

    lerpLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInViewport]);

  // SVG Grain backdrop overlay representation
  const grainBackground = useMemo(() => {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
        <filter id='grain'>
          <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' result='t'/>
          <feColorMatrix in='t' type='saturate' values='0' result='t'/>
          <feComponentTransfer>
            <feFuncA type='identity' exponent='1.2'/>
          </feComponentTransfer>
        </filter>
        <rect width='160' height='160' filter='url(#grain)' opacity='0.065'/>
      </svg>
    `;
    return `url("data:image/svg+xml;base64,${btoa(svg)}")`;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] md:h-[680px] overflow-hidden bg-neutral-950 flex items-center border-b border-amber-400/20 select-none"
      style={{
        // Define default CSS variables for hardware-accelerated transforms
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 1. Grain Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-50 bg-repeat"
        style={{
          backgroundImage: grainBackground,
          backgroundSize: '160px 160px',
        }}
      />

      {/* 2. Deep Stellar Sunset Sky Layer (Distant Backdrop) */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#180e29] via-[#2c1328] to-[#120713] origin-bottom transition-all duration-300"
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y, 0px) * 0.65), -10px) scale(1.1)',
        }}
      />

      {/* 3. Mountain Pagoda Backdrop Layer (Background Speed: 0.5x) */}
      <div
        className="absolute inset-0 bg-cover bg-bottom opacity-50 mix-blend-lighten pointer-events-none filter blur-[0.5px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200')`,
          transform: 'translate3d(0, calc(var(--scroll-y, 0px) * 0.5), -5px) scale(1.15)',
        }}
      />

      {/* 4. Giant Glowing Floating 3D Depth Typography Behind characters (Speed: 0.65x) */}
      <div
        className="absolute inset-x-0 top-[18%] md:top-[15%] flex items-center justify-center pointer-events-none select-none text-center"
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y, 0px) * 0.35), -1px)',
        }}
      >
        <h1 className="font-black text-amber-400/10 tracking-[-0.03em] uppercase leading-none whitespace-nowrap text-[80px] sm:text-[160px] md:text-[230px]">
          NINJA DEPTH
        </h1>
      </div>

      {/* 5. Ambient Vignette Gradient Layer to blend left content with dark cards */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 sm:to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />

      {/* 6. Base Content Layer (Speed: 1.0x / standard scrolling) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 grid grid-cols-1 md:grid-cols-12 gap-12 items-center pointer-events-none">
        <div className="md:col-span-7 space-y-6 md:pr-12 pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-xl border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>EXOTIC COLLECTOR SHOWCASE</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none uppercase">
            3D PARALLAX <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
              REALM SHIFT
            </span>
          </h2>
          
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
            Experience absolute vertical depth of Lego construction. Our high-performance rendering engine pairs visual realism with physical motion. Scroll down to see layers drift with deep, buttery-smooth cinematic momentum.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-3">
            <button
              onClick={() => {
                const targetSec = document.getElementById('grid-showcase');
                if (targetSec) {
                  targetSec.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-amber-400 hover:bg-amber-300 text-neutral-950 hover:scale-[1.03] active:scale-95 text-xs sm:text-sm font-black px-6 py-3.5 rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer border border-amber-300/40"
            >
              <Compass className="w-4 h-4 text-neutral-950" />
              Start Navigating
            </button>
            <button
              onClick={() => {
                const specItem = document.getElementById('about-vip-section');
                if (specItem) {
                  specItem.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-700 hover:scale-[1.03] active:scale-95 text-xs sm:text-sm font-bold px-5.5 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>Explore Specs</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">Background Speed</span>
                <span className="text-xs text-indigo-300 font-extrabold font-mono">0.5x Drifting</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Play className="w-4 h-4 rotate-90" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">Foreground Speed</span>
                <span className="text-xs text-teal-300 font-extrabold font-mono">1.2x Thrusting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Foreground Layer - Towering Mechanical Ninja (Speed: 1.2x) */}
      <div
        className="absolute bottom-[2%] md:bottom-[-5%] right-0 md:right-[6%] w-[70%] sm:w-[50%] md:w-[420px] aspect-[0.7/1] pointer-events-none z-30 filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.85)]"
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y, 0px) * -0.2), 5px)',
        }}
      >
        <img
          src="https://cdn.phototourl.com/free/2026-06-01-3709f574-13b9-45df-a1ae-27066fad9d7d.png"
          alt="Foreground Master Titan Mech"
          className="w-full h-full object-contain object-bottom animate-[float_6s_easeInOutSine_infinite]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 8. Extra Floating Debris Particles for maximum depth perception (Speed: 1.35x & 1.45x) */}
      {/* Floating Sparkle/Stud left top */}
      <div
        className="absolute top-[15%] left-[10%] md:left-[45%] w-8 h-8 pointer-events-none z-40 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg opacity-85 rotate-45 border border-amber-300/40 shadow-lg shadow-orange-500/10 filter blur-[0.3px]"
        style={{
          transform: 'translate3d(calc(var(--scroll-y, 0px) * 0.05), calc(var(--scroll-y, 0px) * -0.35), 15px) rotate(45deg)',
        }}
      />

      {/* Floating Sparkle/Stud right mid */}
      <div
        className="absolute bottom-[35%] right-[2%] md:right-[42%] w-12 h-12 pointer-events-none z-45 bg-gradient-to-br from-teal-400 to-indigo-600 rounded-lg opacity-75 -rotate-12 border border-teal-300/40 shadow-xl filter blur-[1px]"
        style={{
          transform: 'translate3d(calc(var(--scroll-y, 0px) * -0.05), calc(var(--scroll-y, 0px) * -0.45), 20px) rotate(-12deg)',
        }}
      />

      {/* Floating mini-brick left-bottom (Speed: 1.15x) */}
      <div
        className="absolute bottom-[20%] left-[5%] md:left-[35%] w-10 h-6 pointer-events-none z-35 bg-gradient-to-br from-red-500 to-rose-600 rounded-md opacity-60 rotate-12 shadow-md filter blur-[0.5px]"
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y, 0px) * -0.15), 10px)',
        }}
      />

      {/* Dynamic Floating Sub-Text Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 animate-bounce">
        <span className="text-[10px] text-amber-400/70 uppercase tracking-[0.25em] font-extrabold font-mono">
          Scroll Down to Shift Realms
        </span>
        <ArrowDown className="w-3.5 h-3.5 text-amber-400/70" />
      </div>

      {/* Floating CSS Keyframes for slow ambient hovering */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
      `}</style>
    </div>
  );
}
