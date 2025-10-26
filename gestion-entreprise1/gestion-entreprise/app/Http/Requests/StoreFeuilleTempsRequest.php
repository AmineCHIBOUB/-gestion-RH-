<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class StoreFeuilleTempsRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->role === 'rh');
    }

    public function rules()
    {
        return [
            'employe_id' => 'required|exists:employes,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'statut' => 'required|in:brouillon,soumise,approuvee,rejetee',
            'commentaire' => 'nullable|string|max:1000',
            'saisies' => 'required|array|min:1',
            'saisies.*.date' => 'required|date|between:' . request('date_debut') . ',' . request('date_fin'),
            'saisies.*.heures_normales' => 'required|numeric|min:0|max:24',
            'saisies.*.heures_supplementaires' => 'nullable|numeric|min:0|max:24',
            'saisies.*.description' => 'nullable|string|max:500',
            'saisies.*.projet' => 'nullable|string|max:255',
            'saisies.*.tache' => 'nullable|string|max:255'
        ];
    }

    public function messages()
    {
        return [
            'employe_id.required' => 'L\'employé est obligatoire.',
            'employe_id.exists' => 'L\'employé sélectionné n\'existe pas.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'statut.required' => 'Le statut est obligatoire.',
            'statut.in' => 'Le statut doit être : brouillon, soumise, approuvée ou rejetée.',
            'saisies.required' => 'Au moins une saisie de temps est requise.',
            'saisies.*.date.required' => 'La date de la saisie est obligatoire.',
            'saisies.*.date.between' => 'La date de la saisie doit être comprise entre les dates de début et fin.',
            'saisies.*.heures_normales.required' => 'Les heures normales sont obligatoires.',
            'saisies.*.heures_normales.max' => 'Les heures normales ne peuvent pas dépasser 24h par jour.',
            'saisies.*.heures_supplementaires.max' => 'Les heures supplémentaires ne peuvent pas dépasser 24h par jour.'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Erreurs de validation',
            'errors' => $validator->errors()
        ], 422));
    }
}