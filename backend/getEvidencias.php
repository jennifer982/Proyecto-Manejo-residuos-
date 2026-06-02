<?php

// ==========================
// CONFIGURACIÓN DE ERRORES
// ==========================

// Muestra todos los errores y advertencias de PHP.
// Útil durante la fase de desarrollo.
error_reporting(E_ALL);

// Permite visualizar los errores en pantalla.
ini_set('display_errors', 1);

// ==========================
// CONEXIÓN A LA BASE DE DATOS
// ==========================

// Incluye el archivo de conexión.
require_once __DIR__ . "/db.php";

// ==========================
// CONFIGURACIÓN DE RESPUESTA
// ==========================

// Indica que la respuesta será enviada en formato JSON.
header('Content-Type: application/json; charset=utf-8');

// ==========================
// CONSULTA DE REPORTES CON EVIDENCIA
// ==========================

// Obtiene los reportes que:
// - Tienen evidencia fotográfica.
// - Aún no han sido atendidos o resueltos.
// - Se muestran primero los más recientes.
$sql = "

SELECT *
FROM tiraderos_reporte

WHERE foto_evidencia IS NOT NULL
AND id_estado != 4

ORDER BY id_reporte DESC

";

// Ejecuta la consulta.
$result = $conn->query($sql);

// ==========================
// ARREGLO DE RESULTADOS
// ==========================

// Arreglo donde se almacenarán
// los reportes obtenidos.
$data = [];

// ==========================
// RECORRER RESULTADOS
// ==========================

// Verifica que la consulta se ejecutó correctamente.
if ($result) {

    // Recorre cada fila obtenida.
    while ($fila = $result->fetch_assoc()) {

        // Agrega el reporte al arreglo.
        $data[] = $fila;
    }
}

// ==========================
// RESPUESTA JSON
// ==========================

// Devuelve todos los reportes encontrados
// en formato JSON.
echo json_encode($data);

?>