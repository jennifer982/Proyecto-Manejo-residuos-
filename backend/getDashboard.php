<?php

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión.
require_once "db.php";

// Indica que la respuesta será enviada en formato JSON.
header("Content-Type: application/json");

// ==========================
// CONSULTA DE ESTADÍSTICAS
// ==========================

// Obtiene información general de los reportes.
$sql = "

SELECT

    // Total de reportes registrados.
    COUNT(*) total,

    // Reportes pendientes.
    SUM(id_estado = 1) pendientes,

    // Reportes aceptados.
    SUM(id_estado = 2) aceptados,

    // Reportes en proceso.
    SUM(id_estado = 3) proceso,

    // Reportes atendidos o resueltos.
    SUM(id_estado = 4) atendidos,

    // Reportes rechazados.
    SUM(id_estado = 5) rechazados

FROM tiraderos_reporte

";

// Ejecuta la consulta.
$result = $conn->query($sql);

// Obtiene los resultados como arreglo asociativo.
$data = $result->fetch_assoc();

// ==========================
// RESPUESTA JSON
// ==========================

// Devuelve las estadísticas al frontend.
echo json_encode($data);

?>