<?php

// Incluye el archivo de conexión a la base de datos.
require_once 'db.php';

// Indica que la respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// ==========================
// OBTENER DATOS JSON
// ==========================

// Lee los datos enviados en el cuerpo de la petición.
$data = json_decode(
    file_get_contents('php://input'),
    true
);

// ==========================
// VALIDAR PARÁMETROS
// ==========================

// Verifica que se hayan recibido
// el ID del reporte y el nuevo estado.
if (
    isset($data['id_reporte']) &&
    isset($data['id_estado'])
) {

    // Convierte los valores a enteros.
    $id = intval($data['id_reporte']);

    $estado = intval($data['id_estado']);

    // ==========================
    // CONSULTA SQL
    // ==========================

    // Actualiza el estado del reporte.
    $sql = "
        UPDATE tiraderos_reporte
        SET id_estado = ?
        WHERE id_reporte = ?
    ";

    // Prepara la consulta para evitar SQL Injection.
    $stmt = $conn->prepare($sql);

    // Vincula los parámetros:
    // i = integer
    // i = integer
    $stmt->bind_param(
        "ii",
        $estado,
        $id
    );

    // ==========================
    // EJECUTAR CONSULTA
    // ==========================

    if ($stmt->execute()) {

        // Respuesta exitosa.
        echo json_encode([
            'success' => true
        ]);

    } else {

        // Error al actualizar.
        echo json_encode([

            'success' => false,

            'message' => $conn->error

        ]);
    }
}

?>