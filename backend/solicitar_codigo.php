<?php
//debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
require_once "db.php";
require_once "mailer.php";

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Correo electrónico inválido']);
    exit;
}

// Verificar si existe el usuario 
$stmt = $conn->prepare("SELECT id_usuario FROM tabla_usuarios WHERE correo = ? ");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    // Por seguridad, no revelamos si existe o no
    echo json_encode(['success' => true, 'message' => 'Si el correo está registrado, recibirás un código']);
    exit;
}

// Generar código de 6 dígitos
$codigo = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expira = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// Insertar código en la BD
$stmt = $conn->prepare("INSERT INTO reset_password_codes (correo, codigo, expira_en) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $email, $codigo, $expira);
$stmt->execute();
$stmt->close();

// Enviar correo con PHPMailer
$asunto = "Código de recuperación de contraseña";
$mensajeHTML = "
    <h2>Recuperación de contraseña</h2>
    <p>Has solicitado restablecer tu contraseña. Usa el siguiente código:</p>
    <h1 style='font-size:32px;letter-spacing:5px;'>{$codigo}</h1>
    <p>Este código expirará en 15 minutos.</p>
    <p>Si no solicitaste esto, ignora este mensaje.</p>
";
$mensajeTexto = "Tu código de recuperación es: {$codigo}. Válido por 15 minutos.";

$enviado = enviarCorreo($email, $asunto, $mensajeHTML, $mensajeTexto);

if ($enviado) {
    echo json_encode(['success' => true, 'message' => 'Código enviado']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al enviar el correo. Inténtalo más tarde.']);
}
?>