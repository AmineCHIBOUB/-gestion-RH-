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
        Schema::create('elements_variables', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employe_id'); // Suppression de la contrainte
            $table->foreignId('bulletin_paie_id')->nullable()->constrained('bulletins_paie')->onDelete('cascade');
            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('type', ['prime', 'bonus', 'deduction', 'remboursement']);
            $table->decimal('montant', 10, 2);
            $table->integer('mois');
            $table->integer('annee');
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('elements_variables');
    }
};