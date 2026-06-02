<?php

// Incluye el archivo de conexión a la base de datos.
require_once "db.php";

// ==========================
// OBTENER DATOS JSON
// ==========================

// Lee los datos enviados desde el frontend.
$data = json_decode(
    file_get_contents("php://input"),
    true
);

// Obtiene el ID del reporte.
$idReporte = $data["id_reporte"];

// Obtiene el ID del recolector seleccionado.
$idRecolector = $data["id_recolector"];

// ==========================
// ASIGNAR RECOLECTOR
// ==========================

// Actualiza el reporte:
// - Asigna el recolector.
// - Cambia el estado a "Asignado".
$sql = "
    UPDATE tiraderos_reporte
    SET
        id_recolector = $idRecolector,
        id_estado = 2
    WHERE id_reporte = $idReporte
";

// ==========================
// EJECUTAR CONSULTA
// ==========================

// Ejecuta la actualización.
if ($conn->query($sql)) {

    // Respuesta exitosa.
    echo json_encode([

        "success" => true,

        "message" => "Reporte asignado correctamente"

    ]);

} else {

    // Respuesta en caso de error.
    echo json_encode([

        "success" => false,

        "message" => "Error al asignar"

    ]);
}

?>