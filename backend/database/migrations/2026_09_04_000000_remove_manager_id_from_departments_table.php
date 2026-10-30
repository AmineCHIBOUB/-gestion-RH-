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
        Schema::table('departments', function (Blueprint $table) {
            // Drop foreign key constraint first if it exists
            $table->dropForeign(['manager_id']);
            // Then drop the column
            $table->dropColumn('manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            // Re-add the column
            $table->unsignedBigInteger('manager_id')->nullable();
            // Re-add foreign key constraint
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};