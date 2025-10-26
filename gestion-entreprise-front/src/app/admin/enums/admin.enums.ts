export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import'
}

export enum ModuleType {
  USERS = 'users',
  ROLES = 'roles',
  DEPARTMENTS = 'departments',
  POSTS = 'posts',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  LOGS = 'logs'
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json'
}

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial'
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum SettingsCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  EMAIL = 'email',
  PAYROLL = 'payroll',
  DOCUMENTS = 'documents',
  NOTIFICATIONS = 'notifications'
}
