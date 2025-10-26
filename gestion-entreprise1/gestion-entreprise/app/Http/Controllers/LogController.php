<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class LogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $logPath = storage_path('logs/laravel.log');
            
            if (!File::exists($logPath)) {
                return response()->json([
                    'data' => [],
                    'message' => 'Aucun fichier de log trouvé'
                ]);
            }
            
            $logs = $this->parseLogs($logPath, $request->get('limit', 100));
            
            return response()->json([
                'data' => $logs,
                'total' => count($logs),
                'generated_at' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function system(Request $request): JsonResponse
    {
        try {
            $systemLogs = [
                [
                    'id' => 1,
                    'level' => 'info',
                    'message' => 'Système démarré avec succès',
                    'timestamp' => now()->subHours(2),
                    'context' => 'system'
                ],
                [
                    'id' => 2,
                    'level' => 'warning',
                    'message' => 'Utilisation mémoire élevée détectée',
                    'timestamp' => now()->subHour(),
                    'context' => 'performance'
                ]
            ];
            
            return response()->json([
                'data' => $systemLogs,
                'total' => count($systemLogs),
                'generated_at' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des logs système',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function audit(Request $request): JsonResponse
    {
        try {
            $auditLogs = [
                [
                    'id' => 1,
                    'user_id' => 1,
                    'action' => 'login',
                    'resource' => 'auth',
                    'ip_address' => '127.0.0.1',
                    'timestamp' => now()->subMinutes(30)
                ],
                [
                    'id' => 2,
                    'user_id' => 1,
                    'action' => 'create',
                    'resource' => 'user',
                    'ip_address' => '127.0.0.1',
                    'timestamp' => now()->subMinutes(15)
                ]
            ];
            
            return response()->json([
                'data' => $auditLogs,
                'total' => count($auditLogs),
                'generated_at' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des logs d\'audit',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function parseLogs(string $logPath, int $limit): array
    {
        $logs = [];
        $content = File::get($logPath);
        $lines = array_slice(explode("\n", $content), -$limit);
        
        foreach ($lines as $index => $line) {
            if (empty(trim($line))) continue;
            
            $logs[] = [
                'id' => $index + 1,
                'level' => $this->extractLogLevel($line),
                'message' => $this->extractLogMessage($line),
                'timestamp' => $this->extractLogTimestamp($line),
                'raw' => $line
            ];
        }
        
        return array_reverse($logs);
    }

    private function extractLogLevel(string $line): string
    {
        if (preg_match('/\.(ERROR|WARNING|INFO|DEBUG)/', $line, $matches)) {
            return strtolower($matches[1]);
        }
        return 'info';
    }

    private function extractLogMessage(string $line): string
    {
        $parts = explode(': ', $line, 2);
        return isset($parts[1]) ? $parts[1] : $line;
    }

    private function extractLogTimestamp(string $line): string
    {
        if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
            return $matches[1];
        }
        return now()->toDateTimeString();
    }
}