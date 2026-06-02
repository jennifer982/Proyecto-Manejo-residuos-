<?php

// Iniciar sesión
session_start();

// Incluir conexión
require_once "db.php";

// Obtener datos JSON
$data = json_decode(
    file_get_contents("php://input"),
    true
);

// Obtener título
$titulo =
$data["titulo"];

// Obtener descripción
$descripcion =
$data["descripcion"];

// Usuario autenticado
$idUsuario = 1;

// Consulta SQL
$sql = "
INSERT INTO tareas
(
titulo,
descripcion,
estado,
id_usuario
)
VALUES
(
?,
?,
'Pendiente',
?
)
";

// Preparar consulta
$stmt = $conn->prepare($sql);

// Vincular parámetros
$stmt->bind_param(
    "ssi",
    $titulo,
    $descripcion,
    $idUsuario
);

// Ejecutar consulta
if($stmt->execute()){

    echo json_encode([
        "success"=>true
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "error"=>$stmt->error,
        "mysql_error"=>$conn->error,
        "idUsuario"=>$idUsuario
    ]);

}

?>