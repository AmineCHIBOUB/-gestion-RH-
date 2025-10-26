<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Employe;
use App\Models\Conge;
use App\Models\Pointage;
use App\Models\BulletinPaie;
use App\Models\Fichier;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Obtenir les statistiques du dashboard employé
     * GET /dashboard/stats
     */
    public function getStats(): JsonResponse
    {
        $user = Auth::user();
        $employe = Employe::where('user_id', $user->id)->first();
        
        if (!$employe) {
            return response()->json(['error' => 'Employé non trouvé'], 404);
        }

        $currentYear = date('Y');
        $currentMonth = date('m');

        // Calcul des congés
        $congesRestants = $employe->solde_conges ?? 25; // Valeur par défaut
        $congesPris = Conge::where('employe_id', $employe->id)
            ->where('statut', 'approuve')
            ->whereYear('date_debut', $currentYear)
            ->sum('nombre_jours');

        // Calcul des heures travaillées ce mois
        $heuresTravaillees = Pointage::where('employe_id', $employe->id)
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->sum('heures_travaillees');

        // Heures supplémentaires
        $heuresSupplementaires = Pointage::where('employe_id', $employe->id)
            ->whereYear('date', $currentYear)
            ->whereMonth('date', $currentMonth)
            ->sum('heures_supplementaires');

        // Documents non lus
        $documentsNonLus = Fichier::where('employe_id', $employe->id)
            ->where('lu', false)
            ->count();

        // Notifications non lues
        $annoncesNonLues = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        // Dernier bulletin
        $dernierBulletin = BulletinPaie::where('employe_id', $employe->id)
            ->orderBy('periode', 'desc')
            ->first();

        // Prochain congé
        $prochainConge = Conge::where('employe_id', $employe->id)
            ->where('statut', 'approuve')
            ->where('date_debut', '>', now())
            ->orderBy('date_debut', 'asc')
            ->first();

        return response()->json([
            'congesRestants' => $congesRestants - $congesPris,
            'congesPris' => $congesPris,
            'heuresTravaillees' => $heuresTravaillees ?? 0,
            'heuresSupplementaires' => $heuresSupplementaires ?? 0,
            'documentsNonLus' => $documentsNonLus,
            'annoncesNonLues' => $annoncesNonLues,
            'dernierBulletin' => $dernierBulletin,
            'prochainConge' => $prochainConge
        ]);
    }
}