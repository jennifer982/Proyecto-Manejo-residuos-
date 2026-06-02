<?php

// ==========================
// CONFIGURACIÓN DE ERRORES
// ==========================

// Activa la visualización de todos los errores PHP.
// Útil durante el desarrollo y depuración.
error_reporting(E_ALL);

// Muestra los errores directamente en pantalla.
ini_set('display_errors', 1);

// ==========================
// CONFIGURACIÓN DE RESPUESTA
// ==========================

// Indica que la respuesta será enviada en formato JSON.
header("Content-Type: application/json");

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión.
require_once "db.php";

// ==========================
// OBTENER DATOS RECIBIDOS
// ==========================

// Lee los datos enviados desde el frontend
// en formato JSON.
$data = json_decode(
    file_get_contents("php://input"),
    true
);

// ==========================
// VALIDAR ID DEL PUNTO
// ==========================

// Verifica que se haya recibido el ID.
if (!isset($data["id_punto"])) {

    echo json_encode([

        "success" => false,

        "message" => "ID no recibido"

    ]);

    exit;
}

// Convierte el valor recibido a entero.
$id = intval($data["id_punto"]);

// ==========================
// CONSULTA SQL
// ==========================

// Elimina un punto oficial utilizando su ID.
$sql = "
    DELETE FROM puntos_oficiales
    WHERE id_punto = ?
";

// Prepara la consulta.
$stmt = $conn->prepare($sql);

// ==========================
// VALIDAR PREPARE
// ==========================

// Verifica que la consulta se preparó correctamente.
if (!$stmt) {

    echo json_encode([

        "success" => false,

        "message" =>
            "Error prepare: " .
            $conn->error

    ]);

    exit;
}

// Vincula el parámetro entero.
$stmt->bind_param(
    "i",
    $id
);

// ==========================
// EJECUTAR ELIMINACIÓN
// ==========================

if ($stmt->execute()) {

    // Eliminación exitosa.
    echo json_encode([

        "success" => true,

        "message" =>
            "Punto eliminado correctamente"

    ]);

} else {

    // Error al ejecutar la consulta.
    echo json_encode([

        "success" => false,

        "message" =>
            "Error execute: " .
            $stmt->error

    ]);
}

// ==========================
// CERRAR RECURSOS
// ==========================

$stmt->close();
$conn->close();

?>