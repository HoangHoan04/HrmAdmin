import { enumData } from '@/app/core/constants/enums/enumData';
import { toDateOnly } from '@/app/core/constants/helpers';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  LeaveCalendarEvent,
  RegisterDayOff,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DayHeaderContentArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import enLocale from '@fullcalendar/core/locales/en-gb';
import viLocale from '@fullcalendar/core/locales/vi';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-leave-calendar',
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.scss'],
})
export class LeaveCalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  loading = false;
  detailLoading = false;
  drawerVisible = false;
  selectedEvent?: LeaveCalendarEvent;
  selectedDetail?: RegisterDayOff;

  companyOptions: { label: string; value: string }[] = [];
  branchOptions: { label: string; value: string }[] = [];

  filters = {
    companyId: null as string | null,
    branchId: null as string | null,
    status: null as string | null,
    includeHolidays: true,
  };

  readonly statusOptions = [
    { value: null, labelKey: 'leaveCalendar.statusAll' },
    { value: enumData.DAY_OFF_STATUS.APPROVED.value, labelKey: 'leaveCalendar.statusApproved' },
    { value: enumData.DAY_OFF_STATUS.PENDING.value, labelKey: 'leaveCalendar.statusPending' },
  ];

  events: EventInput[] = [];
  private readonly sub = new Subscription();
  private lastRange: { from: Date; to: Date } | null = null;
  private loadSeq = 0;
  private readonly dayOffStatuses = Object.values(enumData.DAY_OFF_STATUS);
  private readonly dayOffTypes = Object.values(enumData.DAY_OFF_CONFIG_TYPE);
  private readonly leaveSessions = Object.values(enumData.LEAVE_SESSION);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    locales: [viLocale, enLocale],
    locale: 'vi',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    height: '100%',
    expandRows: true,
    stickyHeaderDates: true,
    nowIndicator: true,
    allDaySlot: true,
    weekends: true,
    dayMaxEvents: true,
    editable: false,
    selectable: false,
    eventDisplay: 'block',
    events: [],
    dayHeaderContent: (arg) => this.renderDayHeader(arg),
    datesSet: (arg) => this.loadRange(arg.start, arg.end),
    eventClick: (arg) => this.onEventClick(arg),
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.applyLocale(this.resolveLang());
    this.loadSelectBoxes();
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

  loadSelectBoxes(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.companyOptions = items.map((item) => ({
          label: item.code ? `${item.code} - ${item.name}` : item.name,
          value: item.id,
        }));
        this.cdr.markForCheck();
      },
    });

    this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.branchOptions = items.map((item) => ({
          label: item.code ? `${item.code} - ${item.name}` : item.name,
          value: item.id,
        }));
        this.cdr.markForCheck();
      },
    });
  }

  onFilterChange(): void {
    if (this.lastRange) this.loadRange(this.lastRange.from, this.lastRange.to);
  }

  loadRange(from: Date, to: Date): void {
    this.lastRange = { from, to };
    const seq = ++this.loadSeq;
    this.setLoading(true);

    const payload: Record<string, any> = {
      fromDate: toDateOnly(from),
      toDate: toDateOnly(new Date(to.getTime() - 1)),
      includeHolidays: !!this.filters.includeHolidays,
      includePending:
        !this.filters.status || this.filters.status === enumData.DAY_OFF_STATUS.PENDING.value,
    };
    if (this.filters.companyId) payload['companyId'] = this.filters.companyId;
    if (this.filters.branchId) payload['branchId'] = this.filters.branchId;
    if (this.filters.status) payload['status'] = this.filters.status;

    this.apiService
      .post<LeaveCalendarEvent[]>(this.apiService.REGISTER_DAY_OFF.CALENDAR_RANGE, payload)
      .subscribe({
        next: (items) => {
          if (seq !== this.loadSeq) return;
          this.events = items.map((item) => this.toCalendarEvent(item));
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

  onEventClick(arg: EventClickArg): void {
    const item = arg.event.extendedProps['item'] as LeaveCalendarEvent | undefined;
    if (!item) return;

    this.selectedEvent = item;
    this.selectedDetail = undefined;
    this.drawerVisible = true;

    if (item.eventType === 'LEAVE' && item.leaveId) {
      this.detailLoading = true;
      this.cdr.markForCheck();
      this.apiService
        .post<RegisterDayOff>(this.apiService.REGISTER_DAY_OFF.DETAIL, { id: item.leaveId })
        .subscribe({
          next: (detail) => {
            this.selectedDetail = detail;
            this.detailLoading = false;
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            this.message.error(this.i18n.genericError(err.error));
            this.detailLoading = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      this.detailLoading = false;
      this.cdr.markForCheck();
    }
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.detailLoading = false;
    this.selectedEvent = undefined;
    this.selectedDetail = undefined;
  }

  getDayOffStatusLabel(status?: string | null): string {
    if (!status) return '-';
    const meta = this.dayOffStatuses.find((item) => item.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  getDayOffTypeLabel(type?: string | null): string {
    if (!type) return '-';
    const meta = this.dayOffTypes.find((item) => item.value === type);
    return meta ? this.i18n.instant(meta.labelKey) : type;
  }

  getLeaveSessionLabel(session?: string | null): string {
    if (!session) return '-';
    const meta = this.leaveSessions.find((item) => item.value === session);
    return meta ? this.i18n.instant(meta.labelKey) : session;
  }

  private toCalendarEvent(item: LeaveCalendarEvent): EventInput {
    const isHoliday = item.eventType === 'HOLIDAY';
    let backgroundColor = '#9aa0a6';
    if (isHoliday) {
      backgroundColor = '#7e57c2';
    } else if (item.status === enumData.DAY_OFF_STATUS.APPROVED.value) {
      backgroundColor = '#34a853';
    } else if (item.status === enumData.DAY_OFF_STATUS.PENDING.value) {
      backgroundColor = '#fa8c16';
    }

    return {
      id: item.leaveId || item.holidayId || `${item.eventType}-${item.startDate}-${item.title}`,
      title: item.title,
      start: item.startDate,
      end: this.exclusiveEnd(item.endDate),
      allDay: true,
      backgroundColor,
      borderColor: 'transparent',
      textColor: '#fff',
      extendedProps: { item },
    };
  }

  private exclusiveEnd(endDateInclusive: string): string {
    const parts = endDateInclusive.split('-').map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    date.setDate(date.getDate() + 1);
    return toDateOnly(date);
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
        today: this.i18n.instant('leaveCalendar.calToday'),
        month: this.i18n.instant('leaveCalendar.calMonth'),
        week: this.i18n.instant('leaveCalendar.calWeek'),
      },
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

  private setLoading(value: boolean): void {
    queueMicrotask(() => {
      this.loading = value;
      this.cdr.detectChanges();
    });
  }
}
