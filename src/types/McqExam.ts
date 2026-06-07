export interface ExamPoster {
  _id?: string;
  name: string;
  role: string;
  avatar?: string | null;
  userId?: string;
}

export type ExamStatus = "today" | "upcoming" | "past";
export type StatusFilter = "upcoming" | "finished";

export interface Exam {
  _id: string;
  studentClass: string;
  subject: string;
  description?: string;
  examDate: string;
  postedBy?: ExamPoster | null;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
}
