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
        Schema::create('offres', function (Blueprint $table) {
        $table->id();
        $table->foreignId('demande_id')->constrained()->onDelete('cascade');
        $table->foreignId('prestataire_id')->constrained('users')->onDelete('cascade');
        $table->decimal('devis', 10, 2);
        $table->text('message');
        $table->enum('statut', ['en_attente', 'acceptee', 'refusee'])->default('en_attente');
        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offres');
    }
};