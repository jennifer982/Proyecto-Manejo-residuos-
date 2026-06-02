// ==========================
// REGISTRO DE USUARIOS
// register.js
// ==========================

// Espera a que el documento HTML se cargue completamente.
document.addEventListener('DOMContentLoaded', function() {

    // Obtiene el formulario de registro.
    const form = document.getElementById('Formulario');

    // Si el formulario no existe, detiene la ejecución.
    if (!form) return;

    // Contenedor donde se mostrarán los mensajes.
    const messageDiv = document.getElementById('message');

    // Contenedor del indicador de carga.
    const loadingDiv = document.getElementById('loading');

    // Evento que se ejecuta al enviar el formulario.
    form.addEventListener('submit', async function(e) {

        // Evita el envío tradicional del formulario.
        e.preventDefault();

        // ==========================
        // LIMPIAR MENSAJES ANTERIORES
        // ==========================

        if (messageDiv) {

            // Oculta mensajes anteriores.
            messageDiv.style.display = 'none';

            // Restablece las clases CSS.
            messageDiv.className = 'message';

            // Borra el contenido del mensaje.
            messageDiv.innerHTML = '';
        }

        // ==========================
        // OBTENER DATOS DEL FORMULARIO
        // ==========================

        // Crea un objeto FormData con los datos ingresados.
        const formData = new FormData(form);

        // Construye un objeto JavaScript con los datos.
        const data = {

            nombre: formData.get('nombre'),

            correo: formData.get('correo'),

            contrasena: formData.get('contrasena'),

            confirmar_contrasena:
                formData.get('confirmar_contrasena')
        };

        // ==========================
        // VALIDAR CONTRASEÑAS
        // ==========================

        // Comprueba que ambas contraseñas coincidan.
        if (data.contrasena !== data.confirmar_contrasena) {

            showMessage(
                'Las contraseñas no coinciden',
                'error'
            );

            return;
        }

        try {

            // ==========================
            // ENVIAR DATOS AL SERVIDOR
            // ==========================

            const response = await fetch(
                '../backend/insert.php',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    // Convierte el objeto a JSON.
                    body: JSON.stringify(data)
                }
            );

            // Convierte la respuesta en JSON.
            const result = await response.json();

            // ==========================
            // REGISTRO EXITOSO
            // ==========================

            if (result.success) {

                showMessage(
                    '¡Registro exitoso! Redirigiendo...',
                    'success'
                );

                // Limpia todos los campos del formulario.
                form.reset();

                // Redirige al login después de 2 segundos.
                setTimeout(function() {

                    window.location.href =
                        '../views/iniciosesion.html';

                }, 2000);

            }

            // ==========================
            // ERROR DEVUELTO POR EL SERVIDOR
            // ==========================

            else {

                showMessage(
                    result.message,
                    'error'
                );
            }

        }

        // ==========================
        // ERROR DE CONEXION
        // ==========================

        catch (error) {

            console.error('Error:', error);

            showMessage(
                'Error de conexión con el servidor',
                'error'
            );
        }

        // ==========================
        // FINALIZAR PROCESO
        // ==========================

        finally {

            // Oculta el indicador de carga.
            if (loadingDiv)
                loadingDiv.classList.remove('active');
        }
    });

    // ==========================
    // MOSTRAR MENSAJES
    // ==========================

    // Función auxiliar para mostrar mensajes al usuario.
    function showMessage(text, type) {

        // Verifica que exista el contenedor.
        if (!messageDiv) return;

        // Asigna el texto del mensaje.
        messageDiv.innerHTML = text;

        // Agrega la clase según el tipo
        // (success o error).
        messageDiv.className =
            'message ' + type;

        // Hace visible el mensaje.
        messageDiv.style.display = 'block';

        // Oculta el mensaje después de 5 segundos.
        setTimeout(function() {

            messageDiv.style.display = 'none';

        }, 5000);
    }
});