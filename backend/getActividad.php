<?php

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión.
include "db.php";

// ==========================
// CONSULTA DE ACTIVIDAD RECIENTE
// ==========================

// Obtiene los últimos 5 reportes registrados.
$sql = "

SELECT

    id_reporte,

    descripcion,

    riesgo,

    id_estado

FROM tiraderos_reporte

ORDER BY id_reporte DESC

LIMIT 5

";

// Ejecuta la consulta.
$resultado = $conn->query($sql);

// ==========================
// CREAR ARREGLO DE RESPUESTA
// ==========================

// Arreglo donde se almacenarán
// las actividades recientes.
$actividad = [];

// ==========================
// RECORRER RESULTADOS
// ==========================

while ($fila = $resultado->fetch_assoc()) {

    // Agrega cada reporte al arreglo.
    $actividad[] = [

        // Tiempo de referencia.
        "hora" => "Reciente",

        // Descripción de la actividad.
        "descripcion" =>

            "Reporte #" .

            $fila["id_reporte"] .

            " con riesgo " .

            $fila["riesgo"] .

            " fue registrado"

    ];
}

// ==========================
// DEVOLVER RESPUESTA JSON
// ==========================

// Convierte el arreglo a JSON
// para enviarlo al frontend.
echo json_encode($actividad);

?>