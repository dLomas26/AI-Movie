# 🎬 AI Movie Insight

AI Movie Insight is a modern web application that allows users to explore movies using an IMDb ID and receive **AI-powered insights about audience sentiment, reviews, and cinematic metadata**.

The application retrieves movie information such as title, poster, cast, rating, and plot, and enhances it with **AI-generated analysis of audience sentiment** to help users better understand how a movie is perceived.

---

## 🚀 Live Features

✨ Enter an IMDb movie ID (e.g. `tt0133093`)  
🎬 Fetch movie metadata (poster, cast, rating, plot)  
🧠 AI-powered sentiment analysis of audience reviews  
📊 Overall audience sentiment classification (Positive / Mixed / Negative)  
💬 Viewer comments & audience insights  
📱 Fully responsive modern UI  

---

# 🖥 Demo

Example input: tt0133093

Example output:

- Movie Poster
- Cast list
- IMDb Rating
- Plot summary
- AI-generated audience insight
- Sentiment classification

---

# ⚙️ Setup Instructions

Follow these steps to run the project locally.

### 1️⃣ Clone the repository

```bash
git clone https://github.com/dLomas26/AI-Movie.git
cd AI-Movie
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create environment variables
Create a .env.local file in the root directory.

```bash
OPENAI_API_KEY=your_openai_api_key
OMDB_API_KEY=your_omdb_api_key
```

### 4️⃣ Run the development server

```bash
npm run dev
```

---

# 🧰 Tech Stack

### Frontend

Next.js / React

Tailwind CSS

TypeScript / JavaScript

Framer Motion (animations)

### Backend

Next.js API routes


### External APIs

OMDb API – movie data

OpenAI API – sentiment analysis

### Tools

Git & GitHub

Vercel (deployment)

---


# 📌 Tech Stack Rationale

The technologies used in this project were chosen for the following reasons:

### Next.js

Provides a powerful framework for building modern web applications with server-side rendering and API routes.

### Tailwind CSS

Allows rapid UI development with utility-first styling, enabling a clean and responsive design.

### OMDb API

Provides easy access to IMDb-based movie metadata including title, rating, cast, and plot.

### OpenAI API

Used to generate AI-powered insights from audience reviews, enabling sentiment classification.

### Vercel Deployment

Next.js applications integrate seamlessly with Vercel, making deployment simple and scalable.

---

# ⚠️ Assumptions

The following assumptions were made while building this project:

1.Users provide a valid IMDb movie ID as input.
2.AI sentiment results are approximate summaries rather than absolute audience opinions.
3.External APIs such as OMDb or OpenAI must be available for full functionality.
4.The application is optimized for modern browsers.

---

# 👨‍💻 Author

Deepanshu Lomas

GitHub:
https://github.com/dLomas26
