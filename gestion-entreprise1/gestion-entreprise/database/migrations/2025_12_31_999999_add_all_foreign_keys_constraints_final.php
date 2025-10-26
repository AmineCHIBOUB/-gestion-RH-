<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Contraintes pour la table employes
        Schema::table('employes', function (Blueprint $table) {
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('set null');
        });

        // 2. Contraintes pour la table documents
        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('departement_id')->references('id')->on('departments')->onDelete('set null');
        });

        // 3. Contraintes employe_id SEULEMENT (document_id et annonce_id existent déjà)
        Schema::table('document_employe', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('annonce_employe', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        // 4. Toutes les autres tables avec employe_id
        Schema::table('feuilles_temps', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('bulletins_paie', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('elements_variables', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('presences', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('pointages', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('conges', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        Schema::table('fichiers', function (Blueprint $table) {
            $table->foreign('employe_id')->references('id')->on('employes')->onDelete('cascade');
        });

        // 5. Contrainte manager_id (À LA FIN pour éviter les dépendances circulaires)
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('manager_id')->references('id')->on('employes')->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Supprimer dans l'ordre inverse
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
        });

        Schema::table('fichiers', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('conges', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('pointages', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('presences', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('elements_variables', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('bulletins_paie', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('feuilles_temps', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('annonce_employe', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('document_employe', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['departement_id']);
        });

        Schema::table('employes', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['post_id']);
        });
    }
};
