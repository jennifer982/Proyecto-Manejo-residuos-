<?php

// ==========================
// INICIO DE SESIÓN
// ==========================

// Inicia o recupera una sesión existente.
session_start();

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión MySQL.
require_once 'db.php';

// ==========================
// CONFIGURACIÓN DE RESPUESTA
// ==========================

// Indica que la respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// Permite solicitudes desde localhost.
header("Access-Control-Allow-Origin: http://localhost");

// Permite el envío de cookies y sesiones.
header("Access-Control-Allow-Credentials: true");

// ==========================
// OBTENER DATOS JSON
// ==========================

// Lee el contenido enviado por el frontend.
$input = file_get_contents("php://input");

// Convierte el JSON recibido a un arreglo PHP.
$data = json_decode($input, true);

// ==========================
// VALIDAR RECEPCIÓN DE DATOS
// ==========================

// Verifica que se haya recibido un JSON válido.
if (!$data) {

    echo json_encode([

        "success" => false,

        "message" => "No se recibieron datos JSON",

        // Se incluye para depuración.
        "debug" => $input

    ]);

    exit;
}

// ==========================
// OBTENER CREDENCIALES
// ==========================

// Recupera el correo enviado.
$correo = $data['correo'] ?? '';

// Recupera la contraseña enviada.
$contrasena = $data['contrasena'] ?? '';

// ==========================
// VALIDAR CAMPOS VACÍOS
// ==========================

if (empty($correo) || empty($contrasena)) {

    echo json_encode([

        "success" => false,

        "message" => "Faltan datos"

    ]);

    exit;
}

// ==========================
// BUSCAR USUARIO
// ==========================

// Consulta la información del usuario
// junto con su rol.
$stmt = $conn->prepare("

    SELECT
        u.*,
        r.roles

    FROM tabla_usuarios u

    INNER JOIN roles r
            ON u.id_rol = r.id_rol

    WHERE u.correo = ?

");

// Asocia el correo recibido.
$stmt->bind_param("s", $correo);

// Ejecuta la consulta.
$stmt->execute();

// Obtiene los resultados.
$result = $stmt->get_result();

// ==========================
// VALIDAR EXISTENCIA DEL USUARIO
// ==========================

if ($result->num_rows > 0) {

    // Obtiene la información del usuario.
    $user = $result->fetch_assoc();

    // ==========================
    // VALIDAR CONTRASEÑA
    // ==========================

    // Compara la contraseña ingresada
    // con el hash almacenado en la base de datos.
    if (password_verify(
        $contrasena,
        $user['contrasena']
    )) {

        // Convierte el rol a minúsculas.
        $rol = strtolower(
            trim($user['roles'])
        );

        // ==========================
        // CREAR SESIÓN
        // ==========================

        $_SESSION['user_id'] =
            $user['id_usuario'];

        $_SESSION['rol'] =
            $rol;

        $_SESSION['ultimo_acceso'] =
            time();

        $_SESSION['correo'] =
            $user['correo'];

        $_SESSION['nombre'] =
            $user['nombre'];

        // ==========================
        // RESPUESTA EXITOSA
        // ==========================

        echo json_encode([

            "success" => true,

            "rol" => $rol,

            // Nombre del usuario.
            "nombre" =>
                $user['nombre'],

            // ID del usuario.
            "id" =>
                $user['id_usuario']

        ]);

    } else {

        // Contraseña incorrecta.
        echo json_encode([

            "success" => false,

            "message" =>
                "Contraseña incorrecta"

        ]);
    }

} else {

    // Usuario no encontrado.
    echo json_encode([

        "success" => false,

        "message" =>
            "Usuario no encontrado"

    ]);
}

?>