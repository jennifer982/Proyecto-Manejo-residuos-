<?php
require_once 'db.php';
session_start();

// Validamos sesión y datos
if (!isset($_SESSION['user_id']) || !isset($_FILES['evidencia'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos o sesión']);
    exit;
}

$id_reporte = intval($_POST['id_reporte']);
$directorio = "../assets/img/evidencias_recoleccion/";

if (!file_exists($directorio)) { mkdir($directorio, 0777, true); }

$extension = pathinfo($_FILES['evidencia']['name'], PATHINFO_EXTENSION);
$nombre_foto = "evidencia_" . $id_reporte . "_" . time() . "." . $extension;
$ruta_final = $directorio . $nombre_foto;

if (move_uploaded_file($_FILES['evidencia']['tmp_name'], $ruta_final)) {
    // Aquí puedes insertar en una tabla de 'revisiones' o actualizar 
    // una columna 'foto_evidencia' en la tabla 'tiraderos_reporte'
    $sql = "UPDATE tiraderos_reporte SET foto_evidencia = ? WHERE id_reporte = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $ruta_final, $id_reporte);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar en BD']);
    }
}
?>