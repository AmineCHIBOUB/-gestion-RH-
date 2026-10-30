<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeuilleTemps extends Model
{
    use HasFactory;

    protected $table = 'feuilles_temps';

    protected $fillable = [
        'employe_id',
        'annee',
        'semaine',
        'date_debut',
        'date_fin',
        'heures_regulieres',
        'heures_supplementaires',
        'heures_totales',
        'statut',
        'commentaire',
        'valide_par',
        'date_validation',
        'date_soumission'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'heures_regulieres' => 'decimal:2',
        'heures_supplementaires' => 'decimal:2',
        'heures_totales' => 'decimal:2',
        'date_validation' => 'datetime',
        'date_soumission' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relations
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }

    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    public function saisiesTemps(): HasMany
    {
        return $this->hasMany(SaisieTemps::class);
    }

    // Scopes
    public function scopeParStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    public function scopeParEmploye($query, $employeId)
    {
        return $query->where('employe_id', $employeId);
    }

    public function scopeParPeriode($query, $annee, $semaine = null)
    {
        $query->where('annee', $annee);
        if ($semaine) {
            $query->where('semaine', $semaine);
        }
        return $query;
    }

    // Méthodes
    public function calculerHeures()
    {
        $heuresRegulieres = 0;
        $heuresSupplementaires = 0;

        foreach ($this->saisiesTemps as $saisie) {
            $heuresJour = $saisie->heures_travaillees;
            if ($heuresRegulieres + $heuresJour <= 35) {
                $heuresRegulieres += $heuresJour;
            } else {
                $heuresRestantes = 35 - $heuresRegulieres;
                $heuresRegulieres = 35;
                $heuresSupplementaires += ($heuresJour - $heuresRestantes);
            }
        }

        $this->update([
            'heures_regulieres' => $heuresRegulieres,
            'heures_supplementaires' => $heuresSupplementaires,
            'heures_totales' => $heuresRegulieres + $heuresSupplementaires
        ]);
    }
}