<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fichier extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_fichier',
        'nom_original',
        'chemin',
        'taille',
        'type_mime',
        'description',
        'employe_id',
        'facture_id',
        'uploaded_by'
    ];

    protected $casts = [
        'taille' => 'integer'
    ];

    // Relations
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }

    public function facture(): BelongsTo
    {
        return $this->belongsTo(Facture::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
