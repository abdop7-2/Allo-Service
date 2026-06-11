<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            // null = public demande visible by every prestataire;
            // set = demande addressed to one specific prestataire
            $table->foreignId('prestataire_id')->nullable()->after('category_id')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('prestataire_id');
        });
    }
};
