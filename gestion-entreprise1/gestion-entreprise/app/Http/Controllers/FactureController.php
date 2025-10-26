<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Facture;
use Carbon\Carbon;
use App\Http\Requests\StoreFactureRequest;
use App\Http\Requests\UpdateFactureRequest;

class FactureController extends Controller
{
    /**
     * Afficher la liste des factures
     */
    public function index()
    {
        $factures = Facture::with('fichiers')->orderBy('created_at', 'desc')->get();
        return response()->json($factures);
    }

    /**
     * Afficher le formulaire de création d'une facture
     */
    public function create()
    {
        return response()->json([
            'statuts' => ['brouillon', 'envoyee', 'payee', 'en_retard', 'annulee'],
            'numero_facture' => 'FAC-' . date('Y') . '-' . str_pad(Facture::count() + 1, 4, '0', STR_PAD_LEFT)
        ]);
    }

    /**
     * Créer une nouvelle facture
     */
    public function store(StoreFactureRequest $request)
    {
        try {
            $validatedData = $request->validatedWithCalculations();
            
            $facture = Facture::create($validatedData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la facture.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }

        return response()->json([
            'message' => 'Facture créée avec succès',
            'facture' => $facture
        ], 201);
    }

    /**
     * Afficher une facture spécifique
     */
    public function show(string $id)
    {
        $facture = Facture::with('fichiers')->findOrFail($id);
        return response()->json($facture);
    }

    /**
     * Afficher le formulaire d'édition d'une facture
     */
    public function edit(string $id)
    {
        $facture = Facture::findOrFail($id);
        return response()->json([
            'facture' => $facture,
            'statuts' => ['brouillon', 'envoyee', 'payee', 'en_retard', 'annulee']
        ]);
    }

    /**
     * Mettre à jour une facture
     */
    public function update(UpdateFactureRequest $request, string $id)
    {
        try {
            $facture = Facture::findOrFail($id);
            
            $validatedData = $request->validatedWithCalculations();
            
            $facture->update($validatedData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la facture.',
                'error' => 'Une erreur interne s\'est produite.',
                'status' => 'error'
            ], 500);
        }

        return response()->json([
            'message' => 'Facture mise à jour avec succès',
            'facture' => $facture
        ]);
    }

    /**
     * Supprimer une facture
     */
    public function destroy(string $id)
    {
        $facture = Facture::findOrFail($id);
        $facture->delete();

        return response()->json([
            'message' => 'Facture supprimée avec succès'
        ]);
    }

    /**
     * Marquer une facture comme payée
     */
    public function markAsPaid(string $id)
    {
        $facture = Facture::findOrFail($id);
        $facture->update(['statut' => 'payee']);

        return response()->json([
            'message' => 'Facture marquée comme payée',
            'facture' => $facture
        ]);
    }

    /**
     * Rechercher des factures
     */
    public function search(Request $request)
    {
        $query = Facture::query();
        
        if ($request->has('numero_facture')) {
            $query->where('numero_facture', 'like', '%' . $request->numero_facture . '%');
        }
        
        if ($request->has('client_nom')) {
            $query->where('client_nom', 'like', '%' . $request->client_nom . '%');
        }
        
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }
        
        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_emission', [$request->date_debut, $request->date_fin]);
        }
        
        $factures = $query->with('fichiers')->get();
        return response()->json($factures);
    }
}
