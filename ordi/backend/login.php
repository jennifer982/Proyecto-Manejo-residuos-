<?php

session_start();

require_once "db.php";

// Leer datos enviados
$data = json_decode(
    file_get_contents("php://input"),
    true
);

// Validar JSON recibido
if (!$data) {

    echo json_encode([
        "success" => false,
        "message" => "No se recibieron datos"
    ]);

    exit;
}

$correo = $data["correo"];
$contrasena = $data["contrasena"];

// Consulta SQL
$sql = "
SELECT *
FROM usuarios
WHERE correo = ?
";

// Preparar consulta
$stmt = $conn->prepare($sql);

// Vincular correo
$stmt->bind_param(
    "s",
    $correo
);

// Ejecutar consulta
$stmt->execute();

// Obtener usuario
$user =
$stmt->get_result()
->fetch_assoc();

// Validar usuario
if(

    $user &&

    $contrasena ==
    $user["contrasena"]

){

    // Guardar sesión
    $_SESSION["id_usuario"] =
    $user["id_usuario"];

    $_SESSION["nombre"] =
    $user["nombre"];

    echo json_encode([

        "success"=>true,

        "nombre"=>$user["nombre"]

    ]);

}else{

    echo json_encode([

        "success"=>false,

        "message"=>"Credenciales incorrectas"

    ]);

}

?>