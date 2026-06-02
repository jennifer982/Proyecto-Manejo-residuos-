<?php

// Incluye el archivo de conexión a la base de datos.
require_once __DIR__ . "/db.php";

// Indica que la respuesta será enviada en formato JSON.
header('Content-Type: application/json; charset=utf-8');

// ==========================
// VALIDAR ID DEL REPORTE
// ==========================

// Verifica que se haya recibido el parámetro id_reporte
// mediante una petición POST.
if (!isset($_POST["id_reporte"])) {

    echo json_encode([
        "success" => false,
        "message" => "ID no recibido"
    ]);

    exit;
}

// Convierte el valor recibido a entero
// para evitar problemas de tipo de dato.
$id = intval($_POST["id_reporte"]);

// ==========================
// ACTUALIZAR REPORTE
// ==========================

// Cambia el estado del reporte a 4
// y registra que la evidencia fue aceptada.
$sql = "
    UPDATE tiraderos_reporte
    SET
        id_estado = 4,
        resultado_evidencia = 'Aceptada'
    WHERE id_reporte = $id
";

// ==========================
// EJECUTAR CONSULTA
// ==========================

// Ejecuta la actualización en la base de datos.
if ($conn->query($sql)) {

    // Si la actualización fue exitosa.
    echo json_encode([
        "success" => true,
        "message" => "Evidencia aceptada"
    ]);

} else {

    // Si ocurrió un error durante la consulta.
    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);
}
?>