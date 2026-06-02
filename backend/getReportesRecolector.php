<?php
require_once "db.php";
header('Content-Type: application/json');
session_start();

// Verificar sesión activa
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Obtener el ID del recolector desde la sesión
$id_recolector = intval($_SESSION['user_id']);

// Obtener reportes asignados a este recolector
$sql = "SELECT
        tr.id_reporte,
        tt.tipo_residuo AS categoria,
        tr.fecha,
        tr.riesgo,
        te.estado,
        tr.resultado_evidencia
        FROM tiraderos_reporte tr
        LEFT JOIN tabla_residuos r ON tr.id_residuo = r.id_residuo
        LEFT JOIN tabla_tipo_residuos tt ON r.id_tipo = tt.id_tipo
        LEFT JOIN tabla_estados_reportes te ON tr.id_estado = te.id_estado
        WHERE tr.id_recolector = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_recolector);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$stmt->close();
$conn->close();
?>