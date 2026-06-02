<?php
require_once 'db.php';
session_start();
header('Content-Type: application/json');

// 1. Verificar sesión y rol de administrador
if (!isset($_SESSION['user_id']) || $_SESSION['rol'] != 'admin') {
    echo json_encode(['success' => false, 'message' => 'Acceso denegado. Solo administradores.']);
    exit;
}


$id_reporte = $_POST['id_reporte'] ?? null;
$descripcion = $_POST['descripcion'] ?? '';
$riesgo = (int)($_POST['riesgo'] ?? 1);
$latitud = (float)($_POST['latitud'] ?? 0);
$longitud = (float)($_POST['longitud'] ?? 0);

$id_residuo = $_POST['id_residuo'] ?? null;

if ($id_residuo == null){
    echo json_encode(['success' => false, 'message' => 'Ingrese el tipo de residuo.']);
    exit;
}

if (!$id_reporte) {
    echo json_encode(['success' => false, 'message' => 'ID del reporte requerido.']);
    exit;
}

// Validaciones simples
if ($riesgo < 1 || $riesgo > 5) $riesgo = 1;

// 4. Procesar imágenes nuevas (si se subieron)
$fotos = [];
$upload_dir = "../assets/img/reportes/"; 
for ($i = 1; $i <= 3; $i++) {
    $campo = "foto$i";
    if (isset($_FILES[$campo]) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION);
        $nombre_unico = uniqid('reporte_') . '.' . $ext;
        $ruta_destino = $upload_dir . $nombre_unico;
        if (move_uploaded_file($_FILES[$campo]['tmp_name'], $ruta_destino)) {
            $fotos[$campo] = $upload_dir . $nombre_unico;
        }
    }
}

// 5. Construir consulta de actualización (solo los campos que cambian)
$sql = "UPDATE tiraderos_reporte SET 
            descripcion = ?,
            riesgo = ?,
            latitud = ?,
            longitud = ?,
            id_residuo = ?";
$tipos = "siddi";
$params = [$descripcion, $riesgo, $latitud, $longitud, $id_residuo];


foreach ($fotos as $columna => $nombre) {
    $sql .= ", $columna = ?";
    $tipos .= "s";
    $params[] = $nombre;
}

$sql .= " WHERE id_reporte = ?";
$tipos .= "i";
$params[] = $id_reporte;

// 6. Ejecutar consulta preparada
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $conn->error]);
    exit;
}

$stmt->bind_param($tipos, ...$params);
$resultado = $stmt->execute();

if ($resultado) {
    echo json_encode(['success' => true, 'message' => 'Reporte actualizado correctamente.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar el reporte.' ]);
}

$stmt->close();
$conn->close();