<?php

// Incluir conexión
require_once "db.php";

// Obtener JSON enviado
$data = json_decode(
    file_get_contents("php://input"),
    true
);

// Obtener nombre
$nombre = $data["nombre"];

// Obtener correo
$correo = $data["correo"];

// Encriptar contraseña
$contrasena = password_hash(

    $data["contrasena"],

    PASSWORD_DEFAULT

);

$verificar = $conn->prepare(
    "SELECT id_usuario FROM usuarios WHERE correo = ?"
);

$verificar->bind_param(
    "s",
    $correo
);

$verificar->execute();

if($verificar->get_result()->num_rows > 0){

    echo json_encode([
        "success" => false,
        "message" => "El correo ya existe"
    ]);

    exit;
}

// Consulta SQL
$sql = "
INSERT INTO usuarios
(
nombre,
correo,
contrasena
)
VALUES
(
?,
?,
?
)
";

// Preparar consulta
$stmt = $conn->prepare($sql);

// Vincular parámetros
$stmt->bind_param(
    "sss",
    $nombre,
    $correo,
    $contrasena
);

// Ejecutar consulta
if($stmt->execute()){

    echo json_encode([
        "success"=>true,
        "message"=>"Usuario registrado"
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "message"=>$stmt->error
    ]);

}

// Cerrar recursos
$stmt->close();
$conn->close();

?>