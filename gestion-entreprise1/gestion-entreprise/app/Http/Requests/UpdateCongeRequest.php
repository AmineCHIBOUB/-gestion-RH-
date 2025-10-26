<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Carbon\Carbon;
use App\Models\Conge;

class UpdateCongeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        
        // Admin et RH peuvent modifier tous les congés
        if (in_array($user->role, ['admin', 'rh'])) {
            return true;
        }
        
        // Un employé peut modifier ses propres congés (seulement si en attente)
        $conge = $this->route('conge');
        if ($conge && $conge->employe_id === $user->employe->id && $conge->statut === 'en_attente') {
            return true;
        }
        
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $conge = $this->route('conge');
        
        return [
            'employe_id' => 'sometimes|exists:employes,id',
            'type_conge' => 'sometimes|in:conge_paye,conge_sans_solde,conge_maladie,conge_maternite,conge_paternite,rtt',
            'date_debut' => 'sometimes|date|after_or_equal:today',
            'date_fin' => 'sometimes|date|after_or_equal:date_debut',
            'motif' => 'sometimes|string|max:500',
            'statut' => 'sometimes|in:en_attente,approuve,refuse'
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'employe_id.exists' => 'L\'employé sélectionné n\'existe pas.',
            'type_conge.in' => 'Le type de congé doit être : congé payé, congé sans solde, congé maladie, congé maternité, congé paternité ou RTT.',
            'date_debut.date' => 'La date de début doit être une date valide.',
            'date_debut.after_or_equal' => 'La date de début ne peut pas être dans le passé.',
            'date_fin.date' => 'La date de fin doit être une date valide.',
            'date_fin.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'motif.max' => 'Le motif ne peut pas dépasser 500 caractères.',
            'statut.in' => 'Le statut doit être : en attente, approuvé ou refusé.'
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
                'message' => 'Vous n\'êtes pas autorisé à modifier ce congé.',
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
        
        if ($this->has('motif')) {
            $data['motif'] = trim($this->motif);
        }
        
        $this->merge($data);
    }

    /**
     * Get validated data with calculated fields.
     */
    public function validatedWithCalculations(): array
    {
        $validated = $this->validated();
        
        // Calculer le nombre de jours si les dates sont modifiées
        if (isset($validated['date_debut']) && isset($validated['date_fin'])) {
            $dateDebut = Carbon::parse($validated['date_debut']);
            $dateFin = Carbon::parse($validated['date_fin']);
            $validated['nombre_jours'] = $dateDebut->diffInDays($dateFin) + 1;
        }
        
        return $validated;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $conge = $this->route('conge');
            
            // Vérifier que l'employé peut seulement modifier ses propres congés (sauf admin/RH)
            if (isset($this->employe_id) && !in_array($user->role, ['admin', 'rh'])) {
                if ($this->employe_id !== $user->employe->id) {
                    $validator->errors()->add('employe_id', 'Vous ne pouvez modifier que vos propres congés.');
                }
            }
            
            // Vérifier les chevauchements avec d'autres congés approuvés
            if (isset($this->date_debut) && isset($this->date_fin)) {
                $employeId = $this->employe_id ?? $conge->employe_id;
                
                $conflictingConge = Conge::where('employe_id', $employeId)
                    ->where('id', '!=', $conge->id)
                    ->where('statut', 'approuve')
                    ->where(function ($query) {
                        $query->whereBetween('date_debut', [$this->date_debut, $this->date_fin])
                              ->orWhereBetween('date_fin', [$this->date_debut, $this->date_fin])
                              ->orWhere(function ($q) {
                                  $q->where('date_debut', '<=', $this->date_debut)
                                    ->where('date_fin', '>=', $this->date_fin);
                              });
                    })
                    ->exists();
                
                if ($conflictingConge) {
                    $validator->errors()->add('date_debut', 'Ces dates chevauchent avec un autre congé approuvé.');
                }
            }
            
            // Vérifier les limites de durée pour certains types de congés
            if (isset($this->type_conge) && isset($this->date_debut) && isset($this->date_fin)) {
                $dateDebut = Carbon::parse($this->date_debut);
                $dateFin = Carbon::parse($this->date_fin);
                $nombreJours = $dateDebut->diffInDays($dateFin) + 1;
                
                if ($this->type_conge === 'conge_paye' && $nombreJours > 25) {
                    $validator->errors()->add('date_fin', 'Un congé payé ne peut pas dépasser 25 jours.');
                }
                
                if ($this->type_conge === 'rtt' && $nombreJours > 5) {
                    $validator->errors()->add('date_fin', 'Un RTT ne peut pas dépasser 5 jours.');
                }
            }
        });
    }
}