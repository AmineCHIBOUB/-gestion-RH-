<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BulletinPaie extends Model
{
    use HasFactory;

    protected $table = 'bulletins_paie';

    protected $fillable = [
        'employe_id',
        'mois',
        'annee',
        'salaire_base',
        'heures_travaillees',
        'primes',
        'bonus',
        'deductions',
        'cotisations_sociales',
        'impots',
        'salaire_net',
        'statut',
        'date_generation'
    ];

    protected $casts = [
        'salaire_base' => 'decimal:2',
        'heures_travaillees' => 'decimal:2',
        'primes' => 'decimal:2',
        'bonus' => 'decimal:2',
        'deductions' => 'decimal:2',
        'cotisations_sociales' => 'decimal:2',
        'impots' => 'decimal:2',
        'salaire_net' => 'decimal:2',
        'date_generation' => 'datetime'
    ];

    // Relations
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }

    public function elementsVariables(): HasMany
    {
        return $this->hasMany(ElementVariable::class, 'bulletin_paie_id');
    }
}