<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employe;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\StoreEmployeRequest;
use App\Http\Requests\UpdateEmployeRequest;

class EmployeController extends Controller
{
    /**
     * Afficher la liste des employés
     */
    public function index()
    {
        $employes = Employe::with('user')->get();
        return response()->json([
            'data' => $employes,
            'status' => 'success',
            'message' => 'Employés récupérés avec succès'
        ]);
    }

    /**
     * Afficher le formulaire de création d'un employé
     */
    public function create()
    {
        // Retourne les données nécessaires pour le formulaire
        return response()->json([
            'postes' => ['Développeur', 'Designer', 'Manager', 'RH', 'Comptable', 'Commercial'],
            'statuts' => ['actif', 'inactif', 'conge']
        ]);
    }

    /**
     * Créer un nouvel employé
     */
    public function store(StoreEmployeRequest $request)
    {
        try {
            // Créer d'abord l'utilisateur
            $user = User::create([
                'name' => $request->user_name,
                'email' => $request->email,
                'last_name' => $request->nom,
                'first_name' => $request->prenom,
                'password' => Hash::make($request->telephone),
                'post_id' => $request->post_id,
                'department_id' => $request->department_id,
                'role' => 'employe'
            ]);
    
            // Créer l'employé avec les bons champs
            $employe = Employe::create([
                'user_id' => $user->id,
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'adresse' => $request->adresse,
                'post_id' => $request->post_id,           // ✅ Use post_id instead of poste
                'department_id' => $request->department_id, // ✅ Add missing department_id
                'salaire' => $request->salaire,
                'date_embauche' => $request->date_embauche,
                'numero_securite_sociale' => $request->numero_securite_sociale,
                'statut' => $request->statut ?? 'actif'
            ]);
        } catch (\Exception $e) {
            // ✅ Better error handling - show actual error in development
            return response()->json([
                'message' => 'Erreur lors de la création de l\'employé.',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur interne s\'est produite.',
                'details' => config('app.debug') ? $e->getTraceAsString() : null,
                'status' => 'error'
            ], 500);
        }
    
        return response()->json([
            'message' => 'Employé créé avec succès',
            'employe' => $employe->load(['user', 'post', 'department']) // ✅ Load relationships
        ], 201);
    }

    /**
     * Afficher un employé spécifique
     */
    public function show(string $id)
    {
        $employe = Employe::with(['user', 'conges', 'pointages', 'fichiers'])->findOrFail($id);
        return response()->json($employe);
    }

    /**
     * Afficher le formulaire d'édition d'un employé
     */
    public function edit(string $id)
    {
        $employe = Employe::with('user')->findOrFail($id);
        return response()->json([
            'employe' => $employe,
            'postes' => ['Développeur', 'Designer', 'Manager', 'RH', 'Comptable', 'Commercial'],
            'statuts' => ['actif', 'inactif', 'conge']
        ]);
    }

    /**
     * Mettre à jour un employé
     */
    public function update(UpdateEmployeRequest $request, string $id)
    {
        try {
            $employe = Employe::findOrFail($id);
            
            $employe->update($request->only([
                'nom', 'prenom', 'email', 'telephone', 'adresse', 
                'poste', 'salaire', 'date_embauche', 'numero_securite_sociale', 'statut'
            ]));

            // Mettre à jour l'utilisateur associé si nécessaire
            if ($employe->user) {
                $userData = [];
                
                if ($request->has('email') && $employe->user->email !== $request->email) {
                    $userData['email'] = $request->email;
                }
                
                if ($request->has('user_name') && $employe->user->name !== $request->user_name) {
                    $userData['name'] = $request->user_name;
                }
                
                if ($request->has('user_password') && $request->user_password) {
                    $userData['password'] = Hash::make($request->user_password);
                }
                
                if (!empty($userData)) {
                    $employe->user->update($userData);
                }
            }

            return response()->json([
                'message' => 'Employé mis à jour avec succès',
                'employe' => $employe->load('user')
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Employé non trouvé.',
                'status' => 'error'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'employé.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Supprimer un employé
     */
    public function destroy(string $id)
    {
        $employe = Employe::findOrFail($id);
        
        // Supprimer l'utilisateur associé (cascade supprimera l'employé)
        if ($employe->user) {
            $employe->user->delete();
        }
        
        $employe->delete();

        return response()->json([
            'message' => 'Employé supprimé avec succès'
        ]);
    }

    /**
     * Rechercher des employés
     */
    public function search(Request $request)
    {
        $query = Employe::with('user');
        
        if ($request->has('nom')) {
            $query->where('nom', 'like', '%' . $request->nom . '%');
        }
        
        if ($request->has('prenom')) {
            $query->where('prenom', 'like', '%' . $request->prenom . '%');
        }
        
        if ($request->has('poste')) {
            $query->where('poste', 'like', '%' . $request->poste . '%');
        }
        
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }
        
        $employes = $query->get();
        return response()->json($employes);
    }
    
    /**
     * Récupérer le profil de l'employé connecté
     */
    public function myProfile()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié.',
                    'status' => 'error'
                ], 401);
            }
            
            $employe = $user->employe;
            
            if (!$employe) {
                return response()->json([
                    'message' => 'Aucun profil employé trouvé.',
                    'status' => 'error'
                ], 404);
            }
            
            // Retourner directement l'employé au lieu du format avec 'data'
            return response()->json($employe->load('user'));
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du profil.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }
    
    /**
     * Mettre à jour le profil de l'employé connecté
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié.',
                    'status' => 'error'
                ], 401);
            }
            
            $employe = $user->employe;
            
            if (!$employe) {
                return response()->json([
                    'message' => 'Aucun profil employé trouvé.',
                    'status' => 'error'
                ], 404);
            }
            
            // Validation des données
            $validatedData = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'prenom' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:employes,email,' . $employe->id,
                'telephone' => 'sometimes|string|max:20',
                'adresse' => 'sometimes|string|max:500',
                'poste' => 'sometimes|string|max:255',
            ]);
            
            // Mettre à jour l'employé
            $employe->update($validatedData);
            
            // Mettre à jour l'utilisateur si nécessaire
            if ($request->has('email') && $employe->user) {
                $employe->user->update([
                    'email' => $request->email
                ]);
            }
            
            return response()->json([
                'data' => $employe->load('user'),
                'status' => 'success',
                'message' => 'Profil mis à jour avec succès'
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Données invalides.',
                'errors' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du profil.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }
}
