<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Annonce extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'contenu',
        'type_annonce',
        'priorite',
        'date_debut',
        'date_fin',
        'fichier_joint_path',
        'fichier_joint_nom',
        'cible_departements',
        'cible_roles',
        'cree_par',
        'statut',
        'epinglee'
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'cible_departements' => 'array',
        'cible_roles' => 'array',
        'epinglee' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relations
    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    public function employes(): BelongsToMany
    {
        return $this->belongsToMany(Employe::class, 'annonce_employe')
                    ->withPivot('lue', 'date_lecture')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeActives($query)
    {
        return $query->where('statut', 'publiee')
                    ->where('date_debut', '<=', now())
                    ->where(function($q) {
                        $q->whereNull('date_fin')
                          ->orWhere('date_fin', '>=', now());
                    });
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type_annonce', $type);
    }

    public function scopeParPriorite($query, $priorite)
    {
        return $query->where('priorite', $priorite);
    }

    public function scopeEpinglees($query)
    {
        return $query->where('epinglee', true);
    }

    // Accesseurs
    public function getFichierJointUrlAttribute()
    {
        return $this->fichier_joint_path ? asset('storage/' . $this->fichier_joint_path) : null;
    }

    public function getEstActiveAttribute()
    {
        return $this->statut === 'publiee' 
            && $this->date_debut <= now() 
            && ($this->date_fin === null || $this->date_fin >= now());
    }
}