import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Movie Insight Builder',
  description: 'Discover deep AI-powered insights about any movie. Sentiment analysis, audience intelligence, and more.',
  keywords: 'movie, AI, sentiment analysis, IMDb, film insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
