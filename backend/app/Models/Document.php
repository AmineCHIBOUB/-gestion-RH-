<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'type_document',
        'fichier_path',
        'fichier_nom',
        'fichier_taille',
        'mime_type',
        'est_public',
        'date_expiration',
        'cree_par',
        'departement_id',
        'priorite',
        'statut'
    ];

    protected $casts = [
        'est_public' => 'boolean',
        'date_expiration' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relations
    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function employes(): BelongsToMany
    {
        return $this->belongsToMany(Employe::class, 'document_employe')
                    ->withPivot('lu', 'date_lecture')
                    ->withTimestamps();
    }

    // Scopes
    public function scopePublics($query)
    {
        return $query->where('est_public', true);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type_document', $type);
    }

    public function scopeNonExpires($query)
    {
        return $query->where(function($q) {
            $q->whereNull('date_expiration')
              ->orWhere('date_expiration', '>', now());
        });
    }

    // Accesseurs
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->fichier_path);
    }

    public function getTailleFormateeAttribute()
    {
        $bytes = $this->fichier_taille;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}