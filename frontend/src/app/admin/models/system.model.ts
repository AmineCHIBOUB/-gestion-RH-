export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  database: DatabaseHealth;
  services: ServiceHealth[];
  status: SystemStatus;
  lastCheck: Date;
}

export enum SystemStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  DOWN = 'down'
}

export interface DatabaseHealth {
  status: SystemStatus;
  connectionTime: number;
  activeConnections: number;
  maxConnections: number;
  size: number;
}

export interface ServiceHealth {
  name: string;
  status: SystemStatus;
  responseTime: number;
  lastCheck: Date;
  uptime: number;
}

export interface SystemAlert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  isActive: boolean;
}

export enum AlertType {
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  WARNING = 'warning'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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
  createdAt: Date;
}

export interface SystemLog {
  id: number;
  level: LogLevel;
  message: string;
  context?: any;
  channel: string;
  createdAt: Date;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface BackupInfo {
  id: string;
  name: string;
  size: number;
  createdAt: Date;
  type: BackupType;
  status: BackupStatus;
  path: string;
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential'
}

export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
