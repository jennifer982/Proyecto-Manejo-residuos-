<?php
require_once "db.php";

$nombre = $_POST['nombre'];
$direccion = $_POST['direccion'];
$descripcion = $_POST['descripcion'];
$latitud = $_POST['latitud'];
$longitud = $_POST['longitud'];
$horario = $_POST['horario'];
$telefono = $_POST['telefono'];

$sql = "INSERT INTO puntos_oficiales
(nombre,direccion,descripcion,latitud,longitud,horario,telefono,activo)
VALUES (?,?,?,?,?,?,?,1)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssddss",
$nombre,$direccion,$descripcion,$latitud,$longitud,$horario,$telefono);

if($stmt->execute()){
    echo json_encode(["success"=>true,"message"=>"Punto guardado"]);
}else{
    echo json_encode(["success"=>false,"message"=>"Error"]);
}
?>