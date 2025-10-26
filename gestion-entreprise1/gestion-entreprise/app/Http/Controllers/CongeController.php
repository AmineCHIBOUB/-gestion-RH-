<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conge;
use App\Models\Employe;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Http\Requests\StoreCongeRequest;
use App\Http\Requests\UpdateCongeRequest;

class CongeController extends Controller
{
    /**
     * Afficher la liste des congés
     */
    public function index()
    {
        $conges = Conge::with(['employe', 'approbateur'])->orderBy('created_at', 'desc')->get();
        return response()->json($conges);
    }

    /**
     * Afficher le formulaire de création d'un congé
     */
    public function create()
    {
        $employes = Employe::with('user')->where('statut', 'actif')->get();
        return response()->json([
            'employes' => $employes,
            'types_conge' => ['conges_payes', 'maladie', 'maternite', 'paternite', 'sans_solde', 'formation'],
            'statuts' => ['en_attente', 'approuve', 'refuse']
        ]);
    }

    /**
     * Créer une nouvelle demande de congé
     */
    public function store(StoreCongeRequest $request)
    {
        try {
            $validatedData = $request->validatedWithCalculations();
            
            $conge = Conge::create($validatedData);
        } catch (\Exception $e) {
            // For debugging - show the actual error
            return response()->json([
                'message' => 'Erreur lors de la création de la demande de congé.',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'status' => 'error'
            ], 500);
        }
    
        return response()->json([
            'message' => 'Demande de congé créée avec succès',
            'conge' => $conge->load(['employe', 'approbateur'])
        ], 201);
    }

    /**
     * Afficher un congé spécifique
     */
    public function show(string $id)
    {
        $conge = Conge::with(['employe', 'approbateur'])->findOrFail($id);
        return response()->json($conge);
    }

    /**
     * Afficher le formulaire d'édition d'un congé
     */
    public function edit(string $id)
    {
        $conge = Conge::with(['employe', 'approbateur'])->findOrFail($id);
        $employes = Employe::with('user')->where('statut', 'actif')->get();
        
        return response()->json([
            'conge' => $conge,
            'employes' => $employes,
            'types_conge' => ['conges_payes', 'maladie', 'maternite', 'paternite', 'sans_solde', 'formation'],
            'statuts' => ['en_attente', 'approuve', 'refuse']
        ]);
    }

    /**
     * Mettre à jour un congé
     */
    public function update(UpdateCongeRequest $request, string $id)
    {
        try {
            $conge = Conge::findOrFail($id);
            
            $validatedData = $request->validatedWithCalculations();
            
            $conge->update($validatedData);
            
            return response()->json([
                'message' => 'Congé mis à jour avec succès',
                'conge' => $conge->load(['employe', 'approbateur'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Congé non trouvé.',
                'error' => 'Le congé demandé n\'existe pas.',
                'status' => 'error'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du congé.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Supprimer un congé
     */
    public function destroy(string $id)
    {
        $conge = Conge::findOrFail($id);
        $conge->delete();

        return response()->json([
            'message' => 'Congé supprimé avec succès'
        ]);
    }

    /**
     * Approuver un congé
     */
    public function approve(string $id)
    {
        $conge = Conge::findOrFail($id);
        
        $conge->update([
            'statut' => 'approuve',
            'approuve_par' => Auth::id()
        ]);

        return response()->json([
            'message' => 'Congé approuvé avec succès',
            'conge' => $conge->load(['employe', 'approbateur'])
        ]);
    }

    /**
     * Refuser un congé
     */
    public function reject(string $id)
    {
        $conge = Conge::findOrFail($id);
        
        $conge->update([
            'statut' => 'refuse',
            'approuve_par' => Auth::id()
        ]);

        return response()->json([
            'message' => 'Congé refusé',
            'conge' => $conge->load(['employe', 'approbateur'])
        ]);
    }

    /**
     * Obtenir mes congés (employé connecté)
     */
public function myConges() 
{ 
    $user = Auth::user(); 
    $employe = $user->employe; 
    
    if (!$employe) { 
        return response()->json([ 
            'message' => 'Aucun profil employé trouvé pour cet utilisateur' 
        ], 404); 
    } 
    
    $conges = Conge::with('approbateur') 
        ->where('employe_id', $employe->id) 
        ->orderBy('created_at', 'desc') 
        ->get(); 
        
    // ✅ Return with 'conges' wrapper
    return response()->json([
        'conges' => $conges,
        'total' => $conges->count()
    ]); 
}

    /**
     * Obtenir mon solde de congés (employé connecté)
     */
    public function myBalance()
    {
        $user = Auth::user();
        $employe = $user->employe;
        
        if (!$employe) {
            return response()->json([
                'message' => 'Aucun profil employé trouvé pour cet utilisateur'
            ], 404);
        }
        
        // Calculer le solde de congés
        $soldeInitial = 25; // 25 jours par défaut par an
        $congesApprouves = Conge::where('employe_id', $employe->id)
            ->where('statut', 'approuve')
            ->whereYear('date_debut', date('Y'))
            ->sum('nombre_jours');
            
        $congesEnAttente = Conge::where('employe_id', $employe->id)
            ->where('statut', 'en_attente')
            ->whereYear('date_debut', date('Y'))
            ->sum('nombre_jours');
        
        $soldeRestant = $soldeInitial - $congesApprouves;
        
        return response()->json([
            'solde_initial' => $soldeInitial,
            'conges_pris' => $congesApprouves,
            'conges_en_attente' => $congesEnAttente,
            'solde_restant' => $soldeRestant
        ]);
    }

    /**
     * Obtenir les congés en attente d'approbation
     */
    public function pending()
    {
        $conges = Conge::with(['employe', 'approbateur'])
            ->where('statut', 'en_attente')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($conges);
    }
}
