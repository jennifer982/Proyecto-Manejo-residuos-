<?php
// Include database connection
require_once 'db.php';


// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  // Allow requests from any origin (change later dont forger please)
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');


// Only accept POST requests cuz this is were we insert into table, nothing else
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// getting the data sent from the frontend (obj)
$data = json_decode(file_get_contents('php://input'), true);


// check that the data was received correctly
if ($data) {
    // extract and clean the values from the object
    $nombre = $conn->real_escape_string($data['nombre']);  // sanitize input to prevent SQL injection
    $correo = $conn->real_escape_string($data['correo']);  
    $contrasena = $conn->real_escape_string($data['contrasena']);  
    $confirmar = $conn->real_escape_string($data['confirmar_contrasena']);  
}
    

// Validation
$errors = [];

if (empty($nombre)) {
    $errors[] = 'El nombre es obligatorio';
}
if (empty($correo)) {
    $errors[] = 'El correo es obligatorio';
} elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'El correo no es válido';
}
if (empty($contrasena)) {
    $errors[] = 'La contraseña es obligatoria';
} elseif (strlen($contrasena) < 6) {
    $errors[] = 'La contraseña debe tener al menos 6 caracteres';
}
if ($contrasena !== $confirmar) {
    $errors[] = 'Las contraseñas no coinciden';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Check if email already exists
$stmt = $conn->prepare("SELECT id_usuario FROM tabla_usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->close();
    echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
    exit;
}
$stmt->close();


$hash = password_hash($contrasena, PASSWORD_DEFAULT);
// Insert user
$stmt = $conn->prepare("INSERT INTO tabla_usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nombre, $correo, $hash);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id;
    $stmt->close();
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado exitosamente',
        'data' => [
            'id_usuario' => $user_id,
            'nombre' => $nombre,
            'correo' => $correo
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar: ' . $stmt->error
    ]);
    $stmt->close();
}

// Close connection
$conn->close();
?>