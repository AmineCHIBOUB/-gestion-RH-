<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\FichierController;
use App\Http\Controllers\PointageController;
use App\Http\Controllers\AdminController; // Ajouter cette ligne

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route de test CORS
Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS configuré avec succès !',
        'status' => 'success',
        'timestamp' => now(),
        'server' => 'Laravel ' . app()->version()
    ]);
});

// Routes d'authentification (publiques) - utiliser le middleware web pour les sessions
Route::prefix('auth')->middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Routes protégées par authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/permissions', [AuthController::class, 'permissions']);
        Route::get('/is-manager', [AuthController::class, 'isManager']);
        Route::get('/has-role/{role}', [AuthController::class, 'hasRole']);
    });
});

// Profile routes with proper authentication middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [EmployeController::class, 'myProfile']); // Mon profil
    Route::put('profile', [EmployeController::class, 'updateProfile']); // Modifier mon profil
});

// // Routes protégées par authentification
// Route::middleware('auth:sanctum')->group(function () {
    
//     // Routes réservées aux administrateurs
//     // Routes pour Admin uniquement
//     Route::middleware('admin')->group(function () {
//         // === ROUTES ADMIN NOUVELLES ===
//         Route::prefix('admin')->group(function () {
//             // Dashboard et statistiques
//             Route::get('/dashboard/stats', [AdminController::class, 'dashboardStats']);
//             Route::get('/system/health', [AdminController::class, 'systemHealth']);
            
//             // Gestion des utilisateurs
//             Route::get('/users', [AdminController::class, 'getUsers']);
//             Route::post('/users', [AdminController::class, 'createUser']);
//             Route::put('/users/{user}', [AdminController::class, 'updateUser']);
//             Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
//             Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
//             Route::patch('/users/{user}/reset-password', [AdminController::class, 'resetUserPassword']);
//         });
        
//         // SUPPRIMER CES LIGNES (69-75) :

//         // Route::get('employes/create', [EmployeController::class, 'create']);
//         // Route::get('employes/statistics', [EmployeController::class, 'statistics']);
//         // Route::post('employes/bulk-action', [EmployeController::class, 'bulkAction']);
        
//         // === GESTION DES FACTURES ===
//         Route::apiResource('factures', FactureController::class);
//         Route::get('factures/create', [FactureController::class, 'create']); // Données pour formulaire
//         Route::get('factures/search', [FactureController::class, 'search']);
//         Route::put('factures/{id}/mark-as-paid', [FactureController::class, 'markAsPaid']);
//         Route::put('factures/{id}/mark-as-overdue', [FactureController::class, 'markAsOverdue']);
//         Route::get('factures/statistics', [FactureController::class, 'statistics']); // Statistiques factures
//         Route::post('factures/bulk-action', [FactureController::class, 'bulkAction']); // Actions en lot
//         Route::get('factures/export', [FactureController::class, 'export']); // Export PDF/Excel
        
//         // === GESTION SYSTÈME ===
//         Route::get('dashboard/admin-stats', [AuthController::class, 'adminDashboardStats']);
//         Route::get('users', [AuthController::class, 'getAllUsers']);
//         Route::put('users/{user}/role', [AuthController::class, 'updateUserRole']);
//     });
    
//     // Routes pour Admin et RH
//     Route::middleware('rh')->group(function () {
//         // === CONSULTATION EMPLOYÉS ===
//         Route::get('employes', [EmployeController::class, 'index']);
//         Route::get('employes/search', [EmployeController::class, 'search']);
//         Route::get('employes/{employe}', [EmployeController::class, 'show']);
//         Route::get('employes/{employe}/profile', [EmployeController::class, 'profile']); // Profil détaillé
//         Route::get('employes/{employe}/history', [EmployeController::class, 'history']); // Historique employé
        
