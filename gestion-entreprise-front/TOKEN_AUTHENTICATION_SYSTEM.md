# Système de Gestion des Tokens d'Authentification

## Vue d'ensemble

Ce document décrit le système complet de gestion des tokens d'authentification mis en place dans l'application Angular pour communiquer avec l'API Laravel.

## Architecture du Système

### 1. Flux d'Authentification

```
Utilisateur → Angular (Login) → Laravel API (/api/login) → Token JWT/Sanctum → Stockage Local → Requêtes Authentifiées
```

### 2. Composants Principaux

#### A. TokenService (`src/app/services/token.service.ts`)
**Responsabilités :**
- Stockage sécurisé des tokens dans localStorage
- Gestion de l'expiration des tokens
- Vérification des permissions et rôles
- Nettoyage automatique des tokens expirés

**Méthodes principales :**
```typescript
// Stockage du token
setToken(tokenData: TokenData): void

// Récupération du token
getToken(): string | null

// Vérification d'authentification
isAuthenticated(): boolean

// Gestion des rôles
hasRole(role: string): boolean
hasPermission(permission: string): boolean

// Nettoyage
clearToken(): void
```

#### B. AuthService (`src/app/services/auth.ts`)
**Responsabilités :**
- Gestion des requêtes d'authentification
- Interface avec l'API Laravel
- Gestion de l'état utilisateur

**Méthodes principales :**
```typescript
// Connexion
login(credentials: LoginRequest): Observable<AuthResponse>

// Déconnexion
logout(): Observable<any>

// Inscription
register(userData: RegisterRequest): Observable<AuthResponse>

// Changement de mot de passe
changePassword(data: ChangePasswordRequest): Observable<any>
```

#### C. AuthInterceptor (`src/app/interceptors/auth.interceptor.ts`)
**Responsabilités :**
- Ajout automatique du token Bearer dans les en-têtes HTTP
- Gestion des erreurs 401 (token expiré)
- Redirection automatique vers login en cas d'erreur d'authentification

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expiré, redirection vers login
      }
    })
  );
};
```

#### D. Guards de Protection (`src/app/guards/auth.guard.ts`)
**Types de guards disponibles :**

1. **authGuard** - Protection basique des routes
2. **publicGuard** - Routes publiques (login, register)
3. **roleGuard** - Protection par rôle
4. **permissionGuard** - Protection par permission
5. **adminGuard** - Accès administrateur uniquement
6. **hrGuard** - Accès RH et administrateur

## Configuration et Utilisation

### 1. Configuration dans app.config.ts

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // autres providers...
  ]
};
```

### 2. Protection des Routes

```typescript
// Dans app.routes.ts
import { authGuard, roleGuard, adminGuard } from './guards';

export const routes: Routes = [
  // Routes publiques
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  
  // Routes protégées
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  
  // Routes avec rôles spécifiques
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  
  // Routes RH
  { 
    path: 'employees', 
    component: EmployeesComponent,
    canActivate: [hrGuard]
  }
];
```

### 3. Utilisation dans les Composants

```typescript
import { AuthService, TokenService } from '../services';

@Component({...})
export class MyComponent {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}
  
  // Vérifier l'authentification
  isLoggedIn(): boolean {
    return this.tokenService.isAuthenticated();
  }
  
  // Vérifier les rôles
  isAdmin(): boolean {
    return this.tokenService.hasRole('admin');
  }
  
  // Vérifier les permissions
  canManageEmployees(): boolean {
    return this.tokenService.hasPermission('manage_employees');
  }
  
  // Déconnexion
  logout(): void {
    this.authService.logout().subscribe(() => {
      // Redirection automatique via l'intercepteur
    });
  }
}
```

## Sécurité et Bonnes Pratiques

### 1. Stockage des Tokens
- **localStorage** : Persistant entre les sessions
- **Expiration automatique** : Vérification à chaque utilisation
- **Nettoyage automatique** : Suppression des tokens expirés

### 2. Gestion des Erreurs
- **401 Unauthorized** : Token expiré ou invalide → Redirection login
- **403 Forbidden** : Permissions insuffisantes → Page d'erreur
- **Network errors** : Gestion des erreurs de connectivité

### 3. Sécurité
- **HTTPS uniquement** en production
- **Validation côté serveur** : Toujours vérifier les tokens côté Laravel
- **Expiration courte** : Tokens avec durée de vie limitée
- **Refresh automatique** : Renouvellement avant expiration

## Interfaces TypeScript

### TokenData
```typescript
export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: any;
}
```

### LoginRequest
```typescript
export interface LoginRequest {
  email: string;
  password: string;
}
```

### AuthResponse
```typescript
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
}
```

### User
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}
```

## Exemple d'Utilisation Complète

### 1. Connexion
```typescript
// Dans LoginComponent
onSubmit(): void {
  const credentials: LoginRequest = {
    email: this.loginForm.value.email,
    password: this.loginForm.value.password
  };

  this.authService.login(credentials).subscribe({
    next: (response) => {
      if (response.success) {
        // Token automatiquement stocké par AuthService
        this.router.navigate(['/dashboard']);
      }
    },
    error: (error) => {
      // Gestion des erreurs
    }
  });
}
```

### 2. Requête Authentifiée
```typescript
// Dans EmployeService
getEmployees(): Observable<Employe[]> {
  // Le token est automatiquement ajouté par l'intercepteur
  return this.http.get<Employe[]>(`${this.apiUrl}/employees`);
}
```

### 3. Vérification des Permissions
```typescript
// Dans un template
<button *ngIf="canManageEmployees()" 
        (click)="deleteEmployee()">
  Supprimer
</button>

// Dans le composant
canManageEmployees(): boolean {
  return this.tokenService.hasPermission('manage_employees');
}
```

## Débogage et Monitoring

### 1. Logs de Développement
```typescript
// Dans TokenService
console.log('Token expires in:', this.getTimeUntilExpiry(), 'seconds');
console.log('User role:', this.getUserRole());
console.log('User permissions:', this.getUser()?.permissions);
```

### 2. Monitoring de l'Expiration
```typescript
// Vérification périodique
setInterval(() => {
  if (this.tokenService.isAuthenticated()) {
    const timeLeft = this.tokenService.getTimeUntilExpiry();
    if (timeLeft < 300) { // 5 minutes
      console.warn('Token expires soon!');
    }
  }
}, 60000); // Vérifier chaque minute
```

## Intégration avec Laravel

### 1. Configuration CORS (Laravel)
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:4200'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 2. Middleware d'Authentification (Laravel)
```php
// Dans routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // autres routes protégées...
});
```

### 3. Réponse d'Authentification (Laravel)
```php
// Dans AuthController
public function login(Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (Auth::attempt($credentials)) {
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 3600,
                'user' => $user
            ]
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Invalid credentials'
    ], 401);
}
```

## Conclusion

Ce système de gestion des tokens offre :
- **Sécurité robuste** avec gestion automatique des tokens
- **Facilité d'utilisation** avec intercepteurs automatiques
- **Flexibilité** avec guards configurables
- **Maintenabilité** avec services modulaires
- **Expérience utilisateur** optimisée avec gestion des erreurs

Le système est prêt pour la production et peut être étendu selon les besoins spécifiques de l'application.