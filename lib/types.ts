export interface CastMember {
  name: string;
  character?: string;
  order?: number;
}

export interface SentimentData {
  summary: string;
  classification: 'positive' | 'mixed' | 'negative';
  score: number; // 0-100
  keyThemes: string[];
  highlights: string[];
}

export interface Review {
  author: string;
  content: string;
  rating?: string | number;
}

export interface MovieData {
  imdbId: string;
  title: string;
  year: string;
  rating: string;
  votes: string;
  genre: string;
  runtime: string;
  plot: string;
  poster: string;
  director: string;
  cast: CastMember[];
  language: string;
  country: string;
  awards: string;
  boxOffice?: string;
  sentiment: SentimentData;
  // optional array since reviews are fetched separately
  reviews?: Review[];
}
