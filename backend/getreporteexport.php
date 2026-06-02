<?php
// Devuelve los reportes con tipo y estado en texto
// para usarse en la exportación PDF/CSV
require_once 'db.php';

$sql = "
  SELECT 
    tr.id_reporte,
    tt.tipo_residuo,
    te.estado,
    tr.descripcion,
    tr.direccion,
    tr.latitud,
    tr.longitud,
    tr.fecha
  FROM tiraderos_reporte tr
  LEFT JOIN tabla_tipo_residuos tt ON tr.id_tipo = tt.id_tipo
  LEFT JOIN tabla_estados_reportes te ON tr.id_estado = te.id_estado
  ORDER BY tr.fecha DESC
";

$result = $conn->query($sql);

$reportes = [];

while ($row = $result->fetch_assoc()) {
  $reportes[] = $row;
}

header('Content-Type: application/json');
echo json_encode($reportes);

$conn->close();
?>