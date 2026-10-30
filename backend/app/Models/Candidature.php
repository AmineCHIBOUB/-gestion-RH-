<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Candidature extends Model
{
    use HasFactory;

    protected $fillable = [
        'offre_emploi_id',
        'candidat_id',
        'statut',
        'date_candidature',
        'lettre_motivation',
        'cv_path',
        'commentaire',
        'note',
        'date_entretien'
    ];

    protected $casts = [
        'date_candidature' => 'datetime',
        'date_entretien' => 'datetime',
        'note' => 'integer'
    ];

    // Relations
    public function offreEmploi(): BelongsTo
    {
        return $this->belongsTo(OffreEmploi::class);
    }

    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class);
    }
}