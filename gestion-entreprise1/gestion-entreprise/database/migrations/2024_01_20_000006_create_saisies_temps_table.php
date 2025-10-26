<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saisies_temps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feuille_temps_id')->constrained('feuilles_temps')->onDelete('cascade');
            $table->date('date_travail');
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->integer('pause_minutes')->default(0);
            $table->decimal('heures_travaillees', 4, 2)->default(0);
            $table->string('projet')->nullable();
            $table->string('tache')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['feuille_temps_id', 'date_travail']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saisies_temps');
    }
};