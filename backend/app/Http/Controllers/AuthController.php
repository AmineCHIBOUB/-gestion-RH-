<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\ChangePasswordRequest;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
    
        // Vérifier le domaine email

    
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            
            // Load the employee relation
            $user->load('employe');
            
            try {
                // Solution simple : création directe du token dans la base
                $tokenName = 'auth-token';
                $plainTextToken = \Illuminate\Support\Str::random(40);
                $hashedToken = hash('sha256', $plainTextToken);
                
                // Insérer le token directement dans la table
                DB::table('personal_access_tokens')->insert([
                    'tokenable_type' => 'App\\Models\\User',
                    'tokenable_id' => $user->id,
                    'name' => $tokenName,
                    'token' => $hashedToken,
                    'abilities' => json_encode(['*']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                return response()->json([
                    'message' => 'Connexion réussie',
                    'user' => $user,
                    'token' => $plainTextToken,
                    'redirect_path' => $this->getRedirectPath($user->role)
                ]);
            } catch (\Exception $e) {
                Log::error('Token creation error: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Erreur lors de la création du token: ' . $e->getMessage()
                ], 500);
            }
        }
    
        return response()->json([
            'message' => 'Identifiants incorrects'
        ], 401);
    }

    /**
     * Déconnexion de l'utilisateur
     */
    public function logout(Request $request)
    {
        // Supprimer le token actuel
        $request->user()->currentAccessToken()->delete();
    
        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // L'inscription publique crée toujours un employé, les autres rôles sont attribués par un admin
            'role' => 'employe',
        ]);

        try {
            // Solution simple : création directe du token dans la base
            $tokenName = 'auth-token';
            $plainTextToken = \Illuminate\Support\Str::random(40);
            $hashedToken = hash('sha256', $plainTextToken);
            
            // Insérer le token directement dans la table
            DB::table('personal_access_tokens')->insert([
                'tokenable_type' => 'App\\Models\\User',
                'tokenable_id' => $user->id,
                'name' => $tokenName,
                'token' => $hashedToken,
                'abilities' => json_encode(['*']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            return response()->json([
                'message' => 'Inscription réussie',
                'user' => $user,
                'token' => $plainTextToken
            ], 201);
        } catch (\Exception $e) {
            Log::error('Token creation error during registration: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création du token: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les informations de l'utilisateur connecté
     */
    public function user(Request $request)
    {
        return response()->json(Auth::user());
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié.',
                    'status' => 'error'
                ], 401);
            }
            
            $validatedData = $request->validatedWithHashedPassword();
            
            // Utiliser le modèle User directement
            $user = User::findOrFail($userId);
            $user->password = $validatedData['new_password'];
            $user->save();

            return response()->json([
                'message' => 'Mot de passe modifié avec succès',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du changement de mot de passe.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     */
    public function hasRole($role)
    {
        $user = Auth::user();
        return response()->json([
            'hasRole' => $user && $user->role === $role
        ]);
    }

    /**
     * Vérifier si l'utilisateur est manager (admin ou rh)
     */
    public function isManager()
    {
        $user = Auth::user();
        return response()->json([
            'isManager' => $user && in_array($user->role, ['admin', 'rh'])
        ]);
    }

    /**
     * Obtenir les permissions de l'utilisateur
     */
    public function permissions()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $permissions = [];
        
        switch ($user->role) {
            case 'admin':
                $permissions = [
                    'manage_users' => true,
                    'manage_employees' => true,
                    'manage_leaves' => true,
                    'manage_payroll' => true,
                    'view_reports' => true,
                    'manage_settings' => true
                ];
                break;
                
            case 'rh':
                $permissions = [
                    'manage_employees' => true,
                    'manage_leaves' => true,
                    'view_reports' => true,
                    'manage_recruitment' => true
                ];
                break;
                
            case 'employe':
                $permissions = [
                    'view_profile' => true,
                    'request_leave' => true,
                    'view_payslip' => true
                ];
                break;
        }

        return response()->json([
            'role' => $user->role,
            'permissions' => $permissions
        ]);
    }

    /**
     * Obtenir le chemin de redirection basé sur le rôle
     */
    private function getRedirectPath($role)
    {
        switch ($role) {
            case 'admin':
                return '/admin/dashboard';
            case 'rh':
                return '/rh/dashboard';
            case 'employe':
                return '/employe/dashboard';
            default:
                return '/dashboard';
        }
    }
}
