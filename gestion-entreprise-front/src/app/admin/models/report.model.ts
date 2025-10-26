export interface ReportData {
  id: string;
  title: string;
  type: ReportType;
  data: any;
  generatedAt: Date;
  generatedBy: string;
  filters?: ReportFilters;
}

export enum ReportType {
  USER = 'user',
  ACTIVITY = 'activity',
  FINANCIAL = 'financial',
  ATTENDANCE = 'attendance',
  LEAVE = 'leave',
  CUSTOM = 'custom'
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  departmentId?: number;
  userId?: number;
  status?: string;
  [key: string]: any;
}

export interface UserReport {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  usersByDepartment: DepartmentUserCount[];
  usersByRole: RoleUserCount[];
  recentRegistrations: UserRegistration[];
}

export interface ActivityReport {
  totalActivities: number;
  activitiesByType: ActivityTypeCount[];
  activitiesByUser: UserActivityCount[];
  activitiesByDate: DateActivityCount[];
  mostActiveUsers: UserActivitySummary[];
}

export interface FinancialReport {
  totalPayroll: number;
  payrollByDepartment: DepartmentPayroll[];
  averageSalary: number;
  salaryDistribution: SalaryRange[];
  monthlyPayrollTrend: MonthlyPayroll[];
}

export interface DepartmentUserCount {
  departmentName: string;
  userCount: number;
}

export interface RoleUserCount {
  roleName: string;
  userCount: number;
}

export interface UserRegistration {
  id: number;
  name: string;
  email: string;
  registeredAt: Date;
  department: string;
}

export interface ActivityTypeCount {
  type: string;
  count: number;
}

export interface UserActivityCount {
  userId: number;
  userName: string;
  activityCount: number;
}

export interface DateActivityCount {
  date: string;
  count: number;
}

export interface UserActivitySummary {
  userId: number;
  userName: string;
  totalActivities: number;
  lastActivity: Date;
}

export interface DepartmentPayroll {
  departmentName: string;
  totalPayroll: number;
  employeeCount: number;
  averageSalary: number;
}

export interface SalaryRange {
  range: string;
  count: number;
  percentage: number;
}

export interface MonthlyPayroll {
  month: string;
  totalPayroll: number;
  employeeCount: number;
}
