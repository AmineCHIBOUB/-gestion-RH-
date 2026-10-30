<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Obtenir les notifications de l'utilisateur
     * GET /notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filtrer par statut lu/non lu
        if ($request->has('unread_only') && $request->unread_only) {
            $query->whereNull('read_at');
        }

        $limit = $request->get('limit', 10);
        $notifications = $query->limit($limit)->get();

        return response()->json($notifications);
    }

    /**
     * Marquer une notification comme lue
     * PUT /notifications/{id}/read
     */
    public function markAsRead($id): JsonResponse
    {
        $user = Auth::user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification non trouvée'], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Marquer toutes les notifications comme lues
     * PUT /notifications/mark-all-read
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications marquées comme lues']);
    }

    /**
     * Obtenir le nombre de notifications non lues
     * GET /notifications/unread-count
     */
    public function getUnreadCount(): JsonResponse
    {
        $user = Auth::user();
        
        $count = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}