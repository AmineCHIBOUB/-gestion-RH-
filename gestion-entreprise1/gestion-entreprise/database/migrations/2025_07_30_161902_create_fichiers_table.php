<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fichiers', function (Blueprint $table) {
            $table->id();
            $table->string('nom_fichier');
            $table->string('nom_original');
            $table->string('chemin');
            $table->bigInteger('taille');
            $table->string('type_mime');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('employe_id')->nullable(); // Suppression de la contrainte
            $table->foreignId('facture_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fichiers');
    }
};
