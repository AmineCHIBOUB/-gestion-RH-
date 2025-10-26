<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employe_id'); // Suppression de la contrainte
            $table->date('date_pointage');
            $table->timestamp('heure_entree')->nullable();
            $table->timestamp('heure_sortie')->nullable();
            $table->timestamp('pause_debut')->nullable();
            $table->timestamp('pause_fin')->nullable();
            $table->decimal('heures_travaillees', 5, 2)->nullable();
            $table->enum('statut', ['present', 'absent', 'retard', 'conge'])->default('present');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            $table->unique(['employe_id', 'date_pointage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
