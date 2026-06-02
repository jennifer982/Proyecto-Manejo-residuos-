<?php
require_once "db.php";
header('Content-Type: application/json');

$sql = "SELECT id_usuario, nombre 
        FROM tabla_usuarios 
        WHERE id_rol = 3";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
?>