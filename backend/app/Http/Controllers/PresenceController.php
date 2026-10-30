<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Pointage;
use App\Models\Employe;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PresenceController extends Controller
{
    /**
     * Obtenir les présences avec filtres
     * GET /rh/presences
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pointage::with(['employe.user', 'employe.department'])
            ->orderBy('date', 'desc');

        // Filtres
        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date', [$request->date_debut, $request->date_fin]);
        }

        if ($request->has('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }

        if ($request->has('department_id')) {
            $query->whereHas('employe', function($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $presences = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'presences' => $presences->items(),
            'total' => $presences->total(),
            'current_page' => $presences->currentPage(),
            'last_page' => $presences->lastPage()
        ]);
    }

    /**
     * Obtenir les statistiques de présence
     * GET /rh/presences/statistiques
     */
    public function getStatistiques(Request $request): JsonResponse
    {
        $dateDebut = $request->get('date_debut', now()->startOfMonth());
        $dateFin = $request->get('date_fin', now()->endOfMonth());

        // Statistiques globales
        $totalEmployes = Employe::where('statut', 'actif')->count();
        $totalPresences = Pointage::whereBetween('date', [$dateDebut, $dateFin])->count();
        $totalAbsences = Pointage::whereBetween('date', [$dateDebut, $dateFin])
            ->where('statut', 'absent')->count();
        $totalRetards = Pointage::whereBetween('date', [$dateDebut, $dateFin])
            ->where('statut', 'retard')->count();

        // Taux de présence par département
        $presenceParDepartement = Department::withCount([
            'employes',
            'employes as presences_count' => function($query) use ($dateDebut, $dateFin) {
                $query->whereHas('pointages', function($q) use ($dateDebut, $dateFin) {
                    $q->whereBetween('date', [$dateDebut, $dateFin])
                      ->where('statut', 'present');
                });
            }
        ])->get();

        // Évolution des présences sur 7 jours
        $evolutionPresences = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = Pointage::whereDate('date', $date)
                ->where('statut', 'present')
                ->count();
            $evolutionPresences[] = [
                'date' => $date,
                'count' => $count
            ];
        }

        return response()->json([
            'totalEmployes' => $totalEmployes,
            'totalPresences' => $totalPresences,
            'totalAbsences' => $totalAbsences,
            'totalRetards' => $totalRetards,
            'tauxPresence' => $totalEmployes > 0 ? round(($totalPresences / $totalEmployes) * 100, 2) : 0,
            'presenceParDepartement' => $presenceParDepartement,
            'evolutionPresences' => $evolutionPresences
        ]);
    }

    /**
     * Exporter les présences
     * GET /rh/presences/export
     */
    public function export(Request $request): JsonResponse
    {
        $dateDebut = $request->get('date_debut', now()->startOfMonth());
        $dateFin = $request->get('date_fin', now()->endOfMonth());
        $format = $request->get('format', 'excel');

        $presences = Pointage::with(['employe.user', 'employe.department'])
            ->whereBetween('date', [$dateDebut, $dateFin])
            ->orderBy('date', 'desc')
            ->get();

        // Simulation de l'export
        $filename = 'presences_' . now()->format('Y_m_d_H_i_s') . '.' . ($format === 'pdf' ? 'pdf' : 'xlsx');
        
        return response()->json([
            'message' => 'Export généré avec succès',
            'filename' => $filename,
            'download_url' => '/storage/exports/' . $filename,
            'total_records' => $presences->count()
        ]);
    }

    /**
     * Obtenir le planning de présence
     * GET /rh/presences/planning
     */
    public function getPlanning(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $departmentId = $request->get('department_id');

        $query = Employe::with(['user', 'department', 'pointages' => function($q) use ($date) {
            $q->whereDate('date', $date);
        }])->where('statut', 'actif');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $employes = $query->get();

        $planning = $employes->map(function($employe) use ($date) {
            $pointage = $employe->pointages->first();
            return [
                'employe_id' => $employe->id,
                'nom' => $employe->user->name,
                'email' => $employe->user->email,
                'department' => $employe->department->nom ?? 'N/A',
                'statut' => $pointage ? $pointage->statut : 'non_pointe',
                'heure_arrivee' => $pointage ? $pointage->heure_arrivee : null,
                'heure_depart' => $pointage ? $pointage->heure_depart : null,
                'heures_travaillees' => $pointage ? $pointage->heures_travaillees : 0
            ];
        });

        return response()->json($planning);
    }
}