export type CourseSummary = {
  id: string;
  name: string;
  description: string;
  progress: number;
  topicsCompleted: number;
  topicsTotal: number;
  quizzesCompleted: number;
  nextReview: string;
  color: string;
  topics: TopicSummary[];
};

export type TopicSummary = {
  id: string;
  title: string;
  materials: number;
  notes: number;
  flashcards: number;
  quizzes: number;
  mastery: number;
};

export type TaskItem = {
  id: string;
  title: string;
  course: string;
  type: "assignment" | "quiz" | "exam" | "study" | "review";
  due: string;
};

export type WeakTopic = {
  id: string;
  title: string;
  course: string;
  accuracy: number;
  lastReviewed: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  type: "assignment" | "quiz" | "exam" | "study" | "review";
  description: string;
};

export const courses: CourseSummary[] = [
  {
    id: "algorithms",
    name: "Algorithms",
    description: "Design and analyze algorithms with confidence.",
    progress: 0.68,
    topicsCompleted: 12,
    topicsTotal: 18,
    quizzesCompleted: 9,
    nextReview: "Tomorrow  Graphs",
    color: "bg-[color:var(--accent)]",
    topics: [
      {
        id: "sorting",
        title: "Sorting",
        materials: 5,
        notes: 8,
        flashcards: 34,
        quizzes: 4,
        mastery: 0.76,
      },
      {
        id: "graphs",
        title: "Graph Theory",
        materials: 4,
        notes: 6,
        flashcards: 26,
        quizzes: 3,
        mastery: 0.58,
      },
      {
        id: "dp",
        title: "Dynamic Programming",
        materials: 3,
        notes: 5,
        flashcards: 18,
        quizzes: 2,
        mastery: 0.62,
      },
    ],
  },
  {
    id: "databases",
    name: "Databases",
    description: "SQL, indexing, and system design fundamentals.",
    progress: 0.54,
    topicsCompleted: 7,
    topicsTotal: 13,
    quizzesCompleted: 6,
    nextReview: "Fri  Indexes",
    color: "bg-[color:var(--accent-3)]",
    topics: [
      {
        id: "sql",
        title: "SQL Mastery",
        materials: 3,
        notes: 6,
        flashcards: 20,
        quizzes: 3,
        mastery: 0.69,
      },
      {
        id: "indexes",
        title: "Indexes & Query Plans",
        materials: 2,
        notes: 4,
        flashcards: 14,
        quizzes: 2,
        mastery: 0.47,
      },
      {
        id: "transactions",
        title: "Transactions",
        materials: 2,
        notes: 3,
        flashcards: 11,
        quizzes: 1,
        mastery: 0.56,
      },
    ],
  },
  {
    id: "ml",
    name: "Machine Learning",
    description: "Models, evaluation, and real-world deployment.",
    progress: 0.41,
    topicsCompleted: 6,
    topicsTotal: 15,
    quizzesCompleted: 3,
    nextReview: "Today Regularization",
    color: "bg-[color:var(--accent-2)]",
    topics: [
      {
        id: "regression",
        title: "Regression",
        materials: 4,
        notes: 7,
        flashcards: 29,
        quizzes: 3,
        mastery: 0.52,
      },
      {
        id: "classification",
        title: "Classification",
        materials: 3,
        notes: 5,
        flashcards: 21,
        quizzes: 2,
        mastery: 0.48,
      },
      {
        id: "regularization",
        title: "Regularization",
        materials: 2,
        notes: 2,
        flashcards: 10,
        quizzes: 1,
        mastery: 0.39,
      },
    ],
  },
];

export const tasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Problem Set 04",
    course: "Algorithms",
    type: "assignment",
    due: "Today  6:00 PM",
  },
  {
    id: "task-2",
    title: "Quiz: SQL Joins",
    course: "Databases",
    type: "quiz",
    due: "Tomorrow  10:00 AM",
  },
  {
    id: "task-3",
    title: "Midterm Review",
    course: "Machine Learning",
    type: "study",
    due: "Fri 7:30 PM",
  },
  {
    id: "task-4",
    title: "Graph Theory Exam",
    course: "Algorithms",
    type: "exam",
    due: "Mar 28 9:00 AM",
  },
];

export const weakTopics: WeakTopic[] = [
  {
    id: "weak-1",
    title: "Shortest Paths",
    course: "Algorithms",
    accuracy: 0.43,
    lastReviewed: "2 days ago",
  },
  {
    id: "weak-2",
    title: "Query Optimization",
    course: "Databases",
    accuracy: 0.51,
    lastReviewed: "3 days ago",
  },
  {
    id: "weak-3",
    title: "Bias-Variance Tradeoff",
    course: "Machine Learning",
    accuracy: 0.48,
    lastReviewed: "Yesterday",
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Algorithms Study Sprint",
    course: "Algorithms",
    date: "2026-03-16",
    time: "6:00 PM",
    type: "study",
    description: "Focus on graph traversal and shortest paths.",
  },
  {
    id: "evt-2",
    title: "SQL Joins Quiz",
    course: "Databases",
    date: "2026-03-17",
    time: "10:00 AM",
    type: "quiz",
    description: "Timed quiz covering joins and subqueries.",
  },
  {
    id: "evt-3",
    title: "ML Midterm Review",
    course: "Machine Learning",
    date: "2026-03-19",
    time: "7:30 PM",
    type: "review",
    description: "Review regularization and evaluation metrics.",
  },
  {
    id: "evt-4",
    title: "Graph Theory Exam",
    course: "Algorithms",
    date: "2026-03-28",
    time: "9:00 AM",
    type: "exam",
    description: "Comprehensive exam on graph algorithms.",
  },
];

export const studyStreak = {
  current: 9,
  longest: 21,
  lastActive: "Today",
};

export const reviewQueue = {
  dueToday: 28,
  dueTomorrow: 44,
  backlog: 12,
};
