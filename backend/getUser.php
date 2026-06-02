<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['nombre'])) {
    echo json_encode(["success" => false]);
    exit;
}

echo json_encode([
    "success" => true,
    "nombre" => $_SESSION['nombre'],
    "rol" => $_SESSION['rol']
]);
?>