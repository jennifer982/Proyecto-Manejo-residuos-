<?php
header('Content-Type: application/json');
require_once "db.php";

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$codigo = trim($data['codigo'] ?? '');

if (empty($email) || empty($codigo)) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$stmt = $conn->prepare("
    SELECT id FROM reset_password_codes 
    WHERE correo = ? AND codigo = ? AND usado = 0 AND expira_en > NOW() 
    ORDER BY creado_en DESC LIMIT 1
");
$stmt->bind_param("ss", $email, $codigo);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if ($row) {
    echo json_encode(['success' => true, 'message' => 'Código válido']);
} else {
    echo json_encode(['success' => false, 'message' => 'Código inválido o expirado']);
}
?>