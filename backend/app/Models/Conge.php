<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Conge extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'type_conge',
        'date_debut',
        'date_fin',
        'nombre_jours',
        'motif',
        'statut',
        'date_demande',
        'approuve_par'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_demande' => 'datetime'
    ];

    // Relations
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }

    public function approbateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approuve_par');
    }
}
