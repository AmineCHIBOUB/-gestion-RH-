<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['admin', 'rh']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'type_document' => 'sometimes|required|in:contrat,politique,procedure,formation,autre',
            'fichier' => 'sometimes|file|max:10240|mimes:pdf,doc,docx,txt',
            'obligatoire' => 'sometimes|boolean',
            'date_expiration' => 'sometimes|nullable|date|after:today',
            'employes' => 'sometimes|nullable|array',
            'employes.*' => 'exists:employes,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titre.required' => 'Le titre du document est obligatoire.',
            'type_document.in' => 'Le type de document doit être : contrat, politique, procédure, formation ou autre.',
            'fichier.max' => 'Le fichier ne doit pas dépasser 10 Mo.',
            'fichier.mimes' => 'Le fichier doit être au format PDF, DOC, DOCX ou TXT.',
            'employes.*.exists' => 'Un ou plusieurs employés sélectionnés n\'existent pas.'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Les données du document ne sont pas valides.',
                'errors' => $validator->errors(),
                'status' => 'error'
            ], 422)
        );
    }
}