<?php
header('Content-Type: application/json');
require_once "db.php";

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$codigo = trim($data['codigo'] ?? '');
$nuevaContrasena = $data['newPassword'] ?? '';

if (empty($email) || empty($codigo) || empty($nuevaContrasena)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

if (strlen($nuevaContrasena) < 6) {
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

// Verificar código nuevamente
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

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Código inválido o expirado']);
    exit;
}

// Hashear nueva contraseña
$hash = password_hash($nuevaContrasena, PASSWORD_DEFAULT);

// Actualizar usuario
$stmt = $conn->prepare("UPDATE tabla_usuarios SET contrasena = ? WHERE correo = ?");
$stmt->bind_param("ss", $hash, $email);
$stmt->execute();
$stmt->close();

// Marcar código como usado
$stmt = $conn->prepare("UPDATE reset_password_codes SET usado = 1 WHERE id = ?");
$stmt->bind_param("i", $row['id']);
$stmt->execute();
$stmt->close();

echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
?>