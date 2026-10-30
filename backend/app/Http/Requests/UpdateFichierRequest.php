<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UpdateFichierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        
        // Admin et RH peuvent modifier tous les fichiers
        if (in_array($user->role, ['admin', 'rh'])) {
            return true;
        }
        
        // Un employé peut modifier ses propres fichiers
        $fichier = $this->route('fichier');
        if ($fichier && $fichier->uploaded_by === $user->id) {
            return true;
        }
        
        // Un employé peut modifier les fichiers qui lui sont associés
        if ($fichier && $fichier->employe_id === $user->employe->id) {
            return true;
        }
        
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nom' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'employe_id' => 'sometimes|nullable|exists:employes,id',
            'facture_id' => 'sometimes|nullable|exists:factures,id',
            'type_fichier' => 'sometimes|in:contrat,facture,document_rh,rapport,autre'
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nom.string' => 'Le nom doit être une chaîne de caractères.',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'description.string' => 'La description doit être une chaîne de caractères.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
            'employe_id.exists' => 'L\'employé sélectionné n\'existe pas.',
            'facture_id.exists' => 'La facture sélectionnée n\'existe pas.',
            'type_fichier.in' => 'Le type de fichier doit être : contrat, facture, document RH, rapport ou autre.'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Les données fournies ne sont pas valides.',
                'errors' => $validator->errors(),
                'status' => 'error'
            ], 422)
        );
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Vous n\'êtes pas autorisé à modifier ce fichier.',
                'error' => 'Accès refusé.',
                'status' => 'error'
            ], 403)
        );
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];
        
        if ($this->has('nom')) {
            $data['nom'] = trim($this->nom);
        }
        
        if ($this->has('description')) {
            $data['description'] = trim($this->description);
        }
        
        $this->merge($data);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $fichier = $this->route('fichier');
            
            // Vérifier que l'employé peut seulement modifier ses propres fichiers (sauf admin/RH)
            if (isset($this->employe_id) && !in_array($user->role, ['admin', 'rh'])) {
                if ($this->employe_id !== $user->employe->id) {
                    $validator->errors()->add('employe_id', 'Vous ne pouvez associer le fichier qu\'à votre propre profil.');
                }
            }
            
            // Vérifier qu'un fichier ne peut pas être associé à la fois à un employé et une facture
            $employeId = $this->employe_id ?? $fichier->employe_id;
            $factureId = $this->facture_id ?? $fichier->facture_id;
            
            if ($employeId && $factureId) {
                $validator->errors()->add('facture_id', 'Un fichier ne peut pas être associé à la fois à un employé et à une facture.');
            }
            
            // Vérifier la cohérence du type de fichier avec l'association
            if (isset($this->type_fichier)) {
                if ($this->type_fichier === 'facture' && !$factureId) {
                    $validator->errors()->add('facture_id', 'Un fichier de type "facture" doit être associé à une facture.');
                }
                
                if (in_array($this->type_fichier, ['contrat', 'document_rh']) && !$employeId) {
                    $validator->errors()->add('employe_id', 'Un fichier de type "' . $this->type_fichier . '" doit être associé à un employé.');
                }
            }
        });
    }
}