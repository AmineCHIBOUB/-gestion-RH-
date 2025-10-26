<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OffreEmploi extends Model
{
    use HasFactory;

    protected $table = 'offres_emploi';

    protected $fillable = [
        'titre',
        'description',
        'departement',
        'type_contrat',
        'salaire_min',
        'salaire_max',
        'date_limite',
        'date_publication',
        'statut',
        'competences_requises',
        'experience_requise',
        'lieu_travail'
    ];

    protected $casts = [
        'date_limite' => 'date',
        'date_publication' => 'date',
        'salaire_min' => 'decimal:2',
        'salaire_max' => 'decimal:2',
        'competences_requises' => 'array'
    ];

    // Relations
    public function candidatures(): HasMany
    {
        return $this->hasMany(Candidature::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'departement', 'nom');
    }
}