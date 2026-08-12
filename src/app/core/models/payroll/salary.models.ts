import { BaseDto } from '../common.models';

export interface SalaryLineItem {
  id?: string | null;
  itemType: string;
  itemCode: string;
  itemName: string;
  amount: number;
  displayOrder: number;
  note?: string | null;
}

export interface Salary extends BaseDto {
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  salaryConfigId?: string | null;
  salaryConfigName?: string;
  year: number;
  month: number;
  periodCode: string;
  payDate?: string | null;
  status: string;
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  departmentId?: string | null;
  departmentName?: string;
  positionId?: string | null;
  positionName?: string;
  standardWorkingDays?: number | null;
  actualWorkingDays?: number | null;
  basicSalary: number;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  insuranceSalary?: number | null;
  currency: string;
  payslipFileUrl?: string | null;
  approvedDate?: string | null;
  approvedBy?: string | null;
  paidDate?: string | null;
  note?: string | null;
  lineItems?: SalaryLineItem[];
  incomeItems?: SalaryLineItem[];
  deductionItems?: SalaryLineItem[];
}

export interface SalaryConfig extends BaseDto {
  code: string;
  name: string;
  description?: string | null;
  companyId?: string | null;
  companyName?: string;
  standardWorkingDays: number;
  bhxhEmployeeRate: number;
  bhytEmployeeRate: number;
  bhtnEmployeeRate: number;
  defaultPayDay?: number | null;
  isComputePrevMonth: boolean;
  currency: string;
  isActive: boolean;
  displayOrder: number;
}

export interface SalaryConfigSelectBoxDto {
  id: string;
  code: string;
  name: string;
  companyId?: string | null;
  standardWorkingDays: number;
  defaultPayDay?: number | null;
  currency: string;
}
