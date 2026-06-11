<?php

namespace Database\Seeders;

use App\Models\Demande;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemandeSeeder extends Seeder
{
    public function run(): void
    {
        $alice  = User::where('email', 'alice@example.com')->first();
        $bob    = User::where('email', 'bob@example.com')->first();
        $claire = User::where('email', 'claire@example.com')->first();

        $demandes = [
            [
                'client_id'      => $alice->id,
                'category_id'    => 1,
                'title'          => 'Fuite sous l\'évier de cuisine',
                'description'    => 'Il y a une fuite importante sous l\'évier. L\'eau s\'accumule dans le placard. Intervention urgente souhaitée.',
                'budget'         => 150.00,
                'city'           => 'Alger',
                'date_souhaitee' => now()->addDays(2)->toDateString(),
                'statut'         => 'ouverte',
            ],
            [
                'client_id'      => $alice->id,
                'category_id'    => 3,
                'title'          => 'Peinture salon et couloir',
                'description'    => 'Repeindre le salon (25m²) et le couloir (10m²). Couleur au choix du client.',
                'budget'         => 600.00,
                'city'           => 'Alger',
                'date_souhaitee' => now()->addDays(10)->toDateString(),
                'statut'         => 'ouverte',
            ],
            [
                'client_id'      => $bob->id,
                'category_id'    => 2,
                'title'          => 'Prise électrique défectueuse',
                'description'    => 'Trois prises dans le salon ne fonctionnent plus. Besoin d\'un diagnostic et réparation.',
                'budget'         => 80.00,
                'city'           => 'Oran',
                'date_souhaitee' => now()->addDays(3)->toDateString(),
                'statut'         => 'en_cours',
            ],
            [
                'client_id'      => $bob->id,
                'category_id'    => 5,
                'title'          => 'Installation climatiseur salon',
                'description'    => 'Installation d\'un climatiseur split dans le salon (30m²). Fourniture et pose.',
                'budget'         => 200.00,
                'city'           => 'Oran',
                'date_souhaitee' => now()->addDays(5)->toDateString(),
                'statut'         => 'ouverte',
            ],
            [
                'client_id'      => $claire->id,
                'category_id'    => 6,
                'title'          => 'Fabrication d\'une bibliothèque sur mesure',
                'description'    => 'Bibliothèque murale 3m x 2.5m en bois, avec portes basses. Style moderne.',
                'budget'         => 1200.00,
                'city'           => 'Constantine',
                'date_souhaitee' => now()->addDays(15)->toDateString(),
                'statut'         => 'ouverte',
            ],
            [
                'client_id'      => $claire->id,
                'category_id'    => 4,
                'title'          => 'Entretien jardin 200m²',
                'description'    => 'Tonte de pelouse, taille des haies et désherbage. Jardin de 200m².',
                'budget'         => 120.00,
                'city'           => 'Constantine',
                'date_souhaitee' => now()->addDays(7)->toDateString(),
                'statut'         => 'terminee',
            ],
            [
                'client_id'      => $alice->id,
                'category_id'    => 2,
                'title'          => 'Installation de luminaires au salon',
                'description'    => 'Pose de trois suspensions et vérification du tableau électrique.',
                'budget'         => null,
                'city'           => null,
                'date_souhaitee' => now()->addDays(6)->toDateString(),
                'statut'         => 'ouverte',
            ],
        ];

        foreach ($demandes as $data) {
            Demande::create($data);
        }
    }
}
