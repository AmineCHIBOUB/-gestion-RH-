<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreFichierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Tous les utilisateurs authentifiés peuvent uploader des fichiers
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
            'nom' => 'required|string|max:255|regex:/^[a-zA-Z0-9À-ÿ\s\-_\.\(\)]+$/',
            'description' => 'nullable|string|max:1000',
            'fichier' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif,zip,rar',
            'employe_id' => 'nullable|exists:employes,id',
            'facture_id' => 'nullable|exists:factures,id',
            'type_fichier' => 'required|in:contrat,facture,document_rh,rapport,autre'
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
            // Vérifier que l'employé peut uploader pour lui-même ou que c'est un admin/RH
            if ($this->employe_id && $this->user()) {
                $userEmploye = $this->user()->employe;
                
                if (!in_array($this->user()->role, ['admin', 'rh']) && 
                    (!$userEmploye || $userEmploye->id != $this->employe_id)) {
                    $validator->errors()->add('employe_id', 'Vous ne pouvez uploader des fichiers que pour vous-même.');
                }
            }
            
            // Vérifier que le type de fichier correspond au contexte
            if ($this->type_fichier === 'facture' && !$this->facture_id) {
                $validator->errors()->add('facture_id', 'Une facture doit être sélectionnée pour un fichier de type facture.');
            }
            
            if ($this->type_fichier === 'contrat' && !$this->employe_id) {
                $validator->errors()->add('employe_id', 'Un employé doit être sélectionné pour un fichier de type contrat.');
            }
            
            if ($this->type_fichier === 'document_rh' && !$this->employe_id) {
                $validator->errors()->add('employe_id', 'Un employé doit être sélectionné pour un document RH.');
            }
            
            // Vérifier que l'employé et la facture ne sont pas tous les deux spécifiés
            if ($this->employe_id && $this->facture_id) {
                $validator->errors()->add('employe_id', 'Un fichier ne peut pas être associé à la fois à un employé et à une facture.');
            }
            
            // Vérifier la taille du fichier selon le type
            if ($this->hasFile('fichier')) {
                $file = $this->file('fichier');
                $extension = strtolower($file->getClientOriginalExtension());
                
                // Limites spécifiques selon le type de fichier
                $imageMimes = ['jpg', 'jpeg', 'png', 'gif'];
                $documentMimes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
                $archiveMimes = ['zip', 'rar'];
                
                if (in_array($extension, $imageMimes) && $file->getSize() > 5 * 1024 * 1024) { // 5MB pour images
                    $validator->errors()->add('fichier', 'Les images ne peuvent pas dépasser 5 MB.');
                }
                
                if (in_array($extension, $archiveMimes) && $file->getSize() > 20 * 1024 * 1024) { // 20MB pour archives
                    $validator->errors()->add('fichier', 'Les archives ne peuvent pas dépasser 20 MB.');
                }
                
                // Vérifier que le nom du fichier n'est pas trop long
                if (strlen($file->getClientOriginalName()) > 255) {
                    $validator->errors()->add('fichier', 'Le nom du fichier est trop long (maximum 255 caractères).');
                }
                
                // Vérifier que le fichier n'est pas corrompu
                if ($file->getError() !== UPLOAD_ERR_OK) {
                    $validator->errors()->add('fichier', 'Le fichier semble être corrompu ou l\'upload a échoué.');
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
            'nom.required' => 'Le nom du fichier est obligatoire.',
            'nom.max' => 'Le nom du fichier ne peut pas dépasser 255 caractères.',
            'nom.regex' => 'Le nom du fichier contient des caractères non autorisés.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
            'fichier.required' => 'Le fichier est obligatoire.',
            'fichier.file' => 'Le fichier uploadé n\'est pas valide.',
            'fichier.max' => 'Le fichier ne peut pas dépasser 10 MB.',
            'fichier.mimes' => 'Le type de fichier n\'est pas autorisé. Types acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG, GIF, ZIP, RAR.',
            'employe_id.exists' => 'L\'employé sélectionné n\'existe pas.',
            'facture_id.exists' => 'La facture sélectionnée n\'existe pas.',
            'type_fichier.required' => 'Le type de fichier est obligatoire.',
            'type_fichier.in' => 'Le type de fichier sélectionné n\'est pas valide.'
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
            'nom' => 'nom du fichier',
            'description' => 'description',
            'fichier' => 'fichier',
            'employe_id' => 'employé',
            'facture_id' => 'facture',
            'type_fichier' => 'type de fichier'
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
                'message' => 'Les données du fichier ne sont pas valides.',
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
                'message' => 'Vous devez être connecté pour uploader un fichier.',
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
        $data = [];
        
        if ($this->has('nom')) {
            $data['nom'] = trim($this->nom);
        }
        
        if ($this->has('description')) {
            $data['description'] = $this->description ? trim($this->description) : null;
        }
        
        // Convertir les chaînes vides en null pour les IDs
        if ($this->has('employe_id') && $this->employe_id === '') {
            $data['employe_id'] = null;
        }
        
        if ($this->has('facture_id') && $this->facture_id === '') {
            $data['facture_id'] = null;
        }
        
        $this->merge($data);
    }

    /**
     * Get the validated data with file information.
     *
     * @return array
     */
    public function validatedWithFileInfo(): array
    {
        $validated = $this->validated();
        
        if ($this->hasFile('fichier')) {
            $file = $this->file('fichier');
            
            $validated['nom_original'] = $file->getClientOriginalName();
            $validated['taille'] = $file->getSize();
            $validated['type_mime'] = $file->getMimeType();
            $validated['extension'] = $file->getClientOriginalExtension();
        }
        
        return $validated;
    }
}