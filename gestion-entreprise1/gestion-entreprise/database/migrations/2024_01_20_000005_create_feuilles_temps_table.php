<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feuilles_temps', function (Blueprint $table) {
            $table->id();
            // Supprimer la contrainte de clé étrangère
            $table->unsignedBigInteger('employe_id');
            $table->integer('annee');
            $table->integer('semaine');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->decimal('heures_regulieres', 5, 2)->default(0);
            $table->decimal('heures_supplementaires', 5, 2)->default(0);
            $table->decimal('heures_totales', 5, 2)->default(0);
            $table->enum('statut', ['brouillon', 'soumise', 'validee', 'rejetee'])->default('brouillon');
            $table->text('commentaire')->nullable();
            $table->foreignId('valide_par')->nullable()->constrained('users');
            $table->datetime('date_validation')->nullable();
            $table->datetime('date_soumission')->nullable();
            $table->timestamps();
            
            $table->unique(['employe_id', 'annee', 'semaine']);
            $table->index(['statut', 'date_soumission']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feuilles_temps');
    }
};