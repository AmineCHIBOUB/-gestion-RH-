<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Employe;
use App\Models\Conge;
use App\Models\Pointage;
use App\Models\BulletinPaie;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Rapport de présence détaillé
     * GET /rh/rapports/presences
     */
    public function rapportPresences(Request $request): JsonResponse
    {
        $dateDebut = $request->get('date_debut', now()->startOfMonth());
        $dateFin = $request->get('date_fin', now()->endOfMonth());
        $departmentId = $request->get('department_id');

        $query = Employe::with(['user', 'department'])
            ->where('statut', 'actif');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $employes = $query->get();

        $rapport = $employes->map(function($employe) use ($dateDebut, $dateFin) {
            $pointages = Pointage::where('employe_id', $employe->id)
                ->whereBetween('date', [$dateDebut, $dateFin])
                ->get();

            $totalJours = $pointages->count();
            $joursPresents = $pointages->where('statut', 'present')->count();
            $joursAbsents = $pointages->where('statut', 'absent')->count();
            $joursRetard = $pointages->where('statut', 'retard')->count();
            $heuresTotal = $pointages->sum('heures_travaillees');

            return [
                'employe_id' => $employe->id,
                'nom' => $employe->user->name,
                'department' => $employe->department->nom ?? 'N/A',
                'total_jours' => $totalJours,
                'jours_presents' => $joursPresents,
                'jours_absents' => $joursAbsents,
                'jours_retard' => $joursRetard,
                'heures_travaillees' => $heuresTotal,
                'taux_presence' => $totalJours > 0 ? round(($joursPresents / $totalJours) * 100, 2) : 0
            ];
        });

        return response()->json($rapport);
    }

    /**
     * Rapport de congés détaillé
     * GET /rh/rapports/conges
     */
    public function rapportConges(Request $request): JsonResponse
    {
        $annee = $request->get('annee', date('Y'));
        $departmentId = $request->get('department_id');

        $query = Employe::with(['user', 'department'])
            ->where('statut', 'actif');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $employes = $query->get();

        $rapport = $employes->map(function($employe) use ($annee) {
            $conges = Conge::where('employe_id', $employe->id)
                ->whereYear('date_debut', $annee)
                ->get();

            $congesApprouves = $conges->where('statut', 'approuve');
            $congesEnAttente = $conges->where('statut', 'en_attente');
            $congesRejetes = $conges->where('statut', 'rejete');

            return [
                'employe_id' => $employe->id,
                'nom' => $employe->user->name,
                'department' => $employe->department->nom ?? 'N/A',
                'solde_initial' => $employe->solde_conges ?? 25,
                'conges_pris' => $congesApprouves->sum('nombre_jours'),
                'conges_en_attente' => $congesEnAttente->sum('nombre_jours'),
                'conges_rejetes' => $congesRejetes->sum('nombre_jours'),
                'solde_restant' => ($employe->solde_conges ?? 25) - $congesApprouves->sum('nombre_jours'),
                'total_demandes' => $conges->count()
            ];
        });

        return response()->json($rapport);
    }

    /**
     * Rapport de paie global
     * GET /rh/rapports/paie
     */
    public function rapportPaie(Request $request): JsonResponse
    {
        $periode = $request->get('periode', now()->format('Y-m'));
        $departmentId = $request->get('department_id');

        $query = BulletinPaie::with(['employe.user', 'employe.department'])
            ->where('periode', 'like', $periode . '%');

        if ($departmentId) {
            $query->whereHas('employe', function($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        $bulletins = $query->get();

        $rapport = [
            'periode' => $periode,
            'total_employes' => $bulletins->count(),
            'masse_salariale_brute' => $bulletins->sum('salaire_brut'),
            'masse_salariale_nette' => $bulletins->sum('salaire_net'),
            'total_cotisations' => $bulletins->sum('cotisations_sociales'),
            'total_impots' => $bulletins->sum('impot_sur_revenu'),
            'repartition_par_department' => $bulletins->groupBy('employe.department.nom')
                ->map(function($group) {
                    return [
                        'nombre_employes' => $group->count(),
                        'masse_salariale_brute' => $group->sum('salaire_brut'),
                        'masse_salariale_nette' => $group->sum('salaire_net')
                    ];
                })
        ];

        return response()->json($rapport);
    }

    /**
     * Exporter un rapport
     * POST /rh/rapports/export
     */
    public function exportRapport(Request $request): JsonResponse
    {
        $type = $request->get('type'); // presences, conges, paie
        $format = $request->get('format', 'excel');
        $params = $request->except(['type', 'format']);

        // Simulation de l'export
        $filename = 'rapport_' . $type . '_' . now()->format('Y_m_d_H_i_s') . '.' . ($format === 'pdf' ? 'pdf' : 'xlsx');
        
        return response()->json([
            'message' => 'Rapport exporté avec succès',
            'filename' => $filename,
            'download_url' => '/storage/reports/' . $filename,
            'type' => $type,
            'format' => $format
        ]);
    }
}