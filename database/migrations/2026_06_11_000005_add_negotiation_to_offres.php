<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offres', function (Blueprint $table) {
            // price the client counter-proposes during negotiation
            $table->decimal('counter_devis', 10, 2)->nullable()->after('devis');
        });

        DB::statement("ALTER TABLE offres MODIFY statut ENUM('en_attente','acceptee','refusee','negociation') NOT NULL DEFAULT 'en_attente'");
    }

    public function down(): void
    {
        DB::table('offres')->where('statut', 'negociation')->update(['statut' => 'en_attente']);
        DB::statement("ALTER TABLE offres MODIFY statut ENUM('en_attente','acceptee','refusee') NOT NULL DEFAULT 'en_attente'");

        Schema::table('offres', function (Blueprint $table) {
            $table->dropColumn('counter_devis');
        });
    }
};
