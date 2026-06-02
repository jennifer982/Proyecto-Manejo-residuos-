<?php

require_once "db.php";

// Obtener JSON
$data = json_decode(
file_get_contents(
"php://input"
),
true
);

// Consulta SQL
$sql = "
UPDATE tareas
SET estado = ?
WHERE id_tarea = ?
";

// Preparar consulta
$stmt =
$conn->prepare($sql);

// Vincular parámetros
$stmt->bind_param(

"si",

$data["estado"],

$data["id_tarea"]

);

// Ejecutar
$stmt->execute();

// Respuesta
echo json_encode([
"success"=>true
]);

?>