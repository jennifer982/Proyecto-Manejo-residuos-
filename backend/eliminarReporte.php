<?php

// ==========================
// CONFIGURACIÓN DE RESPUESTA
// ==========================

// Indica que la respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// ==========================
// DEPENDENCIAS
// ==========================

// Funciones para envío de correos.
require_once "mailer.php";

// Conexión a la base de datos.
require_once "db.php";

// ==========================
// VALIDAR ID DEL REPORTE
// ==========================

// Verifica que se haya recibido el ID del reporte.
if (!isset($_POST['id_reporte'])) {

    echo json_encode([

        "success" => false,

        "message" => "Falta el ID del reporte"

    ]);

    exit;
}

// Obtiene el ID recibido.
$id = $_POST['id_reporte'];

// ==========================
// OBTENER DATOS DEL REPORTE
// ==========================

// Consulta para recuperar información
// del reporte y del usuario que lo creó.
$sql = "

    SELECT
        tr.id_reporte,
        tr.id_usuario,
        u.nombre,
        u.correo

    FROM tiraderos_reporte tr

    LEFT JOIN tabla_usuarios u
           ON tr.id_usuario = u.id_usuario

    WHERE tr.id_reporte = ?

";

// Prepara la consulta.
$stmt = $conn->prepare($sql);

// Asocia el parámetro.
$stmt->bind_param("i", $id);

// Ejecuta la consulta.
$stmt->execute();

// Obtiene el resultado.
$result = $stmt->get_result();

// Extrae los datos.
$datos = $result->fetch_assoc();

// Verifica que el reporte exista.
if (!$datos) {

    echo json_encode([

        "success" => false,

        "message" => "Reporte no encontrado"

    ]);

    exit;
}

// Libera la consulta.
$stmt->close();

// ==========================
// ELIMINAR REPORTE
// ==========================

// Consulta para eliminar el reporte.
$sql = "
    DELETE FROM tiraderos_reporte
    WHERE id_reporte = ?
";

// Prepara la consulta.
$stmt = $conn->prepare($sql);

// Asocia el ID.
$stmt->bind_param("i", $id);

// ==========================
// EJECUTAR ELIMINACIÓN
// ==========================

if ($stmt->execute()) {

    // ==========================
    // NOTIFICAR AL USUARIO
    // ==========================

    // Envía un correo informando que
    // el reporte fue rechazado o eliminado.
    $notificacionEnviada =
        notificarEstadoReporte(

            $datos['correo'],

            $datos['nombre'],

            $datos['id_reporte'],

            'rechazado'

        );

    // Respuesta exitosa.
    echo json_encode([

        "success" => true,

        "message" =>
            "Reporte eliminado correctamente"

    ]);

} else {

    // Error al eliminar.
    echo json_encode([

        "success" => false,

        "message" =>
            "Error al eliminar el reporte"

    ]);
}

// ==========================
// CERRAR RECURSOS
// ==========================

$stmt->close();
$conn->close();

?>