create extension if not exists "vector";
create extension if not exists "pgcrypto";

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics on delete cascade,
  file_url text not null,
  file_name text,
  extracted_text text,
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics on delete cascade,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics on delete cascade,
  front text not null,
  back text not null,
  review_interval int not null default 0,
  ease_factor numeric not null default 2.5,
  next_review date,
  created_at timestamptz default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics on delete cascade,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes on delete cascade,
  score numeric not null,
  time_taken int,
  created_at timestamptz default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  course_id uuid references public.courses on delete set null,
  title text not null,
  description text,
  event_type text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  reminder_minutes int,
  created_at timestamptz default now()
);

create table if not exists public.study_streak (
  user_id uuid primary key references auth.users on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_study_date date
);

create table if not exists public.topic_relations (
  id uuid primary key default gen_random_uuid(),
  from_topic_id uuid not null references public.topics on delete cascade,
  to_topic_id uuid not null references public.topics on delete cascade,
  relation_type text not null default 'prerequisite',
  created_at timestamptz default now()
);

create table if not exists public.study_chunks (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics on delete cascade,
  source_type text not null,
  source_id uuid,
  content text not null,
  embedding vector(768),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists study_chunks_embedding_idx
  on public.study_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function public.match_study_chunks(
  query_embedding vector(768),
  match_count int,
  topic_id uuid default null
)
returns table (
  id uuid,
  content text,
  source_type text,
  source_id uuid,
  similarity float
)
language sql stable as $$
  select
    study_chunks.id,
    study_chunks.content,
    study_chunks.source_type,
    study_chunks.source_id,
    1 - (study_chunks.embedding <=> query_embedding) as similarity
  from public.study_chunks
  where study_chunks.embedding is not null
    and (topic_id is null or study_chunks.topic_id = topic_id)
  order by study_chunks.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.courses enable row level security;
alter table public.topics enable row level security;
alter table public.materials enable row level security;
alter table public.notes enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.calendar_events enable row level security;
alter table public.study_streak enable row level security;
alter table public.topic_relations enable row level security;
alter table public.study_chunks enable row level security;

create policy "Courses are user-owned"
  on public.courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Topics follow course ownership"
  on public.topics for all
  using (exists (
    select 1 from public.courses
    where courses.id = topics.course_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.courses
    where courses.id = topics.course_id and courses.user_id = auth.uid()
  ));

create policy "Materials follow topic ownership"
  on public.materials for all
  using (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = materials.topic_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = materials.topic_id and courses.user_id = auth.uid()
  ));

create policy "Notes follow topic ownership"
  on public.notes for all
  using (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = notes.topic_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = notes.topic_id and courses.user_id = auth.uid()
  ));

create policy "Flashcards follow topic ownership"
  on public.flashcards for all
  using (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = flashcards.topic_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = flashcards.topic_id and courses.user_id = auth.uid()
  ));

create policy "Quizzes follow topic ownership"
  on public.quizzes for all
  using (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = quizzes.topic_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = quizzes.topic_id and courses.user_id = auth.uid()
  ));

create policy "Quiz results follow quiz ownership"
  on public.quiz_results for all
  using (exists (
    select 1 from public.quizzes
    join public.topics on topics.id = quizzes.topic_id
    join public.courses on courses.id = topics.course_id
    where quizzes.id = quiz_results.quiz_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.quizzes
    join public.topics on topics.id = quizzes.topic_id
    join public.courses on courses.id = topics.course_id
    where quizzes.id = quiz_results.quiz_id and courses.user_id = auth.uid()
  ));

create policy "Calendar events are user-owned"
  on public.calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Study streak is user-owned"
  on public.study_streak for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Topic relations follow topic ownership"
  on public.topic_relations for all
  using (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = topic_relations.from_topic_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = topic_relations.from_topic_id and courses.user_id = auth.uid()
  ));

create policy "Study chunks follow topic ownership"
  on public.study_chunks for all
  using (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = study_chunks.topic_id and courses.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.topics
    join public.courses on courses.id = topics.course_id
    where topics.id = study_chunks.topic_id and courses.user_id = auth.uid()
  ));
