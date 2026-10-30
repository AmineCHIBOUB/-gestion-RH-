<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fichier;
use App\Models\Employe;
use App\Models\Facture;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Requests\StoreFichierRequest;
use App\Http\Requests\UpdateFichierRequest;

class FichierController extends Controller
{
    /**
     * Afficher la liste des fichiers
     */
    public function index()
    {
        $fichiers = Fichier::with(['employe', 'facture', 'uploadedBy'])->orderBy('created_at', 'desc')->get();
        return response()->json($fichiers);
    }

    /**
     * Afficher le formulaire de création d'un fichier
     */
    public function create()
    {
        $employes = Employe::with('user')->where('statut', 'actif')->get();
        $factures = Facture::where('statut', '!=', 'annulee')->get();
        
        return response()->json([
            'employes' => $employes,
            'factures' => $factures
        ]);
    }

    /**
     * Uploader un nouveau fichier
     */
    public function store(StoreFichierRequest $request)
    {
        try {
            $file = $request->file('fichier');
            $nomOriginal = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $nomFichier = Str::uuid() . '.' . $extension;
            
            // Stocker le fichier
            $chemin = $file->storeAs('fichiers', $nomFichier, 'public');

            $validatedData = $request->validated();
            $validatedData['nom_fichier'] = $nomFichier;
            $validatedData['nom_original'] = $nomOriginal;
            $validatedData['chemin'] = $chemin;
            $validatedData['taille'] = $file->getSize();
            $validatedData['type_mime'] = $file->getMimeType();
            $validatedData['uploaded_by'] = Auth::id();
            
            // Supprimer le fichier des données validées car il n'est pas stocké en base
            unset($validatedData['fichier']);
            
            $fichier = Fichier::create($validatedData);
        } catch (\Exception $e) {
            // Supprimer le fichier si la création en base échoue
            if (isset($chemin)) {
                Storage::disk('public')->delete($chemin);
            }
            
            return response()->json([
                'message' => 'Erreur lors de l\'upload du fichier.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }

        return response()->json([
            'message' => 'Fichier uploadé avec succès',
            'fichier' => $fichier->load(['employe', 'facture', 'uploadedBy'])
        ], 201);
    }

    /**
     * Afficher un fichier spécifique
     */
    public function show(string $id)
    {
        $fichier = Fichier::with(['employe', 'facture', 'uploadedBy'])->findOrFail($id);
        return response()->json($fichier);
    }

    /**
     * Télécharger un fichier
     */
    public function download(string $id)
    {
        $fichier = Fichier::findOrFail($id);
        
        $filePath = storage_path('app/public/' . $fichier->chemin);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }
        
        return response()->download($filePath, $fichier->nom_original);
    }

    /**
     * Afficher le formulaire d'édition d'un fichier
     */
    public function edit(string $id)
    {
        $fichier = Fichier::with(['employe', 'facture', 'uploadedBy'])->findOrFail($id);
        $employes = Employe::with('user')->where('statut', 'actif')->get();
        $factures = Facture::where('statut', '!=', 'annulee')->get();
        
        return response()->json([
            'fichier' => $fichier,
            'employes' => $employes,
            'factures' => $factures
        ]);
    }

    /**
     * Mettre à jour un fichier
     */
    public function update(UpdateFichierRequest $request, string $id)
    {
        try {
            $fichier = Fichier::findOrFail($id);
            
            $validatedData = $request->validated();
            
            $fichier->update($validatedData);
            
            return response()->json([
                'message' => 'Fichier mis à jour avec succès',
                'fichier' => $fichier->load(['employe', 'facture', 'uploadedBy'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Fichier non trouvé.',
                'error' => 'Le fichier demandé n\'existe pas.',
                'status' => 'error'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du fichier.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Supprimer un fichier
     */
    public function destroy(string $id)
    {
        $fichier = Fichier::findOrFail($id);
        
        // Supprimer le fichier du stockage
        if (Storage::disk('public')->exists($fichier->chemin)) {
            Storage::disk('public')->delete($fichier->chemin);
        }
        
        $fichier->delete();

        return response()->json([
            'message' => 'Fichier supprimé avec succès'
        ]);
    }

    /**
     * Obtenir les fichiers d'un employé
     */
    public function getByEmployee(string $employeId)
    {
        $fichiers = Fichier::with(['facture', 'uploadedBy'])
            ->where('employe_id', $employeId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($fichiers);
    }

    /**
     * Obtenir les fichiers d'une facture
     */
    public function getByFacture(string $factureId)
    {
        $fichiers = Fichier::with(['employe', 'uploadedBy'])
            ->where('facture_id', $factureId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($fichiers);
    }
}
