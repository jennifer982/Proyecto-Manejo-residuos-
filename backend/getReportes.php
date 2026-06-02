<?php
require_once "db.php";
header('Content-Type: application/json');
error_reporting(0);

$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : '';

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
            tt.tipo_residuo,
            r.residuo   
        FROM tiraderos_reporte tr
        LEFT JOIN tabla_estados_reportes te ON tr.id_estado = te.id_estado
        LEFT JOIN tabla_residuos r ON tr.id_residuo = r.id_residuo 
        LEFT JOIN tabla_tipo_residuos tt ON r.id_tipo = tt.id_tipo 
        WHERE tr.id_estado IN (2,3,6)";

// filtro por tipo 
if (!empty($tipo) && $tipo !== 'todos') {
    // mamposteria no salia por el acento y no quiero moverle a la base de datos porque capaz y todo explota 
    // asi que pos remplazamos texto hazta que jale siono
    $sql .= " AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(    
                LOWER(TRIM(tt.tipo_residuo)), 
                'á','a'), 'é','e'), 'í','i'), 'ó','o'), 'ú','u'), 'ñ','n') = 
             REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                LOWER(TRIM(?)), 
                'á','a'), 'é','e'), 'í','i'), 'ó','o'), 'ú','u'), 'ñ','n')";
}

$sql .= " ORDER BY tr.id_reporte DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Error al preparar la consulta"]);
    $conn->close();
    exit;
}

if (!empty($tipo) && $tipo !== 'todos') {
    $stmt->bind_param("s", $tipo);
}

$stmt->execute();
$result = $stmt->get_result();

$reportes = [];
while ($row = $result->fetch_assoc()) {
    $reportes[] = $row;
}

echo json_encode($reportes);

$stmt->close();
$conn->close();
?>