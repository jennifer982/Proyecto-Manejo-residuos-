<?php

// ==========================
// INICIAR SESIÓN
// ==========================

// Accede a la sesión actual del usuario.
session_start();

// ==========================
// ELIMINAR DATOS DE SESIÓN
// ==========================

// Elimina todas las variables almacenadas
// en la sesión actual.
session_unset();

// Destruye completamente la sesión.
session_destroy();

// ==========================
// CONFIGURACIÓN DE RESPUESTA
// ==========================

// Indica que la respuesta será enviada
// en formato JSON.
header('Content-Type: application/json');

// ==========================
// RESPUESTA EXITOSA
// ==========================

// Informa al frontend que el cierre
// de sesión se realizó correctamente.
echo json_encode([

    "success" => true

]);

?>