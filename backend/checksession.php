<?php

// ==========================
// INICIAR SESIÓN
// ==========================

// Inicia o recupera la sesión actual.
session_start();

// La respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// ==========================
// CONFIGURACIÓN DE INACTIVIDAD
// ==========================

// Tiempo máximo permitido sin actividad.
//
// Nota:
// El comentario indica 10 minutos, pero el valor
// 6000000 segundos equivale aproximadamente a 69 días.
//
// Para 10 minutos debería ser:
// 600 segundos.
$tiempo_inactividad = 6000000;

// ==========================
// VERIFICAR EXISTENCIA DE SESIÓN
// ==========================

// Comprueba si existe el rol del usuario.
if (!isset($_SESSION['rol'])) {

    echo json_encode([

        "success" => true,

        "sesion" => false,

        "rol" => null

    ]);

    exit();
}

// ==========================
// VERIFICAR INACTIVIDAD
// ==========================

// Comprueba si existe un registro
// del último acceso.
if (isset($_SESSION['ultimo_acceso'])) {

    // Calcula cuánto tiempo ha pasado
    // desde la última actividad.
    $tiempo_transcurrido =
        time() - $_SESSION['ultimo_acceso'];

    // Si supera el tiempo permitido.
    if ($tiempo_transcurrido > $tiempo_inactividad) {

        // Elimina todas las variables de sesión.
        session_unset();

        // Destruye la sesión actual.
        session_destroy();

        echo json_encode([

            "success" => false,

            "sesion" => false,

            "error" => "Sesión expirada"

        ]);

        exit();
    }
}

// ==========================
// ACTUALIZAR ÚLTIMO ACCESO
// ==========================

// Guarda la hora actual para reiniciar
// el contador de inactividad.
$_SESSION['ultimo_acceso'] = time();

// ==========================
// SESIÓN VÁLIDA
// ==========================

// Devuelve información indicando
// que la sesión sigue activa.
echo json_encode([

    "success" => true,

    "sesion" => true,

    "rol" => $_SESSION['rol']

]);

?>