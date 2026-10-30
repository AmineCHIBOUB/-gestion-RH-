export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalDepartments: number;
  pendingApprovals: number;
  systemAlerts: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastBackup: string;
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

export interface PendingApproval {
  id: number;
  type: 'leave' | 'expense' | 'overtime' | 'other';
  employee: string;
  description: string;
  amount?: number;
  submittedAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface SystemAlert {
  id: number;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

export interface HRSubstitution {
  id: number;
  adminUser: string;
  targetEmployee: string;
  action: string;
  reason: string;
  timestamp: Date;
}

// Additional interfaces for logs and settings
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

// Interface ajoutée pour les filtres de logs
export interface LogFilters {
  dateFrom?: string;
  dateTo?: string;
  level?: string;
  service?: string;
}

// Interface ajoutée pour les filtres d'audit
export interface AuditFilters {
  dateFrom?: string;
  dateTo?: string;
  user?: string;
  action?: string;
}
