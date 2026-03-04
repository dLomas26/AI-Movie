'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import LoadingOrb from './LoadingOrb';

// static configuration -- only keep the imdb id and accent color
interface ShowcaseMovieConfig {
  id: string;
  accent: string; // tailwind gradient color
}

// loaded movie combines API data with our accent
interface LoadedMovie {
  id: string;
  title: string;
  year: string;
  genre: string;
  rating: string;
  poster: string;
  accent: string;
}

const SHOWCASE_MOVIES: ShowcaseMovieConfig[] = [
  { id: 'tt0133093', accent: '#00ff41' },
  { id: 'tt0068646', accent: '#f5a623' },
  { id: 'tt0111161', accent: '#e88c50' },
  { id: 'tt0816692', accent: '#5b8cff' },
  { id: 'tt1375666', accent: '#a78bfa' },
  { id: 'tt0109830', accent: '#34d399' },
  { id: 'tt0468569', accent: '#f87171' },
  { id: 'tt0120737', accent: '#facc15' },
  { id: 'tt0167260', accent: '#84cc16' },
  { id: 'tt0088763', accent: '#fb923c' },
  { id: 'tt0110912', accent: '#ef4444' },
  { id: 'tt6751668', accent: '#22c55e' },
  { id: 'tt7286456', accent: '#a3e635' },
  { id: 'tt4154796', accent: '#60a5fa' },
  { id: 'tt2582802', accent: '#f97316' },
  { id: 'tt1675434', accent: '#38bdf8' },
];

interface MovieCardProps {
  movie: LoadedMovie;
  onSelect: (id: string) => void;
}

