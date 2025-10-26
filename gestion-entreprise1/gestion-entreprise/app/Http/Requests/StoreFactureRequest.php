<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreFactureRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les administrateurs et RH peuvent créer des factures
        return $this->user() && in_array($this->user()->role, ['admin', 'rh']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'numero_facture' => 'required|string|max:50|unique:factures,numero_facture|regex:/^[A-Z0-9\-_]+$/',
            'client_nom' => 'required|string|max:255|regex:/^[a-zA-ZÀ-ÿ\s\-\'\.,]+$/',
            'client_email' => 'required|email:rfc,dns|max:255',
            'client_adresse' => 'required|string|max:500',
            'date_emission' => 'required|date|before_or_equal:today|after:2020-01-01',
            'date_echeance' => 'required|date|after:date_emission|before:' . now()->addYears(2)->format('Y-m-d'),
            'montant_ht' => 'required|numeric|min:0.01|max:999999.99',
            'taux_tva' => 'required|numeric|min:0|max:100|in:0,5.5,10,20',
            'description' => 'nullable|string|max:1000',
            'statut' => 'nullable|in:brouillon,envoyee,payee,annulee'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'numero_facture.required' => 'Le numéro de facture est obligatoire.',
            'numero_facture.unique' => 'Ce numéro de facture existe déjà.',
            'numero_facture.regex' => 'Le numéro de facture ne peut contenir que des lettres majuscules, chiffres, tirets et underscores.',
            'client_nom.required' => 'Le nom du client est obligatoire.',
            'client_nom.regex' => 'Le nom du client contient des caractères non autorisés.',
            'client_email.required' => 'L\'email du client est obligatoire.',
            'client_email.email' => 'L\'email du client doit être valide.',
            'client_adresse.required' => 'L\'adresse du client est obligatoire.',
            'client_adresse.max' => 'L\'adresse du client ne peut pas dépasser 500 caractères.',
            'date_emission.required' => 'La date d\'émission est obligatoire.',
            'date_emission.before_or_equal' => 'La date d\'émission ne peut pas être dans le futur.',
            'date_emission.after' => 'La date d\'émission doit être postérieure au 1er janvier 2020.',
            'date_echeance.required' => 'La date d\'échéance est obligatoire.',
            'date_echeance.after' => 'La date d\'échéance doit être postérieure à la date d\'émission.',
            'date_echeance.before' => 'La date d\'échéance ne peut pas dépasser 2 ans.',
            'montant_ht.required' => 'Le montant HT est obligatoire.',
            'montant_ht.min' => 'Le montant HT doit être supérieur à 0.',
            'montant_ht.max' => 'Le montant HT ne peut pas dépasser 999 999,99 €.',
            'taux_tva.required' => 'Le taux de TVA est obligatoire.',
            'taux_tva.in' => 'Le taux de TVA doit être 0%, 5.5%, 10% ou 20%.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
            'statut.in' => 'Le statut sélectionné n\'est pas valide.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'numero_facture' => 'numéro de facture',
            'client_nom' => 'nom du client',
            'client_email' => 'email du client',
            'client_adresse' => 'adresse du client',
            'date_emission' => 'date d\'émission',
            'date_echeance' => 'date d\'échéance',
            'montant_ht' => 'montant HT',
            'taux_tva' => 'taux de TVA',
            'description' => 'description',
            'statut' => 'statut'
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Les données de la facture ne sont pas valides.',
                'errors' => $validator->errors(),
                'status' => 'error'
            ], 422)
        );
    }

    /**
     * Handle a failed authorization attempt.
     *
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Vous n\'avez pas l\'autorisation de créer une facture.',
                'status' => 'error'
            ], 403)
        );
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'numero_facture' => strtoupper(trim($this->numero_facture)),
            'client_nom' => trim($this->client_nom),
            'client_email' => strtolower(trim($this->client_email)),
            'client_adresse' => trim($this->client_adresse),
            'description' => $this->description ? trim($this->description) : null,
            'statut' => $this->statut ?? 'brouillon'
        ]);
    }

    /**
     * Get the validated data with calculated montant_ttc.
     *
     * @return array
     */
    public function validatedWithCalculations(): array
    {
        $validated = $this->validated();
        
        // Calculer le montant TTC
        $validated['montant_ttc'] = $validated['montant_ht'] * (1 + $validated['taux_tva'] / 100);
        
        return $validated;
    }
}