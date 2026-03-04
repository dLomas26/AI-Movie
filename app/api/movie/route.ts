import { NextRequest, NextResponse } from 'next/server';
import { validateImdbId } from '@/lib/validators';
import { fetchMovieDetails } from '@/lib/fetchMovie';
import { generateSentiment } from '@/lib/sentiment';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id')?.trim();

  // Validate
  if (!id) {
    return NextResponse.json({ error: 'IMDb ID is required' }, { status: 400 });
  }

  if (!validateImdbId(id)) {
    return NextResponse.json({ error: 'Invalid IMDb ID format. Expected format: tt1234567' }, { status: 400 });
  }

  try {
    // Fetch movie details from OMDB
    const movieDetails = await fetchMovieDetails(id);

    // Generate AI sentiment analysis
    const sentiment = await generateSentiment(movieDetails);

    return NextResponse.json({ ...movieDetails, sentiment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch movie data';
    console.error('[Movie API Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
