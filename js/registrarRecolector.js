// ==========================
// REGISTRO DE SOLICITUDES DE RECOLECTOR
// ==========================

// Escucha el evento de envío del formulario.
document.getElementById("Formulario").addEventListener("submit", function (e) {

    // Evita que el formulario se envíe de manera tradicional.
    e.preventDefault();

    // ==========================
    // VALIDAR CONTRASEÑAS
    // ==========================

    // Obtiene la contraseña ingresada.
    const pass = document.getElementById("contrasena").value;

    // Obtiene la confirmación de contraseña.
    const confirm = document.getElementById("confirmar_contrasena").value;

    // Verifica que ambas contraseñas sean iguales.
    if (pass !== confirm) {

        // Muestra una alerta de error.
        Swal.fire({
            title: 'Error de Validación',
            text: 'Las contraseñas no coinciden.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });

        return;
    }

    // ==========================
    // MOSTRAR CARGA
    // ==========================

    // Obtiene el indicador de carga.
    const loading = document.getElementById("loading");

    // Obtiene el botón de envío.
    const btn = this.querySelector("button");

    // Muestra el indicador de carga.
    loading.style.display = "block";

    // Deshabilita el botón para evitar múltiples envíos.
    btn.disabled = true;

    // ==========================
    // CAPTURAR DATOS DEL FORMULARIO
    // ==========================

    // FormData obtiene automáticamente todos los campos
    // incluyendo archivos PDF adjuntos.
    const datos = new FormData(this);

    // ==========================
    // ENVIAR DATOS AL SERVIDOR
    // ==========================

    fetch("../backend/registrar_solicitud.php", {

        // Método HTTP utilizado.
        method: "POST",

        // Se envían directamente los datos del formulario.
        body: datos

    })

    // Convierte la respuesta del servidor a JSON.
    .then(res => res.json())

    // Procesa la respuesta.
    .then(data => {

        // Oculta el indicador de carga.
        loading.style.display = "none";

        // ==========================
        // SOLICITUD EXITOSA
        // ==========================

        if (data.success) {

            Swal.fire({
                title: 'Registro Exitoso',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#093a27'
            });

            // Redirige al usuario al inicio de sesión.
            window.location.href = "iniciosesion.html";
        }

        // ==========================
        // ERROR EN EL SERVIDOR
        // ==========================

        else {

            Swal.fire({
                title: 'Error',
                text: 'Error: ' + data.message,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#093a27'
            });

            // Vuelve a habilitar el botón.
            btn.disabled = false;
        }
    })

    // ==========================
    // ERROR DE CONEXIÓN
    // ==========================

    .catch(err => {

        console.error(
            "Error en la solicitud:",
            err
        );

        // Oculta el indicador de carga.
        loading.style.display = "none";

        // Reactiva el botón.
        btn.disabled = false;

        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al enviar el formulario.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });
    });
});