// Mensaje en consola para verificar que el archivo login.js
// fue cargado correctamente por el navegador.
console.log("LOGIN JS CARGADO");

// Escucha el evento de envío del formulario de inicio de sesión.
document.getElementById("formLogin").addEventListener("submit", function (e) {

    // Evita que el formulario se envíe de manera tradicional
    // y recargue la página.
    e.preventDefault();

    // Obtiene los valores ingresados por el usuario.
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    // Envía las credenciales al servidor mediante una petición POST.
    fetch("../backend/login.php", {
        credentials: "include", // Incluye cookies de sesión.
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // Convierte los datos a formato JSON.
        body: JSON.stringify({
            correo,
            contrasena
        })
    })

    // Convierte la respuesta del servidor a JSON.
    .then(res => res.json())

    // Procesa la respuesta recibida.
    .then(data => {

        console.log("Respuesta login:", data);

        // Verifica si el inicio de sesión fue exitoso.
        if (!data.success) {

            // Muestra un mensaje de error si las credenciales son incorrectas.
            Swal.fire({
                title: 'Credenciales Incorrectas',
                text: data.message || "El correo o la contraseña no coinciden.",
                icon: 'error',
                confirmButtonText: 'Corregir',
                confirmButtonColor: '#093a27'
            });

            return;
        }

        // ==========================
        // GUARDAR DATOS DE SESION
        // ==========================

        // Guarda información del usuario en sessionStorage
        // para utilizarla durante la sesión actual.
        sessionStorage.setItem('nombreUsuario', data.nombre);
        sessionStorage.setItem('rol', data.rol);
        sessionStorage.setItem('idUsuario', data.id);

        // Normaliza el rol para evitar problemas con mayúsculas,
        // minúsculas o espacios adicionales.
        const rol = (data.rol || "").toLowerCase().trim();

        // ==========================
        // REDIRECCION SEGUN EL ROL
        // ==========================

        // Si es administrador.
        if (rol === "admin" || rol === "administrador") {

            window.location.href =
                "/Proyecto-Manejo-de-residuos/views/admin.html";

        }

        // Si es recolector.
        else if (rol === "recolector") {

            window.location.href =
                "/Proyecto-Manejo-de-residuos/views/recolectorUsuario.html";

        }

        // Si es un usuario normal.
        else {

            window.location.href =
                "/Proyecto-Manejo-de-residuos/index.html";
        }

    })

    // Captura errores de conexión o fallos en la petición.
    .catch(err => {

        console.error("ERROR FETCH:", err);

        Swal.fire({
            title: 'Error de Red',
            text: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });
    });
});

// ==========================
// MENSAJE DE BLOQUEO
// ==========================

// Se ejecuta cuando la página termina de cargarse.
document.addEventListener('DOMContentLoaded', function() {

    // Obtiene el mensaje almacenado en sessionStorage.
    const mensajeAdmin = sessionStorage.getItem('mensaje_bloqueo');

    // Verifica si existe un mensaje de acceso denegado.
    if (mensajeAdmin) {

        // Muestra una alerta indicando que el usuario
        // intentó acceder a una sección restringida.
        Swal.fire({
            title: '¡Acceso denegado!',
            text: mensajeAdmin,
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#50e050'
        });

        // Elimina el mensaje para evitar que vuelva a mostrarse
        // cada vez que se recargue la página.
        sessionStorage.removeItem('mensaje_bloqueo');
    }
});