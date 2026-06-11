<?php

namespace Database\Seeders;

use App\Models\Demande;
use App\Models\Offre;
use App\Models\User;
use Illuminate\Database\Seeder;

class OffreSeeder extends Seeder
{
    public function run(): void
    {
        $hassan = User::where('email', 'hassan@example.com')->first();
        $marie  = User::where('email', 'marie@example.com')->first();
        $karim  = User::where('email', 'karim@example.com')->first();
        $sophie = User::where('email', 'sophie@example.com')->first();
        $yacine = User::where('email', 'yacine@example.com')->first();

        // Demande 1 — Fuite évier (plomberie) → Hassan
        $d1 = Demande::find(1);
        Offre::create([
            'demande_id'     => $d1->id,
            'prestataire_id' => $hassan->id,
            'devis'          => 130.00,
            'message'        => 'Je peux intervenir dès demain matin. Diagnostic gratuit, pièces incluses.',
            'statut'         => 'acceptee',
        ]);

        // Demande 2 — Peinture salon → Karim
        $d2 = Demande::find(2);
        Offre::create([
            'demande_id'     => $d2->id,
            'prestataire_id' => $karim->id,
            'devis'          => 550.00,
            'message'        => 'Je propose une peinture acrylique haut de gamme, 2 couches garanties.',
            'statut'         => 'en_attente',
        ]);

        // Demande 3 — Électricité → Marie (en_cours)
        $d3 = Demande::find(3);
        Offre::create([
            'demande_id'     => $d3->id,
            'prestataire_id' => $marie->id,
            'devis'          => 75.00,
            'message'        => 'Diagnostic et remplacement des prises défectueuses, garantie 1 an.',
            'statut'         => 'acceptee',
        ]);

        // Demande 4 — Ménage → Sophie
        $d4 = Demande::find(4);
        Offre::create([
            'demande_id'     => $d4->id,
            'prestataire_id' => $sophie->id,
            'devis'          => 180.00,
            'message'        => 'Nettoyage complet avec produits professionnels inclus.',
            'statut'         => 'en_attente',
        ]);

        // Demande 5 — Bibliothèque → Yacine
        $d5 = Demande::find(5);
        Offre::create([
            'demande_id'     => $d5->id,
            'prestataire_id' => $yacine->id,
            'devis'          => 1100.00,
            'message'        => 'Fabrication en chêne massif, finition vernis mat. Délai 3 semaines.',
            'statut'         => 'en_attente',
        ]);

        // Demande 6 — Jardin (terminee) → already done, offre accepted
        $d6 = Demande::find(6);
        $offre6 = Offre::create([
            'demande_id'     => $d6->id,
            'prestataire_id' => $hassan->id,
            'devis'          => 110.00,
            'message'        => 'Entretien jardin avec matériel professionnel.',
            'statut'         => 'acceptee',
        ]);
    }
}
