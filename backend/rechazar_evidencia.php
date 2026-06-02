<?php
require_once __DIR__ . "/db.php";

header('Content-Type: application/json; charset=utf-8');

if (!isset($_POST["id_reporte"])) {
    echo json_encode(["success" => false, "message" => "ID no recibido"]);
    exit;
}

$id = intval($_POST["id_reporte"]);

$sql = "UPDATE tiraderos_reporte SET id_estado = 6, resultado_evidencia = 'Rechazada' WHERE id_reporte = $id";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Evidencia rechazada"]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}