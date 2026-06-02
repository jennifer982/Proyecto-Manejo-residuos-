<?php

// ==========================
// CONEXION A LA BASE DE DATOS
// ==========================

// Servidor MySQL
$host = "localhost";

// Usuario MySQL
$user = "root";

// Contraseña MySQL
$pass = "";

// Nombre de la base de datos
$db = "sistema_tareas";

// Crear conexión
$conn = new mysqli(
    $host,
    $user,
    $pass,
    $db
);

// Verificar conexión
if($conn->connect_error){

    die(
        json_encode([
            "success"=>false,
            "message"=>"Error de conexión"
        ])
    );

}

// Configurar UTF8
$conn->set_charset("utf8");

?>