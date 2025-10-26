<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaisieTemps extends Model
{
    use HasFactory;

    protected $table = 'saisies_temps';

    protected $fillable = [
        'feuille_temps_id',
        'date_travail',
        'heure_debut',
        'heure_fin',
        'pause_minutes',
        'heures_travaillees',
        'projet',
        'tache',
        'description'
    ];

    protected $casts = [
        'date_travail' => 'date',
        'heure_debut' => 'datetime',
        'heure_fin' => 'datetime',
        'heures_travaillees' => 'decimal:2',
        'pause_minutes' => 'integer'
    ];

    // Relations
    public function feuilleTemps(): BelongsTo
    {
        return $this->belongsTo(FeuilleTemps::class);
    }

    // Mutateurs
    public function setHeureDebutAttribute($value)
    {
        if ($value && $this->date_travail) {
            $this->attributes['heure_debut'] = $this->date_travail->format('Y-m-d') . ' ' . $value;
        }
    }

    public function setHeureFinAttribute($value)
    {
        if ($value && $this->date_travail) {
            $this->attributes['heure_fin'] = $this->date_travail->format('Y-m-d') . ' ' . $value;
        }
    }

    // Méthodes
    public function calculerHeures()
    {
        if ($this->heure_debut && $this->heure_fin) {
            $debut = $this->heure_debut;
            $fin = $this->heure_fin;
            $pause = $this->pause_minutes ?? 0;
            
            $diffMinutes = $fin->diffInMinutes($debut) - $pause;
            $this->heures_travaillees = round($diffMinutes / 60, 2);
            $this->save();
        }
    }
}