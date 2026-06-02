<?php

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión.
require_once "db.php";

// La respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// ==========================
// TOTAL DE REPORTES
// ==========================

// Cuenta todos los reportes registrados.
$totalReportes = $conn->query(

    "SELECT COUNT(*) as total
     FROM tiraderos_reporte"

)->fetch_assoc()['total'];

// ==========================
// TOTAL DE USUARIOS
// ==========================

// Cuenta todos los usuarios registrados.
$totalUsuarios = $conn->query(

    "SELECT COUNT(*) as total
     FROM usuarios"

)->fetch_assoc()['total'];

// ==========================
// REPORTES PENDIENTES
// ==========================

// Cuenta los reportes cuyo estado es 2.
$pendientes = $conn->query(

    "SELECT COUNT(*) as total
     FROM tiraderos_reporte
     WHERE id_estado = 2"

)->fetch_assoc()['total'];

// ==========================
// REPORTES RESUELTOS
// ==========================

// Cuenta los reportes cuyo estado es 3.
$resueltos = $conn->query(

    "SELECT COUNT(*) as total
     FROM tiraderos_reporte
     WHERE id_estado = 3"

)->fetch_assoc()['total'];

// ==========================
// RESPUESTA JSON
// ==========================

// Devuelve todas las estadísticas
// en un único objeto JSON.
echo json_encode([

    "totalReportes" => $totalReportes,

    "totalUsuarios" => $totalUsuarios,

    "pendientes" => $pendientes,

    "resueltos" => $resueltos

]);

// ==========================
// CERRAR CONEXIÓN
// ==========================

$conn->close();

?>