<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FeuilleTemps;
use App\Models\SaisieTemps;
use App\Models\Employe;
use App\Models\Projet;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreFeuilleTempsRequest;
use App\Http\Requests\UpdateFeuilleTempsRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
// SUPPRIMER cette ligne qui cause les conflits :
// use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class FeuilleTempsController extends Controller
{
    /**
     * Afficher la liste des feuilles de temps
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = FeuilleTemps::with(['employe.user', 'saisies']);

        // Filtrage par rôle
        if ($user->role === 'employe') {
            $query->where('employe_id', $user->employe->id);
        }

        // Filtres
        if ($request->filled('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('date_debut')) {
            $query->where('date_debut', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_fin', '<=', $request->date_fin);
        }

        if ($request->filled('mois')) {
            $mois = Carbon::parse($request->mois);
            $query->whereMonth('date_debut', $mois->month)
                  ->whereYear('date_debut', $mois->year);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $feuillesTemps = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $feuillesTemps,
            'message' => 'Liste des feuilles de temps récupérée avec succès'
        ]);
    }

    /**
     * Récupérer les feuilles de temps de l'employé connecté
     */
    public function mesFeuilles(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->employe) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil employé associé'
            ], 404);
        }

        $query = FeuilleTemps::with(['saisies'])
                            ->where('employe_id', $user->employe->id);

        // Filtres
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('mois')) {
            $mois = Carbon::parse($request->mois);
            $query->whereMonth('date_debut', $mois->month)
                  ->whereYear('date_debut', $mois->year);
        }

        $feuillesTemps = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $feuillesTemps,
            'message' => 'Vos feuilles de temps récupérées avec succès'
        ]);
    }

    /**
     * Créer une nouvelle feuille de temps
     */
    public function store(StoreFeuilleTempsRequest $request)
    {
        try {
            DB::beginTransaction();

            $feuilleTemps = FeuilleTemps::create([
                'employe_id' => $request->employe_id,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'statut' => $request->statut ?? 'brouillon',
                'commentaire' => $request->commentaire,
                'total_heures_normales' => 0,
                'total_heures_supplementaires' => 0
            ]);

            // Créer les saisies de temps
            $totalNormales = 0;
            $totalSupplementaires = 0;

            foreach ($request->saisies as $saisieData) {
                $saisie = SaisieTemps::create([
                    'feuille_temps_id' => $feuilleTemps->id,
                    'date' => $saisieData['date'],
                    'heures_normales' => $saisieData['heures_normales'],
                    'heures_supplementaires' => $saisieData['heures_supplementaires'] ?? 0,
                    'description' => $saisieData['description'] ?? null,
                    'projet' => $saisieData['projet'] ?? null,
                    'tache' => $saisieData['tache'] ?? null
                ]);

                $totalNormales += $saisie->heures_normales;
                $totalSupplementaires += $saisie->heures_supplementaires;
            }

            // Mettre à jour les totaux
            $feuilleTemps->update([
                'total_heures_normales' => $totalNormales,
                'total_heures_supplementaires' => $totalSupplementaires
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $feuilleTemps->load(['employe.user', 'saisies']),
                'message' => 'Feuille de temps créée avec succès'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la feuille de temps',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une feuille de temps spécifique
     */
    public function show($id)
    {
        $user = auth()->user();
        $feuilleTemps = FeuilleTemps::with(['employe.user', 'saisies'])->find($id);

        if (!$feuilleTemps) {
            return response()->json([
                'success' => false,
                'message' => 'Feuille de temps non trouvée'
            ], 404);
        }

        // Vérifier les autorisations
        if ($user->role === 'employe' && $feuilleTemps->employe_id !== $user->employe->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $feuilleTemps,
            'message' => 'Feuille de temps récupérée avec succès'
        ]);
    }

    /**
     * Mettre à jour une feuille de temps
     */
    public function update(UpdateFeuilleTempsRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $feuilleTemps = FeuilleTemps::find($id);

            if (!$feuilleTemps) {
                return response()->json([
                    'success' => false,
                    'message' => 'Feuille de temps non trouvée'
                ], 404);
            }

            // Mettre à jour les informations de base
            $feuilleTemps->update($request->only([
                'date_debut', 'date_fin', 'statut', 'commentaire'
            ]));

            // Mettre à jour les saisies si fournies
            if ($request->has('saisies')) {
                // Supprimer les anciennes saisies
                $feuilleTemps->saisies()->delete();

                $totalNormales = 0;
                $totalSupplementaires = 0;

                // Créer les nouvelles saisies
                foreach ($request->saisies as $saisieData) {
                    $saisie = SaisieTemps::create([
                        'feuille_temps_id' => $feuilleTemps->id,
                        'date' => $saisieData['date'],
                        'heures_normales' => $saisieData['heures_normales'],
                        'heures_supplementaires' => $saisieData['heures_supplementaires'] ?? 0,
                        'description' => $saisieData['description'] ?? null,
                        'projet' => $saisieData['projet'] ?? null,
                        'tache' => $saisieData['tache'] ?? null
                    ]);

                    $totalNormales += $saisie->heures_normales;
                    $totalSupplementaires += $saisie->heures_supplementaires;
                }

                // Mettre à jour les totaux
                $feuilleTemps->update([
                    'total_heures_normales' => $totalNormales,
                    'total_heures_supplementaires' => $totalSupplementaires
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $feuilleTemps->load(['employe.user', 'saisies']),
                'message' => 'Feuille de temps mise à jour avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la feuille de temps',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une feuille de temps
     */
    public function destroy($id)
    {
        try {
            $feuilleTemps = FeuilleTemps::find($id);

            if (!$feuilleTemps) {
                return response()->json([
                    'success' => false,
                    'message' => 'Feuille de temps non trouvée'
                ], 404);
            }

            $user = auth()->user();

            // Vérifier les autorisations
            if ($user->role === 'employe') {
                if ($feuilleTemps->employe_id !== $user->employe->id || $feuilleTemps->statut !== 'brouillon') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez supprimer que vos propres feuilles en brouillon'
                    ], 403);
                }
            }

            DB::beginTransaction();

            // Supprimer les saisies associées
            $feuilleTemps->saisies()->delete();
            
            // Supprimer la feuille de temps
            $feuilleTemps->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Feuille de temps supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la feuille de temps',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soumettre une feuille de temps pour approbation
     */
    public function soumettre($id)
    {
        $feuilleTemps = FeuilleTemps::find($id);

        if (!$feuilleTemps) {
            return response()->json([
                'success' => false,
                'message' => 'Feuille de temps non trouvée'
            ], 404);
        }

        $user = auth()->user();

        // Vérifier les autorisations
        if ($user->role === 'employe' && $feuilleTemps->employe_id !== $user->employe->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        if ($feuilleTemps->statut !== 'brouillon') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les feuilles en brouillon peuvent être soumises'
            ], 400);
        }

        $feuilleTemps->update(['statut' => 'soumise']);

        return response()->json([
            'success' => true,
            'data' => $feuilleTemps->load(['employe.user', 'saisies']),
            'message' => 'Feuille de temps soumise avec succès'
        ]);
    }

    /**
     * Approuver une feuille de temps
     */
    public function approuver(Request $request, $id)
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'rh'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $feuilleTemps = FeuilleTemps::find($id);

        if (!$feuilleTemps) {
            return response()->json([
                'success' => false,
                'message' => 'Feuille de temps non trouvée'
            ], 404);
        }

        if ($feuilleTemps->statut !== 'soumise') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les feuilles soumises peuvent être approuvées'
            ], 400);
        }

        $feuilleTemps->update([
            'statut' => 'approuvee',
            'commentaire' => $request->commentaire ?? $feuilleTemps->commentaire
        ]);

        return response()->json([
            'success' => true,
            'data' => $feuilleTemps->load(['employe.user', 'saisies']),
            'message' => 'Feuille de temps approuvée avec succès'
        ]);
    }

    /**
     * Rejeter une feuille de temps
     */
    public function rejeter(Request $request, $id)
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'rh'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $request->validate([
            'commentaire' => 'required|string|max:1000'
        ]);

        $feuilleTemps = FeuilleTemps::find($id);

        if (!$feuilleTemps) {
            return response()->json([
                'success' => false,
                'message' => 'Feuille de temps non trouvée'
            ], 404);
        }

        if ($feuilleTemps->statut !== 'soumise') {
            return response()->json([
                'success' => false,
                'message' => 'Seules les feuilles soumises peuvent être rejetées'
            ], 400);
        }

        $feuilleTemps->update([
            'statut' => 'rejetee',
            'commentaire' => $request->commentaire
        ]);

        return response()->json([
            'success' => true,
            'data' => $feuilleTemps->load(['employe.user', 'saisies']),
            'message' => 'Feuille de temps rejetée avec succès'
        ]);
    }

    /**
     * Obtenir les statistiques des feuilles de temps
     */
    public function statistiques(Request $request)
    {
        $user = auth()->user();
        $query = FeuilleTemps::query();

        // Filtrage par rôle
        if ($user->role === 'employe') {
            $query->where('employe_id', $user->employe->id);
        }

        // Filtres de période
        if ($request->filled('date_debut')) {
            $query->where('date_debut', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_fin', '<=', $request->date_fin);
        }

        $statistiques = [
            'total_feuilles' => $query->count(),
            'par_statut' => $query->selectRaw('statut, COUNT(*) as count')
                                 ->groupBy('statut')
                                 ->pluck('count', 'statut'),
            'total_heures_normales' => $query->sum('total_heures_normales'),
            'total_heures_supplementaires' => $query->sum('total_heures_supplementaires'),
            'moyenne_heures_par_feuille' => $query->avg('total_heures_normales')
        ];

        // Statistiques par employé (pour admin/rh)
        if (in_array($user->role, ['admin', 'rh'])) {
            $statistiques['par_employe'] = FeuilleTemps::with('employe.user')
                ->selectRaw('employe_id, COUNT(*) as nb_feuilles, SUM(total_heures_normales) as total_heures')
                ->groupBy('employe_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'employe' => $item->employe->user->nom . ' ' . $item->employe->user->prenom,
                        'nb_feuilles' => $item->nb_feuilles,
                        'total_heures' => $item->total_heures
                    ];
                });
        }

        return response()->json([
            'success' => true,
            'data' => $statistiques,
            'message' => 'Statistiques récupérées avec succès'
        ]);
    }

    /**
     * Exporter les feuilles de temps
     */
    public function exporter(Request $request)
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'rh'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $query = FeuilleTemps::with(['employe.user', 'saisies']);

        // Filtres
        if ($request->filled('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }

        if ($request->filled('date_debut')) {
            $query->where('date_debut', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_fin', '<=', $request->date_fin);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $feuillesTemps = $query->orderBy('date_debut', 'desc')->get();

        // Préparer les données pour l'export
        $donnees = [];
        foreach ($feuillesTemps as $feuille) {
            foreach ($feuille->saisies as $saisie) {
                $donnees[] = [
                    'Employé' => $feuille->employe->user->nom . ' ' . $feuille->employe->user->prenom,
                    'Date' => $saisie->date,
                    'Heures Normales' => $saisie->heures_normales,
                    'Heures Supplémentaires' => $saisie->heures_supplementaires,
                    'Projet' => $saisie->projet,
                    'Tâche' => $saisie->tache,
                    'Description' => $saisie->description,
                    'Statut Feuille' => $feuille->statut,
                    'Période' => $feuille->date_debut . ' - ' . $feuille->date_fin
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $donnees,
            'message' => 'Données exportées avec succès'
        ]);
    }
}