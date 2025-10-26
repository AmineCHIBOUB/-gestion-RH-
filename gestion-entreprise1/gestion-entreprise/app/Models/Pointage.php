<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pointage extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'date_pointage',
        'heure_entree',
        'heure_sortie',
        'pause_debut',
        'pause_fin',
        'heures_travaillees',
        'statut',
        'commentaire'
    ];

    protected $casts = [
        'date_pointage' => 'date',
        'heure_entree' => 'datetime',
        'heure_sortie' => 'datetime',
        'pause_debut' => 'datetime',
        'pause_fin' => 'datetime',
        'heures_travaillees' => 'decimal:2'
    ];

    // Relations
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }
}
