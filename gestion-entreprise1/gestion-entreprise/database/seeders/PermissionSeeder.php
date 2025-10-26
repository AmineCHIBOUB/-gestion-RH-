<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            ['name' => 'users.view', 'display_name' => 'Voir les utilisateurs', 'module' => 'users', 'description' => 'Consulter la liste des utilisateurs'],
            ['name' => 'users.create', 'display_name' => 'Créer des utilisateurs', 'module' => 'users', 'description' => 'Créer de nouveaux utilisateurs'],
            ['name' => 'users.edit', 'display_name' => 'Modifier les utilisateurs', 'module' => 'users', 'description' => 'Modifier les informations des utilisateurs'],
            ['name' => 'users.delete', 'display_name' => 'Supprimer les utilisateurs', 'module' => 'users', 'description' => 'Supprimer des utilisateurs'],
            
            ['name' => 'roles.view', 'display_name' => 'Voir les rôles', 'module' => 'roles', 'description' => 'Consulter la liste des rôles'],
            ['name' => 'roles.create', 'display_name' => 'Créer des rôles', 'module' => 'roles', 'description' => 'Créer de nouveaux rôles'],
            ['name' => 'roles.edit', 'display_name' => 'Modifier les rôles', 'module' => 'roles', 'description' => 'Modifier les rôles existants'],
            ['name' => 'roles.delete', 'display_name' => 'Supprimer les rôles', 'module' => 'roles', 'description' => 'Supprimer des rôles'],
            
            ['name' => 'employees.view', 'display_name' => 'Voir les employés', 'module' => 'employees', 'description' => 'Consulter la liste des employés'],
            ['name' => 'employees.create', 'display_name' => 'Créer des employés', 'module' => 'employees', 'description' => 'Ajouter de nouveaux employés'],
            ['name' => 'employees.edit', 'display_name' => 'Modifier les employés', 'module' => 'employees', 'description' => 'Modifier les informations des employés'],
            ['name' => 'employees.delete', 'display_name' => 'Supprimer les employés', 'module' => 'employees', 'description' => 'Supprimer des employés'],
            
            ['name' => 'reports.view', 'display_name' => 'Voir les rapports', 'module' => 'reports', 'description' => 'Consulter les rapports'],
            ['name' => 'reports.export', 'display_name' => 'Exporter les rapports', 'module' => 'reports', 'description' => 'Exporter les rapports'],
            
            ['name' => 'admin.full_access', 'display_name' => 'Accès administrateur complet', 'module' => 'admin', 'description' => 'Accès complet à toutes les fonctionnalités']
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}