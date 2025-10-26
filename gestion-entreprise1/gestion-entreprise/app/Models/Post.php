<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'department_id',
        'salaire_min',
        'salaire_max',
        'niveau',
        'statut'
    ];

    protected $casts = [
        'salaire_min' => 'decimal:2',
        'salaire_max' => 'decimal:2',
        'niveau' => 'string',
        'statut' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}