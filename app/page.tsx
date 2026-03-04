"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import MovieResult from "@/components/MovieResult";
import LoadingOrb from "@/components/LoadingOrb";
import { validateImdbId } from "@/lib/validators";
import type { MovieData } from "@/lib/types";

const MovieShowcase = dynamic(() => import("@/components/MovieShowcase"), { ssr: false });
const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false, loading: () => null });

export default function Home() {
  const [imdbId, setImdbId] = useState("");
  const [loading, setLoading] = useState(false);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [error, setError] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 800);
  }, []);

  const fetchMovie = async (id: string) => {
    try {
      const res = await fetch(`/api/movie?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch movie data");
      setMovieData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const handleSearch = async () => {
    setError("");
    const cleanId = imdbId.trim();

    if (!cleanId) {
      setError("Please enter an IMDb movie ID");
      return;
    }

    if (!validateImdbId(cleanId)) {
      setError("Invalid IMDb ID. Format should be like: tt0133093");
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setMovieData(null);

    await fetchMovie(cleanId);

    setLoading(false);
  };

  const handleSelectMovie = async (id: string) => {
    setImdbId(id);
    setError("");
    setMovieData(null);
    setHasSearched(true);
    setLoading(true);

    await fetchMovie(id);

    setLoading(false);
  };

  const handleReset = () => {
    setMovieData(null);
    setError("");
    setHasSearched(false);
    setImdbId("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-black text-white">

      {/* Cinematic background */}
      <div className="fixed inset-0 overflow-hidden">

        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[160px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[170px]" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <ParticleField />

      <div className="relative z-10 min-h-screen flex flex-col">

        {/* HERO */}
        <div className={`transition-all duration-700 ${hasSearched && movieData ? "pt-6 pb-4" : "pt-20 pb-12"}`}>
          <div className="container mx-auto px-4 max-w-4xl text-center">

            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-4 py-2 mb-8 text-sm text-gray-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              AI-powered intelligence for every movie
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                MovieMind
              </span>{" "}
              <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                AI
              </span>
            </h1>

            {!hasSearched && (
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
               Turn any IMDb ID into deep audience insights and AI-powered movie intelligence.
              </p>
            )}

            {/* SEARCH */}
            <div className="max-w-xl mx-auto">

              <div className={`relative transition-all ${inputFocused ? "scale-[1.02]" : ""}`}>

                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-30 blur" />

                <div className="relative flex items-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

                  <div className="pl-5 pr-2 text-gray-400">
                    🎬
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={imdbId}
                    onChange={(e) => setImdbId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="tt0133093"
                    className="flex-1 bg-transparent py-4 px-3 text-white placeholder-gray-500 font-mono focus:outline-none"
                  />

                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="m-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] disabled:opacity-50"
                  >
                    {loading ? "Analyzing..." : "Analyze"}
                  </button>

                </div>
              </div>

              {/* EXAMPLES */}
              {!hasSearched && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="text-gray-500 text-sm">Try:</span>

                  {["tt0133093", "tt0068646", "tt0111161", "tt0816692"].map((id) => (
                    <button
                      key={id}
                      onClick={() => setImdbId(id)}
                      className="text-sm text-gray-400 hover:text-white font-mono bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1 transition-all hover:scale-105"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mt-4 flex items-center gap-2 backdrop-blur-lg bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
                  ⚠️ <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {loading && <LoadingOrb />}

        {movieData && !loading && (
          <div className="container mx-auto px-4 max-w-6xl pb-16">
            <MovieResult data={movieData} onReset={handleReset} />
          </div>
        )}

        {!hasSearched && <MovieShowcase onSelectMovie={handleSelectMovie} />}

        {/* AI Intelligence Pipeline */}
        {!hasSearched && (
          <div className="container mx-auto px-4 max-w-6xl mt-20 pb-20">

            <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              How MovieMind AI Understands Movies
            </h2>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">

              {[
                {
                  icon: "🎬",
                  title: "Movie Retrieval",
                  desc: "Fetch metadata, cast, rating, and poster from IMDb.",
                },
                {
                  icon: "💬",
                  title: "Audience Voices",
                  desc: "Collect real viewer comments and review signals.",
                },
                {
                  icon: "🧠",
                  title: "AI Analysis",
                  desc: "AI models analyze sentiment and narrative themes.",
                },
                {
                  icon: "📊",
                  title: "Insight Engine",
                  desc: "Generate clear audience sentiment and intelligence.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="relative group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-3 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                >

                  {/* glowing number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-bold shadow-lg">
                    {i + 1}
                  </div>

                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>

                  <h3 className="font-semibold text-lg mb-2 text-white">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>

                </div>
              ))}

            </div>

            {/* bottom tagline */}
            <div className="text-center mt-14 text-gray-400 text-sm max-w-xl mx-auto">
              From a simple IMDb ID to deep cinematic intelligence — powered by AI and audience sentiment analysis.
            </div>

          </div>
        )}

      </div>
    </main>
  );
}