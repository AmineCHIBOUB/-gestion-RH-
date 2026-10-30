<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateEmployeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les administrateurs et RH peuvent modifier des employés
        return $this->user() && in_array($this->user()->role, ['admin', 'rh']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $employeId = $this->route('employe');
        
        return [
            'nom' => 'sometimes|required|string|max:255|regex:/^[a-zA-ZÀ-ÿ\s\-\']+$/',
            'prenom' => 'sometimes|required|string|max:255|regex:/^[a-zA-ZÀ-ÿ\s\-\']+$/',
            'email' => [
                'sometimes',
                'required',
                'email:rfc,dns',
                'max:255',
                Rule::unique('employes', 'email')->ignore($employeId)
            ],
            'telephone' => 'sometimes|required|string|max:20|regex:/^[0-9+\-\s\.\(\)]+$/',
            'adresse' => 'sometimes|required|string|max:500',
            'poste' => 'sometimes|required|string|max:255|in:Développeur,Designer,Manager,RH,Comptable,Commercial,Stagiaire,Consultant',
            'salaire' => 'sometimes|required|numeric|min:1000|max:200000',
            'date_embauche' => 'sometimes|required|date|before_or_equal:today|after:1900-01-01',
            'numero_securite_sociale' => [
                'sometimes',
                'required',
                'string',
                'size:15',
                'regex:/^[0-9]{15}$/',
                Rule::unique('employes', 'numero_securite_sociale')->ignore($employeId)
            ],
            'statut' => 'sometimes|nullable|in:actif,inactif,conge',
            'user_name' => 'sometimes|required|string|max:255|min:2',
            'user_password' => 'sometimes|nullable|string|min:8|max:255|confirmed',
            'user_password_confirmation' => 'sometimes|nullable|string'
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
            'nom.required' => 'Le nom est obligatoire.',
            'nom.regex' => 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'prenom.regex' => 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'telephone.regex' => 'Le format du numéro de téléphone n\'est pas valide.',
            'adresse.required' => 'L\'adresse est obligatoire.',
            'adresse.max' => 'L\'adresse ne peut pas dépasser 500 caractères.',
            'poste.required' => 'Le poste est obligatoire.',
            'poste.in' => 'Le poste sélectionné n\'est pas valide.',
            'salaire.required' => 'Le salaire est obligatoire.',
            'salaire.min' => 'Le salaire doit être d\'au moins 1000 euros.',
            'salaire.max' => 'Le salaire ne peut pas dépasser 200000 euros.',
            'date_embauche.required' => 'La date d\'embauche est obligatoire.',
            'date_embauche.before_or_equal' => 'La date d\'embauche ne peut pas être dans le futur.',
            'date_embauche.after' => 'La date d\'embauche doit être postérieure à 1900.',
            'numero_securite_sociale.required' => 'Le numéro de sécurité sociale est obligatoire.',
            'numero_securite_sociale.size' => 'Le numéro de sécurité sociale doit contenir exactement 15 chiffres.',
            'numero_securite_sociale.unique' => 'Ce numéro de sécurité sociale est déjà utilisé.',
            'numero_securite_sociale.regex' => 'Le numéro de sécurité sociale ne doit contenir que des chiffres.',
            'statut.in' => 'Le statut sélectionné n\'est pas valide.',
            'user_name.required' => 'Le nom d\'utilisateur est obligatoire.',
            'user_name.min' => 'Le nom d\'utilisateur doit contenir au moins 2 caractères.',
            'user_password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'user_password.confirmed' => 'La confirmation du mot de passe ne correspond pas.'
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
                'message' => 'Les données fournies ne sont pas valides.',
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
                'message' => 'Vous n\'avez pas l\'autorisation de modifier cet employé.',
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
        $data = [];
        
        if ($this->has('nom')) {
            $data['nom'] = trim($this->nom);
        }
        
        if ($this->has('prenom')) {
            $data['prenom'] = trim($this->prenom);
        }
        
        if ($this->has('email')) {
            $data['email'] = strtolower(trim($this->email));
        }
        
        if ($this->has('telephone')) {
            $data['telephone'] = preg_replace('/[^0-9+\-\s\.\(\)]/', '', $this->telephone);
        }
        
        if ($this->has('adresse')) {
            $data['adresse'] = trim($this->adresse);
        }
        
        if ($this->has('poste')) {
            $data['poste'] = trim($this->poste);
        }
        
        if ($this->has('user_name')) {
            $data['user_name'] = trim($this->user_name);
        }
        
        $this->merge($data);
    }
}