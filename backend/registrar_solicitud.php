<?php
require_once 'db.php';
header('Content-Type: application/json');

// Evitar que errores de advertencia ensucien el JSON de salida
error_reporting(0);
ini_set('display_errors', 0);

try {
    $nombre = $_POST['nombre'] ?? '';
    $correo = $_POST['correo'] ?? '';
    $pass = password_hash($_POST['contrasena'], PASSWORD_BCRYPT);

    $carpeta_aspirante = "../assets/docs/solicitudes/" . str_replace(['@', '.'], '_', $correo) . "/";
    if (!file_exists($carpeta_aspirante)) {
        mkdir($carpeta_aspirante, 0777, true);
    }

    $rutas = [];
    $campos = ['pdf_licencia', 'pdf_certificado', 'pdf_titulo', 'pdf_tarjeta', 'pdf_licencia_conductor'];

    foreach ($campos as $campo) {

        if (isset($_FILES[$campo]) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {

        // Validar que sea PDF
     $tipo_mime = mime_content_type($_FILES[$campo]['tmp_name']);
       if ($tipo_mime !== 'application/pdf') {
       echo json_encode([
        "success" => false,
        "message" => "Solo se aceptan archivos PDF."
    ]);
    exit;
}


            $nombre_archivo = $campo . "_" . rand(1000, 9999) . ".pdf";
            $ruta_destino = $carpeta_aspirante . $nombre_archivo;
            if (move_uploaded_file($_FILES[$campo]['tmp_name'], $ruta_destino)) {
                $rutas[$campo] = $ruta_destino;
            }
        }
    }
        // Verificar que todos los PDFs fueron subidos correctamente
    $camposRequeridos = ['pdf_licencia', 'pdf_certificado', 'pdf_titulo', 'pdf_tarjeta', 'pdf_licencia_conductor'];
    foreach ($camposRequeridos as $requerido) {
        if (!isset($rutas[$requerido])) {
            echo json_encode([
                "success" => false,
                "message" => "Todos los documentos PDF son obligatorios."
            ]);
            exit;
        }
    }
    // AJUSTE: Nombres exactos según tu captura de phpMyAdmin
   $sql = "INSERT INTO solicitudes_recolectores
        (nombre, correo, contrasena, licencia_manejo_residuos, Certificado_capacitacion, titulo_vehiculo, tarjeta_circulacion, licencia_conducir, estatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')";

    $stmt = $conn->prepare($sql);
    
    // Sincronizamos las 8 variables 's' con las columnas
    $stmt->bind_param("ssssssss", 
        $nombre, 
        $correo, 
        $pass, 
        $rutas['pdf_licencia'], 
        $rutas['pdf_certificado'], 
        $rutas['pdf_titulo'], 
        $rutas['pdf_tarjeta'], 
        $rutas['pdf_licencia_conductor']
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Solicitud enviada correctamente."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error en la base de datos: " . $conn->error]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error interno: " . $e->getMessage()]);
}
?>