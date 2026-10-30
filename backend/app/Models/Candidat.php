<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidat extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'adresse',
        'date_naissance',
        'niveau_etude',
        'experience_annees',
        'competences',
        'linkedin_url',
        'statut'
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'competences' => 'array',
        'experience_annees' => 'integer'
    ];

    // Relations
    public function candidatures(): HasMany
    {
        return $this->hasMany(Candidature::class);
    }
}