import React, { useEffect, useRef } from "react";

interface SuntyLuxOverlayProps {
  themeMode: "amber" | "red" | "emerald" | "cyan";
  intensity?: number;
}

export default function SuntyLuxOverlay({ themeMode, intensity = 1.0 }: SuntyLuxOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Setup color palettes matches the luxury tabs
    const themeColors = {
      amber: ["rgba(251, 191, 36, ", "rgba(245, 158, 11, ", "rgba(217, 119, 6, ", "rgba(253, 224, 71, "], // Brilliant Premium Gold / Luxury Sand
      red: ["rgba(239, 68, 68, ", "rgba(248, 113, 113, ", "rgba(185, 28, 28, ", "rgba(251, 113, 133, "],  // Deep Crimson Threat
      emerald: ["rgba(16, 185, 129, ", "rgba(52, 211, 153, ", "rgba(4, 120, 87, ", "rgba(110, 231, 183, "], // Mystical Jade / Bamboo Green
      cyan: ["rgba(6, 182, 212, ", "rgba(34, 211, 238, ", "rgba(13, 148, 136, ", "rgba(103, 232, 249, "],   // High-tech Cyber Aurora
    };

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      colorBase: string;
      pulseDirection: number;
      pulseSpeed: number;
      isDeepSpark?: boolean;
    }

    // Increased maxParticles roughly double for premium dense coverage
    const maxParticles = Math.min(140, Math.floor((width * height) / 12000)) * intensity;
    const particles: Particle[] = [];

    const createParticle = (isInit = false): Particle => {
      const colors = themeColors[themeMode] || themeColors.amber;
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      const isDeepSpark = Math.random() > 0.8; // Occasional extra large cinematic ambient nebula glow
      return {
        x: Math.random() * width,
        y: isInit ? Math.random() * height : height + 30,
        size: isDeepSpark 
          ? Math.random() * 5.5 + 4.5 // Massive aesthetic soft background orb
          : Math.random() * 3.2 + 1.2, // Vibrant golden/aurora sparks
        speedX: (Math.random() - 0.5) * 0.7,
        speedY: -(Math.random() * 1.0 + 0.3),
        opacity: Math.random() * 0.55 + 0.35, // Boosted base opacity significantly
        colorBase,
        pulseDirection: Math.random() > 0.5 ? 1 : -1,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        isDeepSpark
      };
    };

    // Populate initially
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mathematical scroll kinetic velocity calculations
      const scrollDiff = scrollYRef.current - lastScrollYRef.current;
      velocityRef.current += (scrollDiff - velocityRef.current) * 0.15;
      lastScrollYRef.current = scrollYRef.current;

      // Slowly damp kinetic wind
      velocityRef.current *= 0.93;

      // Render & cycle particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Greatly enhanced kinetic response to scroll momentum (0.18 factor, extremely visible!)
        p.y -= p.speedY + velocityRef.current * 0.18;
        p.x += p.speedX + (velocityRef.current * p.speedX * 0.05);

        // Micro organic breathing glow pulses
        p.opacity += p.pulseSpeed * p.pulseDirection;
        if (p.opacity > 0.90) {
          p.opacity = 0.90;
          p.pulseDirection = -1;
        }
        if (p.opacity < 0.22) {
          p.opacity = 0.22;
          p.pulseDirection = 1;
        }

        // Wrap around margins
        if (p.y < -30) {
          particles[i] = createParticle(false);
          continue;
        }
        if (p.y > height + 30) {
          p.y = -10;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Drawing a beautifully blurred soft luxurious circle with high contrast glow gradient keys
        ctx.beginPath();
        const radLimit = p.isDeepSpark ? p.size * 3.8 : p.size * 2.8;
        const radGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radLimit);
        
        ctx.fillStyle = radGrd;
        if (p.isDeepSpark) {
          radGrd.addColorStop(0, `${p.colorBase}${p.opacity * 0.65})`);
          radGrd.addColorStop(0.3, `${p.colorBase}${p.opacity * 0.25})`);
          radGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.arc(p.x, p.y, radLimit, 0, Math.PI * 2);
        } else {
          radGrd.addColorStop(0, `${p.colorBase}${p.opacity * 0.95})`);
          radGrd.addColorStop(0.4, `${p.colorBase}${p.opacity * 0.45})`);
          radGrd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.arc(p.x, p.y, radLimit, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [themeMode, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[8] select-none mix-blend-screen opacity-[0.9]"
    />
  );
}
