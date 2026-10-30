export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  department_id?: number;
  post_id?: number;
  department?: Department;
  post?: Post;
  profile?: UserProfile;
}

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  module: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  parentId?: number;
}

export interface Post {
  id: number;
  titre: string;
  description?: string;
  departmentId: number;
  level: number;
}

export interface UserProfile {
  id: number;
  userId: number;
  avatar?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  department_id?: number;
  post_id?: number;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  department_id?: number;
  post_id?: number;
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
}
