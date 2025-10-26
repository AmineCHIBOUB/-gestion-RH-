<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Hash;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // L'utilisateur doit être authentifié
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string'
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Le mot de passe actuel est obligatoire.',
            'current_password.string' => 'Le mot de passe actuel doit être une chaîne de caractères.',
            'new_password.required' => 'Le nouveau mot de passe est obligatoire.',
            'new_password.string' => 'Le nouveau mot de passe doit être une chaîne de caractères.',
            'new_password.min' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
            'new_password.confirmed' => 'La confirmation du nouveau mot de passe ne correspond pas.',
            'new_password_confirmation.required' => 'La confirmation du nouveau mot de passe est obligatoire.',
            'new_password_confirmation.string' => 'La confirmation du nouveau mot de passe doit être une chaîne de caractères.'
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
                'message' => 'Vous devez être connecté pour changer votre mot de passe.',
                'error' => 'Non authentifié.',
                'status' => 'error'
            ], 401)
        );
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            
            // Vérifier que le mot de passe actuel est correct
            if ($this->current_password && $user) {
                if (!Hash::check($this->current_password, $user->password)) {
                    $validator->errors()->add('current_password', 'Le mot de passe actuel est incorrect.');
                }
            }
            
            // Vérifier que le nouveau mot de passe est différent de l'ancien
            if ($this->new_password && $user) {
                if (Hash::check($this->new_password, $user->password)) {
                    $validator->errors()->add('new_password', 'Le nouveau mot de passe doit être différent du mot de passe actuel.');
                }
            }
            
            // Validation supplémentaire de la complexité du mot de passe
            if ($this->new_password) {
                // Au moins une lettre majuscule
                if (!preg_match('/[A-Z]/', $this->new_password)) {
                    $validator->errors()->add('new_password', 'Le nouveau mot de passe doit contenir au moins une lettre majuscule.');
                }
                
                // Au moins une lettre minuscule
                if (!preg_match('/[a-z]/', $this->new_password)) {
                    $validator->errors()->add('new_password', 'Le nouveau mot de passe doit contenir au moins une lettre minuscule.');
                }
                
                // Au moins un chiffre
                if (!preg_match('/[0-9]/', $this->new_password)) {
                    $validator->errors()->add('new_password', 'Le nouveau mot de passe doit contenir au moins un chiffre.');
                }
                
                // Au moins un caractère spécial
                if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $this->new_password)) {
                    $validator->errors()->add('new_password', 'Le nouveau mot de passe doit contenir au moins un caractère spécial.');
                }
            }
        });
    }

    /**
     * Get the validated data with hashed password.
     */
    public function validatedWithHashedPassword(): array
    {
        $validated = $this->validated();
        $validated['new_password'] = Hash::make($validated['new_password']);
        
        return $validated;
    }
}