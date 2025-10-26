<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facture extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_facture',
        'client_nom',
        'client_email',
        'client_adresse',
        'date_emission',
        'date_echeance',
        'montant_ht',
        'taux_tva',
        'montant_ttc',
        'statut',
        'description'
    ];

    protected $casts = [
        'date_emission' => 'date',
        'date_echeance' => 'date',
        'montant_ht' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2'
    ];

    // Relations
    public function fichiers(): HasMany
    {
        return $this->hasMany(Fichier::class);
    }
}
