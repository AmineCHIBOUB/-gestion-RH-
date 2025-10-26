<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un administrateur par défaut
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Créer un utilisateur RH par défaut
        User::updateOrCreate(
            ['email' => 'rh@rh.com'],  // ✅ Changé de @admin.com à @rh.com
            [
                'name' => 'Responsable RH',
                'password' => Hash::make('password123'),
                'role' => 'rh',
                'email_verified_at' => now(),
            ]
        );

        // Créer un employé par défaut
        User::updateOrCreate(
            ['email' => 'employe@employe.com'],  // ✅ Changé de @admin.com à @employe.com
            [
                'name' => 'Employé Test',
                'password' => Hash::make('password123'),
                'role' => 'employe',
                'email_verified_at' => now(),
            ]
        );

        // Créer quelques employés supplémentaires
        for ($i = 2; $i <= 6; $i++) {
            User::updateOrCreate(
                ['email' => 'employe' . $i . '@employe.com'],  // ✅ Changé le domaine
                [
                    'name' => 'Employé ' . $i,
                    'password' => Hash::make('password123'),
                    'role' => 'employe',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}