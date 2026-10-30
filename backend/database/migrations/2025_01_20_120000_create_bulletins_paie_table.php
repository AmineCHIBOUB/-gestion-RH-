<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bulletins_paie', function (Blueprint $table) {
            $table->id();
            // Supprimer la contrainte de clé étrangère
            $table->unsignedBigInteger('employe_id');
            $table->integer('mois');
            $table->integer('annee');
            $table->decimal('salaire_base', 10, 2);
            $table->decimal('heures_travaillees', 8, 2)->default(0);
            $table->decimal('primes', 10, 2)->default(0);
            $table->decimal('bonus', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('cotisations_sociales', 10, 2)->default(0);
            $table->decimal('impots', 10, 2)->default(0);
            $table->decimal('salaire_net', 10, 2);
            $table->enum('statut', ['brouillon', 'valide', 'envoye', 'archive'])->default('brouillon');
            $table->timestamp('date_generation')->nullable();
            $table->timestamps();
            
            // Index unique pour éviter les doublons
            $table->unique(['employe_id', 'mois', 'annee']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulletins_paie');
    }
};