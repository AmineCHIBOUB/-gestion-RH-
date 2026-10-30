<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OffreEmploi;
use App\Models\Candidature;
use App\Models\Candidat;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class RecrutementController extends Controller
{
    /**
     * Liste des offres d'emploi
     */
    public function offres(Request $request): JsonResponse
    {
        $query = OffreEmploi::with('candidatures');
        
        if ($request->statut) {
            $query->where('statut', $request->statut);
        }
        
        if ($request->departement) {
            $query->where('departement', $request->departement);
        }
        
        $offres = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return response()->json($offres);
    }
    
    /**
     * Liste des offres (alias pour compatibilité frontend)
     */
    public function getOffres(Request $request): JsonResponse
    {
        return $this->offres($request);
    }
    
    /**
     * Détail d'une offre d'emploi
     */
    public function getOffre($id): JsonResponse
    {
        $offre = OffreEmploi::with('candidatures.candidat')
                           ->findOrFail($id);
        
        return response()->json(['data' => $offre]);
    }
    
    /**
     * Créer une offre d'emploi
     */
    public function creerOffre(Request $request): JsonResponse
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'departement' => 'required|string',
            'type_contrat' => 'required|in:CDI,CDD,Stage,Freelance',
            'salaire_min' => 'nullable|numeric|min:0',
            'salaire_max' => 'nullable|numeric|min:0',
            'date_limite' => 'required|date|after:today'
        ]);
        
        $offre = OffreEmploi::create(array_merge($request->all(), [
            'statut' => 'active',
            'date_publication' => now()
        ]));
        
        return response()->json([
            'data' => $offre,
            'message' => 'Offre d\'emploi créée avec succès'
        ]);
    }
    
    /**
     * Créer une offre (alias pour compatibilité frontend)
     */
    public function createOffre(Request $request): JsonResponse
    {
        return $this->creerOffre($request);
    }
    
    /**
     * Modifier une offre d'emploi
     */
    public function updateOffre(Request $request, $id): JsonResponse
    {
        $offre = OffreEmploi::findOrFail($id);
        
        $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'departement' => 'sometimes|string',
            'type_contrat' => 'sometimes|in:CDI,CDD,Stage,Freelance',
            'salaire_min' => 'nullable|numeric|min:0',
            'salaire_max' => 'nullable|numeric|min:0',
            'date_limite' => 'sometimes|date|after:today'
        ]);
        
        $offre->update($request->all());
        
        return response()->json([
            'data' => $offre,
            'message' => 'Offre d\'emploi modifiée avec succès'
        ]);
    }
    
    /**
     * Supprimer une offre d'emploi
     */
    public function deleteOffre($id): JsonResponse
    {
        $offre = OffreEmploi::findOrFail($id);
        $offre->delete();
        
        return response()->json([
            'message' => 'Offre d\'emploi supprimée avec succès'
        ]);
    }
    
    /**
     * Publier une offre d'emploi
     */
    public function publierOffre($id): JsonResponse
    {
        $offre = OffreEmploi::findOrFail($id);
        $offre->update([
            'statut' => 'publiee',
            'date_publication' => now()
        ]);
        
        return response()->json([
            'data' => $offre,
            'message' => 'Offre d\'emploi publiée avec succès'
        ]);
    }
    
    /**
     * Fermer une offre d'emploi
     */
    public function fermerOffre($id): JsonResponse
    {
        $offre = OffreEmploi::findOrFail($id);
        $offre->update([
            'statut' => 'fermee',
            'date_fermeture' => now()
        ]);
        
        return response()->json([
            'data' => $offre,
            'message' => 'Offre d\'emploi fermée avec succès'
        ]);
    }
    
    /**
     * Liste des candidatures
     */
    public function candidatures(Request $request): JsonResponse
    {
        $query = Candidature::with(['candidat', 'offreEmploi']);
        
        if ($request->offre_id || $request->offreId) {
            $offreId = $request->offre_id ?? $request->offreId;
            $query->where('offre_emploi_id', $offreId);
        }
        
        if ($request->statut) {
            $query->where('statut', $request->statut);
        }
        
        $candidatures = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return response()->json($candidatures);
    }
    
    /**
     * Liste des candidatures (alias pour compatibilité frontend)
     */
    public function getCandidatures(Request $request): JsonResponse
    {
        return $this->candidatures($request);
    }
    
    /**
     * Détail d'une candidature
     */
    public function getCandidature($id): JsonResponse
    {
        $candidature = Candidature::with(['candidat', 'offreEmploi', 'evaluations'])
                                 ->findOrFail($id);
        
        return response()->json(['data' => $candidature]);
    }
    
    /**
     * Créer une candidature avec upload de fichiers
     */
    public function createCandidature(Request $request): JsonResponse
    {
        $request->validate([
            'offre_emploi_id' => 'required|exists:offres_emploi,id',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email',
            'telephone' => 'required|string|max:20',
            'cv' => 'required|file|mimes:pdf,doc,docx|max:5120',
            'lettre_motivation' => 'nullable|file|mimes:pdf,doc,docx|max:5120'
        ]);
        
        // Créer ou récupérer le candidat
        $candidat = Candidat::firstOrCreate(
            ['email' => $request->email],
            $request->only(['nom', 'prenom', 'telephone'])
        );
        
        // Upload des fichiers
        $cvPath = null;
        $lettreMotivationPath = null;
        
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('candidatures/cv', 'public');
        }
        
        if ($request->hasFile('lettre_motivation')) {
            $lettreMotivationPath = $request->file('lettre_motivation')
                                          ->store('candidatures/lettres', 'public');
        }
        
        // Créer la candidature
        $candidature = Candidature::create([
            'offre_emploi_id' => $request->offre_emploi_id,
            'candidat_id' => $candidat->id,
            'cv_path' => $cvPath,
            'lettre_motivation_path' => $lettreMotivationPath,
            'statut' => 'recu',
            'date_candidature' => now()
        ]);
        
        return response()->json([
            'data' => $candidature->load(['candidat', 'offreEmploi']),
            'message' => 'Candidature créée avec succès'
        ]);
    }
    
    /**
     * Mettre à jour le statut d'une candidature
     */
    public function mettreAJourCandidature(Request $request, $id): JsonResponse
    {
        $request->validate([
            'statut' => 'required|in:recu,en_cours,accepte,refuse',
            'commentaire' => 'nullable|string',
            'note' => 'nullable|string'
        ]);
        
        $candidature = Candidature::findOrFail($id);
        $candidature->update($request->all());
        
        return response()->json([
            'data' => $candidature->load(['candidat', 'offreEmploi']),
            'message' => 'Candidature mise à jour avec succès'
        ]);
    }
    
    /**
     * Mettre à jour le statut (alias pour compatibilité frontend)
     */
    public function updateStatutCandidature(Request $request, $id): JsonResponse
    {
        return $this->mettreAJourCandidature($request, $id);
    }
    
    /**
     * Planifier un entretien
     */
    public function planifierEntretien(Request $request, $id): JsonResponse
    {
        $request->validate([
            'dateEntretien' => 'required|date|after:now'
        ]);
        
        $candidature = Candidature::findOrFail($id);
        $candidature->update([
            'date_entretien' => $request->dateEntretien,
            'statut' => 'entretien_planifie'
        ]);
        
        return response()->json([
            'data' => $candidature->load(['candidat', 'offreEmploi']),
            'message' => 'Entretien planifié avec succès'
        ]);
    }
    
    /**
     * Ajouter une évaluation
     */
    public function ajouterEvaluation(Request $request, $candidatureId): JsonResponse
    {
        $request->validate([
            'note_technique' => 'required|integer|between:1,5',
            'note_comportementale' => 'required|integer|between:1,5',
            'commentaires' => 'nullable|string',
            'recommandation' => 'required|in:embaucher,refuser,second_entretien'
        ]);
        
        $candidature = Candidature::findOrFail($candidatureId);
        
        // Pour l'instant, on stocke l'évaluation dans la candidature
        // TODO: Créer une table evaluations séparée si nécessaire
        $candidature->update([
            'note_technique' => $request->note_technique,
            'note_comportementale' => $request->note_comportementale,
            'note_globale' => ($request->note_technique + $request->note_comportementale) / 2,
            'commentaires_evaluation' => $request->commentaires,
            'recommandation' => $request->recommandation,
            'date_evaluation' => now()
        ]);
        
        return response()->json([
            'data' => $candidature->load(['candidat', 'offreEmploi']),
            'message' => 'Évaluation ajoutée avec succès'
        ]);
    }
    
    /**
     * Statistiques de recrutement
     */
    public function statistiques(): JsonResponse
    {
        $stats = [
            'offres_actives' => OffreEmploi::where('statut', 'active')->count(),
            'candidatures_recues' => Candidature::where('statut', 'recu')->count(),
            'candidatures_en_cours' => Candidature::where('statut', 'en_cours')->count(),
            'candidatures_acceptees' => Candidature::where('statut', 'accepte')->count(),
            'taux_conversion' => $this->calculerTauxConversion()
        ];
        
        return response()->json($stats);
    }
    
    /**
     * Calculer le taux de conversion
     */
    private function calculerTauxConversion()
    {
        $totalCandidatures = Candidature::count();
        $candidaturesAcceptees = Candidature::where('statut', 'accepte')->count();
        
        return $totalCandidatures > 0 ? ($candidaturesAcceptees / $totalCandidatures) * 100 : 0;
    }
}