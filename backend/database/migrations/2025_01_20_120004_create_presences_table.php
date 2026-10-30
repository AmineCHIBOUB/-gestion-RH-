<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employe_id'); // Suppression de la contrainte
            $table->date('date_presence');
            $table->time('heure_arrivee')->nullable();
            $table->time('heure_depart')->nullable();
            $table->time('pause_debut')->nullable();
            $table->time('pause_fin')->nullable();
            $table->decimal('heures_travaillees', 5, 2)->nullable();
            $table->enum('statut', ['present', 'absent', 'retard', 'conge', 'maladie'])->default('present');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            $table->unique(['employe_id', 'date_presence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presences');
    }
};