<?php

namespace Database\Seeders;

use App\Models\PrestataireProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class PrestataireProfileSeeder extends Seeder
{
    public function run(): void
    {
        // Prestataires are users 4–8 (created after the 3 clients)
        $profiles = [
            [
                'email'        => 'hassan@example.com',
                'category_id'  => 1, // Plomberie
                'bio'          => 'Plombier professionnel avec 10 ans d\'expérience. Intervention rapide.',
                'availability' => true,
                'rating_avg'   => 4.50,
            ],
            [
                'email'        => 'marie@example.com',
                'category_id'  => 2, // Électricité
                'bio'          => 'Électricienne certifiée, spécialisée en dépannage résidentiel.',
                'availability' => true,
                'rating_avg'   => 4.80,
            ],
            [
                'email'        => 'karim@example.com',
                'category_id'  => 3, // Peinture
                'bio'          => 'Peintre décorateur, intérieur et extérieur, devis gratuit.',
                'availability' => false,
                'rating_avg'   => 4.20,
            ],
            [
                'email'        => 'sophie@example.com',
                'category_id'  => 5, // Climatisation
                'bio'          => 'Technicienne en climatisation et chauffage : installation, entretien et dépannage.',
                'availability' => true,
                'rating_avg'   => 4.70,
            ],
            [
                'email'        => 'yacine@example.com',
                'category_id'  => 6, // Menuiserie
                'bio'          => 'Menuisier ébéniste, fabrication et pose de meubles sur mesure.',
                'availability' => true,
                'rating_avg'   => 4.60,
            ],
        ];

        foreach ($profiles as $data) {
            $user = User::where('email', $data['email'])->first();
            PrestataireProfile::create([
                'user_id'      => $user->id,
                'category_id'  => $data['category_id'],
                'bio'          => $data['bio'],
                'availability' => $data['availability'],
                'rating_avg'   => $data['rating_avg'],
            ]);
        }
    }
}
