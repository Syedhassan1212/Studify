import { format, isToday, isTomorrow } from "date-fns";
import { supabaseServer } from "@/lib/supabase/server";
import type { CalendarEventItem, CourseOverview, WeakTopicItem } from "@/lib/types";

type StudyStreak = {
  current: number;
  longest: number;
  lastActive: string;
};

type ReviewQueue = {
  dueToday: number;
  dueTomorrow: number;
  backlog: number;
};

type TaskItem = {
  id: string;
  title: string;
  course: string | null;
  type: "assignment" | "quiz" | "exam" | "study" | "review";
  due: string;
};

type QuizResultRow = {
  quiz_id: string;
  score: number;
  created_at: string;
};

function normalizeScore(score: number) {
  if (Number.isNaN(score)) return 0;
  if (score <= 1) return score;
  if (score <= 100) return score / 100;
  return 0;
}

function formatReviewDate(date: Date | null) {
  if (!date) return "No review scheduled";
  if (isToday(date)) return `Today - ${format(date, "MMM d")}`;
  if (isTomorrow(date)) return `Tomorrow - ${format(date, "MMM d")}`;
  return format(date, "MMM d");
}

export async function getCourseOverviews(): Promise<CourseOverview[]> {
  const supabase = await supabaseServer();

  const [{ data: courses }, { data: topics }, { data: materials }, { data: notes }, { data: flashcards }, { data: quizzes }, { data: quizResults }] =
    await Promise.all([
      supabase.from("courses").select("id,name,description"),
      supabase.from("topics").select("id,course_id,title"),
      supabase.from("materials").select("id,topic_id"),
      supabase.from("notes").select("id,topic_id"),
      supabase.from("flashcards").select("id,topic_id,next_review"),
      supabase.from("quizzes").select("id,topic_id"),
      supabase.from("quiz_results").select("quiz_id,score,created_at"),
    ]);

  const topicsByCourse = new Map<string, { id: string; title: string }[]>();
  (topics ?? []).forEach((topic) => {
    const list = topicsByCourse.get(topic.course_id) ?? [];
    list.push({ id: topic.id, title: topic.title });
    topicsByCourse.set(topic.course_id, list);
  });

  const countByTopic = (rows: { topic_id: string }[] | null | undefined) => {
    const map = new Map<string, number>();
    (rows ?? []).forEach((row) => {
      map.set(row.topic_id, (map.get(row.topic_id) ?? 0) + 1);
    });
    return map;
  };

  const materialsByTopic = countByTopic(materials);
  const notesByTopic = countByTopic(notes);
  const flashcardsByTopic = countByTopic(flashcards);
  const quizzesByTopic = countByTopic(quizzes);

  const quizIdToTopicId = new Map<string, string>();
  (quizzes ?? []).forEach((quiz) => {
    quizIdToTopicId.set(quiz.id, quiz.topic_id);
  });

  const resultsByTopic = new Map<string, QuizResultRow[]>();
  (quizResults ?? []).forEach((result) => {
    const topicId = quizIdToTopicId.get(result.quiz_id);
    if (!topicId) return;
    const list = resultsByTopic.get(topicId) ?? [];
    list.push(result);
    resultsByTopic.set(topicId, list);
  });

  const nextReviewByCourse = new Map<string, Date | null>();
  (flashcards ?? []).forEach((card) => {
    if (!card.next_review) return;
    const topic = (topics ?? []).find((t) => t.id === card.topic_id);
    if (!topic) return;
    const existing = nextReviewByCourse.get(topic.course_id);
    const currentDate = new Date(card.next_review);
    if (!existing || currentDate < existing) {
      nextReviewByCourse.set(topic.course_id, currentDate);
    }
  });

  return (courses ?? []).map((course) => {
    const courseTopics = topicsByCourse.get(course.id) ?? [];
    const topicSummaries = courseTopics.map((topic) => {
      const quizResultsForTopic = resultsByTopic.get(topic.id) ?? [];
      const avgScore =
        quizResultsForTopic.length > 0
          ? quizResultsForTopic.reduce((sum, item) => sum + normalizeScore(item.score), 0) /
            quizResultsForTopic.length
          : 0;

      return {
        id: topic.id,
        title: topic.title,
        materials: materialsByTopic.get(topic.id) ?? 0,
        notes: notesByTopic.get(topic.id) ?? 0,
        flashcards: flashcardsByTopic.get(topic.id) ?? 0,
        quizzes: quizzesByTopic.get(topic.id) ?? 0,
        mastery: avgScore,
      };
    });

    const topicsCompleted = topicSummaries.filter(
      (topic) =>
        topic.materials + topic.notes + topic.flashcards + topic.quizzes > 0,
    ).length;
    const topicsTotal = courseTopics.length;
    const progress = topicsTotal > 0 ? topicsCompleted / topicsTotal : 0;
    const quizzesCompleted = (courseTopics ?? []).reduce(
      (sum, topic) => sum + (quizzesByTopic.get(topic.id) ?? 0),
      0,
    );

    const nextReview = formatReviewDate(nextReviewByCourse.get(course.id) ?? null);

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      progress,
      topicsCompleted,
      topicsTotal,
      quizzesCompleted,
      nextReview,
      topics: topicSummaries,
    };
  });
}

