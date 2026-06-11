<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin / test client
        User::create([
            'name'     => 'Alice Dupont',
            'email'    => 'alice@example.com',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'phone'    => '0601010101',
        ]);

        User::create([
            'name'     => 'Bob Martin',
            'email'    => 'bob@example.com',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'phone'    => '0602020202',
        ]);

        User::create([
            'name'     => 'Claire Leroy',
            'email'    => 'claire@example.com',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'phone'    => '0603030303',
        ]);

        // Prestataires
        $prestataires = [
            ['name' => 'Hassan Benali',   'email' => 'hassan@example.com',   'phone' => '0611111111'],
            ['name' => 'Marie Fontaine',  'email' => 'marie@example.com',    'phone' => '0622222222'],
            ['name' => 'Karim Saidi',     'email' => 'karim@example.com',    'phone' => '0633333333'],
            ['name' => 'Sophie Bernard',  'email' => 'sophie@example.com',   'phone' => '0644444444'],
            ['name' => 'Yacine Bouzid',   'email' => 'yacine@example.com',   'phone' => '0655555555'],
        ];

        foreach ($prestataires as $data) {
            User::create(array_merge($data, [
                'password' => Hash::make('password'),
                'role'     => 'prestataire',
            ]));
        }
    }
}
