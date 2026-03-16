export type TopicOverview = {
  id: string;
  title: string;
  materials: number;
  notes: number;
  flashcards: number;
  quizzes: number;
  mastery: number;
};

export type CourseOverview = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  topicsCompleted: number;
  topicsTotal: number;
  quizzesCompleted: number;
  nextReview: string;
  color?: string;
  topics: TopicOverview[];
};

export type CalendarEventItem = {
  id: string;
  title: string;
  course: string | null;
  courseId: string | null;
  date: string;
  time: string;
  timeValue: string;
  type: "assignment" | "quiz" | "exam" | "study" | "review";
  description: string | null;
};

export type WeakTopicItem = {
  id: string;
  title: string;
  course: string;
  accuracy: number;
  lastReviewed: string;
};
