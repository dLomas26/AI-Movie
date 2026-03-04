'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SentimentPanel from './SentimentPanel';
import LoadingOrb from './LoadingOrb';
import type { MovieData, Review } from '@/lib/types';

interface Props {
  data: MovieData;
  onReset: () => void;
}

export default function MovieResult({ data, onReset }: Props) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'sentiment' | 'reviews'>('overview');

  // reviews state
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // color chosen on client to prevent SSR mismatch
  const [reviewAccent, setReviewAccent] = useState<string>('#34d399');
  useEffect(() => {
    const reviewPalette = ['#34d399', '#0ea5e9', '#f87171', '#fbbf24', '#c084fc'];
    setReviewAccent(reviewPalette[Math.floor(Math.random() * reviewPalette.length)]);
  }, []);

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const check = () => setIsSmallScreen(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // fetch reviews when the tab becomes active
  useEffect(() => {
    if (activeTab === 'reviews' && reviews === null) {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    setReviewsError('');
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/movie/reviews?id=${data.imdbId}`);
      const json = await res.json();
      console.log('[MovieResult] reviews API response:', json);
      if (!res.ok) throw new Error(json.error || 'Failed to fetch reviews');
      setReviews(json.reviews || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to load reviews';
      setReviewsError(message);
      // also provide a simple fallback review so the user sees something
      setReviews([
        { author: 'System', content: 'Could not fetch reviews; displaying fallback data.' },
      ]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const ratingNum = parseFloat(data.rating) || 0;
  const ratingColor = ratingNum >= 7.5 ? '#34d399' : ratingNum >= 6 ? '#fbbf24' : '#f87171';

  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Back button */}
      <button onClick={onReset} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm">Search another movie</span>
      </button>

      {/* Hero card */}
      <div className="glass rounded-3xl overflow-hidden border border-white/10 mb-6">
        {/* Backdrop blur header */}
        <div className="relative p-6 md:p-8">
          {/* Poster glow effect */}
          <div className="absolute inset-0 opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle at 20% 50%, rgba(139,92,246,0.8), transparent 50%)` }}
          />

          <div className="relative flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-60 md:w-48 md:h-72 rounded-2xl overflow-hidden glow-purple">
                {data.poster && data.poster !== 'N/A' ? (
                  <Image
                    src={data.poster}
                    alt={`${data.title} poster`}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full glass-dark flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}

                {/* Rating badge on poster */}
                <div className="absolute top-2 right-2 glass rounded-lg px-2 py-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill={ratingColor} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-bold" style={{ color: ratingColor }}>{data.rating}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {data.genre.split(',').map(g => (
                  <span key={g} className="glass text-xs text-purple-300 px-3 py-1 rounded-full border border-purple-500/20">
                    {g.trim()}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-1">
                {data.title}
              </h2>
              <p className="text-gray-400 text-sm mb-4">{data.year} · {data.runtime} · {data.language}</p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mb-5">
                {[
                  { label: 'IMDb Rating', value: `${data.rating}/10`, icon: '⭐' },
                  { label: 'Votes', value: data.votes, icon: '👥' },
                  { label: 'Director', value: data.director.split(',')[0], icon: '🎬' },
                ].map((stat, i) => (
                  <div key={i} className="glass-dark rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span>
                    <div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                      <div className="text-sm font-semibold text-white">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plot */}
              <p className="text-gray-300 leading-relaxed text-sm line-clamp-4">{data.plot}</p>

              {/* Awards */}
              {data.awards && data.awards !== 'N/A' && (
                <div className="mt-4 flex items-start gap-2 glass-dark rounded-xl px-4 py-3">
                  <span className="text-yellow-400 text-lg">🏆</span>
                  <p className="text-sm text-yellow-200/80">{data.awards}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-white/10 flex">
          {(['overview', 'cast', 'sentiment', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-medium capitalize transition-all relative
                ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab === 'sentiment' && (
                <span className="mr-1">🧠</span>
              )}
              {tab === 'reviews' && (
                <span className="mr-1">📝</span>
              )}
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Movie Details" icon="🎥">
              <InfoRow label="Title" value={data.title} />
              <InfoRow label="Year" value={data.year} />
              <InfoRow label="Runtime" value={data.runtime} />
              <InfoRow label="Genre" value={data.genre} />
              <InfoRow label="Language" value={data.language} />
              <InfoRow label="Country" value={data.country} />
              {data.boxOffice && <InfoRow label="Box Office" value={data.boxOffice} />}
            </InfoCard>
            <InfoCard title="Full Plot" icon="📖">
              <p className="text-gray-300 text-sm leading-relaxed">{data.plot}</p>
            </InfoCard>
          </div>
        )}

        {activeTab === 'cast' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              🎭 Cast
              <span className="text-gray-500 text-sm font-normal">
                ({data.cast.length} actors)
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.cast.slice(0, isSmallScreen ? 8 : data.cast.length).map((actor, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-white/5 hover:scale-[1.05] transition-all duration-300"
                >
                  <div className="glass-dark rounded-2xl p-4 h-full flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div
                      className="w-16 h-16 rounded-full mb-3 flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 50%), hsl(${i * 60 + 40}, 70%, 40%))`,
                      }}
                    >
                      {actor.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <h4 className="text-white font-semibold text-sm line-clamp-2">
                      {actor.name}
                    </h4>

                    {/* Role */}
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                      {actor.character || 'Role not specified'}
                    </p>

                    {/* Badge for lead/main/supporting */}
                    <span className="mt-2 text-xs text-gray-500">
                      {i === 0 ? 'Lead' : i < 3 ? 'Main' : 'Supporting'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <SentimentPanel sentiment={data.sentiment} />
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviewsLoading && (
              <div className="flex justify-center py-8">
                <LoadingOrb
                  title="Loading reviews"
                  steps={[{ text: 'Fetching recent comments', delay: '0s' }]}
                  accent={reviewAccent}
                />
              </div>
            )}

            {reviewsError && (
              <p className="text-red-400 text-center text-sm">{reviewsError}</p>
            )}

            {!reviewsLoading && !reviewsError && (
              <>
                {reviews && reviews.length > 0 ? (
                  reviews.map((r, idx) => (
                    <div key={idx} className="glass rounded-xl p-4">
                      <p className="text-gray-300 text-sm leading-relaxed">{r.content}</p>
                      <p className="text-xs text-gray-500 mt-2">— {r.author}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No reviews available.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-200 text-sm text-right max-w-[60%]">{value}</span>
    </div>
  );
}
