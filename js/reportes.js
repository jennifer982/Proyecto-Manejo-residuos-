// ==========================
// CARGA INICIAL
// ==========================

// Cuando el documento HTML termina de cargarse,
// se llama a la función que obtiene los reportes.
document.addEventListener("DOMContentLoaded", () => {

    cargarReportes();

});

// ==========================
// VER DETALLE DE REPORTE
// ==========================

// Redirige al usuario a la página de detalle
// enviando el ID del reporte por la URL.
function verReporte(id) {

    window.location.href =
        `../views/detalle.html?id=${id}`;

}

// ==========================
// ACEPTAR REPORTE
// ==========================

// Envía una solicitud al servidor para aceptar
// un reporte pendiente.
function aceptarReporte(id) {

    fetch("../backend/aceptarReporte.php", {

        method: "POST",

        headers: {
            "Content-Type":
            "application/x-www-form-urlencoded"
        },

        // Envía el ID del reporte.
        body: "id_reporte=" + id,

        // Incluye la sesión del usuario.
        credentials: "include"

    })

    // Convierte la respuesta a JSON.
    .then(res => res.json())

    // Procesa la respuesta.
    .then(data => {

        console.log(data);

        // Muestra mensaje de éxito.
        Swal.fire({

            title: 'Reporte Aceptado',

            text: 'El reporte ha sido aceptado.',

            icon: 'success',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        // Actualiza la tabla de reportes.
        cargarReportes();
    })

    // Captura errores.
    .catch(err => console.error(err));
}

// ==========================
// ELIMINAR / RECHAZAR REPORTE
// ==========================

// Envía una solicitud al servidor para eliminar
// o rechazar un reporte.
function eliminarReporte(id) {

    fetch("../backend/eliminarReporte.php", {

        method: "POST",

        headers: {
            "Content-Type":
            "application/x-www-form-urlencoded"
        },

        // Envía el ID del reporte.
        body: "id_reporte=" + id,

        // Incluye la sesión activa.
        credentials: "include"

    })

    // Convierte la respuesta a JSON.
    .then(res => res.json())

    // Procesa la respuesta.
    .then(data => {

        // Muestra mensaje de confirmación.
        Swal.fire({

            title: 'Reporte Eliminado',

            text: 'El reporte ha sido eliminado.',

            icon: 'success',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        // Recarga la tabla.
        cargarReportes();
    })

    // Captura errores.
    .catch(err => console.error(err));
}

// ==========================
// CARGAR REPORTES
// ==========================

// Obtiene todos los reportes registrados
// para mostrarlos en la tabla del administrador.
function cargarReportes() {

    fetch("../backend/getReportesAdmin.php", {

        // Envía las cookies de sesión.
        credentials: "include"

    })

    .then(res => {

        // Si la sesión expiró.
        if (res.status === 401) {

            Swal.fire({

                title: 'Sesión Expirada',

                text: 'La sesión ha expirado.',

                icon: 'warning',

                confirmButtonText: 'Entendido',

                confirmButtonColor: '#093a27'

            });

            // Redirige al login.
            window.location.href =
                "../views/iniciosesion.html";

            return;
        }

        return res.json();
    })

    .then(result => {

        console.log(
            "JSON PARSEADO:",
            result
        );

        const data = result;

        // Verifica que la respuesta sea un arreglo.
        if (!Array.isArray(data)) {

            console.error(
                "data no es array:",
                data
            );

            return;
        }

        // Obtiene el cuerpo de la tabla.
        const tbody =
            document.querySelector(
                "#tablaReportes tbody"
            );

        // Limpia registros anteriores.
        tbody.innerHTML = "";

        // ==========================
        // GENERAR FILAS DE LA TABLA
        // ==========================

        data.forEach(rep => {

            tbody.innerHTML += `
                <tr>

                    <!-- ID del reporte -->
                    <td>${rep.id_reporte}</td>

                    <!-- Tipo de residuo -->
                    <td>${rep.tipo_residuo}</td>

                    <!-- Estado actual -->
                    <td>${rep.estado}</td>

                    <!-- Botones de acción -->
                    <td>

                        <button
                            class="btn-tabla btn-modificar"
                            onclick="verReporte(${rep.id_reporte})">
                            Ver y Editar
                        </button>

                        <button
                            class="btn-tabla btn-aceptar"
                            onclick="aceptarReporte(${rep.id_reporte})">
                            Aceptar
                        </button>

                        <button
                            class="btn-tabla btn-rechazar"
                            onclick="eliminarReporte(${rep.id_reporte})">
                            Rechazar
                        </button>

                    </td>

                </tr>
            `;
        });
    });
}