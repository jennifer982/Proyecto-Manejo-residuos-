<?php

// Indica que la respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// Incluye las funciones de envío de correos.
require_once "mailer.php";

// Incluye la conexión a la base de datos.
require_once "db.php";

// ==========================
// OBTENER ID DEL REPORTE
// ==========================

// Recupera el ID enviado desde el formulario.
$id = $_POST['id_reporte'];

// ==========================
// OBTENER DATOS DEL REPORTE
// ==========================

// Consulta para obtener información del reporte
// y del usuario que lo creó.
$sql = "
    SELECT
        tr.id_reporte,
        tr.id_usuario,
        u.nombre,
        u.correo
    FROM tiraderos_reporte tr
    INNER JOIN tabla_usuarios u
        ON tr.id_usuario = u.id_usuario
    WHERE tr.id_reporte = ?
";

// Prepara la consulta.
$stmt = $conn->prepare($sql);

// Verifica si la consulta se preparó correctamente.
if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Error en la consulta SQL: " . $conn->error,
        "sql" => $sql
    ]);

    $conn->close();
    exit;
}

// Asocia el parámetro ID.
$stmt->bind_param("i", $id);

// Ejecuta la consulta.
$stmt->execute();

// Obtiene el resultado.
$result = $stmt->get_result();

// Extrae los datos del reporte.
$datos = $result->fetch_assoc();

// Si no existe el reporte.
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
// ACTUALIZAR ESTADO
// ==========================

// Cambia el estado del reporte a 2 (Aceptado).
$sql = "
    UPDATE tiraderos_reporte
    SET id_estado = 2
    WHERE id_reporte = ?
";

// Prepara la consulta.
$stmt = $conn->prepare($sql);

// Asocia el ID recibido.
$stmt->bind_param("i", $id);

// ==========================
// EJECUTAR ACTUALIZACIÓN
// ==========================

if ($stmt->execute()) {

    // ==========================
    // ENVIAR NOTIFICACIÓN
    // ==========================

    // Envía un correo electrónico al usuario
    // notificando que su reporte fue aceptado.
    $notificacionEnviada = notificarEstadoReporte(

        $datos['correo'],      // Correo del usuario

        $datos['nombre'],      // Nombre del usuario

        $datos['id_reporte'],  // ID del reporte

        'aceptado'             // Nuevo estado

    );

    // Respuesta exitosa.
    echo json_encode([

        "success" => true,

        "message" => "Reporte aceptado correctamente",

        "notificacion_enviada" => $notificacionEnviada

    ]);

} else {

    // Error al actualizar.
    echo json_encode([
        "success" => false
    ]);
}

// ==========================
// CERRAR RECURSOS
// ==========================

$stmt->close();
$conn->close();

?>