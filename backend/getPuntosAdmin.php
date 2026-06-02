<?php
require_once "db.php";
header("Content-Type: application/json");

$sql = "SELECT * FROM puntos_oficiales ORDER BY id_punto DESC";
$result = $conn->query($sql);

$datos = [];

while($fila = $result->fetch_assoc()){
    $datos[] = $fila;
}

echo json_encode($datos);
$conn->close();
?>