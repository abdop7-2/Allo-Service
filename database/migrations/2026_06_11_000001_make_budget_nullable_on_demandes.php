<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            // inDrive-style: clients no longer set a fixed budget — providers send quotes
            $table->decimal('budget', 10, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->decimal('budget', 10, 2)->nullable(false)->change();
        });
    }
};
