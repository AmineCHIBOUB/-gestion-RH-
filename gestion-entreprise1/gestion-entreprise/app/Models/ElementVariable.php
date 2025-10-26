<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElementVariable extends Model
{
    use HasFactory;

    protected $table = 'elements_variables';

    protected $fillable = [
        'employe_id',
        'bulletin_paie_id',
        'type',
        'libelle',
        'montant',
        'periode',
        'description'
    ];

    protected $casts = [
        'montant' => 'decimal:2'
    ];

    // Relations
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }

    public function bulletinPaie(): BelongsTo
    {
        return $this->belongsTo(BulletinPaie::class);
    }
}