<?php
require_once "db.php";
header('Content-Type: application/json');

// Obtiene reportes pendientes con categoría y recolector asignado
$sql = "SELECT
        tr.id_reporte,
        tt.tipo_residuo AS categoria,
        tr.fecha,
        tr.fecha_asignacion,
        tr.riesgo,
        tr.id_recolector,
        u.nombre AS nombre_recolector
        FROM tiraderos_reporte tr
        LEFT JOIN tabla_residuos r ON tr.id_residuo = r.id_residuo
        LEFT JOIN tabla_tipo_residuos tt ON r.id_tipo = tt.id_tipo
        LEFT JOIN tabla_usuarios u ON tr.id_recolector = u.id_usuario
        WHERE tr.id_estado IN (2, 6)";

$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
?>