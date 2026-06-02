<?php

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión.
require_once 'db.php';

// La respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// ==========================
// OBTENER DATOS RECIBIDOS
// ==========================

// Lee el JSON enviado desde el frontend.
$data = json_decode(
    file_get_contents('php://input'),
    true
);

// ==========================
// VALIDAR DATOS
// ==========================

// Verifica que se hayan recibido
// el ID del reporte y el nuevo estado.
if (
    !isset($data['id_reporte']) ||
    !isset($data['id_estado'])
) {

    echo json_encode([

        'success' => false,

        'message' => 'Datos incompletos'

    ]);

    exit;
}

// Obtiene el ID del reporte.
$id = intval($data['id_reporte']);

// Obtiene el nuevo estado.
$estado = intval($data['id_estado']);

// ==========================
// ACTUALIZAR ESTADO
// ==========================

// Consulta para modificar el estado
// de un reporte específico.
$sql = "

    UPDATE tiraderos_reporte

    SET id_estado = ?

    WHERE id_reporte = ?

";

// Prepara la consulta.
$stmt = $conn->prepare($sql);

// Vincula parámetros enteros.
$stmt->bind_param(
    "ii",
    $estado,
    $id
);

// ==========================
// EJECUTAR ACTUALIZACIÓN
// ==========================

if ($stmt->execute()) {

    // Actualización exitosa.
    echo json_encode([

        'success' => true,

        'message' => 'Estado actualizado'

    ]);

} else {

    // Error durante la actualización.
    echo json_encode([

        'success' => false,

        'message' => $stmt->error

    ]);
}

// ==========================
// CERRAR RECURSOS
// ==========================

$stmt->close();
$conn->close();

?>