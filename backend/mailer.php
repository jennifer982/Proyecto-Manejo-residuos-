<?php

// ==========================
// CONFIGURACIÓN DEL SISTEMA DE CORREOS
// ==========================

// Obtiene la ruta raíz del proyecto.
$root = __DIR__;

// Carga automáticamente las librerías instaladas con Composer.
require_once $root . '/vendor/autoload.php';

// Importación de clases PHPMailer.
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ==========================
// FUNCIÓN GENERAL DE ENVÍO
// ==========================

// Envía correos electrónicos utilizando SMTP de Gmail.
function enviarCorreo($destinatario, $asunto, $mensajeHTML, $mensajeTexto = '') {

    // Crea una nueva instancia de PHPMailer.
    $mail = new PHPMailer(true);

    try {

        // ==========================
        // CONFIGURACIÓN SMTP
        // ==========================

        // Utiliza protocolo SMTP.
        $mail->isSMTP();

        // Servidor SMTP de Gmail.
        $mail->Host = 'smtp.gmail.com';

        // Requiere autenticación.
        $mail->SMTPAuth = true;

        // Usuario configurado en .env.
        $mail->Username = $_ENV['EMAIL_USER'];

        // Contraseña de aplicación configurada en .env.
        $mail->Password = $_ENV['EMAIL_PASS'];

        // Cifrado TLS.
        $mail->SMTPSecure =
            PHPMailer::ENCRYPTION_STARTTLS;

        // Puerto SMTP.
        $mail->Port = 587;

        // Codificación UTF-8.
        $mail->CharSet = 'UTF-8';

        // ==========================
        // DESTINATARIOS
        // ==========================

        // Correo remitente.
        $mail->setFrom(
            $_ENV['EMAIL_USER'],
            'Ceretic_Residuos'
        );

        // Correo destinatario.
        $mail->addAddress($destinatario);

        // ==========================
        // CONTENIDO DEL MENSAJE
        // ==========================

        $mail->isHTML(true);

        $mail->Subject = $asunto;

        $mail->Body = $mensajeHTML;

        $mail->AltBody =
            $mensajeTexto
            ?: strip_tags($mensajeHTML);

        // Envía el correo.
        $mail->send();

        return true;

    } catch (Exception $e) {

        // Registra errores en el log.
        error_log(
            "Error al enviar correo: {$mail->ErrorInfo}"
        );

        return false;
    }
}

// enviar notificaciones 
function notificarEstadoReporte($correoUsuario, $nombreUsuario, $idReporte, $estado, $tipoResiduo = '') {
    $asunto = "Actualización de tu reporte #{$idReporte}";
    
    if ($estado === 'aceptado') {
        $colorEstado = '#27ae60';
        $textoEstado = 'Aceptado';
        $mensaje = "Tu reporte ha sido <strong style='color:{$colorEstado};'>{$textoEstado}</strong> por nuestro equipo.";
        $siguientePaso = "Ahora se encuentra disponible en el mapa";
    } else {
        $colorEstado = '#e74c3c';
        $textoEstado = 'Rechazado';
        $mensaje = "Tu reporte ha sido <strong style='color:{$colorEstado};'>{$textoEstado}</strong> por nuestro equipo.";
        $siguientePaso = "Esto puede deberse a que el área ya fue atendida, el reporte está duplicado, o la información proporcionada no es suficiente.";
    }
    
    $mensajeHTML = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #233E5E;'>Actualización de Reporte</h2>
            <p>Hola <strong>{$nombreUsuario}</strong>,</p>
            <p>{$mensaje}</p>
            <div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 5px 0;'><strong>ID del reporte:</strong> #{$idReporte}</p>
  
                <p style='margin: 5px 0;'><strong>Nuevo estado:</strong> <span style='color:{$colorEstado}; font-weight: bold;'>{$textoEstado}</span></p>
            </div>
            <p>{$siguientePaso}</p>
            <p style='margin-top: 30px; font-size: 0.9em; color: #666;'>Gracias por contribuir a un entorno más limpio.</p>
            <p style='font-size: 0.9em; color: #666;'>— Equipo de Manejo de Residuos</p>
        </div>
    ";

    $mensajeTexto = "Hola {$nombreUsuario},\n\nTu reporte #{$idReporte} ha sido {$textoEstado}.\n\n";
    $mensajeTexto .= $siguientePaso . "\n\n— Equipo de Manejo de Residuos";

    return enviarCorreo($correoUsuario, $asunto, $mensajeHTML, $mensajeTexto);
}

