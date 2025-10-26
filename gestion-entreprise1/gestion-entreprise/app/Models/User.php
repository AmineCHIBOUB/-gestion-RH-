<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str; // ← Import déjà présent
// Ajout des imports manquants pour les relations
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'first_name',
        'last_name', 
        'email',
        'phone',
        'password',
        'role',
        'is_active',
        'department_id',
        'post_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relations existantes
    public function employe(): HasOne
    {
        return $this->hasOne(Employe::class);
    }

    public function congesApprouves(): HasMany
    {
        return $this->hasMany(Conge::class, 'approuve_par');
    }

    public function fichiersUploades(): HasMany
    {
        return $this->hasMany(Fichier::class, 'uploaded_by');
    }

    // Nouvelles relations pour l'admin
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // SUPPRIMEZ cette relation problématique :
    // public function roles(): BelongsToMany
    // {
    //     return $this->belongsToMany(Role::class, 'user_roles');
    // }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    // Méthodes utilitaires
    public function hasRole(string $role): bool
    {
        return $this->role === $role; // Utilise seulement la colonne 'role' simple
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name) ?: $this->name;
    }
}
