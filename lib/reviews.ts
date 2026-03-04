import { Review } from './types';

const FALLBACK_REVIEWS: Review[] = [
  {
    author: 'System',
    content: 'No reviews are available at the moment.',
  },
];

export function generateFallbackReviews(): Review[] {
  return FALLBACK_REVIEWS;
}

interface MovieReviewInput {
  imdbId: string;
  title: string;
  genre: string;
  plot: string;
}

export async function getMovieReviews(
  movie: MovieReviewInput
): Promise<Review[]> {
  return await generateAIReviews(movie);
}

async function generateAIReviews(movie: MovieReviewInput): Promise<Review[]> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return FALLBACK_REVIEWS;

  const prompt = `
You are a professional movie critic panel.

Movie Details:
Title: ${movie.title}
Genre: ${movie.genre}
Plot: ${movie.plot}

Generate EXACTLY 6 UNIQUE reviews.

Rules:
- 3 should be POSITIVE
- 3 should be CRITICAL
- Each review MUST feel like written by a DIFFERENT person
- Use different tones: critic, casual viewer, analyst, fan, harsh critic, etc.
- Avoid repetition at all costs
- Mention specific aspects: acting, story, visuals, pacing, music
- Each review should be 80–120 words

Return ONLY JSON:
[
  { "author": "Reviewer 1", "content": "review..." },
  { "author": "Reviewer 2", "content": "review..." },
  { "author": "Reviewer 3", "content": "review..." },
  { "author": "Reviewer 4", "content": "review..." },
  { "author": "Reviewer 5", "content": "review..." },
  { "author": "Reviewer 6", "content": "review..." }
]
`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9, // 🔥 more variation
        top_p: 0.95,
        frequency_penalty: 0.8,
        presence_penalty: 0.7,
        // 400 tokens was occasionally too small, causing the model to be
        // truncated mid-review (which meant the JSON could not be parsed).
        // bump the limit so we get the full output more reliably.
        max_tokens: 800,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Groq Reviews Error:', data);
      throw new Error(data.error?.message);
    }

    const text = data.choices?.[0]?.message?.content || '';
    console.log("Reviews raw:", text);

    // Extract JSON safely from whatever the model returned.  Sometimes the
    // output gets cut off (max_tokens) or the model can prepend/append extra
    // explanation text, so we try to pull out the first JSON array we can and
    // fall back gracefully.
    let reviewsJson: string | null = null;
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      reviewsJson = text.slice(startIdx, endIdx + 1);
    } else if (startIdx !== -1) {
      // there's an opening bracket but no closing one; add it ourselves and
      // hope the rest of the JSON is intact.
      reviewsJson = text.slice(startIdx) + ']';
    }

    if (reviewsJson) {
      try {
        const parsed = JSON.parse(reviewsJson);
        if (Array.isArray(parsed)) {
          // ensure exactly six reviews
          if (parsed.length >= 6) return parsed.slice(0, 6);

          const filled = [...parsed];
          while (filled.length < 6) {
            filled.push({
              author: `Guest Critic ${filled.length + 1}`,
              content: "This film has mixed elements, offering moments of brilliance alongside noticeable flaws in execution.",
            });
          }
          return filled;
        }
        console.warn('[Groq Reviews] parsed value was not an array', parsed);
      } catch (e) {
        console.error('[Groq Reviews] failed to parse JSON:', e);
      }
    }

    // if we reach here the output was unusable
    return FALLBACK_REVIEWS;

  } catch (err) {
    console.error('[Groq Reviews Error]', err);
    return FALLBACK_REVIEWS;
  }
}