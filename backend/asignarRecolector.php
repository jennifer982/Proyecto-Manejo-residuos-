<?php

// ==========================
// DEPENDENCIAS
// ==========================

// Conexión a la base de datos.
require_once 'db.php';

// Funciones para envío de correos electrónicos.
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
        'message' => 'No autorizado.'
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
$id_reporte = intval($datos['id_reporte']);

// Obtiene el ID del recolector.
$id_recolector = intval($datos['id_recolector']);

// ==========================
// VALIDAR DATOS
// ==========================

// Comprueba que ambos valores existan.
if (!$id_reporte || !$id_recolector) {

    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos.'
    ]);

    exit;
}

// ==========================
// ASIGNAR RECOLECTOR
// ==========================

// Actualiza el reporte:
// - Asigna el recolector.
// - Cambia el estado.
// - Registra la fecha de asignación.
$stmt = $conn->prepare(

    "UPDATE tiraderos_reporte
     SET id_recolector = ?,
         id_estado = 6,
         fecha_asignacion = NOW()
     WHERE id_reporte = ?"

);

// Vincula parámetros.
$stmt->bind_param(
    "ii",
    $id_recolector,
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
// OBTENER DATOS DEL RECOLECTOR
// ==========================

// Recupera información necesaria para
// enviar la notificación por correo.
$sqlInfo = "

    SELECT
        u.nombre,
        u.correo,
        r.residuo AS tipo_residuo

    FROM tabla_usuarios u,
         tiraderos_reporte tr

    JOIN tabla_residuos r
         ON tr.id_residuo = r.id_residuo

    WHERE u.id_usuario = ?
      AND tr.id_reporte = ?

";

// Prepara la consulta.
$stmtInfo = $conn->prepare($sqlInfo);

// Verifica que la consulta sea válida.
if (!$stmtInfo) {

    echo json_encode([

        'success' => false,

        'message' =>
            'Error en prepare: ' .
            $conn->error

    ]);

    $conn->close();

    exit;
}

// Vincula parámetros.
$stmtInfo->bind_param(
    "ii",
    $id_recolector,
    $id_reporte
);

// Ejecuta la consulta.
$stmtInfo->execute();

// Obtiene los datos encontrados.
$info =
    $stmtInfo
    ->get_result()
    ->fetch_assoc();

$stmtInfo->close();

// ==========================
// ENVÍO DE CORREO
// ==========================

// Variable que indica si el correo fue enviado.
$notificacion = false;

// Variable para almacenar errores.
$errorNotif = null;

// Verifica que existan datos y la función.
if (
    $info &&
    function_exists(
        'notificarAsignacionReporte'
    )
) {

    try {

        // Envía la notificación al recolector.
        $notificacion =
            notificarAsignacionReporte(

                $info['correo'],

                $info['nombre'],

                $id_reporte,

                $info['tipo_residuo'] ?? '',

                'asignado'
            );

    }

    catch (Exception $e) {

        $errorNotif =
            $e->getMessage();
    }

}

// No se encontraron datos del recolector.
elseif (!$info) {

    $errorNotif =
        'No se encontró información del recolector';
}

// La función no existe.
else {

    $errorNotif =
        'Función notificarAsignacionReporte no definida';
}

// ==========================
// RESPUESTA FINAL
// ==========================

$respuesta = [

    'success' => true,

    'message' =>
        'Recolector asignado correctamente',

    'notificacion_enviada' =>
        $notificacion
];

// Agrega información del error de correo
// si ocurrió alguno.
if ($errorNotif) {

    $respuesta['error_notificacion'] =
        $errorNotif;
}

// Devuelve la respuesta al cliente.
echo json_encode($respuesta);

// Cierra la conexión.
$conn->close();

?>