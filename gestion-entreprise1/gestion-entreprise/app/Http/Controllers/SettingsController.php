<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $settings = [
                'general' => [
                    'company_name' => config('app.name', 'Gestion Entreprise'),
                    'company_email' => 'contact@entreprise.com',
                    'company_phone' => '+33 1 23 45 67 89',
                    'timezone' => config('app.timezone', 'Europe/Paris'),
                    'language' => 'fr'
                ],
                'payroll' => [
                    'default_currency' => 'EUR',
                    'pay_frequency' => 'monthly',
                    'overtime_rate' => 1.5,
                    'tax_rate' => 0.20
                ],
                'documents' => [
                    'max_file_size' => '10MB',
                    'allowed_extensions' => ['pdf', 'doc', 'docx', 'jpg', 'png'],
                    'storage_path' => 'documents'
                ],
                'notifications' => [
                    'email_enabled' => true,
                    'sms_enabled' => false,
                    'push_enabled' => true
                ]
            ];
            
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des paramètres',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'general.company_name' => 'sometimes|string|max:255',
            'general.company_email' => 'sometimes|email',
            'general.company_phone' => 'sometimes|string|max:20',
            'payroll.default_currency' => 'sometimes|string|size:3',
            'payroll.overtime_rate' => 'sometimes|numeric|min:1',
            'payroll.tax_rate' => 'sometimes|numeric|between:0,1',
            'documents.max_file_size' => 'sometimes|string',
            'documents.allowed_extensions' => 'sometimes|array',
            'notifications.email_enabled' => 'sometimes|boolean',
            'notifications.sms_enabled' => 'sometimes|boolean',
            'notifications.push_enabled' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            // Simuler la sauvegarde des paramètres
            Cache::put('app_settings', $request->all(), 3600);
            
            return response()->json([
                'message' => 'Paramètres mis à jour avec succès',
                'data' => $request->all()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour des paramètres',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getGeneral(): JsonResponse
    {
        $settings = [
            'company_name' => config('app.name', 'Gestion Entreprise'),
            'company_email' => 'contact@entreprise.com',
            'company_phone' => '+33 1 23 45 67 89',
            'timezone' => config('app.timezone', 'Europe/Paris'),
            'language' => 'fr'
        ];
        
        return response()->json($settings);
    }

    public function updateGeneral(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'company_email' => 'required|email',
            'company_phone' => 'required|string|max:20',
            'timezone' => 'required|string',
            'language' => 'required|string|size:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            Cache::put('general_settings', $request->all(), 3600);
            
            return response()->json([
                'message' => 'Paramètres généraux mis à jour avec succès',
                'data' => $request->all()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour des paramètres généraux',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getPayroll(): JsonResponse
    {
        $settings = [
            'default_currency' => 'EUR',
            'pay_frequency' => 'monthly',
            'overtime_rate' => 1.5,
            'tax_rate' => 0.20
        ];
        
        return response()->json($settings);
    }

    public function updatePayroll(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'default_currency' => 'required|string|size:3',
            'pay_frequency' => 'required|in:weekly,biweekly,monthly',
            'overtime_rate' => 'required|numeric|min:1',
            'tax_rate' => 'required|numeric|between:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            Cache::put('payroll_settings', $request->all(), 3600);
            
            return response()->json([
                'message' => 'Paramètres de paie mis à jour avec succès',
                'data' => $request->all()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour des paramètres de paie',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}