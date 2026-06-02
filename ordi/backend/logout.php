<?php

// Recuperar sesión
session_start();

// Eliminar variables
session_unset();

// Destruir sesión
session_destroy();

// Respuesta JSON
echo json_encode([
    "success"=>true
]);

?>