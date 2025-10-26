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
        Schema::create('candidatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offre_emploi_id')->constrained('offres_emploi')->onDelete('cascade');
            $table->string('nom_candidat');
            $table->string('prenom_candidat');
            $table->string('email_candidat');
            $table->string('telephone_candidat')->nullable();
            $table->text('lettre_motivation')->nullable();
            $table->string('cv_path')->nullable();
            $table->enum('statut', ['nouvelle', 'en_cours', 'acceptee', 'refusee'])->default('nouvelle');
            $table->date('date_candidature');
            $table->text('notes_rh')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidatures');
    }
};