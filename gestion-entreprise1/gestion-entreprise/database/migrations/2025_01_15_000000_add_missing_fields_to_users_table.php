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
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('phone')->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('role');
            $table->unsignedBigInteger('department_id')->nullable()->after('is_active');
            $table->unsignedBigInteger('post_id')->nullable()->after('department_id');
            
            // Ajouter les contraintes de clés étrangères
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['post_id']);
            $table->dropColumn(['first_name', 'last_name', 'phone', 'is_active', 'department_id', 'post_id']);
        });
    }
};