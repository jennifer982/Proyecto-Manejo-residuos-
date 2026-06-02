<?php

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo que contiene
// la conexión con MySQL.
require_once "db.php";

// ==========================
// CONFIGURACIÓN DE RESPUESTA
// ==========================

// Indica que la respuesta será enviada
// en formato JSON.
header("Content-Type: application/json");

// ==========================
// CONSULTA DE PUNTOS OFICIALES
// ==========================

// Obtiene únicamente los puntos oficiales
// que se encuentran activos.
$sql = "

SELECT *
FROM puntos_oficiales

WHERE activo = 1

";

// Ejecuta la consulta.
$result = $conn->query($sql);

// ==========================
// ALMACENAR RESULTADOS
// ==========================

// Arreglo donde se guardarán
// los puntos obtenidos.
$datos = [];

// Recorre cada registro encontrado.
while ($row = $result->fetch_assoc()) {

    // Agrega el registro al arreglo.
    $datos[] = $row;
}

// ==========================
// RESPUESTA JSON
// ==========================

// Devuelve todos los puntos activos
// al frontend en formato JSON.
echo json_encode($datos);

// ==========================
// CERRAR CONEXIÓN
// ==========================

// Libera la conexión a la base de datos.
$conn->close();

?>