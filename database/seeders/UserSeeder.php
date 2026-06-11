<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Clients
        User::create([
            'name'     => 'Alice Dupont',
            'email'    => 'alice@example.com',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'phone'    => '0601010101',
            'avatar'   => 'https://randomuser.me/api/portraits/women/68.jpg',
        ]);

        User::create([
            'name'     => 'Bob Martin',
            'email'    => 'bob@example.com',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'phone'    => '0602020202',
            'avatar'   => 'https://randomuser.me/api/portraits/men/32.jpg',
        ]);

        User::create([
            'name'     => 'Claire Leroy',
            'email'    => 'claire@example.com',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'phone'    => '0603030303',
            'avatar'   => 'https://randomuser.me/api/portraits/women/44.jpg',
        ]);

        // Prestataires
        $prestataires = [
            ['name' => 'Hassan Benali',  'email' => 'hassan@example.com', 'phone' => '0611111111', 'avatar' => 'https://randomuser.me/api/portraits/men/75.jpg'],
            ['name' => 'Marie Fontaine', 'email' => 'marie@example.com',  'phone' => '0622222222', 'avatar' => 'https://randomuser.me/api/portraits/women/65.jpg'],
            ['name' => 'Karim Saidi',    'email' => 'karim@example.com',  'phone' => '0633333333', 'avatar' => 'https://randomuser.me/api/portraits/men/22.jpg'],
            ['name' => 'Sophie Bernard', 'email' => 'sophie@example.com', 'phone' => '0644444444', 'avatar' => 'https://randomuser.me/api/portraits/women/29.jpg'],
            ['name' => 'Yacine Bouzid',  'email' => 'yacine@example.com', 'phone' => '0655555555', 'avatar' => 'https://randomuser.me/api/portraits/men/85.jpg'],
        ];

        foreach ($prestataires as $data) {
            User::create(array_merge($data, [
                'password' => Hash::make('password'),
                'role'     => 'prestataire',
            ]));
        }
    }
}
