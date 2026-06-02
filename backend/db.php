<?php

// ==========================
// CONFIGURACIÓN DEL PROYECTO
// ==========================

// Obtiene la ruta absoluta donde se encuentra este archivo.
// Se utiliza para construir rutas seguras a otros archivos.
$root = __DIR__;

// ==========================
// CARGAR DEPENDENCIAS
// ==========================

// Incluye el autoloader de Composer.
// Permite utilizar librerías instaladas mediante Composer.
require_once $root . '/vendor/autoload.php';

// ==========================
// CARGAR VARIABLES DE ENTORNO
// ==========================

// Crea una instancia de Dotenv utilizando
// la carpeta raíz del proyecto.
$dotenv = Dotenv\Dotenv::createImmutable($root);

// Carga las variables definidas en el archivo .env.
$dotenv->load();

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Crea una nueva conexión MySQL utilizando
// las variables almacenadas en el archivo .env.
$conn = new mysqli(

    $_ENV['DB_HOST'], // Servidor

    $_ENV['DB_USER'], // Usuario

    $_ENV['DB_PASS'], // Contraseña

    $_ENV['DB_NAME']  // Base de datos

);

// ==========================
// VALIDAR CONEXIÓN
// ==========================

// Verifica si ocurrió un error al conectar.
if ($conn->connect_error) {

    die(json_encode([

        'success' => false,

        'message' =>
            'Database connection failed: ' .
            $conn->connect_error

    ]));
}

// ==========================
// CONFIGURAR CHARSET
// ==========================

// Establece UTF-8 para soportar:
// - Acentos
// - Ñ y caracteres especiales
// - Emojis
// - Caracteres internacionales
$conn->set_charset('utf8mb4');

?>