// ==========================
// CARGA INICIAL
// ==========================

// Cuando el documento HTML termina de cargarse,
// se ejecuta la función que obtiene los usuarios.
document.addEventListener("DOMContentLoaded", () => {

    cargarUsuarios();

});

// ==========================
// CARGAR USUARIOS
// ==========================

// Obtiene la lista de usuarios registrados
// desde el servidor y la muestra en una tabla.
function cargarUsuarios() {

    fetch("../backend/getUsuarios.php", {

        // Incluye las cookies de sesión para validar
        // que el usuario tenga permisos.
        credentials: "include"

    })

    .then(res => {

        // ==========================
        // VALIDAR SESIÓN
        // ==========================

        // Si el servidor devuelve 401,
        // significa que la sesión expiró o no existe.
        if (res.status === 401) {

            Swal.fire({

                title: 'Sesión Expirada',

                text: 'La sesión ha expirado.',

                icon: 'warning',

                confirmButtonText: 'Entendido',

                confirmButtonColor: '#093a27'

            });

            // Redirige al usuario al inicio de sesión.
            window.location.href =
                "../views/iniciosesion.html";

            return;
        }

        // Convierte la respuesta a formato JSON.
        return res.json();
    })

    .then(data => {

        // Si no se recibieron datos, termina la ejecución.
        if (!data) return;

        // Muestra la información en la consola para depuración.
        console.log("Usuarios:", data);

        // Obtiene el cuerpo de la tabla.
        const tabla =
            document.querySelector(
                "#tablaUsuarios tbody"
            );

        // Limpia registros anteriores.
        tabla.innerHTML = "";

        // ==========================
        // RECORRER USUARIOS
        // ==========================

        data.forEach(user => {

            // Crea una nueva fila.
            const fila =
                document.createElement("tr");

            // Inserta la información del usuario.
            fila.innerHTML = `

                <td>${user.id_usuario}</td>

                <td>${user.nombre}</td>

                <td>${user.correo}</td>

                <td>${user.rol}</td>

            `;

            // Agrega la fila a la tabla.
            tabla.appendChild(fila);
        });
    })

    // ==========================
    // MANEJO DE ERRORES
    // ==========================

    .catch(err => {

        console.error(
            "Error:",
            err
        );

        // Muestra un mensaje si no fue posible
        // comunicarse con el servidor.
        Swal.fire({

            title: 'Error de Conexión',

            text: 'No se pudo obtener la lista de usuarios del sistema.',

            icon: 'error',

            confirmButtonText: 'Cerrar',

            confirmButtonColor: '#093a27'

        });
    });
}