export interface HomeNamedCount {
  key: string;
  name: string;
  count: number;
}

export interface HomeKpi {
  totalEmployees: number;
  femaleEmployees: number;
  maleEmployees: number;
  otherGenderEmployees: number;
  newHiresThisMonth: number;
  newHiresLastMonth: number;
  newHiresChangePercent: number;
  activeContracts: number;
}

export interface HomePending {
  leaveRequests: number;
  attendanceComplaints: number;
  transfers: number;
  reviewRenewals: number;
  total: number;
}

export interface HomeAttendanceToday {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  incomplete: number;
  totalRecords: number;
  attendanceRatePercent: number;
}

export interface HomeContractSnapshot {
  active: number;
  pendingSign: number;
  expiringIn30Days: number;
  expired: number;
}

export interface HomeDashboard {
  fromDate: string;
  toDate: string;
  kpis: HomeKpi;
  pending: HomePending;
  attendanceToday: HomeAttendanceToday;
  contracts: HomeContractSnapshot;
  genderBreakdown: HomeNamedCount[];
  departmentHeadcount: HomeNamedCount[];
  headcountByYear: HomeNamedCount[];
  leaveStatusThisMonth: HomeNamedCount[];
  newHiresByMonth: HomeNamedCount[];
}

export interface HomeDashboardRequest {
  fromDate?: string | null;
  toDate?: string | null;
}
