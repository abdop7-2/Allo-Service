<?php

namespace Database\Seeders;

use App\Models\Avis;
use App\Models\Offre;
use App\Models\User;
use Illuminate\Database\Seeder;

class AvisSeeder extends Seeder
{
    public function run(): void
    {
        $alice  = User::where('email', 'alice@example.com')->first();
        $claire = User::where('email', 'claire@example.com')->first();
        $hassan = User::where('email', 'hassan@example.com')->first();
        $marie  = User::where('email', 'marie@example.com')->first();

        // Avis for offre 1 (Alice → Hassan, plomberie)
        $offre1 = Offre::find(1);
        Avis::create([
            'client_id'      => $alice->id,
            'prestataire_id' => $hassan->id,
            'offre_id'       => $offre1->id,
            'note'           => 5,
            'commentaire'    => 'Travail impeccable, très ponctuel et professionnel. Je recommande vivement.',
        ]);

        // Avis for offre 3 (Bob → Marie, électricité)
        $bob   = User::where('email', 'bob@example.com')->first();
        $offre3 = Offre::find(3);
        Avis::create([
            'client_id'      => $bob->id,
            'prestataire_id' => $marie->id,
            'offre_id'       => $offre3->id,
            'note'           => 4,
            'commentaire'    => 'Bonne intervention, rapide et efficace. Tarif raisonnable.',
        ]);

        // Avis for offre 6 (Claire → Hassan, jardinage)
        $offre6 = Offre::find(6);
        Avis::create([
            'client_id'      => $claire->id,
            'prestataire_id' => $hassan->id,
            'offre_id'       => $offre6->id,
            'note'           => 5,
            'commentaire'    => 'Jardin nickel, très satisfaite du résultat !',
        ]);
    }
}
