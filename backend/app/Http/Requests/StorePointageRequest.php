<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Carbon\Carbon;

class StorePointageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Tous les utilisateurs authentifiés peuvent pointer
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
            'date_pointage' => 'required|date|before_or_equal:today|after:' . now()->subMonths(3)->format('Y-m-d'),
            'heure_entree' => 'required|date_format:H:i',
            'heure_sortie' => 'nullable|date_format:H:i|after:heure_entree',
            'pause_debut' => 'nullable|date_format:H:i|after:heure_entree',
            'pause_fin' => 'nullable|date_format:H:i|after:pause_debut|before:heure_sortie',
            'statut' => 'nullable|in:present,absent,retard,conge'
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
            // Vérifier que l'employé peut pointer pour lui-même ou que c'est un admin/RH
            if ($this->employe_id && $this->user()) {
                $userEmploye = $this->user()->employe;
                
                if (!in_array($this->user()->role, ['admin', 'rh']) && 
                    (!$userEmploye || $userEmploye->id != $this->employe_id)) {
                    $validator->errors()->add('employe_id', 'Vous ne pouvez pointer que pour vous-même.');
                }
            }
            
            // Vérifier qu'il n'y a pas déjà un pointage pour cette date
            if ($this->employe_id && $this->date_pointage) {
                $existingPointage = \App\Models\Pointage::where('employe_id', $this->employe_id)
                    ->where('date_pointage', $this->date_pointage)
                    ->exists();
                    
                if ($existingPointage) {
                    $validator->errors()->add('date_pointage', 'Un pointage existe déjà pour cette date.');
                }
            }
            
            // Vérifier les heures de travail (pas plus de 12h par jour)
            if ($this->heure_entree && $this->heure_sortie) {
                $entree = Carbon::createFromFormat('H:i', $this->heure_entree);
                $sortie = Carbon::createFromFormat('H:i', $this->heure_sortie);
                
                $heuresTravaillees = $sortie->diffInHours($entree);
                
                // Soustraire la pause si elle existe
                if ($this->pause_debut && $this->pause_fin) {
                    $pauseDebut = Carbon::createFromFormat('H:i', $this->pause_debut);
                    $pauseFin = Carbon::createFromFormat('H:i', $this->pause_fin);
                    $heuresPause = $pauseFin->diffInHours($pauseDebut);
                    $heuresTravaillees -= $heuresPause;
                }
                
                if ($heuresTravaillees > 12) {
                    $validator->errors()->add('heure_sortie', 'La durée de travail ne peut pas dépasser 12 heures par jour.');
                }
                
                if ($heuresTravaillees < 0) {
                    $validator->errors()->add('heure_sortie', 'Les heures de travail calculées sont invalides.');
                }
            }
            
            // Vérifier que la pause est cohérente
            if ($this->pause_debut && !$this->pause_fin) {
                $validator->errors()->add('pause_fin', 'L\'heure de fin de pause est obligatoire si vous spécifiez le début.');
            }
            
            if (!$this->pause_debut && $this->pause_fin) {
                $validator->errors()->add('pause_debut', 'L\'heure de début de pause est obligatoire si vous spécifiez la fin.');
            }
            
            // Vérifier que la pause ne dépasse pas 2 heures
            if ($this->pause_debut && $this->pause_fin) {
                $pauseDebut = Carbon::createFromFormat('H:i', $this->pause_debut);
                $pauseFin = Carbon::createFromFormat('H:i', $this->pause_fin);
                $dureePause = $pauseFin->diffInMinutes($pauseDebut);
                
                if ($dureePause > 120) {
                    $validator->errors()->add('pause_fin', 'La pause ne peut pas dépasser 2 heures.');
                }
            }
            
            // Vérifier les heures de bureau (7h-20h)
            if ($this->heure_entree) {
                $entree = Carbon::createFromFormat('H:i', $this->heure_entree);
                if ($entree->hour < 6 || $entree->hour > 22) {
                    $validator->errors()->add('heure_entree', 'L\'heure d\'entrée doit être entre 06:00 et 22:00.');
                }
            }
            
            if ($this->heure_sortie) {
                $sortie = Carbon::createFromFormat('H:i', $this->heure_sortie);
                if ($sortie->hour < 6 || $sortie->hour > 23) {
                    $validator->errors()->add('heure_sortie', 'L\'heure de sortie doit être entre 06:00 et 23:00.');
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
            'date_pointage.required' => 'La date est obligatoire.',
            'date_pointage.before_or_equal' => 'La date ne peut pas être dans le futur.',
            'date_pointage.after' => 'La date ne peut pas être antérieure à 3 mois.',
            'heure_entree.required' => 'L\'heure d\'entrée est obligatoire.',
            'heure_entree.date_format' => 'L\'heure d\'entrée doit être au format HH:MM.',
            'heure_sortie.date_format' => 'L\'heure de sortie doit être au format HH:MM.',
            'heure_sortie.after' => 'L\'heure de sortie doit être postérieure à l\'heure d\'entrée.',
            'pause_debut.date_format' => 'L\'heure de début de pause doit être au format HH:MM.',
            'pause_debut.after' => 'L\'heure de début de pause doit être postérieure à l\'heure d\'entrée.',
            'pause_fin.date_format' => 'L\'heure de fin de pause doit être au format HH:MM.',
            'pause_fin.after' => 'L\'heure de fin de pause doit être postérieure au début de pause.',
            'pause_fin.before' => 'L\'heure de fin de pause doit être antérieure à l\'heure de sortie.',
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
            'date_pointage' => 'date',
            'heure_entree' => 'heure d\'entrée',
            'heure_sortie' => 'heure de sortie',
            'pause_debut' => 'début de pause',
            'pause_fin' => 'fin de pause',
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
                'message' => 'Les données du pointage ne sont pas valides.',
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
                'message' => 'Vous devez être connecté pour effectuer un pointage.',
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
            'statut' => $this->statut ?? 'present'
        ]);
    }

    /**
     * Get the validated data with calculated hours worked.
     *
     * @return array
     */
    public function validatedWithCalculations(): array
    {
        $validated = $this->validated();
        
        // Calculer les heures travaillées
        if (isset($validated['heure_entree']) && isset($validated['heure_sortie'])) {
            $entree = Carbon::createFromFormat('H:i', $validated['heure_entree']);
            $sortie = Carbon::createFromFormat('H:i', $validated['heure_sortie']);
            
            $heuresTravaillees = $sortie->diffInMinutes($entree) / 60;
            
            // Soustraire la pause si elle existe
            if (isset($validated['pause_debut']) && isset($validated['pause_fin'])) {
                $pauseDebut = Carbon::createFromFormat('H:i', $validated['pause_debut']);
                $pauseFin = Carbon::createFromFormat('H:i', $validated['pause_fin']);
                $heuresPause = $pauseFin->diffInMinutes($pauseDebut) / 60;
                $heuresTravaillees -= $heuresPause;
            }
            
            $validated['heures_travaillees'] = round($heuresTravaillees, 2);
        }
        
        return $validated;
    }
}