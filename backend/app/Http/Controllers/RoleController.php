<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Obtenir tous les rôles disponibles
     */
    public function index(): JsonResponse
    {
        try {
            // Rôles définis dans le système
            $roles = [
                [
                    'id' => 1,
                    'name' => 'admin',
                    'display_name' => 'Administrateur',
                    'description' => 'Accès complet au système',
                    'users_count' => User::where('role', 'admin')->count()
                ],
                [
                    'id' => 2,
                    'name' => 'rh',
                    'display_name' => 'Ressources Humaines',
                    'description' => 'Gestion des employés et congés',
                    'users_count' => User::where('role', 'rh')->count()
                ],
                [
                    'id' => 3,
                    'name' => 'employe',
                    'display_name' => 'Employé',
                    'description' => 'Accès limité aux données personnelles',
                    'users_count' => User::where('role', 'employe')->count()
                ]
            ];
            
            return response()->json($roles);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des rôles',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les détails d'un rôle
     */
    public function show($roleId): JsonResponse
    {
        try {
            $roleNames = ['admin', 'rh', 'employe'];
            $roleDisplayNames = [
                'admin' => 'Administrateur',
                'rh' => 'Ressources Humaines', 
                'employe' => 'Employé'
            ];
            
            if ($roleId < 1 || $roleId > 3) {
                return response()->json(['error' => 'Rôle non trouvé'], 404);
            }
            
            $roleName = $roleNames[$roleId - 1];
            $users = User::where('role', $roleName)->get(['id', 'name', 'email']);
            
            $role = [
                'id' => $roleId,
                'name' => $roleName,
                'display_name' => $roleDisplayNames[$roleName],
                'users' => $users,
                'permissions' => $this->getRolePermissions($roleName)
            ];
            
            return response()->json($role);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération du rôle',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les permissions disponibles
     */
    public function getPermissions(): JsonResponse
    {
        try {
            $permissions = [
                ['id' => 1, 'name' => 'manage_users', 'display_name' => 'Gérer les utilisateurs'],
                ['id' => 2, 'name' => 'manage_employees', 'display_name' => 'Gérer les employés'],
                ['id' => 3, 'name' => 'manage_leaves', 'display_name' => 'Gérer les congés'],
                ['id' => 4, 'name' => 'manage_payroll', 'display_name' => 'Gérer la paie'],
                ['id' => 5, 'name' => 'view_reports', 'display_name' => 'Voir les rapports'],
                ['id' => 6, 'name' => 'manage_settings', 'display_name' => 'Gérer les paramètres'],
                ['id' => 7, 'name' => 'manage_recruitment', 'display_name' => 'Gérer le recrutement'],
                ['id' => 8, 'name' => 'view_profile', 'display_name' => 'Voir le profil'],
                ['id' => 9, 'name' => 'request_leave', 'display_name' => 'Demander un congé'],
                ['id' => 10, 'name' => 'view_payslip', 'display_name' => 'Voir les fiches de paie']
            ];
            
            return response()->json($permissions);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des permissions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les utilisateurs par rôle
     */
    public function getUsersByRole($roleId): JsonResponse
    {
        try {
            $roleNames = ['admin', 'rh', 'employe'];
            
            if ($roleId < 1 || $roleId > 3) {
                return response()->json(['error' => 'Rôle non trouvé'], 404);
            }
            
            $roleName = $roleNames[$roleId - 1];
            $users = User::where('role', $roleName)
                        ->get(['id', 'name', 'email', 'created_at']);
            
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des utilisateurs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les permissions d'un rôle
     */
    private function getRolePermissions($role): array
    {
        switch ($role) {
            case 'admin':
                return [
                    'manage_users', 'manage_employees', 'manage_leaves',
                    'manage_payroll', 'view_reports', 'manage_settings'
                ];
            case 'rh':
                return [
                    'manage_employees', 'manage_leaves', 'view_reports', 'manage_recruitment'
                ];
            case 'employe':
                return [
                    'view_profile', 'request_leave', 'view_payslip'
                ];
            default:
                return [];
        }
    }
}