export async function getDashboardData() {
  const supabase = await supabaseServer();

  const [courses, { data: events }, { data: streak }, { data: flashcards }, { data: topics }] =
    await Promise.all([
      getCourseOverviews(),
      supabase.from("calendar_events").select("id,title,description,event_type,start_time,course_id"),
      supabase
        .from("study_streak")
        .select("current_streak,longest_streak,last_study_date")
        .maybeSingle(),
      supabase.from("flashcards").select("id,next_review,topic_id"),
      supabase.from("topics").select("id,title,course_id"),
    ]);

  const reviewQueue: ReviewQueue = { dueToday: 0, dueTomorrow: 0, backlog: 0 };
  const today = new Date();

  (flashcards ?? []).forEach((card) => {
    if (!card.next_review) return;
    const reviewDate = new Date(card.next_review);
    if (isToday(reviewDate)) reviewQueue.dueToday += 1;
    else if (isTomorrow(reviewDate)) reviewQueue.dueTomorrow += 1;
    else if (reviewDate < today) reviewQueue.backlog += 1;
  });

  const studyStreak: StudyStreak = {
    current: streak?.current_streak ?? 0,
    longest: streak?.longest_streak ?? 0,
    lastActive: streak?.last_study_date
      ? format(new Date(streak.last_study_date), "MMM d")
      : "No activity yet",
  };

  const upcomingTasks: TaskItem[] = (events ?? [])
    .map((event) => ({
      id: event.id,
      title: event.title,
      course: courses.find((course) => course.id === event.course_id)?.name ?? null,
      type: (event.event_type ?? "study") as TaskItem["type"],
      due: format(new Date(event.start_time), "MMM d h:mm a"),
      startTime: new Date(event.start_time).getTime(),
    }))
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 4)
    .map(({ startTime, ...task }) => task);

  const weakTopics: WeakTopicItem[] = [];
  const topicMap = new Map((topics ?? []).map((topic) => [topic.id, topic]));

  courses.forEach((course) => {
    course.topics.forEach((topic) => {
      if (topic.mastery === 0) return;
      const sourceTopic = topicMap.get(topic.id);
      if (!sourceTopic) return;
      weakTopics.push({
        id: topic.id,
        title: topic.title,
        course: course.name,
        accuracy: topic.mastery,
        lastReviewed: "Recently",
      });
    });
  });

  weakTopics.sort((a, b) => a.accuracy - b.accuracy);

  return {
    courses,
    reviewQueue,
    studyStreak,
    tasks: upcomingTasks,
    weakTopics: weakTopics.slice(0, 4),
  };
}

export async function getCalendarEvents(): Promise<CalendarEventItem[]> {
  const supabase = await supabaseServer();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id,title,description,event_type,start_time,course_id");

  const { data: courses } = await supabase.from("courses").select("id,name");
  const courseMap = new Map((courses ?? []).map((course) => [course.id, course.name]));

  return (events ?? []).map((event) => {
    const start = new Date(event.start_time);
    return {
      id: event.id,
      title: event.title,
      course: courseMap.get(event.course_id) ?? null,
      date: format(start, "yyyy-MM-dd"),
      time: format(start, "h:mm a"),
      type: (event.event_type ?? "study") as CalendarEventItem["type"],
      description: event.description,
    };
  });
}
