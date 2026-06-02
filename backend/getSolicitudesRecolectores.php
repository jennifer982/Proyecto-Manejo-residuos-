<?php

require_once "db.php";

header('Content-Type: application/json');

$sql = "SELECT
        id_solicitud,
        nombre,
        correo,
        fecha_registro,
        licencia_manejo_residuos,
        Certificado_capacitacion,
        titulo_vehiculo,
        tarjeta_circulacion,
        licencia_conducir
        FROM solicitudes_recolectores
        WHERE estatus = 'Pendiente'
        ORDER BY fecha_registro DESC";

$result = $conn->query($sql);

if(!$result){

    echo json_encode([
        "error" => true,
        "message" => $conn->error
    ]);

    exit;
}

$data = [];

while($row = $result->fetch_assoc()){

    $data[] = $row;
}

echo json_encode($data);

$conn->close();

?>