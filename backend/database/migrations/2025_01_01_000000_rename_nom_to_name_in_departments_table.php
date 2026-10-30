<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            // Ajouter la nouvelle colonne name
            $table->string('name')->after('id');
        });
        
        // Copier les données de nom vers name
        DB::statement('UPDATE departments SET name = nom');
        
        Schema::table('departments', function (Blueprint $table) {
            // Supprimer l'ancienne colonne nom
            $table->dropColumn('nom');
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            // Ajouter l'ancienne colonne nom
            $table->string('nom')->after('id');
        });
        
        // Copier les données de name vers nom
        DB::statement('UPDATE departments SET nom = name');
        
        Schema::table('departments', function (Blueprint $table) {
            // Supprimer la nouvelle colonne name
            $table->dropColumn('name');
        });
    }
};