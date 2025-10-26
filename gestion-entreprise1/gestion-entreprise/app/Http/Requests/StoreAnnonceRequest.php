<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreAnnonceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les administrateurs et RH peuvent créer des annonces
        return $this->user() && in_array($this->user()->role, ['admin', 'rh']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string|max:5000',
            'type_annonce' => 'required|in:generale,urgente,evenement,formation,politique',
            'priorite' => 'required|in:basse,normale,haute,critique',
            'date_publication' => 'nullable|date|after_or_equal:today',
            'date_expiration' => 'nullable|date|after:date_publication',
            'visible' => 'boolean',
            'envoyer_notification' => 'boolean',
            'employes' => 'nullable|array',
            'employes.*' => 'exists:employes,id',
            'departements' => 'nullable|array',
            'departements.*' => 'string|in:IT,Management,Design,Finance,HR,Marketing'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titre.required' => 'Le titre de l\'annonce est obligatoire.',
            'contenu.required' => 'Le contenu de l\'annonce est obligatoire.',
            'contenu.max' => 'Le contenu ne doit pas dépasser 5000 caractères.',
            'type_annonce.required' => 'Le type d\'annonce est obligatoire.',
            'type_annonce.in' => 'Le type d\'annonce doit être : générale, urgente, événement, formation ou politique.',
            'priorite.required' => 'La priorité est obligatoire.',
            'priorite.in' => 'La priorité doit être : basse, normale, haute ou critique.',
            'date_publication.after_or_equal' => 'La date de publication ne peut pas être antérieure à aujourd\'hui.',
            'date_expiration.after' => 'La date d\'expiration doit être postérieure à la date de publication.',
            'employes.*.exists' => 'Un ou plusieurs employés sélectionnés n\'existent pas.',
            'departements.*.in' => 'Un ou plusieurs départements sélectionnés ne sont pas valides.'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Les données de l\'annonce ne sont pas valides.',
                'errors' => $validator->errors(),
                'status' => 'error'
            ], 422)
        );
    }
}