//         // === GESTION DES CONGÉS ===
//         Route::get('conges', [CongeController::class, 'index']);
//         Route::get('conges/pending', [CongeController::class, 'pending']);
//         Route::get('conges/approved', [CongeController::class, 'approved']);
//         Route::get('conges/rejected', [CongeController::class, 'rejected']);
//         Route::get('conges/statistics', [CongeController::class, 'statistics']);
//         Route::put('conges/{id}/approve', [CongeController::class, 'approve']);
//         Route::put('conges/{id}/reject', [CongeController::class, 'reject']);
//         Route::get('conges/{conge}', [CongeController::class, 'show']);
//         Route::get('conges/calendar', [CongeController::class, 'calendar']); // Vue calendrier
        
//         // === GESTION DES POINTAGES ===
//         Route::get('pointages', [PointageController::class, 'index']);
//         Route::get('pointages/rapport', [PointageController::class, 'rapport']);
//         Route::get('pointages/statistics', [PointageController::class, 'statistics']);
//         Route::get('pointages/{pointage}', [PointageController::class, 'show']);
//         Route::get('pointages/export', [PointageController::class, 'export']); // Export rapports
//         Route::get('pointages/daily-report', [PointageController::class, 'dailyReport']);
//         Route::get('pointages/monthly-report', [PointageController::class, 'monthlyReport']);
        
//         // === CONSULTATION DES FICHIERS ===
//         Route::get('fichiers', [FichierController::class, 'index']);
//         Route::get('fichiers/{fichier}', [FichierController::class, 'show']);
//         Route::get('fichiers/employee/{employeId}', [FichierController::class, 'getByEmployee']);
//         Route::get('fichiers/facture/{factureId}', [FichierController::class, 'getByFacture']);
//         Route::get('fichiers/search', [FichierController::class, 'search']);
        
//         // === DASHBOARD RH ===
//         Route::get('dashboard/rh-stats', [AuthController::class, 'rhDashboardStats']);
//     });
    
//     // Routes accessibles à tous les utilisateurs authentifiés (avec vérification propriétaire)
//     Route::middleware('owner.or.manager')->group(function () {
//         // === GESTION DES CONGÉS PERSONNELS ===
//         Route::post('conges', [CongeController::class, 'store']);
//         Route::put('conges/{conge}', [CongeController::class, 'update']);
//         Route::delete('conges/{conge}', [CongeController::class, 'destroy']);
//         Route::get('conges/employee/{employeId}', [CongeController::class, 'getByEmployee']);
//         Route::get('conges/my-conges', [CongeController::class, 'myConges']); // Mes congés
//         Route::get('conges/my-balance', [CongeController::class, 'myBalance']); // Solde de congés
        
//         // === GESTION DES POINTAGES PERSONNELS ===
//         Route::post('pointages/clock-in', [PointageController::class, 'clockIn']);
//         Route::post('pointages/clock-out', [PointageController::class, 'clockOut']);
//         Route::get('pointages/current-status', [PointageController::class, 'currentStatus']); // Statut actuel
//         Route::get('pointages/employee/{employeId}', [PointageController::class, 'getByEmployee']);
//         Route::get('pointages/my-pointages', [PointageController::class, 'myPointages']); // Mes pointages
//         Route::post('pointages', [PointageController::class, 'store']);
//         Route::put('pointages/{pointage}', [PointageController::class, 'update']);
//         Route::delete('pointages/{pointage}', [PointageController::class, 'destroy']);
        
//         // === PROFIL PERSONNEL ===
//         Route::get('profile', [EmployeController::class, 'myProfile']); // Mon profil
//         Route::put('profile', [EmployeController::class, 'updateProfile']); // Modifier mon profil
//     });
    
