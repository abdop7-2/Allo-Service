<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nom' => 'Plomberie',        'icone' => 'wrench'],
            ['nom' => 'Électricité',      'icone' => 'bolt'],
            ['nom' => 'Peinture',         'icone' => 'paint-roller'],
            ['nom' => 'Jardinage',        'icone' => 'leaf'],
            ['nom' => 'Climatisation',    'icone' => 'snowflake'],
            ['nom' => 'Menuiserie',       'icone' => 'hammer'],
        ];

        DB::table('categories')->insert(array_map(fn($c) => array_merge($c, [
            'created_at' => now(),
            'updated_at' => now(),
        ]), $categories));
    }
}
