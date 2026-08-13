export interface Allowance {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  defaultAmount?: number | null;
  isTaxable: boolean;
  isInsurable: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface Advance {
  id: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  amount: number;
  requestDate: string;
  deductMonth?: number | null;
  deductYear?: number | null;
  status: string;
  reason?: string | null;
  note?: string | null;
  approvedBy?: string | null;
  approvedDate?: string | null;
}

export interface PayrollSlip {
  id: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  amount: number;
  slipDate: string;
  slipType?: string | null;
  applyMonth?: number | null;
  applyYear?: number | null;
  status: string;
  reason?: string | null;
  note?: string | null;
  approvedBy?: string | null;
  approvedDate?: string | null;
  kind: string;
}

export interface PayrollRunRequest {
  year: number;
  month: number;
  companyId?: string | null;
  branchId?: string | null;
  salaryConfigId?: string | null;
  overwriteDrafts?: boolean;
  includeDefaultAllowances?: boolean;
  computePit?: boolean;
  overtimeRateMultiplier?: number;
}

export interface PayrollPreviewItem {
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  canCreate: boolean;
  skipReason?: string | null;
  basicSalaryFull: number;
  basicSalaryPaid: number;
  standardWorkingDays?: number | null;
  actualWorkingDays?: number | null;
  totalOtMinutes: number;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  pitAmount: number;
  lineItems?: unknown[];
  existingSalaryId?: string | null;
  existingStatus?: string | null;
}

export interface PayrollPreviewResult {
  year: number;
  month: number;
  periodCode: string;
  totalEmployees: number;
  readyCount: number;
  skippedCount: number;
  totalGross: number;
  totalNet: number;
  items: PayrollPreviewItem[];
}

export interface PayrollRunResult {
  createdOrUpdated: number;
  skipped: number;
  salaryIds: string[];
  warnings: string[];
}
