<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Remove categories no longer offered. Existing demandes / prestataire
     * profiles in these categories are reassigned to a kept category so we
     * never wipe live accounts or break foreign keys.
     */
    public function up(): void
    {
        $remove = ['Informatique', 'Ménage', 'Déménagement', 'Maçonnerie'];

        $ids = DB::table('categories')->whereIn('nom', $remove)->pluck('id');
        if ($ids->isEmpty()) {
            return;
        }

        $fallback = DB::table('categories')
            ->whereNotIn('nom', $remove)
            ->orderBy('id')
            ->value('id');

        if ($fallback) {
            DB::table('prestataire_profiles')->whereIn('category_id', $ids)->update(['category_id' => $fallback]);
            DB::table('demandes')->whereIn('category_id', $ids)->update(['category_id' => $fallback]);
        }

        DB::table('categories')->whereIn('id', $ids)->delete();
    }

    public function down(): void
    {
        $rows = [
            ['nom' => 'Déménagement', 'icone' => 'truck'],
            ['nom' => 'Ménage',       'icone' => 'broom'],
            ['nom' => 'Informatique', 'icone' => 'laptop'],
            ['nom' => 'Maçonnerie',   'icone' => 'building'],
        ];

        foreach ($rows as $r) {
            if (!DB::table('categories')->where('nom', $r['nom'])->exists()) {
                DB::table('categories')->insert(array_merge($r, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }
};
