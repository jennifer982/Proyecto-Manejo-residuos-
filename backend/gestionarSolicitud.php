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

// Inicia la sesión del usuario.
session_start();

// ==========================
// VALIDAR ACCESO DE ADMINISTRADOR
// ==========================

// Verifica que exista una sesión activa
// y que el usuario tenga rol de administrador.
if (
    !isset($_SESSION['user_id']) ||
    $_SESSION['rol'] !== 'admin'
) {

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

// Obtiene el ID de la solicitud.
$id_solicitud =
    intval($datos['id_solicitud']);

// Obtiene la acción solicitada.
$accion =
    $datos['accion']; // aceptar o rechazar

// ==========================
// VALIDAR DATOS
// ==========================

if (
    !$id_solicitud ||
    !in_array(
        $accion,
        ['aceptar', 'rechazar']
    )
) {

    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos'
    ]);

    exit;
}

// ==========================
// OBTENER DATOS DEL SOLICITANTE
// ==========================

// Recupera nombre y correo del aspirante.
$stmt = $conn->prepare(

    "SELECT nombre, correo
     FROM solicitudes_recolectores
     WHERE id_solicitud = ?"

);

$stmt->bind_param(
    "i",
    $id_solicitud
);

$stmt->execute();

$solicitante =
    $stmt
    ->get_result()
    ->fetch_assoc();

$stmt->close();

// Verifica que exista la solicitud.
if (!$solicitante) {

    echo json_encode([

        'success' => false,

        'message' =>
            'Solicitud no encontrada'

    ]);

    exit;
}

// ==========================
// PROCESAR ACCIÓN
// ==========================

$accionExitosa = false;
$mensaje = '';

// ==========================
// ACEPTAR SOLICITUD
// ==========================

if ($accion === 'aceptar') {

    // Obtiene la contraseña registrada
    // en la solicitud.
    $stmt = $conn->prepare(

        "SELECT contrasena
         FROM solicitudes_recolectores
         WHERE id_solicitud = ?"

    );

    $stmt->bind_param(
        "i",
        $id_solicitud
    );

    $stmt->execute();

    $result =
        $stmt
        ->get_result()
        ->fetch_assoc();

    $stmt->close();

    $contrasena =
        $result['contrasena'];

    // ==========================
    // CREAR CUENTA DE RECOLECTOR
    // ==========================

    $stmt = $conn->prepare(

        "INSERT INTO tabla_usuarios
        (
            nombre,
            correo,
            contrasena,
            id_rol
        )
        VALUES (?, ?, ?, 3)"

    );

    $stmt->bind_param(

        "sss",

        $solicitante['nombre'],

        $solicitante['correo'],

        $contrasena

    );

    if ($stmt->execute()) {

        $stmt->close();

        // Cambia el estatus de la solicitud.
        $stmt = $conn->prepare(

            "UPDATE solicitudes_recolectores
             SET estatus = 'Aceptado'
             WHERE id_solicitud = ?"

        );

        $stmt->bind_param(
            "i",
            $id_solicitud
        );

        $stmt->execute();

        $stmt->close();

        $accionExitosa = true;

        $mensaje =
            'Recolector aceptado y cuenta creada';

    } else {

        echo json_encode([

            'success' => false,

            'message' =>
                'Error al crear usuario: ' .
                $stmt->error

        ]);

        $stmt->close();
        $conn->close();

        exit;
    }

}

// ==========================
// RECHAZAR SOLICITUD
// ==========================

else {

    $stmt = $conn->prepare(

        "UPDATE solicitudes_recolectores
         SET estatus = 'Rechazado'
         WHERE id_solicitud = ?"

    );

    $stmt->bind_param(
        "i",
        $id_solicitud
    );

    if ($stmt->execute()) {

        $accionExitosa = true;

        $mensaje =
            'Solicitud rechazada';

    } else {

        echo json_encode([

            'success' => false,

            'message' =>
                $stmt->error

        ]);

        $stmt->close();
        $conn->close();

        exit;
    }

    $stmt->close();
}

// ==========================
// ENVIAR NOTIFICACIÓN
// ==========================

$notificacionEnviada = false;
$errorNotificacion = null;

// Verifica que exista la función de correo.
if (
    $accionExitosa &&
    function_exists(
        'notificarEstadoSolicitud'
    )
) {

    try {

        // Define el estado enviado por correo.
        $estado =
            ($accion === 'aceptar')
            ? 'aceptado'
            : 'rechazado';

        // Envía la notificación.
        $notificacionEnviada =
            notificarEstadoSolicitud(

                $solicitante['correo'],

                $solicitante['nombre'],

                $id_solicitud,

                $estado

            );

    }

    catch (Exception $e) {

        $errorNotificacion =
            $e->getMessage();
    }

}

// La función de correo no existe.
elseif ($accionExitosa) {

    $errorNotificacion =
        'Función notificarEstadoSolicitud no definida';
}

// ==========================
// RESPUESTA FINAL
// ==========================

$respuesta = [

    'success' => true,

    'message' => $mensaje,

    'notificacion_enviada' =>
        $notificacionEnviada

];

// Agrega información adicional
// si hubo problemas con el correo.
if ($errorNotificacion) {

    $respuesta['error_notificacion'] =
        $errorNotificacion;
}

// Devuelve la respuesta al cliente.
echo json_encode($respuesta);

// Cierra la conexión.
$conn->close();

?>