//     // === GESTION DES FICHIERS (tous les utilisateurs authentifiés) ===
//     Route::post('fichiers', [FichierController::class, 'store']);
//     Route::put('fichiers/{fichier}', [FichierController::class, 'update']);
//     Route::delete('fichiers/{fichier}', [FichierController::class, 'destroy']);
//     Route::get('fichiers/{id}/download', [FichierController::class, 'download']);
//     Route::post('fichiers/upload', [FichierController::class, 'upload']); // Upload multiple
//     Route::get('fichiers/my-files', [FichierController::class, 'myFiles']); // Mes fichiers
    
//     // === ROUTES GÉNÉRALES AUTHENTIFIÉES ===
//     Route::get('/user', function (Request $request) {
//         return $request->user();
//     });
//     Route::get('dashboard/stats', [AuthController::class, 'dashboardStats']); // Statistiques générales
//     Route::get('notifications', [AuthController::class, 'notifications']); // Notifications
//     Route::put('notifications/{id}/read', [AuthController::class, 'markNotificationAsRead']);
// });

 // Modifier mon profil
//     });

// === ROUTES PUBLIQUES ===
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'timestamp' => now()]);
});

// Route pour récupérer les informations de l'entreprise (publique)
Route::get('/company-info', function () {
    return response()->json([
        'name' => config('app.name', 'Gestion Entreprise'),
        'version' => '1.0.0',
        'contact' => 'contact@entreprise.com'
    ]);
});

// Route pour vérifier la disponibilité d'un email (publique)
Route::post('/check-email', function (Request $request) {
    $request->validate(['email' => 'required|email']);
    $exists = \App\Models\User::where('email', $request->email)->exists();
    return response()->json(['available' => !$exists]);
});

// Ajoutez ces imports en haut du fichier
use App\Http\Controllers\PaieController;
use App\Http\Controllers\RecrutementController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SettingsController;

// Ajoutez ces routes dans la section admin middleware
// Change this line:
// Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

// To this (option 1 - if you have a middleware that accepts multiple roles):
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Dashboard et statistiques
    Route::get('/dashboard/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/system/health', [AdminController::class, 'systemHealth']);
    
    // Gestion des utilisateurs
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::put('/users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
    Route::patch('/users/{user}/reset-password', [AdminController::class, 'resetUserPassword']);
    
    Route::get('employes', [EmployeController::class, 'index']);
    Route::post('employes', [EmployeController::class, 'store']);
    Route::put('employes/{employe}', [EmployeController::class, 'update']);
    Route::delete('employes/{employe}', [EmployeController::class, 'destroy']);
    Route::get('pointages', [PointageController::class, 'index']);
        Route::post('pointages', [PointageController::class, 'store']);
        Route::post('conges', [CongeController::class, 'store']);
        Route::put('conges/{conge}', [CongeController::class, 'update']);
        Route::delete('conges/{conge}', [CongeController::class, 'destroy']);
        Route::get('conges/employee/{employeId}', [CongeController::class, 'getByEmployee']);
        Route::get('conges/my-conges', [CongeController::class, 'myConges']); // Mes congés
        Route::get('conges/my-balance', [CongeController::class, 'myBalance']); // Solde de congés

        Route::get('conges', [CongeController::class, 'index']);
        Route::get('conges/pending', [CongeController::class, 'pending']);
        Route::get('conges/approved', [CongeController::class, 'approved']);
        Route::get('conges/rejected', [CongeController::class, 'rejected']);
        Route::get('conges/statistics', [CongeController::class, 'statistics']);
        Route::put('conges/{id}/approve', [CongeController::class, 'approve']);
        Route::put('conges/{id}/reject', [CongeController::class, 'reject']);
        Route::get('conges/{conge}', [CongeController::class, 'show']);
        Route::get('conges/calendar', [CongeController::class, 'calendar']); // Vue calendrier


    // Routes pour les rôles
    Route::apiResource('roles', RoleController::class);
    Route::get('permissions', [RoleController::class, 'getPermissions']);
    
    // Routes pour les départements
    Route::apiResource('departments', DepartmentController::class);
    
    // routes

    // Posts routes
        Route::apiResource('posts', PostController::class);



    // Routes pour les rapports
    Route::prefix('reports')->group(function () {
        Route::post('users', [ReportController::class, 'users']);
        Route::post('activities', [ReportController::class, 'activities']);
        Route::post('attendance', [ReportController::class, 'attendance']);
        Route::post('leaves', [ReportController::class, 'leaves']);
    });
    
    // Routes pour les logs
    Route::prefix('logs')->group(function () {
        Route::get('/', [LogController::class, 'index']);
        Route::get('system', [LogController::class, 'system']);
        Route::get('audit', [LogController::class, 'audit']);
    });
    
    // Routes pour les paramètres
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::put('/', [SettingsController::class, 'update']);
        Route::get('general', [SettingsController::class, 'getGeneral']);
        Route::put('general', [SettingsController::class, 'updateGeneral']);
        Route::get('payroll', [SettingsController::class, 'getPayroll']);
        Route::put('payroll', [SettingsController::class, 'updatePayroll']);
    });
});
Route::middleware('auth:sanctum')->group(function () {
        Route::get('/bulletins/{id}/download', [App\Http\Controllers\BulletinPaieController::class, 'downloadBulletin']);
});
// Routes pour les bulletins de paie employé
// Remove the separate middleware group (lines 300-302)
// And move the download route into the main bulletins group:

