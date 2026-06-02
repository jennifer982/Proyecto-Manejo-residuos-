<?php

// Incluir conexión
require_once "db.php";

// Consulta SQL
$sql = "
SELECT
*
FROM tareas
";

// Ejecutar consulta
$result =
$conn->query($sql);

// Arreglo de resultados
$data = [];

// Recorrer registros
while(
$row =
$result->fetch_assoc()
){

    $data[] =
    $row;

}

// Enviar JSON
echo json_encode(
    $data
);

?>