<?php

require_once "db.php";

// Total tareas
$totalTareas =
$conn->query(
"SELECT COUNT(*) total FROM tareas"
)
->fetch_assoc()["total"];

// Pendientes
$pendientes =
$conn->query(
"SELECT COUNT(*) total
FROM tareas
WHERE estado='Pendiente'"
)
->fetch_assoc()["total"];

// Completadas
$completadas =
$conn->query(
"SELECT COUNT(*) total
FROM tareas
WHERE estado='Completada'"
)
->fetch_assoc()["total"];

// Respuesta JSON
echo json_encode([

"totalTareas"=>$totalTareas,

"pendientes"=>$pendientes,

"completadas"=>$completadas

]);

?>