Route::middleware('auth:sanctum')->group(function () {
    // Static routes first
    Route::get('/bulletins/all', [App\Http\Controllers\BulletinPaieController::class, 'getAllBulletins']);
    Route::post('/bulletins/generate-all', [App\Http\Controllers\BulletinPaieController::class, 'generateBulletinsForAllEmployees']);
    Route::get('/bulletins/my-bulletins', [App\Http\Controllers\BulletinPaieController::class, 'getMesBulletins']);
    Route::get('/bulletins/years', [App\Http\Controllers\BulletinPaieController::class, 'getAvailableYears']);
    Route::get('/bulletins/download-all/{mois}/{annee}', [App\Http\Controllers\BulletinPaieController::class, 'downloadAllBulletins']);
    
    // Specific dynamic routes before general ones
    Route::get('/bulletins/{id}/download', [App\Http\Controllers\BulletinPaieController::class, 'downloadBulletin']);
    
    // General dynamic route LAST
    Route::get('/bulletins/{id}', [App\Http\Controllers\BulletinPaieController::class, 'getBulletin']);
});

// Routes pour les notifications
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);
});

// Routes pour le dashboard
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', [App\Http\Controllers\DashboardController::class, 'getStats']);
});

// Routes pour les présences RH (Admin/RH uniquement)
Route::middleware(['auth:sanctum', 'role:Admin,RH'])->prefix('rh')->group(function () {
    // Présences
    Route::get('/presences', [App\Http\Controllers\PresenceController::class, 'index']);
    Route::get('/presences/statistiques', [App\Http\Controllers\PresenceController::class, 'getStatistiques']);
    Route::get('/presences/export', [App\Http\Controllers\PresenceController::class, 'export']);
    Route::get('/presences/planning', [App\Http\Controllers\PresenceController::class, 'getPlanning']);
    
    // Rapports RH complets
    Route::get('/rapports/presences', [App\Http\Controllers\ReportController::class, 'rapportPresences']);
    Route::get('/rapports/conges', [App\Http\Controllers\ReportController::class, 'rapportConges']);
    Route::get('/rapports/paie', [App\Http\Controllers\ReportController::class, 'rapportPaie']);
    Route::post('/rapports/export', [App\Http\Controllers\ReportController::class, 'exportRapport']);
});

// Routes d'authentification (publiques) - supprimer le middleware web
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Routes protégées par authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/permissions', [AuthController::class, 'permissions']);
        Route::get('/is-manager', [AuthController::class, 'isManager']);
        Route::get('/has-role/{role}', [AuthController::class, 'hasRole']);
    });
});



