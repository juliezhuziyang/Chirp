import { InteractiveSoundWave } from "../InteractiveSoundWave";

export function ChirpBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden relative">
      <InteractiveSoundWave />
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
      </div>
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
