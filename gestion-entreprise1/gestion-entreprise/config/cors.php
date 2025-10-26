<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:4200'], // ✅ Frontend Angular
    'allowed_headers' => ['*'],
    'supports_credentials' => true, // ✅ Pour Sanctum
];
