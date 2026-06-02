<?php
require_once "db.php";

header('Content-Type: application/json');

$sql = "
SELECT 
    id_usuario,
    nombre,
    correo,

    CASE
        WHEN id_rol = 1 THEN 'Administrador'
        WHEN id_rol = 2 THEN 'Usuario '
        WHEN id_rol = 3 THEN 'Recolector'
        ELSE 'Desconocido'
    END AS rol

FROM tabla_usuarios
";

$result = $conn->query($sql);

$usuarios = [];

if ($result) {
    while($row = $result->fetch_assoc()){
        $usuarios[] = $row;
    }

    echo json_encode($usuarios);

} else {
    echo json_encode([
        "error" => true,
        "message" => "Error al obtener usuarios"
    ]);
}

$conn->close();
?>