export interface Role {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: Permission[];
  usersCount?: number;
}

export interface Permission {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  action: string;
  resource: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
  permissionIds?: number[];
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}
