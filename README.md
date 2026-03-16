# StudyOS

Personal AI Study Operating System for focused, course-based learning. This Next.js app blends structured notes, spaced repetition, and AI tutoring into a single daily workspace.

## What’s Included

- Dashboard with course progress, streaks, weak topics, and quick actions
- Calendar with monthly/weekly views and scheduled study sessions
- Course hub with topics, materials, notes, quizzes, and flashcards
- RAG-ready pipeline for PDF/TXT materials with pgvector in Supabase
- Gemini 2.5 Flash powered endpoints for Q&A, quizzes, flashcards, and summaries
- Spaced repetition scheduling logic (SM-2 style)

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

3. Set up Supabase

- Enable the `pgvector` extension
- Run the SQL schema in `supabase/schema.sql`
- Create a storage bucket named `materials`

4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

## API Endpoints

- `POST /api/ai/ask` ? RAG-based tutor responses
- `POST /api/ai/quiz` ? AI quiz generation
- `POST /api/ai/flashcards` ? Flashcard generation
- `POST /api/ai/summarize` ? Notes summaries
- `POST /api/materials/process` ? Extract + chunk + embed materials

## Project Structure

- `src/app/(app)` ? Dashboard, Calendar, Courses
- `src/components` ? UI building blocks
- `src/lib` ? Supabase, Gemini, RAG, spaced repetition
- `supabase/schema.sql` ? Database schema and vector search function

## Notes

- `src/lib/mock-data.ts` provides seeded UI data.
- Replace mock data with real Supabase queries when wiring live data.
- The material processing route assumes the file is accessible via a public URL.
