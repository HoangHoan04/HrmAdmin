import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateCourseComponent } from './course-manager/add-or-update-course/add-or-update-course.component';
import { CourseManagerComponent } from './course-manager/course-manager.component';
import { AddOrUpdateEnrollmentComponent } from './enrollment-manager/add-or-update-enrollment/add-or-update-enrollment.component';
import { EnrollmentManagerComponent } from './enrollment-manager/enrollment-manager.component';
import { AddOrUpdateMaterialComponent } from './material-manager/add-or-update-material/add-or-update-material.component';
import { MaterialManagerComponent } from './material-manager/material-manager.component';
import { ProgressDashboardComponent } from './progress-dashboard/progress-dashboard.component';
import { AddOrUpdateQuizComponent } from './quiz-manager/add-or-update-quiz/add-or-update-quiz.component';
import { QuizManagerComponent } from './quiz-manager/quiz-manager.component';
import { AddOrUpdateResultComponent } from './result-manager/add-or-update-result/add-or-update-result.component';
import { ResultManagerComponent } from './result-manager/result-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'training/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_PROGRESS.path,
    ),
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_PROGRESS.path,
    ),
    component: ProgressDashboardComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.path),
    component: CourseManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.children.ADD_COURSE.path,
    ),
    component: AddOrUpdateCourseComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.children.EDIT_COURSE.path,
      ) + '/:id',
    component: AddOrUpdateCourseComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.children.DETAIL_COURSE.path,
      ) + '/:id',
    component: AddOrUpdateCourseComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_MATERIAL.path,
    ),
    component: MaterialManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_MATERIAL.children
        .ADD_TRAINING_MATERIAL.path,
    ),
    component: AddOrUpdateMaterialComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_MATERIAL.children
          .EDIT_TRAINING_MATERIAL.path,
      ) + '/:id',
    component: AddOrUpdateMaterialComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_QUIZ.path),
    component: QuizManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_QUIZ.children.ADD_TRAINING_QUIZ
        .path,
    ),
    component: AddOrUpdateQuizComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_QUIZ.children.EDIT_TRAINING_QUIZ
          .path,
      ) + '/:id',
    component: AddOrUpdateQuizComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.TRAINING.children.ENROLLMENT.path),
    component: EnrollmentManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.ENROLLMENT.children.ADD_ENROLLMENT
        .path,
    ),
    component: AddOrUpdateEnrollmentComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.TRAINING.children.ENROLLMENT.children.EDIT_ENROLLMENT
          .path,
      ) + '/:id',
    component: AddOrUpdateEnrollmentComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.TRAINING.children.RESULT.path),
    component: ResultManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.TRAINING.children.RESULT.children.ADD_RESULT.path,
    ),
    component: AddOrUpdateResultComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.TRAINING.children.RESULT.children.EDIT_RESULT.path,
      ) + '/:id',
    component: AddOrUpdateResultComponent,
  },
];

@NgModule({
  declarations: [
    ProgressDashboardComponent,
    CourseManagerComponent,
    AddOrUpdateCourseComponent,
    MaterialManagerComponent,
    AddOrUpdateMaterialComponent,
    QuizManagerComponent,
    AddOrUpdateQuizComponent,
    EnrollmentManagerComponent,
    AddOrUpdateEnrollmentComponent,
    ResultManagerComponent,
    AddOrUpdateResultComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class TrainingModule {}
