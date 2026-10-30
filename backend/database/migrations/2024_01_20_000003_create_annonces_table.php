<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->longText('contenu');
            $table->enum('type_annonce', [
                'generale', 'rh', 'technique', 'securite', 
                'evenement', 'formation', 'urgente'
            ]);
            $table->enum('priorite', ['basse', 'normale', 'haute', 'urgente'])->default('normale');
            $table->datetime('date_debut');
            $table->datetime('date_fin')->nullable();
            $table->string('fichier_joint_path')->nullable();
            $table->string('fichier_joint_nom')->nullable();
            $table->json('cible_departements')->nullable(); // IDs des départements ciblés
            $table->json('cible_roles')->nullable(); // Rôles ciblés
            $table->foreignId('cree_par')->constrained('users');
            $table->enum('statut', ['brouillon', 'publiee', 'archivee'])->default('brouillon');
            $table->boolean('epinglee')->default(false);
            $table->timestamps();
            
            $table->index(['statut', 'date_debut', 'date_fin']);
            $table->index(['type_annonce', 'priorite']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};