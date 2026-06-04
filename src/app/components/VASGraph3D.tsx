import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface VASGraphProps {
  valence: number; // -5 to 5
  arousal: number; // 0 to 5
  socialEngagement: number; // -5 to 5
}

export function VASGraph3D({ valence, arousal, socialEngagement }: VASGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: -20, y: 30 }); // Start with arousal pointing upward
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x - deltaY * 0.5, // Inverted direction for natural feel
      y: prev.y + deltaX * 0.5,
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Scale values for display
  const scale = 35; // pixels per unit
  const normalizedValence = valence * scale;
  const normalizedArousal = arousal * scale;
  // Z-axis in CSS 3D uses an opposite visual direction to this graph's
  // labeled front/back convention, so invert once at mapping time.
  const normalizedSocial = -socialEngagement * scale;

  // Helper function to create grid lines
  const createGridLines = () => {
    const lines = [];
    const gridSize = 5;
    const gridScale = scale;

    // XY plane (at z=0) - light gray
    for (let i = -gridSize; i <= gridSize; i++) {
      // Vertical lines (parallel to Y axis)
      lines.push(
        <div
          key={`xy-v-${i}`}
          className="absolute bg-gray-300"
          style={{
            width: '1px',
            height: `${gridSize * 2 * gridScale}px`,
            left: `${i * gridScale}px`,
            top: `${-gridSize * gridScale}px`,
            transform: 'translateZ(0px)',
            opacity: 0.3,
          }}
        />
      );
      // Horizontal lines (parallel to X axis)
      lines.push(
        <div
          key={`xy-h-${i}`}
          className="absolute bg-gray-300"
          style={{
            width: `${gridSize * 2 * gridScale}px`,
            height: '1px',
            left: `${-gridSize * gridScale}px`,
            top: `${i * gridScale}px`,
            transform: 'translateZ(0px)',
            opacity: 0.3,
          }}
        />
      );
    }

    // YZ plane (at x=0) - light blue
    for (let i = -gridSize; i <= gridSize; i++) {
      // Vertical lines (parallel to Y axis)
      lines.push(
        <div
          key={`yz-v-${i}`}
          className="absolute bg-blue-300"
          style={{
            width: '1px',
            height: `${gridSize * 2 * gridScale}px`,
            left: '0px',
            top: `${-gridSize * gridScale}px`,
            transform: `translateZ(${i * gridScale}px) rotateY(90deg)`,
            transformOrigin: 'left center',
            opacity: 0.2,
          }}
        />
      );
      // Horizontal lines (parallel to Z axis)
      lines.push(
        <div
          key={`yz-h-${i}`}
          className="absolute bg-blue-300"
          style={{
            width: `${gridSize * 2 * gridScale}px`,
            height: '1px',
            left: '0px',
            top: `${i * gridScale}px`,
            transform: 'rotateY(90deg)',
            transformOrigin: 'left center',
            opacity: 0.2,
          }}
        />
      );
    }

    // XZ plane (at y=0) - light purple
    for (let i = -gridSize; i <= gridSize; i++) {
      // Lines parallel to X axis
      lines.push(
        <div
          key={`xz-x-${i}`}
          className="absolute bg-purple-300"
          style={{
            width: `${gridSize * 2 * gridScale}px`,
            height: '1px',
            left: `${-gridSize * gridScale}px`,
            top: '0px',
            transform: `translateZ(${i * gridScale}px) rotateX(90deg)`,
            transformOrigin: 'center top',
            opacity: 0.2,
          }}
        />
      );
      // Lines parallel to Z axis
      lines.push(
        <div
          key={`xz-z-${i}`}
          className="absolute bg-purple-300"
          style={{
            width: '1px',
            height: `${gridSize * 2 * gridScale}px`,
            left: `${i * gridScale}px`,
            top: '0px',
            transform: 'rotateX(90deg)',
            transformOrigin: 'center top',
            opacity: 0.2,
          }}
        />
      );
    }

    return lines;
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl overflow-hidden border-2 border-orange-200 shadow-xl">
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {/* Grid lines */}
          {createGridLines()}

          {/* Main axes with thicker lines and labels - all share origin at (0,0,0) */}

          {/* X-axis (Valence) - extends from -5 to 5 along X */}
          {/* Negative side (thin, left from origin) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '175px',
              height: '3px',
              left: '-175px',
              top: '-1.5px',
              background: 'linear-gradient(to right, #ef4444, #a3a3a3)',
              transform: 'translateZ(0px)',
            }}
          />
          {/* Positive side (thicker and darker, right from origin) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '175px',
              height: '6px',
              left: '0px',
              top: '-3px',
              background: 'linear-gradient(to right, #a3a3a3, #16a34a)',
              transform: 'translateZ(0px)',
            }}
          />
          {/* Valence labels - counter-rotated to face user */}
          <div
            className="absolute text-xs font-bold text-red-600 whitespace-nowrap"
            style={{
              left: '-200px',
              top: '8px',
              transform: `translateZ(0px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
            }}
          >
            Valence (-)
          </div>
          <div
            className="absolute text-xs font-extrabold text-green-700 whitespace-nowrap"
            style={{
              left: '160px',
              top: '8px',
              transform: `translateZ(0px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
            }}
          >
            Valence (+)
          </div>

          {/* Y-axis (Arousal) - points upward from origin (0 to 5) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '6px',
              height: '175px',
              left: '-3px',
              top: '-175px',
              background: 'linear-gradient(to top, #a3a3a3, #2563eb)',
              transform: 'translateZ(0px)',
            }}
          />
          <div
            className="absolute text-xs font-extrabold text-blue-700 whitespace-nowrap"
            style={{
              left: '10px',
              top: '-195px',
              transform: `translateZ(0px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
            }}
          >
            Arousal (+)
          </div>

          {/* Z-axis (Social Engagement) - extends from -5 to 5 along Z, shares origin */}
          {/* Negative side (thin, going backwards away from viewer into -Z) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '175px',
              height: '3px',
              left: '0px',
              top: '-1.5px',
              background: 'linear-gradient(to right, #a3a3a3, #7c3aed)',
              transform: 'rotateY(-90deg)',
              transformOrigin: 'left center',
            }}
          />
          {/* Positive side (thicker and darker, coming forward toward viewer into +Z) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '175px',
              height: '6px',
              left: '0px',
              top: '-3px',
              background: 'linear-gradient(to right, #a3a3a3, #6d28d9)',
              transform: 'rotateY(90deg)',
              transformOrigin: 'left center',
            }}
          />
          <div
            className="absolute text-xs font-bold text-purple-700 whitespace-nowrap"
            style={{
              left: '10px',
              top: '10px',
              transform: `translateZ(-175px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
            }}
          >
            Social (-)
          </div>
          <div
            className="absolute text-xs font-extrabold text-purple-800 whitespace-nowrap"
            style={{
              left: '10px',
              top: '10px',
              transform: `translateZ(175px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
            }}
          >
            Social (+)
          </div>

          {/* Data point - True 3D sphere properly positioned in 3D space */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
            className="absolute"
            style={{
              width: '48px',
              height: '48px',
              left: normalizedValence - 24,
              top: -normalizedArousal - 24,
              transform: `translateZ(${normalizedSocial}px)`,
              transformStyle: 'preserve-3d',
              zIndex: 100,
            }}
          >
            {/* Create 3D sphere using multiple circular layers */}
            {Array.from({ length: 21 }, (_, i) => {
              const t = i / 20; // 0 to 1
              const angle = (t - 0.5) * Math.PI; // -PI/2 to PI/2
              const z = Math.sin(angle) * 24; // -24 to 24
              const radius = Math.cos(angle) * 24; // varies with z to create sphere
              const opacity = 0.8 + t * 0.2; // slightly more opaque towards front

              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    left: `${24 - radius}px`,
                    top: `${24 - radius}px`,
                    transform: `translateZ(${z}px)`,
                    background: `radial-gradient(circle at 40% 40%,
                      rgba(251, 191, 36, ${opacity}),
                      rgba(245, 158, 11, ${opacity * 0.9}) 40%,
                      rgba(217, 119, 6, ${opacity * 0.8}) 70%,
                      rgba(180, 83, 9, ${opacity * 0.7}))`,
                    boxShadow: i === 20 ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  }}
                />
              );
            })}

            {/* Highlight on front face */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: '6px',
                left: '10px',
                width: '16px',
                height: '16px',
                transform: 'translateZ(25px)',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0) 70%)',
              }}
            />

            {/* White border ring on front */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: 'translateZ(24px)',
                boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.7)',
              }}
            />

            {/* Pulse animation ring */}
            <div
              className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-30"
              style={{
                transform: 'translateZ(24px)',
              }}
            />
          </motion.div>

          {/* Tick marks on axes with counter-rotated labels */}
          {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((tick) => (
            <div key={`tick-x-${tick}`}>
              {/* X-axis ticks */}
              <div
                className="absolute bg-gray-600"
                style={{
                  width: '2px',
                  height: '8px',
                  left: `${tick * scale - 1}px`,
                  top: '-4px',
                  transform: 'translateZ(0px)',
                }}
              />
              <div
                className="absolute text-[10px] text-gray-600"
                style={{
                  left: `${tick * scale - 6}px`,
                  top: '10px',
                  transform: `translateZ(0px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
                }}
              >
                {tick}
              </div>
            </div>
          ))}

          {[0, 1, 2, 3, 4, 5].map((tick) => (
            <div key={`tick-y-${tick}`}>
              {/* Y-axis ticks */}
              <div
                className="absolute bg-gray-600"
                style={{
                  width: '8px',
                  height: '2px',
                  left: '-4px',
                  top: `${-tick * scale - 1}px`,
                  transform: 'translateZ(0px)',
                }}
              />
              <div
                className="absolute text-[10px] text-gray-600"
                style={{
                  left: '-20px',
                  top: `${-tick * scale - 6}px`,
                  transform: `translateZ(0px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
                }}
              >
                {tick}
              </div>
            </div>
          ))}

          {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((tick) => (
            <div key={`tick-z-${tick}`}>
              {/* Z-axis ticks */}
              <div
                className="absolute bg-gray-600"
                style={{
                  width: '8px',
                  height: '2px',
                  left: '-4px',
                  top: '-1px',
                  transform: `translateZ(${tick * scale}px)`,
                }}
              />
              <div
                className="absolute text-[10px] text-gray-600"
                style={{
                  left: '-20px',
                  top: '-6px',
                  transform: `translateZ(${tick * scale}px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
                }}
              >
                {tick}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-xs text-gray-600 border border-orange-200 shadow-lg">
        <span className="font-semibold">🖱️ Drag to rotate</span> • View the 3D graph from different angles
      </div>

      {/* Value labels */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 text-sm border-2 border-orange-200 shadow-xl">
        <h4 className="font-bold text-gray-800 mb-3 text-base">VAS Values</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-green-500 rounded-full"></div>
            <span className="font-semibold text-gray-700">Valence:</span>
            <span className={`font-bold ${valence >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {valence.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="font-semibold text-gray-700">Arousal:</span>
            <span className="font-bold text-blue-600">{arousal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="font-semibold text-gray-700">Social:</span>
            <span className={`font-bold ${socialEngagement >= 0 ? 'text-purple-500' : 'text-purple-700'}`}>
              {socialEngagement.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
