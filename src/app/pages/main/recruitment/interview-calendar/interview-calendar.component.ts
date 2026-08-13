import { PERMISSION_CODES } from '@/app/core/constants/common';
import {
  Evaluation,
  HiringPlan,
  Candidate,
  InterviewSchedule,
  PagedResult,
  PlanCriteria,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { interviewStatusLabel } from '@/app/core/utils/recruitment-label.util';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  DayHeaderContentArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import enLocale from '@fullcalendar/core/locales/en-gb';
import viLocale from '@fullcalendar/core/locales/vi';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

interface ScoreRow {
  evaluationCriteriaId: string;
  evaluationCriteriaCode?: string | null;
  evaluationCriteriaName?: string | null;
  maxScore: number;
  score: number;
  comment: string;
  id?: string | null;
}

@Component({
  standalone: false,
  selector: 'app-interview-calendar',
  templateUrl: './interview-calendar.component.html',
  styleUrls: ['./interview-calendar.component.scss'],
})
export class InterviewCalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  loading = false;
  detailLoading = false;
  submitting = false;
  evalSaving = false;
  drawerVisible = false;
  modalVisible = false;
  selected?: InterviewSchedule;
  canManage = false;
  events: EventInput[] = [];
  candidates: Candidate[] = [];
  createForm!: FormGroup;
  scoreInterviewerId: string | null = null;
  scoreRows: ScoreRow[] = [];
  planCriteria: PlanCriteria[] = [];
  private readonly sub = new Subscription();
  private lastRange: { from: Date; to: Date } | null = null;
  private loadSeq = 0;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locales: [viLocale, enLocale],
    locale: 'vi',
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    height: '100%',
    expandRows: true,
    stickyHeaderDates: true,
    nowIndicator: true,
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    weekends: true,
    dayMaxEvents: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    eventDisplay: 'block',
    events: [],
    dayHeaderContent: (arg) => this.renderDayHeader(arg),
    datesSet: (arg) => this.loadRange(arg.start, arg.end),
    dateClick: (arg) => this.onDateClick(arg),
    select: (arg) => this.onSelect(arg),
    eventClick: (arg) => this.onEventClick(arg),
    eventDrop: (arg) => this.onEventDrop(arg),
    eventResize: (arg) => this.onEventResize(arg),
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly permissionSvc: PermissionService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.canManage = this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_INTERVIEW_MANAGE);
    this.createForm = this.fb.group({
      candidateId: [null, Validators.required],
      round: [1, [Validators.required, Validators.min(1)]],
      startAt: [null, Validators.required],
      endAt: [null, Validators.required],
      location: [''],
    });
    this.applyLocale(this.resolveLang());
    this.calendarOptions = {
      ...this.calendarOptions,
      editable: this.canManage,
      selectable: this.canManage,
    };
    this.loadCandidates();
    this.sub.add(
      this.translate.onLangChange.subscribe((e) => {
        this.applyLocale(e.lang);
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private resolveLang(): string {
    return this.translate.currentLang() || 'vi';
  }

  private applyLocale(lang: string): void {
    const isVi = (lang || 'vi').toLowerCase().startsWith('vi');
    this.calendarOptions = {
      ...this.calendarOptions,
      locale: isVi ? 'vi' : 'en-gb',
      buttonText: {
        today: this.i18n.instant('recruitment.interview.calToday'),
        month: this.i18n.instant('recruitment.interview.calMonth'),
        week: this.i18n.instant('recruitment.interview.calWeek'),
        day: this.i18n.instant('recruitment.interview.calDay'),
      },
      slotLabelFormat: isVi
        ? { hour: '2-digit', minute: '2-digit', hour12: false }
        : { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
      eventTimeFormat: isVi
        ? { hour: '2-digit', minute: '2-digit', hour12: false }
        : { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
    };
  }

  private renderDayHeader(arg: DayHeaderContentArg): { html: string } {
    const lang = this.resolveLang().toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-GB';
    const weekday = new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(arg.date);
    const dayNum = arg.date.getDate();
    const todayClass = arg.isToday ? ' is-today' : '';
    return {
      html: `<div class="gcal-dayhead${todayClass}"><span class="gcal-weekday">${weekday}</span><span class="gcal-daynum">${dayNum}</span></div>`,
    };
  }

  loadCandidates(): void {
    this.apiService
      .post<PagedResult<Candidate>>(this.apiService.CANDIDATE.PAGINATION, {
        pageIndex: 1,
        pageSize: 300,
      })
      .subscribe({
        next: (res) => {
          this.candidates = res.items.filter((c) =>
            ['NEW', 'SCREENING', 'INTERVIEW', 'WAITLIST'].includes(c.status),
          );
        },
      });
  }

  loadRange(from: Date, to: Date): void {
    this.lastRange = { from, to };
    const seq = ++this.loadSeq;
    this.setLoading(true);
    this.apiService
      .post<InterviewSchedule[]>(this.apiService.INTERVIEW_SCHEDULE.CALENDAR_RANGE, {
        from: from.toISOString(),
        to: to.toISOString(),
      })
      .subscribe({
        next: (items) => {
          if (seq !== this.loadSeq) return;
          this.events = items.map((item) => ({
            id: item.id,
            title: `${item.candidateName || item.candidateCode || this.i18n.instant('recruitment.interview.untitledEvent')} (#${item.round})`,
            start: item.startAt,
            end: item.endAt,
            backgroundColor:
              item.status === 'COMPLETED'
                ? '#34a853'
                : item.status === 'CANCELLED'
                  ? '#9aa0a6'
                  : '#1a73e8',
            borderColor: 'transparent',
            textColor: '#fff',
            extendedProps: { item },
          }));
          const api = this.calendarComponent?.getApi();
          if (api) {
            api.removeAllEvents();
            api.addEventSource(this.events);
          } else {
            this.calendarOptions = { ...this.calendarOptions, events: this.events };
          }
          this.setLoading(false);
        },
        error: (err: any) => {
          if (seq !== this.loadSeq) return;
          this.message.error(this.i18n.genericError(err.error));
          this.setLoading(false);
        },
      });
  }

  private setLoading(value: boolean): void {
    queueMicrotask(() => {
      this.loading = value;
      this.cdr.detectChanges();
    });
  }

  onDateClick(arg: DateClickArg): void {
    if (!this.canManage) return;
    if (arg.view.type === 'dayGridMonth') {
      const start = new Date(arg.date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(10, 0, 0, 0);
      this.openCreateModal(start, end);
    }
  }

  onSelect(arg: DateSelectArg): void {
    if (!this.canManage) return;
    this.openCreateModal(arg.start, arg.end);
    this.calendarComponent?.getApi()?.unselect();
  }

  openCreateModal(start: Date, end: Date): void {
    this.createForm.reset({
      candidateId: null,
      round: 1,
      startAt: start,
      endAt: end,
      location: '',
    });
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      Object.values(this.createForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const raw = this.createForm.getRawValue();
    this.apiService
      .post(this.apiService.INTERVIEW_SCHEDULE.CREATE, {
        candidateId: raw.candidateId,
        round: raw.round,
        location: raw.location,
        startAt: new Date(raw.startAt).toISOString(),
        endAt: new Date(raw.endAt).toISOString(),
      })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.createSuccess());
          this.modalVisible = false;
          this.submitting = false;
          if (this.lastRange) this.loadRange(this.lastRange.from, this.lastRange.to);
          this.loadCandidates();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.submitting = false;
        },
      });
  }

  onEventClick(arg: EventClickArg): void {
    const item = arg.event.extendedProps['item'] as InterviewSchedule | undefined;
    if (!item?.id) return;
    this.selected = {
      ...item,
      interviewers: item.interviewers ?? [],
      evaluations: item.evaluations ?? [],
    };
    this.scoreInterviewerId = null;
    this.scoreRows = [];
    this.planCriteria = [];
    this.drawerVisible = true;
    this.detailLoading = true;
    this.cdr.markForCheck();
    this.apiService
      .post<InterviewSchedule>(this.apiService.INTERVIEW_SCHEDULE.DETAIL, { id: item.id })
      .subscribe({
        next: (detail) => {
          this.selected = {
            ...detail,
            interviewers: detail?.interviewers ?? [],
            evaluations: detail?.evaluations ?? [],
          };
          const primary =
            this.selected.interviewers.find((i) => i.isPrimary)?.employeeId ||
            this.selected.interviewers[0]?.employeeId ||
            null;
          this.scoreInterviewerId = primary;
          this.loadScoreContext();
          this.detailLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.detailLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadScoreContext(): void {
    if (!this.selected) return;
    const planId = this.selected.hiringPlanId;
    if (!planId) {
      this.planCriteria = [];
      this.rebuildScoreRows();
      return;
    }
    this.apiService
      .post<HiringPlan>(this.apiService.HIRING_PLAN.DETAIL, { id: planId })
      .subscribe({
        next: (plan) => {
          this.planCriteria = (plan.criteria || [])
            .slice()
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          this.rebuildScoreRows();
          this.cdr.markForCheck();
        },
        error: () => {
          this.planCriteria = [];
          this.rebuildScoreRows();
          this.cdr.markForCheck();
        },
      });
  }

  onScoreInterviewerChange(): void {
    this.rebuildScoreRows();
  }

  private rebuildScoreRows(): void {
    if (!this.selected) {
      this.scoreRows = [];
      return;
    }
    const interviewerId = this.scoreInterviewerId;
    const existing = (this.selected.evaluations || []).filter(
      (e) => !interviewerId || e.interviewerEmployeeId === interviewerId,
    );

    if (this.planCriteria.length > 0) {
      this.scoreRows = this.planCriteria.map((c) => {
        const hit = existing.find((e) => e.evaluationCriteriaId === c.evaluationCriteriaId);
        return {
          evaluationCriteriaId: c.evaluationCriteriaId,
          evaluationCriteriaCode: c.evaluationCriteriaCode,
          evaluationCriteriaName: c.evaluationCriteriaName,
          maxScore: c.maxScore ?? 10,
          score: hit?.score ?? 0,
          comment: hit?.comment || '',
          id: hit?.id,
        };
      });
      return;
    }

    this.scoreRows = existing.map((e) => ({
      evaluationCriteriaId: e.evaluationCriteriaId,
      evaluationCriteriaCode: e.evaluationCriteriaCode,
      evaluationCriteriaName: e.evaluationCriteriaName,
      maxScore: 10,
      score: e.score ?? 0,
      comment: e.comment || '',
      id: e.id,
    }));
  }

  get existingEvaluations(): Evaluation[] {
    return this.selected?.evaluations ?? [];
  }

  get canScore(): boolean {
    return (
      this.canManage &&
      !!this.selected &&
      this.selected.status !== 'CANCELLED' &&
      !!this.scoreInterviewerId &&
      this.scoreRows.length > 0
    );
  }

  saveEvaluations(): void {
    if (!this.selected || !this.scoreInterviewerId || !this.canScore) return;
    for (const row of this.scoreRows) {
      if (row.score < 0 || row.score > row.maxScore) {
        this.message.warning(
          this.i18n.instant('recruitment.interview.scoreOutOfRange', {
            max: row.maxScore,
            name: row.evaluationCriteriaName || row.evaluationCriteriaCode,
          }),
        );
        return;
      }
    }
    this.evalSaving = true;
    this.apiService
      .post(this.apiService.INTERVIEW_SCHEDULE.UPSERT_EVALUATIONS, {
        interviewScheduleId: this.selected.id,
        interviewerEmployeeId: this.scoreInterviewerId,
        evaluations: this.scoreRows.map((r) => ({
          id: r.id || undefined,
          evaluationCriteriaId: r.evaluationCriteriaId,
          score: r.score,
          comment: r.comment || null,
        })),
      })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.updateSuccess());
          this.evalSaving = false;
          this.apiService
            .post<InterviewSchedule>(this.apiService.INTERVIEW_SCHEDULE.DETAIL, {
              id: this.selected!.id,
            })
            .subscribe({
              next: (detail) => {
                this.selected = {
                  ...detail,
                  interviewers: detail?.interviewers ?? [],
                  evaluations: detail?.evaluations ?? [],
                };
                this.rebuildScoreRows();
                this.cdr.markForCheck();
              },
            });
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.evalSaving = false;
        },
      });
  }

  completeSelected(): void {
    if (!this.selected) return;
    this.apiService
      .post(this.apiService.INTERVIEW_SCHEDULE.COMPLETE, {
        id: this.selected.id,
        moveCandidateToWaitlist: true,
      })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.updateSuccess());
          this.closeDrawer();
          if (this.lastRange) this.loadRange(this.lastRange.from, this.lastRange.to);
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }

  cancelSelected(): void {
    if (!this.selected) return;
    this.apiService
      .post(this.apiService.INTERVIEW_SCHEDULE.CANCEL, { id: this.selected.id })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.updateSuccess());
          this.closeDrawer();
          if (this.lastRange) this.loadRange(this.lastRange.from, this.lastRange.to);
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }

  onEventDrop(arg: EventDropArg): void {
    this.updateTimes(arg.event.id, arg.event.start, arg.event.end, () => arg.revert());
  }

  onEventResize(arg: EventResizeDoneArg): void {
    this.updateTimes(arg.event.id, arg.event.start, arg.event.end, () => arg.revert());
  }

  private updateTimes(id: string, start: Date | null, end: Date | null, revert: () => void): void {
    if (!this.canManage || !start || !end) {
      revert();
      return;
    }
    this.apiService
      .post<boolean>(this.apiService.INTERVIEW_SCHEDULE.UPDATE, {
        id,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      })
      .subscribe({
        next: (ok) => {
          if (ok) this.message.success(this.i18n.updateSuccess());
          else {
            this.message.error(this.i18n.genericError());
            revert();
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          revert();
        },
      });
  }

  get interviewerNames(): string {
    if (!this.selected?.interviewers?.length) return '-';
    return this.selected.interviewers.map((i) => i.employeeName || i.employeeCode || '').join(', ');
  }

  labelInterviewStatus(status?: string | null): string {
    return interviewStatusLabel((k) => this.i18n.instant(k), status);
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.detailLoading = false;
    this.selected = undefined;
    this.scoreRows = [];
    this.planCriteria = [];
    this.scoreInterviewerId = null;
  }

  closeModal(): void {
    this.modalVisible = false;
  }
}
