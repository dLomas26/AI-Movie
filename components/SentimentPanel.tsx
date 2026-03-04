'use client';

import { useEffect, useState } from 'react';
import type { SentimentData } from '@/lib/types';

interface Props {
  sentiment: SentimentData;
}

export default function SentimentPanel({ sentiment }: Props) {
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let current = 0;
      const step = sentiment.score / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, sentiment.score);
        setAnimScore(Math.round(current));
        if (current >= sentiment.score) clearInterval(interval);
      }, 16);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(t);
  }, [sentiment.score]);

  const classConfig = {
    positive: {
      label: 'Positive',
      emoji: '✨',
      color: '#34d399',
      gradFrom: 'from-emerald-500/20',
      gradTo: 'to-green-600/10',
      border: 'border-emerald-500/30',
      ringColor: 'rgba(52, 211, 153',
    },
    mixed: {
      label: 'Mixed',
      emoji: '⚖️',
      color: '#fbbf24',
      gradFrom: 'from-amber-500/20',
      gradTo: 'to-yellow-600/10',
      border: 'border-amber-500/30',
      ringColor: 'rgba(251, 191, 36',
    },
    negative: {
      label: 'Negative',
      emoji: '💫',
      color: '#f87171',
      gradFrom: 'from-red-500/20',
      gradTo: 'to-rose-600/10',
      border: 'border-red-500/30',
      ringColor: 'rgba(248, 113, 113',
    },
  };

  const config = classConfig[sentiment.classification];
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (animScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Main sentiment card */}
      <div className={`glass rounded-2xl border ${config.border} bg-gradient-to-br ${config.gradFrom} ${config.gradTo} p-6`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Score ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              {/* Progress circle */}
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={config.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${config.color}60)` }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: config.color }}>{animScore}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>

          {/* Classification */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <span className="text-2xl">{config.emoji}</span>
              <span className={`text-2xl font-black`} style={{ color: config.color }}>
                {config.label} Reception
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">{sentiment.summary}</p>
          </div>
        </div>
      </div>

      {/* Key themes + highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Themes */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-lg">🎭</span> Key Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            {sentiment.keyThemes.map((theme, i) => (
              <span
                key={i}
                className="glass px-3 py-1.5 rounded-full text-sm font-medium border border-purple-500/20 text-purple-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span> AI Highlights
          </h4>
          <ul className="space-y-2">
            {sentiment.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: config.color }} />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sentiment bar visualization */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-lg">📊</span> Sentiment Spectrum
        </h4>
        <div className="relative">
          <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-emerald-500/30">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${animScore}%`,
                background: `linear-gradient(90deg, #ef4444, #f59e0b, #10b981)`,
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full border-2 border-white bg-white shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Negative</span>
            <span>Mixed</span>
            <span>Positive</span>
          </div>
        </div>

        {/* AI badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span>Analysis powered by <span className="text-purple-400">Brew AI</span> — based on IMDb ratings, reviews & metadata</span>
        </div>
      </div>
    </div>
  );
}
