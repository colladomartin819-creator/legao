import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { Sparkles, Sliders, Check } from "lucide-react";

interface ParticleType {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export default function LegoCursor() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("lego_cursor_enabled");
    return saved ? JSON.parse(saved) : true;
  });

  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<ParticleType[]>([]);
  const particleIdRef = useRef(0);
  const lastSpawnRef = useRef({ x: 0, y: 0 });

  // Smooth mouse movement using framer-motion springs
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350, mass: 0.5 };
  const mouseX = useSpring(rawX, springConfig);
  const mouseY = useSpring(rawY, springConfig);

  useEffect(() => {
    localStorage.setItem("lego_cursor_enabled", JSON.stringify(enabled));
    
    if (enabled) {
      document.body.classList.add("lego-cursor-active");
    } else {
      document.body.classList.remove("lego-cursor-active");
    }
    
    return () => {
      document.body.classList.remove("lego-cursor-active");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Spawn lego stud trail particles if mouse has moved sufficiently
      const dist = Math.hypot(e.clientX - lastSpawnRef.current.x, e.clientY - lastSpawnRef.current.y);
      if (dist > 25) {
        spawnParticle(e.clientX, e.clientY);
        lastSpawnRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    // Track hovered interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        target.classList.contains("cursor-pointer")
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [enabled, rawX, rawY]);

  const spawnParticle = (x: number, y: number) => {
    const colors = [
      "#EF5350", // Lego Red
      "#1E88E5", // Lego Blue
      "#FBC02D", // Lego Yellow
      "#43A047", // Lego Green
      "#FF5722", // Lego Orange
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const id = particleIdRef.current++;
    
    setParticles((prev) => [
      ...prev.slice(-15), // Cap particle count at 15 for buttery smooth performance
      {
        id,
        x: x + (Math.random() * 12 - 6),
        y: y + (Math.random() * 12 - 6),
        color: randomColor,
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
      },
    ]);

    // Cleanup particle after 1 second
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  // Sparkle burst to celebrate clicking
  const handleCursorClickEvent = () => {
    if (!enabled) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        spawnParticle(cursorPos.x, cursorPos.y);
      }, i * 40);
    }
  };

  return (
    <>
      {/* Global CSS Injector to hide native cursor when active */}
      {enabled && (
        <style dangerouslySetInnerHTML={{ __html: `
          .lego-cursor-active, .lego-cursor-active * {
            cursor: none !important;
          }
        `}} />
      )}

      {/* Floating LEGO Baseplate Config Toggle */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-auto">
        <button
          onClick={() => setEnabled(!enabled)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-2xl border transition duration-200 uppercase font-black text-[10px] tracking-wider ${
            enabled
              ? "bg-amber-400 text-neutral-950 border-amber-300 hover:bg-amber-300"
              : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
          }`}
          style={{
            boxShadow: enabled ? "0 0 20px rgba(251, 192, 45, 0.25)" : "none"
          }}
        >
          <div className="relative w-5 h-5 flex items-center justify-center bg-neutral-950 rounded-md border border-neutral-800">
            {/* Tiny modeled 2x2 Lego Stud */}
            <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${
              enabled ? "bg-amber-400 scale-110 shadow-[0_0_8px_#fcd34d]" : "bg-neutral-800 scale-90"
            }`} />
          </div>
          <span>LEGO® HAND CURSOR: {enabled ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Active LEGO Cursor Element */}
      {enabled && (
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
          onClick={handleCursorClickEvent}
        >
          {/* Lego Stud Trail Particles */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0.9, scale: 1, x: p.x - p.size / 2, y: p.y - p.size / 2, rotate: p.rotation }}
                animate={{ opacity: 0, scale: 0.2, y: p.y + 40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute rounded-sm border"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderColor: "rgba(0,0,0,0.15)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)"
                }}
              >
                {/* Simulated center stud logo dot */}
                <div className="w-1/2 h-1/2 rounded-full mx-auto my-auto mt-[25%] opacity-50 border border-black/10 bg-white/20" />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* LEGO Minifigure Hand Cursor */}
          <motion.div
            style={{
              x: mouseX,
              y: mouseY,
              position: "absolute",
              left: -16, // Offset so the center/tip of claw points right under cursor
              top: -16,  // Offset
            }}
            animate={{
              rotate: hovered ? 25 : 0,
              scale: clicked ? 0.85 : hovered ? 1.15 : 1
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 18
            }}
          >
            <svg
              width="45"
              height="45"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
            >
              {/* Sleeve (Classic Lego Red Sleeve/Arm Cuff) */}
              <motion.path
                d="M12 24 L20 24 L18 31 L14 31 Z"
                fill="#EF5350"
                stroke="#C62828"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              
              {/* Wrist Pivot bar (Grey/Metallic connector) */}
              <rect
                x="14"
                y="20"
                width="4"
                height="4"
                fill="#B0BEC5"
                stroke="#546E7A"
                strokeWidth="1"
                rx="0.5"
              />

              {/* LEGO Hand Base Block */}
              <path
                d="M11 17 C11 16 13 15 16 15 C19 15 21 16 21 17 L21 19 L11 19 Z"
                fill="#FBC02D"
                stroke="#F57F17"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Left Claw Prong */}
              <motion.path
                d="M11 17 C10 13 5 12 5 8 C5 4 10 5 12 8"
                fill="none"
                stroke="#FBC02D"
                strokeWidth="3.2"
                strokeLinecap="round"
                animate={{
                  rotate: clicked ? 12 : hovered ? -3 : 0,
                  x: clicked ? 1 : hovered ? -0.5 : 0
                }}
                transition={{ type: "spring", stiffness: 450, damping: 12 }}
                style={{ originX: "11px", originY: "17px" }}
              />

              {/* Right Claw Prong */}
              <motion.path
                d="M21 17 C22 13 27 12 27 8 C27 4 22 5 20 8"
                fill="none"
                stroke="#FBC02D"
                strokeWidth="3.2"
                strokeLinecap="round"
                animate={{
                  rotate: clicked ? -12 : hovered ? 3 : 0,
                  x: clicked ? -1 : hovered ? 0.5 : 0
                }}
                transition={{ type: "spring", stiffness: 450, damping: 12 }}
                style={{ originX: "21px", originY: "17px" }}
              />
              
              {/* Highlight Dot on Palm */}
              <circle cx="16" cy="18" r="1.5" fill="#FFF" opacity="0.4" />
            </svg>
          </motion.div>
        </div>
      )}
    </>
  );
}
