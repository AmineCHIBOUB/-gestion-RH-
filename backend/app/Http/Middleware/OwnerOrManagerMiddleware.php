<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Employe;

class OwnerOrManagerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié.'
            ], 401);
        }

        // Admin et RH ont accès à tout
        if (in_array($user->role, ['admin', 'rh'])) {
            return $next($request);
        }

        // Pour les employés, vérifier qu'ils accèdent à leurs propres données
        $employeId = $request->route('employe') ?? $request->route('id');
        
        if ($employeId) {
            $employe = Employe::find($employeId);
            if (!$employe || $employe->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres données.'
                ], 403);
            }
        }

        return $next($request);
    }
}