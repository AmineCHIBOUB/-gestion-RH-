<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Carbon\Carbon;
use App\Models\Pointage;

class UpdatePointageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        
        // Admin et RH peuvent modifier tous les pointages
        if (in_array($user->role, ['admin', 'rh'])) {
            return true;
        }
        
        // Un employé peut modifier ses propres pointages (seulement le jour même)
        $pointage = $this->route('pointage');
        if ($pointage && $pointage->employe_id === $user->employe->id) {
            $today = Carbon::today()->format('Y-m-d');
            if ($pointage->date === $today) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'employe_id' => 'sometimes|exists:employes,id',
            'date_pointage' => 'sometimes|date',
            'heure_entree' => 'sometimes|date_format:H:i',
            'heure_sortie' => 'sometimes|nullable|date_format:H:i|after:heure_entree',
            'pause_debut' => 'sometimes|nullable|date_format:H:i',
            'pause_fin' => 'sometimes|nullable|date_format:H:i|after:pause_debut',
            'statut' => 'sometimes|in:present,absent,retard,conge,maladie'
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'employe_id.exists' => 'L\'employé sélectionné n\'existe pas.',
            'date_pointage.date' => 'La date doit être une date valide.',
            'heure_entree.date_format' => 'L\'heure d\'entrée doit être au format HH:MM.',
            'heure_sortie.date_format' => 'L\'heure de sortie doit être au format HH:MM.',
            'heure_sortie.after' => 'L\'heure de sortie doit être postérieure à l\'heure d\'entrée.',
            'pause_debut.date_format' => 'L\'heure de début de pause doit être au format HH:MM.',
            'pause_fin.date_format' => 'L\'heure de fin de pause doit être au format HH:MM.',
            'pause_fin.after' => 'L\'heure de fin de pause doit être postérieure à l\'heure de début de pause.',
            'statut.in' => 'Le statut doit être : présent, absent, retard, congé ou maladie.'
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
                'message' => 'Vous n\'êtes pas autorisé à modifier ce pointage.',
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
        
        // Définir le statut par défaut si non fourni
        if (!$this->has('statut') && ($this->has('heure_entree') || $this->has('heure_sortie'))) {
            $data['statut'] = 'present';
        }
        
        $this->merge($data);
    }

    /**
     * Get validated data with calculated fields.
     */
    public function validatedWithCalculations(): array
    {
        $validated = $this->validated();
        $pointage = $this->route('pointage');
        
        // Utiliser les valeurs existantes si non fournies
        $heureEntree = $validated['heure_entree'] ?? $pointage->heure_entree;
        $heureSortie = $validated['heure_sortie'] ?? $pointage->heure_sortie;
        $pauseDebut = $validated['pause_debut'] ?? $pointage->pause_debut;
        $pauseFin = $validated['pause_fin'] ?? $pointage->pause_fin;
        $statut = $validated['statut'] ?? $pointage->statut;
        $datePointage = $validated['date_pointage'] ?? $pointage->date_pointage;
        
        // Calculer les heures travaillées
        $heuresTravaillees = 0;
        if ($heureEntree && $heureSortie && $statut === 'present') {
            $entree = Carbon::createFromFormat('H:i', $heureEntree);
            $sortie = Carbon::createFromFormat('H:i', $heureSortie);
            
            $heuresTravaillees = $sortie->diffInMinutes($entree) / 60;
            
            // Soustraire la pause si elle existe
            if ($pauseDebut && $pauseFin) {
                $pauseDebutCarbon = Carbon::createFromFormat('H:i', $pauseDebut);
                $pauseFinCarbon = Carbon::createFromFormat('H:i', $pauseFin);
                $heuresPause = $pauseFinCarbon->diffInMinutes($pauseDebutCarbon) / 60;
                $heuresTravaillees -= $heuresPause;
            }
        }
        
        $validated['heures_travaillees'] = round($heuresTravaillees, 2);
        
        return $validated;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $pointage = $this->route('pointage');
            
            // Vérifier que l'employé peut seulement modifier ses propres pointages (sauf admin/RH)
            if (isset($this->employe_id) && !in_array($user->role, ['admin', 'rh'])) {
                if ($this->employe_id !== $user->employe->id) {
                    $validator->errors()->add('employe_id', 'Vous ne pouvez modifier que vos propres pointages.');
                }
            }
            
            // Vérifier qu'il n'y a pas de doublon pour la même date (sauf le pointage actuel)
            if (isset($this->date_pointage)) {
                $employeId = $this->employe_id ?? $pointage->employe_id;
                
                $existingPointage = Pointage::where('employe_id', $employeId)
                    ->where('date_pointage', $this->date_pointage)
                    ->where('id', '!=', $pointage->id)
                    ->exists();
                
                if ($existingPointage) {
                    $validator->errors()->add('date_pointage', 'Un pointage existe déjà pour cette date.');
                }
            }
            
            // Vérifier les limites d'heures de travail
            $heureEntree = $this->heure_entree ?? $pointage->heure_entree;
            $heureSortie = $this->heure_sortie ?? $pointage->heure_sortie;
            
            if ($heureEntree && $heureSortie) {
                $entree = Carbon::createFromFormat('H:i', $heureEntree);
                $sortie = Carbon::createFromFormat('H:i', $heureSortie);
                $heuresTravaillees = $sortie->diffInMinutes($entree) / 60;
                
                if ($heuresTravaillees > 12) {
                    $validator->errors()->add('heure_sortie', 'La durée de travail ne peut pas dépasser 12 heures.');
                }
                
                // Vérifier les heures d'ouverture (6h-22h pour l'entrée, 6h-23h pour la sortie)
                if ($entree->hour < 6 || $entree->hour >= 22) {
                    $validator->errors()->add('heure_entree', 'L\'heure d\'entrée doit être entre 06:00 et 22:00.');
                }
                
                if ($sortie->hour < 6 || $sortie->hour >= 23) {
                    $validator->errors()->add('heure_sortie', 'L\'heure de sortie doit être entre 06:00 et 23:00.');
                }
            }
            
            // Vérifier la durée de pause
            $pauseDebut = $this->pause_debut ?? $pointage->pause_debut;
            $pauseFin = $this->pause_fin ?? $pointage->pause_fin;
            
            if ($pauseDebut && $pauseFin) {
                $pauseDebutCarbon = Carbon::createFromFormat('H:i', $pauseDebut);
                $pauseFinCarbon = Carbon::createFromFormat('H:i', $pauseFin);
                $dureePause = $pauseFinCarbon->diffInMinutes($pauseDebutCarbon) / 60;
                
                if ($dureePause > 2) {
                    $validator->errors()->add('pause_fin', 'La durée de pause ne peut pas dépasser 2 heures.');
                }
            }
        });
    }
}