import type { MovieData } from './types';

/**
 * Fetches movie details from OMDB API
 * Falls back to a mock for development if OMDB key not set
 */
export async function fetchMovieDetails(
  imdbId: string
): Promise<Omit<MovieData, 'sentiment'>> {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    // Development fallback with realistic mock data
    return getMockMovieData(imdbId);
  }

  const url = `https://www.omdbapi.com/?i=${imdbId}&plot=full&apikey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache 1hr

  if (!res.ok) {
    throw new Error('Failed to connect to movie database');
  }

  const data = await res.json();

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Movie not found. Please check the IMDb ID.');
  }

  // Parse cast list (OMDB only gives actor names, no characters)
  const castNames = (data.Actors || '').split(',').map((name: string) => name.trim());
  let cast = castNames.map((name: string, i: number) => ({
    name,
    character: '', // will be filled by AI later
    order: i,
  }));

  // 🔥 AI enhancement of cast with realistic character names
  cast = await enhanceCastWithAI(cast, data.Title || 'Unknown Movie');

  return {
    imdbId,
    title: data.Title || 'Unknown Title',
    year: data.Year || 'N/A',
    rating: data.imdbRating || 'N/A',
    votes: data.imdbVotes?.replace(/,/g, '') || 'N/A', // normalize commas
    genre: data.Genre || 'N/A',
    runtime: data.Runtime || 'N/A',
    plot: data.Plot || 'No plot available.',
         poster: data.Poster !== 'N/A' ? data.Poster : '/fallback.svg',
    director: data.Director || 'N/A',
    cast,
    language: data.Language || 'N/A',
    country: data.Country || 'N/A',
    awards: data.Awards || 'N/A',
    boxOffice: data.BoxOffice !== 'N/A' ? data.BoxOffice : undefined,
  };
}


// helper that calls AI to extend cast list with character names
let aiCastWarningShown = false;

async function enhanceCastWithAI(cast: any[], title: string) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return cast;

  try {
    const prompt = `
Movie: ${title}

Existing actors:
${cast.map(c => c.name).join(', ')}

Generate a realistic extended cast list with character names.

Return ONLY valid JSON. If any name or character contains a double-quote,
escape it as \\\" so the output remains JSON-parseable.

Example:
[
  { "name": "Actor Name", "character": "Character Name" }
]

Include existing actors + at least 6 more.
`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return cast;

    const rawJson = jsonMatch[0];

    const parseCastJson = (str: string) => {
      const parsed = JSON.parse(str);
      return parsed.map((c: any, i: number) => ({
        name: c.name,
        character: c.character,
        order: i,
      }));
    };

    try {
      return parseCastJson(rawJson);
    } catch (parseErr) {
      if (!aiCastWarningShown) {
        console.warn('AI Cast parsing failed, ignoring enhancement.', parseErr, '\nraw output:', rawJson);
        aiCastWarningShown = true;
      }

      // attempt incremental sanitization before giving up
      const sanitize = (str: string) => {
        // 1. fix cases where value was escaped but not wrapped
        //    e.g. "character": \"Name\"  -> "character": "Name"
        let s = str.replace(/:\s*\\\"([^\\\"]*)\\\"/g, ': "$1"');
        // 2. escape any remaining unescaped quotes inside quoted strings
        s = s.replace(/("(?:name|character)"\s*:\s*")([^"\n]*?)(?="\s*(?:,|\}|\]))/g,
          (_m, pre, val) => pre + val.replace(/"/g, '\\"'));
        return s;
      };

      const repaired = sanitize(rawJson);

      try {
        return parseCastJson(repaired);
      } catch {
        // if sanitization didn't help, just return original cast
        return cast;
      }
    }

  } catch (err) {
    console.error('AI Cast Error:', err);
    return cast;
  }
}

/**
 * Development mock data for when OMDB API key is not set
 */
function getMockMovieData(imdbId: string): Omit<MovieData, 'sentiment'> {
  const mockMovies: Record<string, Omit<MovieData, 'sentiment'>> = {
    tt0133093: {
      imdbId: 'tt0133093',
      title: 'The Matrix',
      year: '1999',
      rating: '8.7',
      votes: '1934591',
      genre: 'Action, Sci-Fi',
      runtime: '136 min',
      plot: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth—the life he knows is the elaborate deception of an evil cyber-intelligence.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTgwMzUtYjQyNjAwNjA4ZjE3XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
      director: 'Lana Wachowski, Lilly Wachowski',
      cast: [
        { name: 'Keanu Reeves', character: 'Neo', order: 0 },
        { name: 'Laurence Fishburne', character: 'Morpheus', order: 1 },
        { name: 'Carrie-Anne Moss', character: 'Trinity', order: 2 },
        { name: 'Hugo Weaving', character: 'Agent Smith', order: 3 },
      ],
      language: 'English',
      country: 'United States, Australia',
      awards: 'Won 4 Oscars. 42 wins & 51 nominations total',
      boxOffice: '$171,479,930',
    },
  };

  // Return specific mock or generate generic one
  return (
    mockMovies[imdbId] || {
      imdbId,
      title: 'Demo Movie',
      year: '2020',
      rating: '7.5',
      votes: '250000',
      genre: 'Drama, Thriller',
      runtime: '120 min',
      plot: 'A gripping tale of suspense and redemption that keeps audiences on the edge of their seats.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTgwMzUtYjQyNjAwNjA4ZjE3XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
      director: 'John Filmmaker',
      cast: [
        { name: 'Jane Actor', character: 'Lead Role', order: 0 },
        { name: 'Bob Supporting', character: 'Supporting', order: 1 },
      ],
      language: 'English',
      country: 'United States',
      awards: '5 nominations',
    }
  );
}
