import { NextRequest, NextResponse } from 'next/server';
import { validateImdbId } from '@/lib/validators';
import { getMovieReviews, generateFallbackReviews } from '@/lib/reviews';
import { fetchMovieDetails } from '@/lib/fetchMovie';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id')?.trim();

  // ✅ Validation
  if (!id) {
    return NextResponse.json({ error: 'IMDb ID is required' }, { status: 400 });
  }

  if (!validateImdbId(id)) {
    return NextResponse.json(
      { error: 'Invalid IMDb ID format. Expected format: tt1234567' },
      { status: 400 }
    );
  }

  try {
    // ✅ Step 1: Fetch movie details (VERY IMPORTANT)
    const movie = await fetchMovieDetails(id);

    // ✅ Step 2: Pass full context to AI
    const reviews = await getMovieReviews({
      imdbId: id,
      title: movie.title,
      genre: movie.genre,
      plot: movie.plot,
    });

    if (reviews.length === 0 || (reviews.length === 1 && reviews[0].author === 'System')) {
      console.warn('[Reviews API] returning fallback reviews');
    }

    return NextResponse.json({ reviews });

  } catch (err) {
    console.error('[Reviews API Error]', err);

    return NextResponse.json({
      reviews: generateFallbackReviews(),
    });
  }
}