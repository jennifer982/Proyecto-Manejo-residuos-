<?php
require_once "db.php";
header('Content-Type: application/json');

$sql = "SELECT 
    tr.id_reporte,
    tr.descripcion,
    tr.latitud,
    tr.longitud,
    tr.foto1,
    tr.foto2,
    tr.foto3,
    tr.fecha,
    tr.id_estado,
    te.estado,
    COALESCE(tt.tipo_residuo, r.residuo, 'SIN TIPO') AS tipo_residuo,
    u.nombre AS nombre_recolector
FROM tiraderos_reporte tr
LEFT JOIN tabla_estados_reportes te ON tr.id_estado = te.id_estado
LEFT JOIN tabla_residuos r ON tr.id_residuo = r.id_residuo
LEFT JOIN tabla_tipo_residuos tt ON r.id_tipo = tt.id_tipo
LEFT JOIN tabla_usuarios u ON tr.id_recolector = u.id_usuario  
WHERE tr.id_estado IN (1, 2, 6)
ORDER BY tr.id_reporte DESC";

$result = $conn->query($sql);
$reportes = [];

while ($row = $result->fetch_assoc()) {
    $reportes[] = $row;
}

echo json_encode($reportes);
$conn->close();
?>