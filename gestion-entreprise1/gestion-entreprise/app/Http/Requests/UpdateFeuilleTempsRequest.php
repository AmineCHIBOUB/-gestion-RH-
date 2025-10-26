<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UpdateFeuilleTempsRequest extends FormRequest
{
    public function authorize()
    {
        $feuilleTemps = $this->route('feuille_temps');
        $user = auth()->user();
        
        // Admin et RH peuvent tout modifier
        if (in_array($user->role, ['admin', 'rh'])) {
            return true;
        }
        
        // L'employé peut modifier sa propre feuille si elle est en brouillon
        return $feuilleTemps && $feuilleTemps->employe_id === $user->employe->id && $feuilleTemps->statut === 'brouillon';
    }

    public function rules()
    {
        return [
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after_or_equal:date_debut',
            'statut' => 'sometimes|required|in:brouillon,soumise,approuvee,rejetee',
            'commentaire' => 'nullable|string|max:1000',
            'saisies' => 'sometimes|required|array|min:1',
            'saisies.*.id' => 'nullable|exists:saisie_temps,id',
            'saisies.*.date' => 'required|date',
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
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'statut.required' => 'Le statut est obligatoire.',
            'statut.in' => 'Le statut doit être : brouillon, soumise, approuvée ou rejetée.',
            'saisies.required' => 'Au moins une saisie de temps est requise.',
            'saisies.*.date.required' => 'La date de la saisie est obligatoire.',
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