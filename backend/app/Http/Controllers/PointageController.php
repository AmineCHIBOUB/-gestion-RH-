<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pointage;
use App\Models\Employe;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StorePointageRequest;
use App\Http\Requests\UpdatePointageRequest;

class PointageController extends Controller
{
    /**
     * Afficher la liste des pointages
     */
    public function index(Request $request)
    {
        $query = Pointage::with('employe.user');
        
        // Filtrer par employé
        if ($request->employe_id) {
            $query->where('employe_id', $request->employe_id);
        }
        
        // Filtrer par date
        if ($request->date_debut) {
            $query->where('date_pointage', '>=', $request->date_debut);
        }
        
        if ($request->date_fin) {
            $query->where('date_pointage', '<=', $request->date_fin);
        }
        
        // Filtrer par statut
        if ($request->statut) {
            $query->where('statut', $request->statut);
        }
        
        $pointages = $query->orderBy('date_pointage', 'desc')
                          ->orderBy('heure_entree', 'desc')
                          ->paginate(20);
        
        return response()->json($pointages);
    }

    /**
     * Afficher le formulaire de création d'un pointage
     */
    public function create()
    {
        $employes = Employe::with('user')->where('statut', 'actif')->get();
        
        return response()->json([
            'employes' => $employes
        ]);
    }

    /**
     * Enregistrer un nouveau pointage
     */
    public function store(StorePointageRequest $request)
    {
        try {
            $validatedData = $request->validatedWithCalculations();
            
            $pointage = Pointage::create($validatedData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du pointage.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
        
        return response()->json([
            'message' => 'Pointage créé avec succès',
            'pointage' => $pointage->load('employe.user')
        ], 201);
    }

    /**
     * Afficher un pointage spécifique
     */
    public function show(string $id)
    {
        $pointage = Pointage::with('employe.user')->findOrFail($id);
        return response()->json($pointage);
    }

    /**
     * Afficher le formulaire d'édition d'un pointage
     */
    public function edit(string $id)
    {
        $pointage = Pointage::with('employe.user')->findOrFail($id);
        $employes = Employe::with('user')->where('statut', 'actif')->get();
        
        return response()->json([
            'pointage' => $pointage,
            'employes' => $employes
        ]);
    }

    /**
     * Mettre à jour un pointage
     */
    public function update(UpdatePointageRequest $request, string $id)
    {
        try {
            $pointage = Pointage::findOrFail($id);
            
            $validatedData = $request->validatedWithCalculations();
            
            $pointage->update($validatedData);
            
            return response()->json([
                'message' => 'Pointage mis à jour avec succès',
                'pointage' => $pointage->load('employe.user')
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Pointage non trouvé.',
                'error' => 'Le pointage demandé n\'existe pas.',
                'status' => 'error'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du pointage.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Supprimer un pointage
     */
    public function destroy(string $id)
    {
        $pointage = Pointage::findOrFail($id);
        $pointage->delete();
        
        return response()->json([
            'message' => 'Pointage supprimé avec succès'
        ]);
    }

    /**
     * Obtenir les pointages d'un employé
     */
    public function getByEmployee(string $employeId, Request $request)
    {
        $query = Pointage::where('employe_id', $employeId);
        
        // Filtrer par période
        if ($request->date_debut) {
            $query->where('date_pointage', '>=', $request->date_debut);
        }
        
        if ($request->date_fin) {
            $query->where('date_pointage', '<=', $request->date_fin);
        }
        
        $pointages = $query->orderBy('date_pointage', 'desc')->get();
        
        return response()->json($pointages);
    }

    /**
     * Pointer l'entrée d'un employé
     */
    public function clockIn(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id'
        ]);
        
        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now()->format('H:i');
        
        // Vérifier qu'il n'y a pas déjà un pointage pour aujourd'hui
        $existingPointage = Pointage::where('employe_id', $request->employe_id)
                                   ->where('date_pointage', $today)
                                   ->first();
        
        if ($existingPointage) {
            return response()->json([
                'message' => 'Pointage déjà effectué pour aujourd\'hui'
            ], 422);
        }
        
        $pointage = Pointage::create([
            'employe_id' => $request->employe_id,
            'date_pointage' => $today,
            'heure_entree' => $now,
            'statut' => 'present'
        ]);
        
        return response()->json([
            'message' => 'Entrée pointée avec succès',
            'pointage' => $pointage->load('employe.user')
        ], 201);
    }

    /**
     * Pointer la sortie d'un employé
     */
    public function clockOut(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id'
        ]);
        
        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now()->format('H:i');
        
        $pointage = Pointage::where('employe_id', $request->employe_id)
                           ->where('date_pointage', $today)
                           ->first();
        
        if (!$pointage) {
            return response()->json([
                'message' => 'Aucun pointage d\'entrée trouvé pour aujourd\'hui'
            ], 422);
        }
        
        if ($pointage->heure_sortie) {
            return response()->json([
                'message' => 'Sortie déjà pointée pour aujourd\'hui'
            ], 422);
        }
        
        // Calculer les heures travaillées
        $entree = Carbon::createFromFormat('H:i', $pointage->heure_entree);
        $sortie = Carbon::createFromFormat('H:i', $now);
        $heuresTravaillees = $sortie->diffInMinutes($entree) / 60;
        
        // Soustraire la pause si elle existe
        if ($pointage->pause_debut && $pointage->pause_fin) {
            $pauseDebut = Carbon::createFromFormat('H:i', $pointage->pause_debut);
            $pauseFin = Carbon::createFromFormat('H:i', $pointage->pause_fin);
            $dureePause = $pauseFin->diffInMinutes($pauseDebut) / 60;
            $heuresTravaillees -= $dureePause;
        }
        
        $pointage->update([
            'heure_sortie' => $now,
            'heures_travaillees' => $heuresTravaillees
        ]);
        
        return response()->json([
            'message' => 'Sortie pointée avec succès',
            'pointage' => $pointage->load('employe.user')
        ]);
    }

    /**
     * Obtenir un rapport de pointage
     */
    public function rapport(Request $request)
    {
        $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'employe_id' => 'nullable|exists:employes,id'
        ]);
        
        $query = Pointage::with('employe.user')
                        ->whereBetween('date_pointage', [$request->date_debut, $request->date_fin]);
        
        if ($request->employe_id) {
            $query->where('employe_id', $request->employe_id);
        }
        
        $pointages = $query->orderBy('date_pointage', 'desc')->get();
        
        // Calculer les statistiques
        $totalHeures = $pointages->sum('heures_travaillees');
        $joursPresents = $pointages->where('statut', 'present')->count();
        $joursAbsents = $pointages->where('statut', 'absent')->count();
        $joursConges = $pointages->where('statut', 'conge')->count();
        $joursMaladie = $pointages->where('statut', 'maladie')->count();
        
        return response()->json([
            'pointages' => $pointages,
            'statistiques' => [
                'total_heures' => round($totalHeures, 2),
                'jours_presents' => $joursPresents,
                'jours_absents' => $joursAbsents,
                'jours_conges' => $joursConges,
                'jours_maladie' => $joursMaladie
            ]
        ]);
    }
}