function MovieCard({ movie, onSelect }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // detect touch-capable devices to disable hover/mouse math
  useEffect(() => {
    const touch = typeof window !== 'undefined' && ('ontouchstart' in window || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
    setIsTouch(Boolean(touch));
  }, []);

  // rAF throttle refs so we don't set state on every mouse event
  const rafRef = useRef<number | null>(null);
  const latestRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return; // avoid heavy calculations on touch devices
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    latestRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const vals = latestRef.current;
        const el = cardRef.current;
        if (!vals || !el) return;
        const rect2 = el.getBoundingClientRect();
        const x = vals.x;
        const y = vals.y;
        const cx = rect2.width / 2;
        const cy = rect2.height / 2;

        const rotateX = ((y - cy) / cy) * -14;
        const rotateY = ((x - cx) / cx) * 14;

        setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06,1.06,1.06)`);
        setGlowPos({ x: (x / rect2.width) * 100, y: (y / rect2.height) * 100 });
      }) as unknown as number;
    }
  };

  const handleMouseLeave = () => {
    if (rafRef.current != null) {
      window.cancelAnimationFrame?.(rafRef.current);
      rafRef.current = null;
    }
    latestRef.current = null;
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
    setIsHovered(false);
  };

  const handleMouseEnter = () => setIsHovered(true);

  return (
      <div
        ref={cardRef}
        onMouseMove={isTouch ? undefined : handleMouseMove}
        onMouseLeave={isTouch ? undefined : handleMouseLeave}
        onMouseEnter={isTouch ? undefined : handleMouseEnter}
      onClick={() => onSelect(movie.id)}
      className="relative cursor-pointer flex-shrink-0"
      style={{
        width: '180px',
        transition: 'transform 0.15s ease-out',
        transform,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 transition-opacity duration-300 blur-xl"
        style={{
          background: movie.accent,
          opacity: isHovered ? 0.35 : 0,
        }}
      />

      {/* Card body */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: '#0d0d0d',
          boxShadow: isHovered
            ? `0 30px 60px -10px rgba(0,0,0,0.8), 0 0 0 1px ${movie.accent}44`
            : '0 10px 30px -5px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Shimmer overlay */}
        {isHovered && (
          <div
            className="absolute inset-0 z-20 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.10) 0%, transparent 65%)`,
            }}
          />
        )}

        {/* Poster */}
        <div className="relative" style={{ height: '270px' }}>
          <Image
            src={movie.poster}
            alt={movie.title}
            width={180}
            height={270}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
            onError={(e: any) => {
              try {
                e.currentTarget.src = '/fallback.svg';
              } catch {}
            }}
          />

          {/* Rating badge */}
          <div
            className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold backdrop-blur-sm"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${movie.accent}66`,
              color: movie.accent,
            }}
          >
            ★ {movie.rating}
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{
              background: 'linear-gradient(to top, #0d0d0d 0%, transparent 100%)',
            }}
          />

          {/* Hover CTA */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center transition-all duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md"
              style={{
                background: `${movie.accent}22`,
                border: `1px solid ${movie.accent}88`,
                color: movie.accent,
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="px-3 py-3" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(10px)' }}>
          <p className="text-white font-semibold text-sm leading-tight truncate">{movie.title}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-500 text-xs">{movie.year}</span>
            <span className="text-gray-500 text-xs truncate ml-2">{movie.genre}</span>
          </div>

          {/* Accent line */}
          <div
            className="mt-2 h-[2px] rounded-full transition-all duration-300"
            style={{
              background: movie.accent,
              width: isHovered ? '100%' : '30%',
              opacity: isHovered ? 1 : 0.4,
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface MovieShowcaseProps {
  onSelectMovie: (id: string) => void;
}

export default function MovieShowcase({ onSelectMovie }: MovieShowcaseProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [movies, setMovies] = useState<LoadedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  // client-only state so SSR/client color cannot mismatch
  const [isClient, setIsClient] = useState(false);
  const [spinnerAccent, setSpinnerAccent] = useState<string>('#60a5fa');

  useEffect(() => {
    setIsClient(true);
    const accentPalette = ['#60a5fa', '#a78bfa', '#f472b6', '#10b981', '#f59e0b', '#ef4444'];
    setSpinnerAccent(accentPalette[Math.floor(Math.random() * accentPalette.length)]);
  }, []);

  useEffect(() => {
    // load each configured movie via server API to avoid exposing the API key
    const loadMovies = async () => {
      try {
        const results = await Promise.all(
          SHOWCASE_MOVIES.map(async (m) => {
            const res = await fetch(`/api/movie?id=${m.id}`);
            const json = await res.json();
            if (!res.ok) {
              console.warn('[MovieShowcase]', m.id, json.error);
            }
            return {
              id: m.id,
              title: json.title || 'Unknown',
              year: json.year || '',
              genre: json.genre || '',
              rating: json.rating || '',
              poster: json.poster || '/fallback.svg',
              accent: m.accent,
            } as LoadedMovie;
          })
        );
        setMovies(results);
      } catch (err) {
        console.error('[MovieShowcase] load error', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <div className="w-full mt-12 mb-4">
      {/* Section header */}
      <div className="container mx-auto px-4 max-w-5xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #888, #444)' }} />
          <h2 className="text-white font-semibold text-sm tracking-widest uppercase opacity-70">
            Featured Films
          </h2>
        </div>
        <p className="text-gray-600 text-xs">Click any poster to analyze</p>
      </div>

      {/* Scrollable carousel */}
      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #000, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #000, transparent)' }}
        />

        {/* Scrollable track */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto pb-6 pt-4 px-8 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: 'pan-x',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
          }}
        >
          {/* Duplicate for a richer feel on wide screens */}
          {loading && isClient ? (
          <div className="w-full flex justify-center py-10">
            <LoadingOrb
              title="Loading featured films"
              steps={[{ text: 'Fetching poster data', delay: '0s' }]}
              accent={spinnerAccent}
            />
          </div>
        ) : loading ? (
          // avoid SSR/client mismatch by not rendering orb on server
          <div className="w-full flex justify-center py-10" />
        ) : (
          movies.map((movie, i) => (
            <MovieCard
              key={`${movie.id}-${i}`}
              movie={movie}
              onSelect={onSelectMovie}
            />
          ))
        )}
        </div>
      </div>

      {/* Divider */}
      <div className="container mx-auto px-4 max-w-5xl mt-6">
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, #333, transparent)' }} />
      </div>
    </div>
  );
}