/**
 * envia notificacion al aceptar o rechazar una solicitud de recolector
 */
function notificarEstadoSolicitud($correoUsuario, $nombreUsuario, $idSolicitud, $estado) {
    $asunto = "Actualización de tu solicitud de recolector";
    
    if ($estado === 'aceptado') {
        $colorEstado = '#27ae60';
        $textoEstado = 'Aceptada';
        $mensaje = "¡Felicidades! Tu solicitud para ser recolector ha sido <strong style='color:{$colorEstado};'>Aceptada</strong>.";
        $siguientePaso = "Ahora formas parte de nuestro equipo de recolectores. Podrás recibir asignaciones de reportes y contribuir a la limpieza de la comunidad.";
    } else {
        $colorEstado = '#e74c3c';
        $textoEstado = 'Rechazada';
        $mensaje = "Lamentamos informarte que tu solicitud para ser recolector ha sido <strong style='color:{$colorEstado};'>RECHAZADA</strong>.";
        $siguientePaso = "Esto puede deberse a que la documentación presentada no cumple con los requisitos necesarios. Si lo deseas, puedes volver a postularte con la documentación correcta.";
    }

    $mensajeHTML = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #233E5E;'>Actualización de Solicitud de Recolector</h2>
            <p>Hola <strong>{$nombreUsuario}</strong>,</p>
            <p>{$mensaje}</p>
            <div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 5px 0;'><strong>Nuevo estado:</strong> <span style='color:{$colorEstado}; font-weight: bold;'>{$textoEstado}</span></p>
            </div>
            <p>{$siguientePaso}</p>
            <p style='margin-top: 30px; font-size: 0.9em; color: #666;'>Gracias por tu interés en colaborar con nosotros.</p>
            <p style='font-size: 0.9em; color: #666;'>— Equipo de Manejo de Residuos</p>
        </div>
    ";

    $mensajeTexto = "Hola {$nombreUsuario},\n\nTu solicitud #{$idSolicitud} ha sido {$textoEstado}.\n\n{$siguientePaso}\n\n— Equipo de Manejo de Residuos";

    return enviarCorreo($correoUsuario, $asunto, $mensajeHTML, $mensajeTexto);
}

/**
 * yanoquiero hacer correos aiuda
 */
function notificarAsignacionReporte($correo, $nombre, $idReporte, $tipoResiduo, $accion) {
    if ($accion === 'asignado') {
        $asunto = "Nuevo reporte asignado ";
        $color = '#27ae60';
        $textoEstado = 'Asignado';
        $mensaje = "Se te ha <strong style='color:{$color};'>asignado un nuevo reporte</strong>.";
        $detalle = "Confiamos en su servicio para la recolección.";
    } else { // cancelado
        $asunto = "Reporte desasignado ";
        $color = '#e67e22';
        $textoEstado = 'Desasignado';
        $mensaje = "Se ha <strong style='color:{$color};'>cancelado la asignación</strong> de un reporte que tenías.";
        $detalle = "El reporte volverá a estar disponible para otros recolectores.";
    }

    $tipoHTML = $tipoResiduo ? "<p><strong>Tipo de residuo:</strong> {$tipoResiduo}</p>" : '';

    $mensajeHTML = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #233E5E;'>Actualización de Asignación</h2>
            <p>Hola <strong>{$nombre}</strong>,</p>
            <p>{$mensaje}</p>
            <div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                
                {$tipoHTML}
                <p style='margin: 5px 0;'><strong>Estado:</strong> <span style='color:{$color}; font-weight: bold;'>{$textoEstado}</span></p>
            </div>
            <p>{$detalle}</p>
            <p style='margin-top: 30px; font-size: 0.9em; color: #666;'>Gracias por tu labor como recolector.</p>
            <p style='font-size: 0.9em; color: #666;'>— Equipo de Manejo de Residuos</p>
        </div>
    ";

    $mensajeTexto = "Hola {$nombre},\n\nUn reporte ha sido {$textoEstado}.\nTipo de residuo: {$tipoResiduo}\n\n{$detalle}\n\n— Equipo de Manejo de Residuos";

    return enviarCorreo($correo, $asunto, $mensajeHTML, $mensajeTexto);
}
?>
