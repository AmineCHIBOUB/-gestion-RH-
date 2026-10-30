// Import/Export Models
export interface ImportSettings {
  importType: string;
  format: string;
  file: File;
  hasHeaders: boolean;
  validateData: boolean;
  skipDuplicates: boolean;
  errorHandling: 'skip' | 'stop' | 'log';
  batchSize: number;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors?: ImportError[];
  message?: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ExportSettings {
  exportType: string;
  format: string;
  fields: string[];
  includeHeaders: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    status: string;
    department: string;
    role: string;
  };
  compression: boolean;
  password: string;
  maxRecords: number;
}

export interface ExportResult {
  success: boolean;
  recordCount: number;
  fileSize?: string;
  format?: string;
  filename?: string;
  downloadUrl?: string;
  message?: string;
}

// Settings Models
export interface PayrollSettings {
  id?: number;
  // Calendrier
  payrollFrequency: 'weekly' | 'biweekly' | 'monthly';
  payrollDay: number;
  vacationDaysPerYear: number;
  sickLeaveDaysPerYear: number;
  
  // Taux
  overtimeRate: number;
  weekendRate: number;
  holidayRate: number;
  maximumOvertimeHours: number;
  
  // Charges
  socialSecurityRate: number;
  incomeTaxRate: number;
  healthInsuranceRate: number;
  unemploymentInsuranceRate: number;
  
  // Avantages
  transportAllowance: number;
  mealAllowance: number;
  seniorityBonusRate: number;
  performanceBonusMaxRate: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentSettings {
  id?: number;
  maxFileSize: number;
  allowedFormats: string[];
  storageLocation: string;
  retentionPeriod: number;
  autoBackup: boolean;
  encryptionEnabled: boolean;
  versionControl: boolean;
  accessControl: {
    public: boolean;
    roles: string[];
    departments: string[];
  };
  notifications: {
    onUpload: boolean;
    onDelete: boolean;
    onExpiry: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GeneralSettings {
  id?: number;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  fiscalYearStart: string;
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorAuth: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Log Models
export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  resource: string;
  resourceId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failed';
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context: any;
  timestamp: Date;
  source: string;
  stackTrace?: string;
}

// Report Models
export interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

export interface UserReport {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  usersByDepartment: { [key: string]: number };
  usersByRole: { [key: string]: number };
  chartData: ReportData;
}

export interface ActivityReport {
  totalActivities: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  activitiesByType: { [key: string]: number };
  activitiesByUser: { [key: string]: number };
  chartData: ReportData;
}

export interface FinancialReport {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  spendingByDepartment: { [key: string]: number };
  spendingByCategory: { [key: string]: number };
  monthlySpending: { [key: string]: number };
  chartData: ReportData;
}

// Common Types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
