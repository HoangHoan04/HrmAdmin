import { BaseDto } from '../common.models';

export interface TrainingCourse extends BaseDto {
  code: string;
  name: string;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  provider?: string | null;
  hours: number;
  budgetAmount?: number | null;
  status: string;
  description?: string | null;
}

export interface TrainingEnrollment extends BaseDto {
  courseId: string;
  courseCode?: string | null;
  courseName?: string | null;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  enrolledAt: string;
  status: string;
  note?: string | null;
}

export interface TrainingResult extends BaseDto {
  enrollmentId: string;
  courseName?: string | null;
  employeeName?: string | null;
  score?: number | null;
  grade?: string | null;
  completedAt?: string | null;
  certificateUrl?: string | null;
  note?: string | null;
}

export interface CourseMaterial extends BaseDto {
  courseId: string;
  courseName?: string | null;
  name: string;
  fileUrl: string;
  displayOrder: number;
}

export interface TrainingQuiz extends BaseDto {
  courseId: string;
  courseName?: string | null;
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string | null;
  optionD?: string | null;
  correctOption: string;
}

export interface TrainingProgress {
  courseId: string;
  courseName: string;
  enrolledCount: number;
  completedCount: number;
  droppedCount: number;
  completionPercent: number;
}
