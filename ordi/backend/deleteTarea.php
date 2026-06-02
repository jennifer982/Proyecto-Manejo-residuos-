<?php

require_once "db.php";

// Obtener datos
$data = json_decode(
file_get_contents(
"php://input"
),
true
);

// Consulta SQL
$sql = "
DELETE FROM tareas
WHERE id_tarea = ?
";

// Preparar
$stmt =
$conn->prepare($sql);

// Vincular ID
$stmt->bind_param(
"i",
$data["id_tarea"]
);

// Ejecutar
$stmt->execute();

// Respuesta
echo json_encode([
"success"=>true
]);

?>