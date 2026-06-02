<?php
require_once 'db.php';
header('Content-Type: application/json');
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id > 0) {
    
   $sql = "SELECT 
            tr.id_reporte, 
            tr.id_usuario, 
            tr.id_residuo, 
            tr.id_estado, 
            tr.anonimo_rol,
            tr.direccion, 
            tr.latitud, 
            tr.longitud, 
            tr.descripcion, 
            tr.riesgo, 
            tr.foto1, 
            tr.foto2, 
            tr.foto3, 
            tr.fecha,
            tt.tipo_residuo AS categoria,    
            tres.residuo AS material,        
            te.estado,
            

            IF(tr.anonimo_rol = 1, 'Anónimo', u.nombre) AS nombre_usuario

        FROM tiraderos_reporte tr
        LEFT JOIN tabla_residuos tres ON tr.id_residuo = tres.id_residuo
        LEFT JOIN tabla_tipo_residuos tt ON tres.id_tipo = tt.id_tipo 
        LEFT JOIN tabla_estados_reportes te ON tr.id_estado = te.id_estado
        LEFT JOIN tabla_usuarios u ON tr.id_usuario = u.id_usuario
        WHERE tr.id_reporte = $id";
    $result = $conn->query($sql);
    if ($result && $row = $result->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(["error" => "No encontrado"]);
    }
}
$conn->close();
?>