'use client';

interface LoadingStep { text: string; delay: string; }
interface LoadingOrbProps {
  title?: string;
  steps?: LoadingStep[];
  accent?: string;
}

export default function LoadingOrb({
  title = 'Analyzing Movie...',
  steps = [
    { text: 'Fetching movie details', delay: '0s' },
    { text: 'Retrieving audience data', delay: '0.5s' },
    { text: 'Running AI sentiment analysis', delay: '1s' },
  ],
  accent = '#a855f7',
}: LoadingOrbProps) {
  const borderColor = accent + '33';
  const glowGradient = `radial-gradient(circle, ${accent}80, transparent 60%)`;
  const coreColor = accent;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Animated orb */}
      <div className="relative w-32 h-32">
        {/* Outer rings */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${borderColor}`,
              animation: `spin ${3 + i}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
              transform: `scale(${1 + i * 0.3})`,
            }}
          />
        ))}

        {/* Core glow */}
        <div
          className="absolute inset-4 rounded-full blur-sm opacity-80"
          style={{ animation: 'pulse 2s ease-in-out infinite', background: glowGradient }}
        />
        <div className="absolute inset-6 rounded-full flex items-center justify-center" style={{ background: coreColor }}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      {/* Loading steps */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-white font-semibold text-lg">{title}</p>
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2" style={{ animation: `fadeIn 0.5s ${step.delay} both` }}>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"
                style={{ animation: `pulse 1.5s ${step.delay} ease-in-out infinite` }}
              />
              {step.text}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
