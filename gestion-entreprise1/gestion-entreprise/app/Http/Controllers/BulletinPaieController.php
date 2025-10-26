<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\BulletinPaie;
use App\Models\Employe;
use App\Models\Pointage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf as PDF; // Fix this import

class BulletinPaieController extends Controller
{
    /**
     * Obtenir mes bulletins de paie
     * GET /bulletins/my-bulletins
     */
    public function getMesBulletins(Request $request): JsonResponse
    {
        $user = Auth::user();
        $employe = Employe::where('user_id', $user->id)->first();
        
        if (!$employe) {
            return response()->json(['error' => 'Employé non trouvé'], 404);
        }

        $query = BulletinPaie::where('employe_id', $employe->id)
            ->orderBy('periode', 'desc');

        // Filtres optionnels
        if ($request->has('annee')) {
            $query->whereYear('periode', $request->annee);
        }
        
        if ($request->has('mois')) {
            $query->whereMonth('periode', $request->mois);
        }

        $bulletins = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'bulletins' => $bulletins->items(),
            'total' => $bulletins->total(),
            'current_page' => $bulletins->currentPage(),
            'last_page' => $bulletins->lastPage()
        ]);
    }

    /**
     * Obtenir un bulletin spécifique
     * GET /bulletins/{id}
     */
    public function getBulletin($id): JsonResponse
    {
        $user = Auth::user();
        $employe = Employe::where('user_id', $user->id)->first();
        
        if (!$employe) {
            return response()->json(['error' => 'Employé non trouvé'], 404);
        }

        $bulletin = BulletinPaie::where('id', $id)
            ->where('employe_id', $employe->id)
            ->with(['employe', 'elementsVariables'])
            ->first();

        if (!$bulletin) {
            return response()->json(['error' => 'Bulletin non trouvé'], 404);
        }

        return response()->json($bulletin);
    }

    /**
     * Télécharger un bulletin PDF
     * GET /bulletins/{id}/download
     */
    public function downloadBulletin($id)
    {
        $bulletin = BulletinPaie::where('id', $id)
            ->with(['employe.user', 'employe.post', 'employe.department'])
            ->first();
    
        if (!$bulletin) {
            return response()->json(['error' => 'Bulletin non trouvé'], 404);
        }
    
        // Calculate additional data for PDF
        $salaireBrut = $bulletin->salaire_base + $bulletin->primes + $bulletin->bonus;
        $totalDeductions = $bulletin->deductions;
    
        // Prepare data for PDF
        $data = [
            'bulletin' => $bulletin,
            'employe' => $bulletin->employe,
            'user' => $bulletin->employe->user,
            'post' => $bulletin->employe->post,
            'department' => $bulletin->employe->department,
            'salaire_brut' => $salaireBrut,
            'total_deductions' => $totalDeductions,
            'periode' => [
                'mois' => $bulletin->mois,
                'annee' => $bulletin->annee,
                'mois_nom' => $this->getMoisNom($bulletin->mois)
            ]
        ];
    
        try {
            // Generate PDF using the correct facade
            $pdf = PDF::loadView('bulletins.bulletin-pdf', $data);
            $pdf->setPaper('A4', 'portrait');
            
            $filename = 'bulletin_paie_' . $bulletin->employe->user->nom . '_' . $bulletin->employe->user->prenom . '_' . $bulletin->mois . '_' . $bulletin->annee . '.pdf';
            
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la génération du PDF',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get month name in French
     */
    private function getMoisNom($mois)
    {
        $moisNoms = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        
        return $moisNoms[$mois] ?? 'Inconnu';
    }

    /**
     * Obtenir les statistiques annuelles
     * GET /bulletins/stats-annuelles
     */
    public function getStatsAnnuelles(Request $request): JsonResponse
    {
        $user = Auth::user();
        $employe = Employe::where('user_id', $user->id)->first();
        
        if (!$employe) {
            return response()->json(['error' => 'Employé non trouvé'], 404);
        }

        $annee = $request->get('annee', date('Y'));

        $stats = BulletinPaie::where('employe_id', $employe->id)
            ->whereYear('periode', $annee)
            ->selectRaw('
                COUNT(*) as nombreBulletins,
                SUM(salaire_brut) as totalBrut,
                SUM(salaire_net) as totalNet,
                AVG(salaire_brut) as moyenneBrut,
                AVG(salaire_net) as moyenneNet
            ')
            ->first();

        return response()->json([
            'annee' => $annee,
            'nombreBulletins' => $stats->nombreBulletins ?? 0,
            'totalBrut' => $stats->totalBrut ?? 0,
            'totalNet' => $stats->totalNet ?? 0,
            'moyenneBrut' => $stats->moyenneBrut ?? 0,
            'moyenneNet' => $stats->moyenneNet ?? 0
        ]);
    }

    /**
     * Generate payroll bulletins for all employees
     * POST /bulletins/generate-all
     */
    public function generateBulletinsForAllEmployees(Request $request): JsonResponse
    {
        $request->validate([
            'mois' => 'required|integer|min:1|max:12',
            'annee' => 'required|integer|min:2020|max:' . (date('Y') + 1)
        ]);

        $mois = $request->mois;
        $annee = $request->annee;
        $bulletinsGeneres = [];
        $erreurs = [];

        try {
            DB::beginTransaction();

            // Get all active employees
            $employes = Employe::where('statut', 'actif')
                ->with(['user', 'post', 'department'])
                ->get();

            foreach ($employes as $employe) {
                try {
                    // Check if bulletin already exists for this period
                    $existingBulletin = BulletinPaie::where('employe_id', $employe->id)
                        ->where('mois', $mois)
                        ->where('annee', $annee)
                        ->first();

                    if ($existingBulletin) {
                        $erreurs[] = "Bulletin déjà existant pour {$employe->user->nom} {$employe->user->prenom}";
                        continue;
                    }

                    // Calculate worked hours from pointages
                    $heuresTravaillees = Pointage::where('employe_id', $employe->id)
                        ->whereMonth('date_pointage', $mois)
                        ->whereYear('date_pointage', $annee)
                        ->where('statut', 'present')
                        ->sum('heures_travaillees');

                    // Get base salary (monthly)
                    $salaireBase = $employe->salaire ?? 0;
                    
                    // Calculate hourly rate (assuming 35h/week * 4.33 weeks = 151.67h/month)
                    $heuresStandardMois = 151.67;
                    $tauxHoraire = $salaireBase / $heuresStandardMois;
                    
                    // Calculate gross salary based on actual hours worked
                    $salaireBrut = $heuresTravaillees * $tauxHoraire;
                    
                    // Calculate overtime (hours > 151.67)
                    $heuresSupplementaires = max(0, $heuresTravaillees - $heuresStandardMois);
                    $primeHeuresSupp = $heuresSupplementaires * $tauxHoraire * 0.25; // 25% bonus for overtime
                    
                    // Add overtime premium to gross salary
                    $salaireBrut += $primeHeuresSupp;
                    
                    // Calculate deductions
                    $cotisationsSociales = $salaireBrut * 0.23; // 23% social contributions
                    $impots = $salaireBrut * 0.20; // 20% tax as requested
                    $totalDeductions = $cotisationsSociales + $impots;
                    
                    // Calculate net salary
                    $salaireNet = $salaireBrut - $totalDeductions;

                    // Create bulletin
                    $bulletin = BulletinPaie::create([
                        'employe_id' => $employe->id,
                        'mois' => $mois,
                        'annee' => $annee,
                        'salaire_base' => $salaireBase,
                        'heures_travaillees' => $heuresTravaillees,
                        'primes' => $primeHeuresSupp,
                        'bonus' => 0,
                        'deductions' => $totalDeductions,
                        'cotisations_sociales' => $cotisationsSociales,
                        'impots' => $impots,
                        'salaire_net' => $salaireNet,
                        'statut' => 'genere',
                        'date_generation' => now()
                    ]);

                    $bulletinsGeneres[] = [
                        'employe' => $employe->user->nom . ' ' . $employe->user->prenom,
                        'employe_id' => $employe->id,
                        'bulletin_id' => $bulletin->id,
                        'heures_travaillees' => $heuresTravaillees,
                        'salaire_brut' => round($salaireBrut, 2),
                        'salaire_net' => round($salaireNet, 2),
                        'impots' => round($impots, 2)
                    ];

                } catch (Exception $e) {
                    $erreurs[] = "Erreur pour {$employe->user->nom} {$employe->user->prenom}: " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bulletins de paie générés avec succès',
                'bulletins_generes' => count($bulletinsGeneres),
                'details' => $bulletinsGeneres,
                'erreurs' => $erreurs,
                'periode' => [
                    'mois' => $mois,
                    'annee' => $annee
                ]
            ]);

        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération des bulletins',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download all bulletins for a specific period as ZIP
     * GET /bulletins/download-all/{mois}/{annee}
     */
    public function downloadAllBulletins($mois, $annee)
    {
        try {
            $bulletins = BulletinPaie::where('mois', $mois)
                ->where('annee', $annee)
                ->with(['employe.user', 'employe.post', 'employe.department'])
                ->get();

            if ($bulletins->isEmpty()) {
                return response()->json([
                    'error' => 'Aucun bulletin trouvé pour cette période'
                ], 404);
            }

            // For now, return JSON data. You can implement PDF generation later
            $bulletinsData = $bulletins->map(function ($bulletin) {
                return [
                    'employe' => [
                        'nom' => $bulletin->employe->user->nom,
                        'prenom' => $bulletin->employe->user->prenom,
                        'email' => $bulletin->employe->user->email,
                        'poste' => $bulletin->employe->post->titre ?? 'N/A',
                        'departement' => $bulletin->employe->department->name ?? 'N/A'
                    ],
                    'periode' => [
                        'mois' => $bulletin->mois,
                        'annee' => $bulletin->annee
                    ],
                    'salaire' => [
                        'base' => $bulletin->salaire_base,
                        'heures_travaillees' => $bulletin->heures_travaillees,
                        'primes' => $bulletin->primes,
                        'cotisations_sociales' => $bulletin->cotisations_sociales,
                        'impots' => $bulletin->impots,
                        'salaire_net' => $bulletin->salaire_net
                    ],
                    'date_generation' => $bulletin->date_generation
                ];
            });

            return response()->json([
                'success' => true,
                'bulletins' => $bulletinsData,
                'total' => $bulletins->count(),
                'periode' => [
                    'mois' => $mois,
                    'annee' => $annee
                ]
            ], 200, [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="bulletins_paie_' . $mois . '_' . $annee . '.json"'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all bulletins for admin/HR view
     * GET /bulletins/all
     */
    public function getAllBulletins(Request $request): JsonResponse
    {
        try {
            $query = BulletinPaie::with(['employe.user', 'employe.post', 'employe.department'])
                ->orderBy('date_generation', 'desc');
    
            // Optional filters
            if ($request->has('mois')) {
                $query->where('mois', $request->mois);
            }
            
            if ($request->has('annee')) {
                $query->where('annee', $request->annee);
            }
            
            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
            }
            
            if ($request->has('employe_id')) {
                $query->where('employe_id', $request->employe_id);
            }
    
            $bulletins = $query->paginate($request->get('per_page', 50));
    
            return response()->json([
                'success' => true,
                'data' => $bulletins->items(),
                'total' => $bulletins->total(),
                'current_page' => $bulletins->currentPage(),
                'last_page' => $bulletins->lastPage()
            ]);
    
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des bulletins',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
