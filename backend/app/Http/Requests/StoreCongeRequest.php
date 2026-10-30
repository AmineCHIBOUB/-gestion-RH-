<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Carbon\Carbon;

class StoreCongeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Tous les utilisateurs authentifiés peuvent demander un congé
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employe_id' => 'required|exists:employes,id',
            'type_conge' => 'required|in:conge_paye,conge_maladie,conge_maternite,conge_paternite,conge_sans_solde,rtt,formation',
            'date_debut' => 'required|date|after:today',
            'date_fin' => 'required|date|after:date_debut',
            'motif' => 'required|string|max:1000|min:10',
            'statut' => 'nullable|in:en_attente,approuve,refuse'
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Vérifier que l'employé peut demander un congé pour lui-même ou que c'est un admin/RH
            if ($this->employe_id && $this->user()) {
                $userEmploye = $this->user()->employe;
                
                if (!in_array($this->user()->role, ['admin', 'rh']) && 
                    (!$userEmploye || $userEmploye->id != $this->employe_id)) {
                    $validator->errors()->add('employe_id', 'Vous ne pouvez demander un congé que pour vous-même.');
                }
            }
            
            // Vérifier que les dates ne sont pas un weekend pour certains types de congés
            if ($this->date_debut && $this->date_fin && in_array($this->type_conge, ['conge_paye', 'rtt'])) {
                $dateDebut = Carbon::parse($this->date_debut);
                $dateFin = Carbon::parse($this->date_fin);
                
                // Calculer le nombre de jours ouvrables
                $joursOuvrables = 0;
                $currentDate = $dateDebut->copy();
                
                while ($currentDate->lte($dateFin)) {
                    if ($currentDate->isWeekday()) {
                        $joursOuvrables++;
                    }
                    $currentDate->addDay();
                }
                
                if ($joursOuvrables === 0) {
                    $validator->errors()->add('date_debut', 'La période sélectionnée ne contient aucun jour ouvrable.');
                }
                
                // Vérifier la durée maximale selon le type de congé
                if ($this->type_conge === 'conge_paye' && $joursOuvrables > 25) {
                    $validator->errors()->add('date_fin', 'Un congé payé ne peut pas dépasser 25 jours ouvrables.');
                }
                
                if ($this->type_conge === 'rtt' && $joursOuvrables > 5) {
                    $validator->errors()->add('date_fin', 'Un RTT ne peut pas dépasser 5 jours ouvrables.');
                }
            }
            
            // Vérifier qu'il n'y a pas de chevauchement avec d'autres congés approuvés
            if ($this->employe_id && $this->date_debut && $this->date_fin) {
                $chevauche = \App\Models\Conge::where('employe_id', $this->employe_id)
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
                    
                if ($chevauche) {
                    $validator->errors()->add('date_debut', 'Cette période chevauche avec un congé déjà approuvé.');
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employe_id.required' => 'L\'employé est obligatoire.',
            'employe_id.exists' => 'L\'employé sélectionné n\'existe pas.',
            'type_conge.required' => 'Le type de congé est obligatoire.',
            'type_conge.in' => 'Le type de congé sélectionné n\'est pas valide.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_debut.after' => 'La date de début doit être dans le futur.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.after' => 'La date de fin doit être postérieure à la date de début.',
            'motif.required' => 'Le motif est obligatoire.',
            'motif.min' => 'Le motif doit contenir au moins 10 caractères.',
            'motif.max' => 'Le motif ne peut pas dépasser 1000 caractères.',
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
            'employe_id' => 'employé',
            'type_conge' => 'type de congé',
            'date_debut' => 'date de début',
            'date_fin' => 'date de fin',
            'motif' => 'motif',
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
                'message' => 'Les données de la demande de congé ne sont pas valides.',
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
                'message' => 'Vous devez être connecté pour demander un congé.',
                'status' => 'error'
            ], 401)
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
            'motif' => trim($this->motif),
            'statut' => $this->statut ?? 'en_attente'
        ]);
    }

    /**
     * Get the validated data with calculated number of days.
     *
     * @return array
     */
    public function validatedWithCalculations(): array
    {
        $validated = $this->validated();
        
        // Calculer le nombre de jours
        $dateDebut = Carbon::parse($validated['date_debut']);
        $dateFin = Carbon::parse($validated['date_fin']);
        
        $validated['nombre_jours'] = $dateDebut->diffInDays($dateFin) + 1;
        
        return $validated;
    }
}