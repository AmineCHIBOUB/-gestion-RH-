export interface Department {
  id: number;
  name: string;  // Changé de 'nom' à 'name'
  description?: string;
  code?: string;
  manager_id?: number;
  manager?: {
    id: number;
    name: string;
    email: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentRequest {
  name: string;  // Changé de 'nom' à 'name'
  description?: string;
  code?: string;
  manager_id?: number;
  is_active?: boolean;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  code?: string;
  managerId?: number;
  parentId?: number;
  budget?: number;  // Propriété ajoutée
  location?: string;  // Propriété ajoutée
  isActive?: boolean;
}

export interface CreatePostRequest {
  name: string;  // Changé de 'nom' à 'name'
  description?: string;
  code: string;
  departmentId: number;
  level: number;
  minSalary?: number;
  maxSalary?: number;
  requirements?: string;
  isActive?: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Post {
  id: number;
  titre: string;
  description: string;
  department_id: number;
  department?: {
    id: number;
    name: string;
  };
  salaire_min: number;
  salaire_max: number;
  niveau: string;
  statut: string;
  created_at: string;
  updated_at: string;
}
