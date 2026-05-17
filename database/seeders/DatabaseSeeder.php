<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminSeeder::class,
            KamarSeeder::class,
            TagihanSeeder::class,
            TestimoniSeeder::class,
            FaqSeeder::class,
        ]);
    }
}
