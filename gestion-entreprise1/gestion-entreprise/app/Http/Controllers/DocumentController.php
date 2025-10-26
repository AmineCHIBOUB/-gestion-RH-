<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use App\Models\Employe;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
// SUPPRIMER cette ligne qui cause les conflits :
// use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class DocumentController extends Controller
{
    /**
     * Afficher la liste des documents
     */
    public function index(Request $request)
    {
        $query = Document::with(['employes']);

        // Filtres
        if ($request->has('type_document') && $request->type_document) {
            $query->where('type_document', $request->type_document);
        }

        if ($request->has('obligatoire')) {
            $query->where('obligatoire', $request->boolean('obligatoire'));
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $documents = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($documents);
    }

    /**
     * Afficher les documents d'un employé spécifique
     */
    public function getByEmploye($employeId)
    {
        $employe = Employe::findOrFail($employeId);
        $documents = $employe->documents()->with('pivot')->get();

        return response()->json([
            'employe' => $employe,
            'documents' => $documents
        ]);
    }

    /**
     * Afficher les documents de l'utilisateur connecté
     */
    public function mesDocuments()
    {
        $user = Auth::user();
        $employe = $user->employe;
        
        if (!$employe) {
            return response()->json([
                'message' => 'Aucun profil employé trouvé.',
                'documents' => []
            ]);
        }

        $documents = $employe->documents()
            ->with('pivot')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'documents' => $documents,
            'employe' => $employe
        ]);
    }

    /**
     * Créer un nouveau document
     */
    public function store(StoreDocumentRequest $request)
    {
        try {
            $validatedData = $request->validated();
            
            // Upload du fichier
            if ($request->hasFile('fichier')) {
                $file = $request->file('fichier');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('documents', $filename, 'public');
                $validatedData['chemin_fichier'] = $path;
                $validatedData['nom_fichier_original'] = $file->getClientOriginalName();
                $validatedData['taille_fichier'] = $file->getSize();
            }

            $validatedData['cree_par'] = Auth::id();
            
            $document = Document::create($validatedData);

            // Associer aux employés si spécifiés
            if (isset($validatedData['employes']) && is_array($validatedData['employes'])) {
                $document->employes()->attach($validatedData['employes'], [
                    'date_assignation' => now(),
                    'lu' => false
                ]);
            }

            return response()->json([
                'message' => 'Document créé avec succès.',
                'document' => $document->load('employes'),
                'status' => 'success'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du document.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Afficher un document spécifique
     */
    public function show($id)
    {
        $document = Document::with(['employes', 'createur'])->findOrFail($id);
        
        return response()->json($document);
    }

    /**
     * Mettre à jour un document
     */
    public function update(UpdateDocumentRequest $request, $id)
    {
        try {
            $document = Document::findOrFail($id);
            $validatedData = $request->validated();

            // Upload du nouveau fichier si fourni
            if ($request->hasFile('fichier')) {
                // Supprimer l'ancien fichier
                if ($document->chemin_fichier && Storage::disk('public')->exists($document->chemin_fichier)) {
                    Storage::disk('public')->delete($document->chemin_fichier);
                }

                $file = $request->file('fichier');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('documents', $filename, 'public');
                $validatedData['chemin_fichier'] = $path;
                $validatedData['nom_fichier_original'] = $file->getClientOriginalName();
                $validatedData['taille_fichier'] = $file->getSize();
            }

            $document->update($validatedData);

            // Mettre à jour les associations employés si spécifiées
            if (isset($validatedData['employes'])) {
                $document->employes()->detach();
                if (is_array($validatedData['employes'])) {
                    $document->employes()->attach($validatedData['employes'], [
                        'date_assignation' => now(),
                        'lu' => false
                    ]);
                }
            }

            return response()->json([
                'message' => 'Document mis à jour avec succès.',
                'document' => $document->load('employes'),
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du document.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Supprimer un document
     */
    public function destroy($id)
    {
        try {
            $document = Document::findOrFail($id);

            // Supprimer le fichier du stockage
            if ($document->chemin_fichier && Storage::disk('public')->exists($document->chemin_fichier)) {
                Storage::disk('public')->delete($document->chemin_fichier);
            }

            // Supprimer les associations
            $document->employes()->detach();
            
            $document->delete();

            return response()->json([
                'message' => 'Document supprimé avec succès.',
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du document.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Télécharger un document
     */
    public function download($id): HttpResponse
    {
        $document = Document::findOrFail($id);
        
        // Vérifier les permissions
        $user = auth()->user();
        if ($user->role !== 'admin' && $user->role !== 'rh') {
            // Vérifier si l'employé a accès à ce document
            $employe = $user->employe;
            if (!$employe || !$document->employes->contains($employe->id)) {
                abort(403, 'Accès non autorisé à ce document');
            }
        }
        
        $filePath = storage_path('app/' . $document->chemin_fichier);
        
        if (!file_exists($filePath)) {
            abort(404, 'Fichier non trouvé');
        }
        
        return response()->download($filePath, $document->titre . '.' . pathinfo($document->chemin_fichier, PATHINFO_EXTENSION));
    }

    /**
     * Marquer un document comme lu par un employé
     */
    public function marquerCommeLu($documentId)
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

            $document = Document::findOrFail($documentId);
            
            // Vérifier si l'employé a accès à ce document
            if (!$document->employes()->where('employe_id', $employe->id)->exists()) {
                return response()->json([
                    'message' => 'Accès non autorisé à ce document.',
                    'status' => 'error'
                ], 403);
            }

            // Marquer comme lu
            $document->employes()->updateExistingPivot($employe->id, [
                'lu' => true,
                'date_lecture' => now()
            ]);

            return response()->json([
                'message' => 'Document marqué comme lu.',
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
     * Assigner un document à des employés
     */
    public function assignerEmployes(Request $request, $documentId)
    {
        $request->validate([
            'employes' => 'required|array',
            'employes.*' => 'exists:employes,id'
        ]);

        try {
            $document = Document::findOrFail($documentId);
            
            $document->employes()->attach($request->employes, [
                'date_assignation' => now(),
                'lu' => false
            ]);

            return response()->json([
                'message' => 'Document assigné aux employés avec succès.',
                'document' => $document->load('employes'),
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
     * Retirer l'assignation d'un document à des employés
     */
    public function retirerEmployes(Request $request, $documentId)
    {
        $request->validate([
            'employes' => 'required|array',
            'employes.*' => 'exists:employes,id'
        ]);

        try {
            $document = Document::findOrFail($documentId);
            
            $document->employes()->detach($request->employes);

            return response()->json([
                'message' => 'Assignation retirée avec succès.',
                'document' => $document->load('employes'),
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
     * Obtenir les statistiques des documents
     */
    public function statistiques()
    {
        $stats = [
            'total_documents' => Document::count(),
            'documents_obligatoires' => Document::where('obligatoire', true)->count(),
            'documents_expires' => Document::where('date_expiration', '<', now())->count(),
            'documents_par_type' => Document::selectRaw('type_document, COUNT(*) as count')
                ->groupBy('type_document')
                ->get(),
            'taux_lecture' => $this->calculerTauxLecture()
        ];

        return response()->json($stats);
    }

    /**
     * Calculer le taux de lecture des documents
     */
    private function calculerTauxLecture()
    {
        $totalAssignations = DB::table('document_employe')->count();
        $assignationsLues = DB::table('document_employe')->where('lu', true)->count();
        
        return $totalAssignations > 0 ? round(($assignationsLues / $totalAssignations) * 100, 2) : 0;
    }
}