<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Annonce;
use App\Models\Employe;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreAnnonceRequest;
use App\Http\Requests\UpdateAnnonceRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnnonceController extends Controller
{
    /**
     * Afficher la liste des annonces
     */
    public function index(Request $request)
    {
        $query = Annonce::with(['auteur', 'employes']);

        // Filtres
        if ($request->has('type_annonce') && $request->type_annonce) {
            $query->where('type_annonce', $request->type_annonce);
        }

        if ($request->has('priorite') && $request->priorite) {
            $query->where('priorite', $request->priorite);
        }

        if ($request->has('visible')) {
            $query->where('visible', $request->boolean('visible'));
        }

        if ($request->has('active')) {
            $now = now();
            if ($request->boolean('active')) {
                $query->where('date_publication', '<=', $now)
                      ->where(function($q) use ($now) {
                          $q->whereNull('date_expiration')
                            ->orWhere('date_expiration', '>', $now);
                      });
            }
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                  ->orWhere('contenu', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $annonces = $query->orderBy('priorite', 'desc')
                         ->orderBy('date_publication', 'desc')
                         ->paginate($perPage);

        return response()->json($annonces);
    }

    /**
     * Afficher les annonces pour l'employé connecté
     */
    public function mesAnnonces()
    {
        $user = Auth::user();
        $employe = $user->employe;
        
        if (!$employe) {
            return response()->json([
                'message' => 'Aucun profil employé trouvé.',
                'annonces' => []
            ]);
        }

        $now = now();
        
        // Annonces visibles et actives
        $annonces = Annonce::where('visible', true)
            ->where('date_publication', '<=', $now)
            ->where(function($q) use ($now) {
                $q->whereNull('date_expiration')
                  ->orWhere('date_expiration', '>', $now);
            })
            ->where(function($q) use ($employe) {
                // Annonces générales ou spécifiquement assignées
                $q->whereDoesntHave('employes')
                  ->orWhereHas('employes', function($subQ) use ($employe) {
                      $subQ->where('employe_id', $employe->id);
                  })
                  ->orWhereJsonContains('departements', $employe->departement);
            })
            ->with(['auteur'])
            ->orderBy('priorite', 'desc')
            ->orderBy('date_publication', 'desc')
            ->get();

        return response()->json([
            'annonces' => $annonces,
            'employe' => $employe
        ]);
    }

    /**
     * Créer une nouvelle annonce
     */
    public function store(StoreAnnonceRequest $request)
    {
        try {
            $validatedData = $request->validated();
            
            // Définir la date de publication si non spécifiée
            if (!isset($validatedData['date_publication'])) {
                $validatedData['date_publication'] = now();
            }
            
            $validatedData['auteur_id'] = Auth::id();
            $validatedData['visible'] = $validatedData['visible'] ?? true;
            
            $annonce = Annonce::create($validatedData);

            // Associer aux employés si spécifiés
            if (isset($validatedData['employes']) && is_array($validatedData['employes'])) {
                $annonce->employes()->attach($validatedData['employes'], [
                    'date_assignation' => now(),
                    'lu' => false
                ]);
            }

            // Envoyer des notifications si demandé
            if ($validatedData['envoyer_notification'] ?? false) {
                $this->envoyerNotifications($annonce);
            }

            return response()->json([
                'message' => 'Annonce créée avec succès.',
                'annonce' => $annonce->load(['auteur', 'employes']),
                'status' => 'success'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de l\'annonce.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Afficher une annonce spécifique
     */
    public function show($id)
    {
        $annonce = Annonce::with(['auteur', 'employes'])->findOrFail($id);
        
        return response()->json($annonce);
    }

    /**
     * Mettre à jour une annonce
     */
    public function update(UpdateAnnonceRequest $request, $id)
    {
        try {
            $annonce = Annonce::findOrFail($id);
            $validatedData = $request->validated();

            $annonce->update($validatedData);

            // Mettre à jour les associations employés si spécifiées
            if (isset($validatedData['employes'])) {
                $annonce->employes()->detach();
                if (is_array($validatedData['employes'])) {
                    $annonce->employes()->attach($validatedData['employes'], [
                        'date_assignation' => now(),
                        'lu' => false
                    ]);
                }
            }

            // Envoyer des notifications si demandé
            if ($validatedData['envoyer_notification'] ?? false) {
                $this->envoyerNotifications($annonce);
            }

            return response()->json([
                'message' => 'Annonce mise à jour avec succès.',
                'annonce' => $annonce->load(['auteur', 'employes']),
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'annonce.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Supprimer une annonce
     */
    public function destroy($id)
    {
        try {
            $annonce = Annonce::findOrFail($id);

            // Supprimer les associations
            $annonce->employes()->detach();
            
            $annonce->delete();

            return response()->json([
                'message' => 'Annonce supprimée avec succès.',
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'annonce.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Publier une annonce
     */
    public function publier($id)
    {
        try {
            $annonce = Annonce::findOrFail($id);
            
            $annonce->update([
                'visible' => true,
                'date_publication' => now()
            ]);

            // Envoyer des notifications
            $this->envoyerNotifications($annonce);

            return response()->json([
                'message' => 'Annonce publiée avec succès.',
                'annonce' => $annonce->load(['auteur', 'employes']),
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la publication de l\'annonce.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Dépublier une annonce
     */
    public function depublier($id)
    {
        try {
            $annonce = Annonce::findOrFail($id);
            
            $annonce->update(['visible' => false]);

            return response()->json([
                'message' => 'Annonce dépubliée avec succès.',
                'annonce' => $annonce->load(['auteur', 'employes']),
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la dépublication de l\'annonce.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Marquer une annonce comme lue par un employé
     */
    public function marquerCommeLue($annonceId)
    {
        try {
            $user = Auth::user();
            $employe = $user->employe;
            
            if (!$employe) {
                return response()->json([
                    'message' => 'Aucun profil employé trouvé.',
                    'status' => 'error'
                ], 404);
            }

            $annonce = Annonce::findOrFail($annonceId);
            
            // Vérifier si l'employé a accès à cette annonce
            $hasAccess = $annonce->employes()->where('employe_id', $employe->id)->exists() ||
                        !$annonce->employes()->exists() ||
                        in_array($employe->departement, $annonce->departements ?? []);
            
            if (!$hasAccess) {
                return response()->json([
                    'message' => 'Accès non autorisé à cette annonce.',
                    'status' => 'error'
                ], 403);
            }

            // Marquer comme lue si assignée spécifiquement
            if ($annonce->employes()->where('employe_id', $employe->id)->exists()) {
                $annonce->employes()->updateExistingPivot($employe->id, [
                    'lu' => true,
                    'date_lecture' => now()
                ]);
            }

            return response()->json([
                'message' => 'Annonce marquée comme lue.',
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Assigner une annonce à des employés
     */
    public function assignerEmployes(Request $request, $annonceId)
    {
        $request->validate([
            'employes' => 'required|array',
            'employes.*' => 'exists:employes,id'
        ]);

        try {
            $annonce = Annonce::findOrFail($annonceId);
            
            $annonce->employes()->attach($request->employes, [
                'date_assignation' => now(),
                'lu' => false
            ]);

            return response()->json([
                'message' => 'Annonce assignée aux employés avec succès.',
                'annonce' => $annonce->load(['auteur', 'employes']),
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'assignation.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Retirer l'assignation d'une annonce à des employés
     */
    public function retirerEmployes(Request $request, $annonceId)
    {
        $request->validate([
            'employes' => 'required|array',
            'employes.*' => 'exists:employes,id'
        ]);

        try {
            $annonce = Annonce::findOrFail($annonceId);
            
            $annonce->employes()->detach($request->employes);

            return response()->json([
                'message' => 'Assignation retirée avec succès.',
                'annonce' => $annonce->load(['auteur', 'employes']),
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du retrait de l\'assignation.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des annonces
     */
    public function statistiques()
    {
        $now = now();
        
        $stats = [
            'total_annonces' => Annonce::count(),
            'annonces_actives' => Annonce::where('visible', true)
                ->where('date_publication', '<=', $now)
                ->where(function($q) use ($now) {
                    $q->whereNull('date_expiration')
                      ->orWhere('date_expiration', '>', $now);
                })->count(),
            'annonces_expirees' => Annonce::where('date_expiration', '<', $now)->count(),
            'annonces_par_type' => Annonce::selectRaw('type_annonce, COUNT(*) as count')
                ->groupBy('type_annonce')
                ->get(),
            'annonces_par_priorite' => Annonce::selectRaw('priorite, COUNT(*) as count')
                ->groupBy('priorite')
                ->get(),
            'taux_lecture' => $this->calculerTauxLecture()
        ];

        return response()->json($stats);
    }

    /**
     * Envoyer des notifications pour une annonce
     */
    private function envoyerNotifications($annonce)
    {
        // Logique d'envoi de notifications
        // À implémenter selon le système de notifications choisi
    }

    /**
     * Calculer le taux de lecture des annonces
     */
    private function calculerTauxLecture()
    {
        $totalAssignations = DB::table('annonce_employe')->count();
        $assignationsLues = DB::table('annonce_employe')->where('lu', true)->count();
        
        return $totalAssignations > 0 ? round(($assignationsLues / $totalAssignations) * 100, 2) : 0;
    }
}