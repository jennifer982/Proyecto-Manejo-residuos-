<?php

// ==========================
// DEPENDENCIAS
// ==========================

// Conexión a la base de datos.
require_once 'db.php';

// Funciones para envío de correos.
require_once 'mailer.php';

// La respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// Inicia la sesión PHP.
session_start();

// ==========================
// VALIDAR SESIÓN
// ==========================

// Verifica que exista un usuario autenticado.
if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);

    exit;
}

// ==========================
// OBTENER DATOS RECIBIDOS
// ==========================

// Lee el JSON enviado desde el frontend.
$datos = json_decode(
    file_get_contents('php://input'),
    true
);

// Obtiene el ID del reporte.
$id_reporte = intval(
    $datos['id_reporte']
);

// ==========================
// VALIDAR DATOS
// ==========================

// Verifica que exista un ID válido.
if (!$id_reporte) {

    echo json_encode([
        'success' => false,
        'message' => 'ID de reporte requerido'
    ]);

    exit;
}

// ==========================
// OBTENER DATOS DEL REPORTE
// ==========================

// Recupera información del reporte,
// el recolector asignado y el tipo de residuo.
$stmtInfo = $conn->prepare(

    "SELECT
        tr.id_recolector,
        r.residuo AS tipo_residuo,
        u.nombre,
        u.correo

     FROM tiraderos_reporte tr

     LEFT JOIN tabla_usuarios u
            ON tr.id_recolector = u.id_usuario

     JOIN tabla_residuos r
            ON tr.id_residuo = r.id_residuo

     WHERE tr.id_reporte = ?"

);

// Asocia el ID del reporte.
$stmtInfo->bind_param(
    "i",
    $id_reporte
);

// Ejecuta la consulta.
$stmtInfo->execute();

// Obtiene los resultados.
$info =
    $stmtInfo
    ->get_result()
    ->fetch_assoc();

$stmtInfo->close();

// Verifica que el reporte exista.
if (!$info) {

    echo json_encode([
        'success' => false,
        'message' => 'Reporte no encontrado'
    ]);

    $conn->close();

    exit;
}

// ==========================
// CANCELAR ASIGNACIÓN
// ==========================

// Elimina el recolector asignado,
// restablece el estado y elimina
// la fecha de asignación.
$stmt = $conn->prepare(

    "UPDATE tiraderos_reporte

     SET
        id_recolector = NULL,
        id_estado = 2,
        fecha_asignacion = NULL

     WHERE id_reporte = ?"

);

// Asocia el ID.
$stmt->bind_param(
    "i",
    $id_reporte
);

// Ejecuta la actualización.
if (!$stmt->execute()) {

    echo json_encode([

        'success' => false,

        'message' => $stmt->error

    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$stmt->close();

// ==========================
// ENVIAR NOTIFICACIÓN
// ==========================

// Indica si el correo fue enviado.
$notificacion = false;

// Almacena errores relacionados con la notificación.
$errorNotif = null;

// Verifica que hubiera un recolector asignado.
if (
    $info['id_recolector'] &&
    $info['correo']
) {

    // Verifica que exista la función de correo.
    if (
        function_exists(
            'notificarAsignacionReporte'
        )
    ) {

        try {

            // Envía correo notificando
            // la cancelación de la asignación.
            $notificacion =
                notificarAsignacionReporte(

                    $info['correo'],

                    $info['nombre'],

                    $id_reporte,

                    $info['tipo_residuo'] ?? '',

                    'cancelado'
                );

        }

        catch (Exception $e) {

            $errorNotif =
                $e->getMessage();
        }

    } else {

        $errorNotif =
            'Función notificarAsignacionReporte no definida';
    }

}

// Si el reporte no tenía recolector.
else {

    $errorNotif =
        'No había recolector asignado a este reporte';
}

// ==========================
// RESPUESTA FINAL
// ==========================

$respuesta = [

    'success' => true,

    'message' =>
        'Asignación cancelada correctamente',

    'notificacion_enviada' =>
        $notificacion
];

// Agrega detalles del error de correo si existe.
if ($errorNotif) {

    $respuesta['error_notificacion'] =
        $errorNotif;
}

// Devuelve la respuesta al cliente.
echo json_encode($respuesta);

// Cierra la conexión.
$conn->close();

?>