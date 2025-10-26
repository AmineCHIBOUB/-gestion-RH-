<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employe_id'); // Suppression de la contrainte
            $table->enum('type_conge', ['conges_payes', 'maladie', 'maternite', 'paternite', 'sans_solde', 'formation']);
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('nombre_jours');
            $table->text('motif')->nullable();
            $table->enum('statut', ['en_attente', 'approuve', 'refuse'])->default('en_attente');
            $table->timestamp('date_demande')->useCurrent();
            $table->foreignId('approuve_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conges');
    }
};
