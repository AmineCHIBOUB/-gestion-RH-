<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
// use Maatwebsite\Excel\Facades\Excel; // Temporairement commenté
// use Maatwebsite\Excel\Concerns\FromCollection; // Temporairement commenté
// use Maatwebsite\Excel\Concerns\WithHeadings; // Temporairement commenté
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use App\Models\Paie;
use App\Models\BulletinPaie;
use App\Models\ElementVariable;
use App\Models\Employe;
use App\Models\Pointage;
use Carbon\Carbon;

class PaieController extends Controller
{
    /**
     * Liste des bulletins de paie
     */
    public function index(Request $request): JsonResponse
    {
        $query = BulletinPaie::with(['employe.user', 'elementsVariables']);
        
        if ($request->employe_id) {
            $query->where('employe_id', $request->employe_id);
        }
        
        if ($request->mois) {
            $query->where('mois', $request->mois);
        }
        
        if ($request->annee) {
            $query->where('annee', $request->annee);
        }
        
        if ($request->statut) {
            $query->where('statut', $request->statut);
        }
        
        $bulletins = $query->orderBy('annee', 'desc')
                          ->orderBy('mois', 'desc')
                          ->paginate($request->per_page ?? 20);
        
        return response()->json($bulletins);
    }
    
    /**
     * Liste des éléments de paie avec filtres (alias pour index)
     */
    public function getElementsPaie(Request $request): JsonResponse
    {
        return $this->index($request);
    }
    
    /**
     * Détail d'un élément de paie
     */
    public function getElementPaie($id): JsonResponse
    {
        $element = BulletinPaie::with(['employe.user', 'elementsVariables'])
                              ->findOrFail($id);
        
        return response()->json(['data' => $element]);
    }
    
