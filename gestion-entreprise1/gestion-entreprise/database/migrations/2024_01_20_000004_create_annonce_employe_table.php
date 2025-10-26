<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonce_employe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annonce_id')->constrained()->onDelete('cascade');
            // Supprimer la contrainte
            $table->unsignedBigInteger('employe_id');
            $table->boolean('lue')->default(false);
            $table->datetime('date_lecture')->nullable();
            $table->timestamps();
            
            $table->unique(['annonce_id', 'employe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonce_employe');
    }
};