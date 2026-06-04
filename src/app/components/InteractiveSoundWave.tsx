import { useEffect, useRef, useState } from 'react';

interface InteractiveSoundWaveProps {
  className?: string;
}

export function InteractiveSoundWave({ className = '' }: InteractiveSoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      targetMousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      // Smooth lerp for mouse position
      mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * 0.05;
      mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.008;

      // Draw multiple wave layers
      const layers = [
        { color: 'rgba(255, 107, 53, 0.08)', amplitude: 80, frequency: 0.015, offset: 0 },
        { color: 'rgba(247, 147, 30, 0.06)', amplitude: 60, frequency: 0.02, offset: Math.PI * 0.5 },
        { color: 'rgba(253, 184, 51, 0.05)', amplitude: 100, frequency: 0.01, offset: Math.PI },
      ];

      layers.forEach((layer) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        const points = 200;
        for (let i = 0; i <= points; i++) {
          const x = (canvas.width / points) * i;
          const relativeX = i / points;

          // Calculate mouse influence based on distance
          const mouseInfluence = 1 - Math.abs(relativeX - mousePos.current.x) * 2;
          const clampedInfluence = Math.max(0, mouseInfluence);

          // Wave calculation with mouse interaction
          const baseY =
            Math.sin(relativeX * layer.frequency * 100 + time + layer.offset) * layer.amplitude +
            Math.sin(relativeX * layer.frequency * 50 - time * 0.5) * (layer.amplitude * 0.5);

          // Add mouse-based vertical displacement
          const mouseDisplacement =
            clampedInfluence * (mousePos.current.y - 0.5) * 150;

          const y = canvas.height / 2 + baseY + mouseDisplacement;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Fill below the wave
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = layer.color.replace('0.08', '0.03').replace('0.06', '0.02').replace('0.05', '0.02');
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