    /**
     * Créer un élément de paie
     */
    public function createElementPaie(Request $request): JsonResponse
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'mois' => 'required|integer|between:1,12',
            'annee' => 'required|integer|min:2020',
            'salaire_base' => 'required|numeric|min:0'
        ]);
        
        $employe = Employe::findOrFail($request->employe_id);
        $bulletin = $this->calculerBulletinPaie($employe, $request->mois, $request->annee);
        
        $bulletinSauve = BulletinPaie::create(array_merge($bulletin, $request->only([
            'salaire_base', 'primes', 'bonus', 'deductions'
        ])));
        
        return response()->json([
            'data' => $bulletinSauve->load(['employe.user', 'elementsVariables']),
            'message' => 'Élément de paie créé avec succès'
        ]);
    }
    
    /**
     * Modifier un élément de paie
     */
    public function updateElementPaie(Request $request, $id): JsonResponse
    {
        $bulletin = BulletinPaie::findOrFail($id);
        
        $request->validate([
            'salaire_base' => 'sometimes|numeric|min:0',
            'primes' => 'sometimes|numeric|min:0',
            'bonus' => 'sometimes|numeric|min:0',
            'deductions' => 'sometimes|numeric|min:0',
            'statut' => 'sometimes|in:brouillon,genere,valide,paye'
        ]);
        
        $bulletin->update($request->all());
        
        // Recalculer le salaire net si nécessaire
        if ($request->has(['salaire_base', 'primes', 'bonus', 'deductions'])) {
            $salaireNet = $bulletin->salaire_base + $bulletin->primes + $bulletin->bonus 
                         - $bulletin->deductions - $bulletin->cotisations_sociales - $bulletin->impots;
            $bulletin->update(['salaire_net' => $salaireNet]);
        }
        
        return response()->json([
            'data' => $bulletin->load(['employe.user', 'elementsVariables']),
            'message' => 'Élément de paie modifié avec succès'
        ]);
    }
    
    /**
     * Calculer un élément de paie
     */
    public function calculerElementPaie($id): JsonResponse
    {
        $bulletin = BulletinPaie::findOrFail($id);
        $employe = $bulletin->employe;
        
        $nouveauCalcul = $this->calculerBulletinPaie($employe, $bulletin->mois, $bulletin->annee);
        $bulletin->update($nouveauCalcul);
        
        return response()->json([
            'data' => $bulletin->load(['employe.user', 'elementsVariables']),
            'message' => 'Élément de paie recalculé avec succès'
        ]);
    }
    
    /**
     * Valider une paie
     */
    public function validerPaie($id): JsonResponse
    {
        $bulletin = BulletinPaie::findOrFail($id);
        $bulletin->update([
            'statut' => 'valide',
            'date_validation' => now()
        ]);
        
        return response()->json([
            'data' => $bulletin->load(['employe.user', 'elementsVariables']),
            'message' => 'Paie validée avec succès'
        ]);
    }
    
    /**
     * Générer un bulletin (temporairement sans PDF)
     */
    public function genererBulletin($id)
    {
        $bulletin = BulletinPaie::with(['employe.user', 'elementsVariables'])
                               ->findOrFail($id);
        
        // Pour l'instant, retourner les données JSON
        // TODO: Implémenter la génération PDF plus tard
        return response()->json([
            'data' => $bulletin,
            'message' => 'Données du bulletin récupérées (PDF à implémenter)'
        ]);
    }
    
    /**
     * Export de paie
     */
    public function exportPaie(Request $request)
    {
        $request->validate([
            'periode' => 'required|string',
            'format' => 'required|in:excel,pdf'
        ]);
        
        [$mois, $annee] = explode('/', $request->periode);
        
        $bulletins = BulletinPaie::with(['employe.user'])
                                ->where('mois', $mois)
                                ->where('annee', $annee)
                                ->get();
        
        // Pour l'instant, retourner les données JSON
        return response()->json([
            'data' => $bulletins,
            'message' => 'Export ' . $request->format . ' à implémenter'
        ]);
    }
    
    /**
     * Préparer paie en masse
     */
    public function preparerPaieMasse(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'required|string'
        ]);
        
        [$mois, $annee] = explode('/', $request->periode);
        
        $query = Employe::where('statut', 'actif');
        
        if ($request->departement) {
            $query->where('departement_id', $request->departement);
        }
        
        $employes = $query->get();
        $resultats = [];
        
        foreach ($employes as $employe) {
            $bulletin = $this->calculerBulletinPaie($employe, $mois, $annee);
            $bulletinSauve = BulletinPaie::create($bulletin);
            $resultats[] = $bulletinSauve;
        }
        
        return response()->json([
            'data' => $resultats,
            'message' => 'Préparation de paie en masse terminée',
            'total' => count($resultats)
        ]);
    }
    
    /**
     * Préparer la paie pour une période (méthode originale)
     */
    public function preparerPaie(Request $request): JsonResponse
    {
        $request->validate([
            'mois' => 'required|integer|between:1,12',
            'annee' => 'required|integer|min:2020',
            'employe_ids' => 'array',
            'employe_ids.*' => 'exists:employes,id'
        ]);
        
        $employes = Employe::with(['pointages', 'conges'])
                          ->when($request->employe_ids, function($query) use ($request) {
                              return $query->whereIn('id', $request->employe_ids);
                          })
                          ->where('statut', 'actif')
                          ->get();
        
        $resultats = [];
        
        foreach ($employes as $employe) {
            $bulletin = $this->calculerBulletinPaie($employe, $request->mois, $request->annee);
            $resultats[] = $bulletin;
        }
        
        return response()->json([
            'data' => $resultats,
            'periode' => $request->mois . '/' . $request->annee,
            'total_employes' => count($resultats)
        ]);
    }
    
    /**
     * Générer un bulletin de paie
     */
    public function genererBulletinPaie(Request $request): JsonResponse
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'mois' => 'required|integer|between:1,12',
            'annee' => 'required|integer|min:2020'
        ]);
        
        $employe = Employe::findOrFail($request->employe_id);
        $bulletin = $this->calculerBulletinPaie($employe, $request->mois, $request->annee);
        
        // Sauvegarder le bulletin
        $bulletinSauve = BulletinPaie::create($bulletin);
        
        return response()->json([
            'data' => $bulletinSauve->load(['employe.user', 'elementsVariables']),
            'message' => 'Bulletin de paie généré avec succès'
        ]);
    }
    
    /**
     * Éléments variables de paie
     */
    public function elementsVariables(Request $request): JsonResponse
    {
        $query = ElementVariable::with('employe.user');
        
        if ($request->employe_id) {
            $query->where('employe_id', $request->employe_id);
        }
        
        if ($request->type) {
            $query->where('type', $request->type);
        }
        
        if ($request->periode) {
            $query->where('periode', $request->periode);
        }
        
        $elements = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return response()->json($elements);
    }
    
    /**
     * CRUD Éléments Variables
     */
    public function getElementsVariables(Request $request): JsonResponse
    {
        $query = ElementVariable::with(['employe.user']);
        
        // Filtres
        if ($request->filled('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('periode')) {
            $query->where('periode', $request->periode);
        }
        
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        
        $elements = $query->orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 15));
        
        return response()->json($elements);
    }
    
    // Ligne 630-650 environ - Remplacer par :
    public function exportElementsVariables(Request $request)
    {
        $query = ElementVariable::with(['employe.user']);
        
        // Appliquer les mêmes filtres
        if ($request->filled('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('periode')) {
            $query->where('periode', $request->periode);
        }
        
        $elements = $query->get();
        
        // Retourner JSON au lieu d'Excel
        return response()->json([
            'message' => 'Export Excel temporairement désactivé - données en JSON',
            'data' => $elements,
            'filename' => 'elements_variables_' . date('Y-m-d_H-i-s') . '.json'
        ]);
    }
    
    /**
     * Gestion des exports
     */
    public function getExportHistory(): JsonResponse
    {
        // Simuler un historique d'exports (à adapter selon votre système)
        $exports = [
            [
                'id' => 1,
                'type' => 'paie',
                'periode' => date('m/Y'),
                'format' => 'excel',
                'statut' => 'termine',
                'created_at' => now()->subDays(2),
                'filename' => 'paie_' . date('m_Y') . '.xlsx'
            ],
            [
                'id' => 2,
                'type' => 'elements_variables',
                'periode' => date('m/Y'),
                'format' => 'excel',
                'statut' => 'termine',
                'created_at' => now()->subDays(5),
                'filename' => 'elements_variables_' . date('m_Y') . '.xlsx'
            ]
        ];
        
        return response()->json($exports);
    }
    
    public function exporterPaie(Request $request): HttpResponse
    {
        $request->validate([
            'periode' => 'required|string',
            'format' => 'required|in:excel,pdf',
            'employes' => 'array',
            'departement' => 'nullable|string'
        ]);
        
        $query = BulletinPaie::with(['employe.user', 'employe.departement']);
        
        // Filtrer par période
        [$mois, $annee] = explode('/', $request->periode);
        $query->where('mois', $mois)->where('annee', $annee);
        
        // Filtrer par employés spécifiques
        if ($request->filled('employes')) {
            $query->whereIn('employe_id', $request->employes);
        }
        
        // Filtrer par département
        if ($request->filled('departement')) {
            $query->whereHas('employe', function($q) use ($request) {
                $q->where('departement', $request->departement);
            });
        }
        
        $bulletins = $query->get();
        
        if ($request->format === 'excel') {
            // Export Excel temporairement désactivé
            return response()->json([
                'message' => 'Export Excel temporairement désactivé - données en JSON',
                'data' => $bulletins->map(function ($bulletin) {
                    return [
                        'Employé' => $bulletin->employe->user->nom . ' ' . $bulletin->employe->user->prenom,
                        'Département' => $bulletin->employe->departement,
                        'Période' => $bulletin->mois . '/' . $bulletin->annee,
                        'Salaire Base' => $bulletin->salaire_base,
                        'Primes' => $bulletin->primes,
                        'Bonus' => $bulletin->bonus,
                        'Déductions' => $bulletin->deductions,
                        'Cotisations' => $bulletin->cotisations,
                        'Impôts' => $bulletin->impots,
                        'Salaire Net' => $bulletin->salaire_net,
                        'Statut' => $bulletin->statut
                    ];
                }),
                'filename' => 'paie_' . str_replace('/', '_', $request->periode) . '.json'
            ]);
        }
        
        // Pour PDF, retourner une réponse temporaire
        return response()->json(['message' => 'Export PDF en cours de développement']);
    }
    
    public function previewExport(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'required|string',
            'employes' => 'array',
            'departement' => 'nullable|string'
        ]);
        
        $query = BulletinPaie::with(['employe.user']);
        
        [$mois, $annee] = explode('/', $request->periode);
        $query->where('mois', $mois)->where('annee', $annee);
        
        if ($request->filled('employes')) {
            $query->whereIn('employe_id', $request->employes);
        }
        
        if ($request->filled('departement')) {
            $query->whereHas('employe', function($q) use ($request) {
                $q->where('departement', $request->departement);
            });
        }
        
        $count = $query->count();
        $totalSalaires = $query->sum('salaire_net');
        
        return response()->json([
            'nombre_bulletins' => $count,
            'total_salaires' => $totalSalaires,
            'periode' => $request->periode
        ]);
    }
    
    public function retelechargerExport($exportId): HttpResponse
    {
        // Simuler le téléchargement d'un export existant
        // À adapter selon votre système de stockage des exports
        $filename = 'export_' . $exportId . '.xlsx';
        $path = storage_path('app/exports/' . $filename);
        
        if (!file_exists($path)) {
            abort(404, 'Fichier d\'export non trouvé');
        }
        
        return response()->download($path);
    }
    
    public function exportCalculsPaie(Request $request): HttpResponse
    {
        $query = BulletinPaie::with(['employe.user']);
        
        // Appliquer les filtres
        if ($request->filled('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }
        
        if ($request->filled('mois')) {
            $query->where('mois', $request->mois);
        }
        
        if ($request->filled('annee')) {
            $query->where('annee', $request->annee);
        }
        
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        
        $calculs = $query->get();
        
        // Retourner JSON au lieu d'Excel
        return response()->json([
            'message' => 'Export Excel temporairement désactivé - données en JSON',
            'data' => $calculs,
            'filename' => 'calculs_paie_' . date('Y-m-d_H-i-s') . '.json'
        ]);
    }
    
    /**
     * Méthodes pour la préparation de paie
     */
    public function getPreparationPaie(Request $request): JsonResponse
    {
        $query = Employe::with(['user', 'bulletinsPaie' => function($q) use ($request) {
            if ($request->filled('periode')) {
                [$mois, $annee] = explode('/', $request->periode);
                $q->where('mois', $mois)->where('annee', $annee);
            }
        }])->where('statut', 'actif');
        
        if ($request->filled('departement')) {
            $query->where('departement', $request->departement);
        }
        
        $employes = $query->get();
        
        $preparation = $employes->map(function($employe) use ($request) {
            $bulletin = $employe->bulletinsPaie->first();
            
            return [
                'employe_id' => $employe->id,
                'nom_complet' => $employe->user->nom . ' ' . $employe->user->prenom,
                'departement' => $employe->departement,
                'salaire_base' => $employe->salaire,
                'statut_preparation' => $bulletin ? $bulletin->statut : 'non_prepare',
                'salaire_net' => $bulletin ? $bulletin->salaire_net : null,
                'date_calcul' => $bulletin ? $bulletin->created_at : null
            ];
        });
        
        return response()->json($preparation);
    }
    
    public function getStatistiquesPreparation(Request $request): JsonResponse
    {
        $periode = $request->get('periode', date('m/Y'));
        [$mois, $annee] = explode('/', $periode);
        
        $totalEmployes = Employe::where('statut', 'actif')->count();
        $bulletinsGeneres = BulletinPaie::where('mois', $mois)
                                       ->where('annee', $annee)
                                       ->count();
        $bulletinsValides = BulletinPaie::where('mois', $mois)
                                       ->where('annee', $annee)
                                       ->where('statut', 'valide')
                                       ->count();
        
        $totalSalaires = BulletinPaie::where('mois', $mois)
                                    ->where('annee', $annee)
                                    ->sum('salaire_net');
        
        return response()->json([
            'periode' => $periode,
            'total_employes' => $totalEmployes,
            'bulletins_generes' => $bulletinsGeneres,
            'bulletins_valides' => $bulletinsValides,
            'pourcentage_completion' => $totalEmployes > 0 ? round(($bulletinsGeneres / $totalEmployes) * 100, 2) : 0,
            'pourcentage_validation' => $bulletinsGeneres > 0 ? round(($bulletinsValides / $bulletinsGeneres) * 100, 2) : 0,
            'total_salaires' => $totalSalaires
        ]);
    }
    
    public function getEtapesPreparation(Request $request): JsonResponse
    {
        $periode = $request->get('periode', date('m/Y'));
        
        $etapes = [
            [
                'id' => 1,
                'nom' => 'Collecte des données',
                'description' => 'Récupération des heures travaillées et éléments variables',
                'statut' => 'termine',
                'pourcentage' => 100
            ],
            [
                'id' => 2,
                'nom' => 'Calcul des paies',
                'description' => 'Calcul automatique des bulletins de paie',
                'statut' => 'en_cours',
                'pourcentage' => 75
            ],
            [
                'id' => 3,
                'nom' => 'Validation RH',
                'description' => 'Validation des calculs par les RH',
                'statut' => 'en_attente',
                'pourcentage' => 0
            ],
            [
                'id' => 4,
                'nom' => 'Génération des bulletins',
                'description' => 'Génération des bulletins PDF finaux',
                'statut' => 'en_attente',
                'pourcentage' => 0
            ]
        ];
        
        return response()->json($etapes);
    }
    
    public function calculerPaieEmploye(Request $request): JsonResponse
    {
        $request->validate([
            'employeId' => 'required|exists:employes,id',
            'periode' => 'required|string'
        ]);
        
        $employe = Employe::findOrFail($request->employeId);
        [$mois, $annee] = explode('/', $request->periode);
        
        // Vérifier si un bulletin existe déjà
        $bulletinExistant = BulletinPaie::where('employe_id', $employe->id)
                                       ->where('mois', $mois)
                                       ->where('annee', $annee)
                                       ->first();
        
        if ($bulletinExistant) {
            // Recalculer
            $nouveauCalcul = $this->calculerBulletinPaie($employe, $mois, $annee);
            $bulletinExistant->update($nouveauCalcul);
            $bulletin = $bulletinExistant;
        } else {
            // Créer nouveau bulletin
            $calcul = $this->calculerBulletinPaie($employe, $mois, $annee);
            $bulletin = BulletinPaie::create($calcul);
        }
        
        return response()->json([
            'data' => $bulletin->load(['employe.user']),
            'message' => 'Paie calculée avec succès pour ' . $employe->user->nom . ' ' . $employe->user->prenom
        ]);
    }
    
    public function calculerPaieTous(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'required|string'
        ]);
        
        [$mois, $annee] = explode('/', $request->periode);
        
        $employes = Employe::where('statut', 'actif')->get();
        $resultats = [];
        $erreurs = [];
        
        foreach ($employes as $employe) {
            try {
                // Vérifier si un bulletin existe déjà
                $bulletinExistant = BulletinPaie::where('employe_id', $employe->id)
                                               ->where('mois', $mois)
                                               ->where('annee', $annee)
                                               ->first();
                
                if ($bulletinExistant) {
                    $nouveauCalcul = $this->calculerBulletinPaie($employe, $mois, $annee);
                    $bulletinExistant->update($nouveauCalcul);
                    $bulletin = $bulletinExistant;
                } else {
                    $calcul = $this->calculerBulletinPaie($employe, $mois, $annee);
                    $bulletin = BulletinPaie::create($calcul);
                }
                
                $resultats[] = [
                    'employe_id' => $employe->id,
                    'nom' => $employe->user->nom . ' ' . $employe->user->prenom,
                    'salaire_net' => $bulletin->salaire_net,
                    'statut' => 'succes'
                ];
            } catch (\Exception $e) {
                $erreurs[] = [
                    'employe_id' => $employe->id,
                    'nom' => $employe->user->nom . ' ' . $employe->user->prenom,
                    'erreur' => $e->getMessage()
                ];
            }
        }
        
        return response()->json([
            'resultats' => $resultats,
            'erreurs' => $erreurs,
            'total_traites' => count($resultats),
            'total_erreurs' => count($erreurs),
            'message' => 'Calcul de paie en masse terminé'
        ]);
    }
    
    public function validerPreparationPaie(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'required|string'
        ]);
        
        [$mois, $annee] = explode('/', $request->periode);
        
        $bulletins = BulletinPaie::where('mois', $mois)
                                 ->where('annee', $annee)
                                 ->where('statut', 'genere')
                                 ->get();
        
        $bulletins->each(function($bulletin) {
            $bulletin->update([
                'statut' => 'valide',
                'date_validation' => now(),
                'validateur_id' => auth()->id()
            ]);
        });
        
        return response()->json([
            'bulletins_valides' => $bulletins->count(),
            'message' => 'Préparation de paie validée avec succès'
        ]);
    }
    
    public function reinitialiserPreparationPaie(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'required|string'
        ]);
        
        [$mois, $annee] = explode('/', $request->periode);
        
        $bulletins = BulletinPaie::where('mois', $mois)
                                 ->where('annee', $annee)
                                 ->where('statut', '!=', 'paye')
                                 ->get();
        
        $bulletins->each(function($bulletin) {
            $bulletin->update([
                'statut' => 'genere',
                'date_validation' => null,
                'validateur_id' => null
            ]);
        });
        
        return response()->json([
            'bulletins_reinitialises' => $bulletins->count(),
            'message' => 'Préparation de paie réinitialisée avec succès'
        ]);
    }

    /**
     * Calculer le bulletin de paie (méthode privée)
     */
    private function calculerBulletinPaie($employe, $mois, $annee)
    {
        // Calcul des heures travaillées
        $heuresTravaillees = $this->calculerHeuresTravaillees($employe->id, $mois, $annee);
        
        // Salaire de base
        $salaireBase = $employe->salaire;
        
        // Éléments variables
        $elementsVariables = ElementVariable::where('employe_id', $employe->id)
                                           ->where('periode', $mois . '/' . $annee)
                                           ->get();
        
        $primes = $elementsVariables->where('type', 'prime')->sum('montant');
        $bonus = $elementsVariables->where('type', 'bonus')->sum('montant');
        $deductions = $elementsVariables->where('type', 'deduction')->sum('montant');
        
        // Calculs sociaux (exemple simplifié)
        $cotisationsSociales = $salaireBase * 0.23; // 23% de cotisations
        $impots = ($salaireBase + $primes + $bonus) * 0.12; // 12% d'impôts
        
        $salaireNet = $salaireBase + $primes + $bonus - $deductions - $cotisationsSociales - $impots;
        
        return [
            'employe_id' => $employe->id,
            'mois' => $mois,
            'annee' => $annee,
            'salaire_base' => $salaireBase,
            'heures_travaillees' => $heuresTravaillees,
            'primes' => $primes,
            'bonus' => $bonus,
            'deductions' => $deductions,
            'cotisations_sociales' => $cotisationsSociales,
            'impots' => $impots,
            'salaire_net' => $salaireNet,
            'statut' => 'genere'
        ];
    }
    
    /**
     * Calculer les heures travaillées
     */
    private function calculerHeuresTravaillees($employeId, $mois, $annee)
    {
        return Pointage::where('employe_id', $employeId)
                      ->whereMonth('date_pointage', $mois)
                      ->whereYear('date_pointage', $annee)
                      ->sum('heures_travaillees');
    }
}