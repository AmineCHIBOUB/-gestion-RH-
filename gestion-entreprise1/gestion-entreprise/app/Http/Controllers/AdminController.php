<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\Role;
use App\Models\Post; // Add this import at the top
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboardStats(): JsonResponse
    {
        try {
            $totalUsers = User::count();
            $activeUsers = User::where('is_active', true)->count();
            $inactiveUsers = $totalUsers - $activeUsers;
            $totalDepartments = Department::count();
            
            // Fix: Always return 3 for roles as requested
            $totalRoles = 3;
            
            // Add post statistics
            $totalPosts = Post::count();
            $activePosts = Post::where('statut', 'actif')->count();
            $inactivePosts = Post::where('statut', 'inactif')->count();
            
            // Activités récentes (exemple basé sur les utilisateurs créés récemment)
            $recentActivities = User::with(['department'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'description' => "Utilisateur {$user->full_name} créé",
                        'user' => 'System',
                        'timestamp' => $user->created_at,
                        'type' => 'create',
                        'icon' => 'person_add'
                    ];
                });

            return response()->json([
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'inactive_users' => $inactiveUsers,
                'total_departments' => $totalDepartments,
                'total_roles' => $totalRoles, // Always 3
                'total_posts' => $totalPosts,
                'active_posts' => $activePosts,
                'inactive_posts' => $inactivePosts,
                'recent_activities' => $recentActivities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function systemHealth(): JsonResponse
    {
        try {
            // Simulation des métriques système
            $diskUsage = disk_free_space('/') ? 
                (1 - disk_free_space('/') / disk_total_space('/')) * 100 : 0;
            
            $memoryUsage = function_exists('memory_get_usage') ? 
                (memory_get_usage(true) / (1024 * 1024 * 1024)) * 100 : 0;

            return response()->json([
                'cpu' => rand(20, 80), // Simulation - remplacer par vraie métrique
                'memory' => min(100, $memoryUsage),
                'storage' => min(100, $diskUsage),
                'status' => 'healthy'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'cpu' => 0,
                'memory' => 0,
                'storage' => 0,
                'status' => 'error'
            ], 500);
        }
    }

    public function getUsers(Request $request): JsonResponse
    {
        try {
            $query = User::with(['department', 'post']);
            
            // Filtres
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
                });
            }
            
            if ($request->has('role')) {
                $query->where('role', $request->get('role'));
            }
            
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }
            
            // Pagination
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 10);
            
            $users = $query->paginate($limit, ['*'], 'page', $page);
            
            // Transformer les données pour le frontend Angular (snake_case -> camelCase)
            $transformedUsers = collect($users->items())->map(function ($user) {
                return [
                    'id' => $user->id,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'isActive' => (bool) $user->is_active,
                    'emailVerifiedAt' => $user->email_verified_at,
                    'createdAt' => $user->created_at,
                    'updatedAt' => $user->updated_at,
                    'role' => $user->role ,
                    'department' => $user->department ? [
                        'id' => $user->department->id,
                        'name' => $user->department->name,
                        'description' => $user->department->description ?? null
                    ] : null,
                    'post' => $user->post ? [
                        'id' => $user->post->id,
                        'titre' => $user->post->titre,
                        'description' => $user->post->description ?? null
                    ] : null
                ];
            })->toArray();
            
            return response()->json([
                'data' => $transformedUsers,
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createUser(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:admin,rh,employe',
                'department_id' => 'nullable|exists:departments,id',
                'post_id' => 'nullable|exists:posts,id',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Données de validation invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userData = $validator->validated();
            $userData['password'] = Hash::make($userData['password']);
            $userData['name'] = $userData['first_name'] . ' ' . $userData['last_name'];
            $userData['is_active'] = $userData['is_active'] ?? true;

            $user = User::create($userData);
            $user->load(['department', 'post']);

            return response()->json([
                'message' => 'Utilisateur créé avec succès',
                'user' => [
                    'id' => $user->id,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'isActive' => (bool) $user->is_active,
                    'role' => $user->role,
                    'department' => $user->department ? [
                        'id' => $user->department->id,
                        'name' => $user->department->name,
                        'description' => $user->department->description ?? null
                    ] : null,
                    'post' => $user->post ? [
                        'id' => $user->post->id,
                        'title' => $user->post->title,
                        'description' => $user->post->description ?? null
                    ] : null,
                    'createdAt' => $user->created_at,
                    'updatedAt' => $user->updated_at
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'sometimes|required|string|max:255',
                'last_name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'role' => 'sometimes|required|string|in:admin,rh,employe',
                'department_id' => 'nullable|exists:departments,id',
                'post_id' => 'nullable|exists:posts,id',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Données de validation invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userData = $validator->validated();
            
            // Update name if first_name or last_name changed
            if (isset($userData['first_name']) || isset($userData['last_name'])) {
                $firstName = $userData['first_name'] ?? $user->first_name;
                $lastName = $userData['last_name'] ?? $user->last_name;
                $userData['name'] = $firstName . ' ' . $lastName;
            }

            $user->update($userData);
            $user->load(['department', 'post']);

            return response()->json([
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'id' => $user->id,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'isActive' => (bool) $user->is_active,
                    'role' => $user->role,
                    'department' => $user->department ? [
                        'id' => $user->department->id,
                        'name' => $user->department->name,
                        'description' => $user->department->description ?? null
                    ] : null,
                    'post' => $user->post ? [
                        'id' => $user->post->id,
                        'title' => $user->post->title,
                        'description' => $user->post->description ?? null
                    ] : null,
                    'createdAt' => $user->created_at,
                    'updatedAt' => $user->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser(User $user): JsonResponse
    {
        try {
            // Check if user has related data that should prevent deletion
            $hasEmployeeRecord = $user->employe()->exists();
            $hasApprovedLeaves = $user->congesApprouves()->exists();
            $hasUploadedFiles = $user->fichiersUploades()->exists();

            if ($hasEmployeeRecord || $hasApprovedLeaves || $hasUploadedFiles) {
                return response()->json([
                    'message' => 'Impossible de supprimer cet utilisateur car il a des données associées. Désactivez-le plutôt.',
                    'can_delete' => false
                ], 409);
            }

            $userName = $user->full_name;
            $user->delete();

            return response()->json([
                'message' => "Utilisateur {$userName} supprimé avec succès"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleUserStatus(User $user): JsonResponse
    {
        try {
            $user->update([
                'is_active' => !$user->is_active
            ]);

            $status = $user->is_active ? 'activé' : 'désactivé';

            return response()->json([
                'message' => "Utilisateur {$user->full_name} {$status} avec succès",
                'user' => [
                    'id' => $user->id,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'email' => $user->email,
                    'isActive' => (bool) $user->is_active,
                    'updatedAt' => $user->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du changement de statut de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetUserPassword(Request $request, User $user): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'new_password' => 'required|string|min:8|confirmed',
                'send_email' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Données de validation invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $newPassword = $request->input('new_password');
            $sendEmail = $request->boolean('send_email', false);

            $user->update([
                'password' => Hash::make($newPassword),
                'email_verified_at' => null // Force user to verify email again if needed
            ]);

            // TODO: Implement email notification if $sendEmail is true
            // You can add email sending logic here using Laravel's Mail facade

            return response()->json([
                'message' => "Mot de passe de {$user->full_name} réinitialisé avec succès",
                'email_sent' => $sendEmail
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la réinitialisation du mot de passe',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}