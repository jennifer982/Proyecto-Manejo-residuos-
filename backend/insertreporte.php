<?php
require_once 'db.php';
header('Content-Type: application/json');
session_start();
if (empty($_POST)) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos en el formulario']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false, 
        'message' => 'Debes iniciar sesión para poder reportar.'
    ]);
    exit; // Cortamos el proceso aquí mismo
}
// 1. Limpiar valores (Asegurados con los nombres del HTML)
$id_residuo  = intval($_POST['id_residuo']); // El material específico
$id_estado   = 1;
$latitud     = floatval($_POST['latitud']);
$longitud    = floatval($_POST['longitud']);
$direccion   = isset($_POST['direccion']) ? $conn->real_escape_string(trim($_POST['direccion'])) : '';
$descripcion = $conn->real_escape_string($_POST['descripcion']);
$riesgo      = intval($_POST['riesgo']);
// 2. Manejo de usuario
$id_usuario = intval($_SESSION['user_id']);
$anonimo_rol = (isset($_POST['anonimo']) && ($_POST['anonimo'] == '1' || $_POST['anonimo'] == 'on')) ? 1 : 0;
// 3. Procesar las 3 fotos
$fotos_rutas = ['foto1' => '', 'foto2' => '', 'foto3' => ''];
$directorio = "../assets/img/reportes/";
if (!file_exists($directorio)) {
    mkdir($directorio, 0777, true);
}
for ($i = 1; $i <= 3; $i++) {
    $nombre_campo = "foto" . $i;
    if (isset($_FILES[$nombre_campo]) && $_FILES[$nombre_campo]['error'] === 0) {
        $extension = pathinfo($_FILES[$nombre_campo]['name'], PATHINFO_EXTENSION);
        $nuevo_nombre = "reporte_" . time() . "_$i." . $extension;
        $ruta_destino = $directorio . $nuevo_nombre;
        if (move_uploaded_file($_FILES[$nombre_campo]['tmp_name'], $ruta_destino)) {
            $fotos_rutas[$nombre_campo] = $ruta_destino;
        }
    }
}
// 4. Insertar
$query = "INSERT INTO tiraderos_reporte (id_usuario, id_residuo, id_estado, anonimo_rol, latitud, longitud,direccion, descripcion, riesgo, foto1, foto2, foto3)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("iiiiddssisss",
    $id_usuario,
    $id_residuo,
    $id_estado,
    $anonimo_rol,
    $latitud,
    $longitud,
    $direccion,
    $descripcion,
    $riesgo,
    $fotos_rutas['foto1'],
    $fotos_rutas['foto2'],
    $fotos_rutas['foto3']
);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>