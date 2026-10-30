<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreEmployeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les administrateurs peuvent créer des employés
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
            'nom' => 'required|string|max:255|regex:/^[a-zA-ZÀ-ÿ\s\-\']+$/',
            'prenom' => 'required|string|max:255|regex:/^[a-zA-ZÀ-ÿ\s\-\']+$/',
            'email' => 'required|email:rfc,dns|unique:employes,email|max:255',
            'telephone' => 'nullable|string|max:20|regex:/^[+]?[0-9\s\-\.\(\)]+$/',
            'adresse' => 'nullable|string|max:500',
            // Fix: Change from hardcoded strings to foreign key validation
            'post_id' => 'required|exists:posts,id',
            'department_id' => 'required|exists:departments,id',
            'salaire' => 'required|numeric|min:1000|max:200000',
            'date_embauche' => 'required|date|before_or_equal:today|after:1900-01-01',
            'numero_securite_sociale' => 'required|string|regex:/^[0-9]{13,15}$/|unique:employes,numero_securite_sociale',
            'statut' => 'nullable|in:actif,inactif,suspendu',
            'user_name' => 'required|string|max:255|min:2|unique:users,name',
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
            'telephone.regex' => 'Le format du numéro de téléphone n\'est pas valide.',
            'telephone.max' => 'Le numéro de téléphone ne peut pas dépasser 20 caractères.',
            'adresse.max' => 'L\'adresse ne peut pas dépasser 500 caractères.',
            'post_id.required' => 'Le poste est obligatoire.',
            'post_id.exists' => 'Le poste sélectionné n\'est pas valide.',
            'department_id.required' => 'Le département est obligatoire.',
            'department_id.exists' => 'Le département sélectionné n\'est pas valide.',
            'salaire.required' => 'Le salaire est obligatoire.',
            'salaire.min' => 'Le salaire doit être d\'au moins 1000 euros.',
            'salaire.max' => 'Le salaire ne peut pas dépasser 200000 euros.',
            'date_embauche.required' => 'La date d\'embauche est obligatoire.',
            'date_embauche.before_or_equal' => 'La date d\'embauche ne peut pas être dans le futur.',
            'date_embauche.after' => 'La date d\'embauche doit être postérieure à 1900.',
            'numero_securite_sociale.required' => 'Le numéro de sécurité sociale est obligatoire.',
            'numero_securite_sociale.regex' => 'Le numéro de sécurité sociale doit contenir entre 13 et 15 chiffres.',
            'numero_securite_sociale.unique' => 'Ce numéro de sécurité sociale est déjà utilisé.',
            'statut.in' => 'Le statut sélectionné n\'est pas valide.',
            'user_name.required' => 'Le nom d\'utilisateur est obligatoire.',
            'user_name.min' => 'Le nom d\'utilisateur doit contenir au moins 2 caractères.',
            'user_name.unique' => 'Ce nom d\'utilisateur est déjà utilisé.',
            'user_password.required' => 'Le mot de passe est obligatoire.',
            'user_password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'user_password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'user_password_confirmation.required' => 'La confirmation du mot de passe est obligatoire.'
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
            'nom' => 'nom',
            'prenom' => 'prénom',
            'email' => 'adresse email',
            'telephone' => 'numéro de téléphone',
            'adresse' => 'adresse',
            'poste' => 'poste',
            'departement' => 'département',
            'salaire' => 'salaire',
            'date_embauche' => 'date d\'embauche',
            'numero_securite_sociale' => 'numéro de sécurité sociale',
            'statut' => 'statut',
            'user_name' => 'nom d\'utilisateur',
            'user_password' => 'mot de passe'
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
                'message' => 'Vous n\'avez pas l\'autorisation de créer un employé.',
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
            'nom' => trim($this->nom),
            'prenom' => trim($this->prenom),
            'email' => strtolower(trim($this->email)),
            'telephone' => $this->telephone ? trim($this->telephone) : null,
            'adresse' => $this->adresse ? trim($this->adresse) : null,
            'poste' => trim($this->poste),
            'departement' => trim($this->departement),
            'user_name' => trim($this->user_name),
            'statut' => $this->statut ?? 'actif'
        ]);
    }
}