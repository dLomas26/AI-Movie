import type { SentimentData } from './types';

interface MovieInput {
  title: string;
  year: string;
  rating: string;
  genre: string;
  plot: string;
  awards: string;
  votes?: string;
}

export async function generateSentiment(movie: MovieInput): Promise<SentimentData> {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    return algorithmicSentiment(movie);
  }

  const prompt = `
You are an expert film critic and audience analyst.

Analyze the following movie deeply:

Title: ${movie.title}
Year: ${movie.year}
IMDb Rating: ${movie.rating}/10
Votes: ${movie.votes || "N/A"}
Genre: ${movie.genre}
Awards: ${movie.awards}
Plot: ${movie.plot}

Instructions:
- Think like BOTH a critic and general audience
- Capture emotional impact + technical quality
- Avoid generic statements
- Make it feel real and specific to THIS movie

Return ONLY valid JSON:

{
  "summary": "Write a rich 3-4 line audience + critic sentiment summary (natural, human-like, not robotic)",
  "classification": "positive | mixed | negative",
  "score": number (0-100),
  "keyThemes": ["4-6 meaningful themes"],
  "highlights": [
    "5-7 specific insights (acting, direction, pacing, visuals, emotional impact, etc.)"
  ]
}
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
        temperature: 0.5, // 🔥 slightly creative but controlled
        max_tokens: 600,  // 🔥 more depth
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Groq Sentiment Error:', data);
      throw new Error(data.error?.message);
    }

    const text = data.choices?.[0]?.message?.content || '';
    // debug logging was printing raw sentiment JSON to the server console; removed in production

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || '',
        classification: (parsed.classification || 'mixed').toLowerCase(),
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        keyThemes: parsed.keyThemes || [],
        highlights: parsed.highlights || [],
      };
    }

    return algorithmicSentiment(movie);

  } catch (err) {
    console.error('[Groq Sentiment Error]', err);
    return algorithmicSentiment(movie);
  }
}

/* 🔥 UPGRADED FALLBACK (MORE HUMAN-LIKE) */
function algorithmicSentiment(movie: MovieInput): SentimentData {
  const rating = parseFloat(movie.rating) || 5;
  const score = Math.round((rating / 10) * 100);

  let classification: 'positive' | 'mixed' | 'negative';
  let summary: string;
  let keyThemes: string[];
  let highlights: string[];

  if (rating >= 7.5) {
    classification = 'positive';
    summary = `"${movie.title}" stands out as a highly appreciated film, combining strong storytelling with memorable performances. Audiences widely praise its emotional depth and rewatch value, making it a standout in its genre.`;

    keyThemes = [
      'Strong storytelling',
      'Emotional impact',
      'High rewatch value',
      'Critical acclaim',
      'Audience satisfaction'
    ];

    highlights = [
      `Excellent IMDb rating of ${rating}/10`,
      'Highly praised performances and direction',
      'Engaging narrative with emotional depth',
      'Strong audience and critic alignment',
      movie.awards !== 'N/A' ? `Recognition: ${movie.awards}` : 'Widely appreciated by viewers',
      'High replay and recommendation value'
    ];

  } else if (rating >= 6) {
    classification = 'mixed';
    summary = `"${movie.title}" delivers a mixed experience, with certain elements resonating well while others fall short. It has its moments of brilliance but struggles with consistency in execution.`;

    keyThemes = [
      'Mixed reception',
      'Inconsistent execution',
      'Selective audience appeal',
      'Genre expectations',
      'Debatable impact'
    ];

    highlights = [
      `Moderate rating of ${rating}/10`,
      'Strong moments but uneven pacing',
      'Some performances stand out while others fall flat',
      'Appeals to a niche audience',
      'Critics and viewers show divided opinions'
    ];

  } else {
    classification = 'negative';
    summary = `"${movie.title}" struggles to leave a strong impression, with audiences criticizing its execution and lack of engagement. While it may have isolated strengths, overall reception remains underwhelming.`;

    keyThemes = [
      'Weak execution',
      'Low engagement',
      'Critical disappointment',
      'Missed potential',
      'Audience dissatisfaction'
    ];

    highlights = [
      `Low IMDb rating of ${rating}/10`,
      'Fails to fully engage the audience',
      'Criticized for weak storytelling or direction',
      'Limited positive reception',
      'Some niche appreciation despite flaws'
    ];
  }

  return { summary, classification, score, keyThemes, highlights };
}