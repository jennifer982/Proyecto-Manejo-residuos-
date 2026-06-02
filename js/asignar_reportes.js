//==================================================
// CUANDO CARGA LA PAGINA
// Ejecuta automáticamente la carga de reportes
// pendientes de asignación
//==================================================
document.addEventListener("DOMContentLoaded", () => {

    cargarReportes();

});


//==================================================
// CARGAR REPORTES
// Obtiene los reportes pendientes desde el backend
// y los muestra en la tabla
//==================================================
function cargarReportes() {

    fetch("../backend/getReportesPendientes.php")

    .then(res => res.json())

    .then(data => {

        // Obtener referencia de la tabla
        const tabla =
            document.getElementById(
                "tabla-reportes"
            );

        // Limpiar contenido anterior
        tabla.innerHTML = "";

        // Si no existen reportes pendientes
        if (!data.length) {

            tabla.innerHTML =

            '<tr><td colspan="5">No hay reportes pendientes de asignación.</td></tr>';

            return;
        }

        // Recorrer todos los reportes recibidos
        data.forEach(rep => {

            // Crear fila de la tabla
            tabla.innerHTML += `

                <tr>

                    <td>${rep.id_reporte}</td>

                    <td>${rep.categoria}</td>

                    <td>${rep.fecha}</td>

                    <td>${rep.riesgo}</td>

                    <td>

                        <select id="rec-${rep.id_reporte}">
                        </select>

                        <button onclick="asignar(${rep.id_reporte})">
                            Asignar
                        </button>

                        <button onclick="cancelarAsignacion(${rep.id_reporte})">
                            Cancelar
                        </button>

                    </td>

                </tr>

            `;

            // Cargar lista de recolectores disponibles
            cargarRecolectores(
                rep.id_reporte
            );

        });

    })

    .catch(err =>

        console.error(
            "Error al cargar reportes:",
            err
        )

    );
}


//==================================================
// CARGAR RECOLECTORES
// Obtiene todos los recolectores registrados
// y los agrega al select correspondiente
//==================================================
function cargarRecolectores(idReporte) {

    fetch("../backend/getRecolectores.php")

    .then(res => res.json())

    .then(data => {

        // Obtener select correspondiente al reporte
        const select =
            document.getElementById(
                `rec-${idReporte}`
            );

        // Opción por defecto
        select.innerHTML =

            '<option value="">-- Seleccionar --</option>';

        // Recorrer todos los recolectores
        data.forEach(rec => {

            // Crear opción del select
            const option =
                document.createElement(
                    "option"
                );

            // ID del recolector
            option.value =
                rec.id_usuario;

            // Nombre visible
            option.textContent =
                rec.nombre;

            // Agregar opción al select
            select.appendChild(option);

        });

    })

    .catch(err =>

        console.error(
            "Error al cargar recolectores:",
            err
        )

    );
}
//==================================================
// ASIGNAR RECOLECTOR
// Asigna un recolector a un reporte pendiente
//==================================================
function asignar(idReporte) {

    // Obtener el recolector seleccionado del select
    const idRecolector =
        document.getElementById(
            `rec-${idReporte}`
        ).value;

    // Verificar que se haya seleccionado un recolector
    if (!idRecolector) {

        Swal.fire({

            title: 'Error',

            text: 'Seleccione un recolector para asignar el reporte.',

            icon: 'error',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        return;
    }

    // Enviar datos al backend
    fetch("../backend/asignarRecolector.php", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        // Convertir datos a formato JSON
        body: JSON.stringify({

            id_reporte: idReporte,

            id_recolector: idRecolector

        })

    })

    .then(res => res.json())

    .then(data => {

        // Mostrar mensaje de éxito
        Swal.fire({

            title: 'Éxito',

            text: data.message,

            icon: 'success',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        // Recargar tabla de reportes
        cargarReportes();

    })

    .catch(err =>

        console.error(
            "Error al asignar:",
            err
        )

    );
}


//==================================================
// CANCELAR ASIGNACION
// Permite quitar un reporte previamente asignado
// a un recolector
//==================================================
function cancelarAsignacion(idReporte) {

    // Mostrar ventana de confirmación
    Swal.fire({

        title: '¿Cancelar asignación?',

        text: "¿Estás seguro de que deseas quitarle este reporte al recolector?",

        icon: 'question',

        showCancelButton: true,

        confirmButtonColor: '#093a27',

        cancelButtonColor: '#d33',

        confirmButtonText: 'Sí, cancelar',

        cancelButtonText: 'Mantener asignado'

    })

    .then((result) => {

        // Si el usuario confirma la cancelación
        if (result.isConfirmed) {

            fetch("../backend/cancelarAsignacion.php", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                // Enviar ID del reporte
                body: JSON.stringify({

                    id_reporte: idReporte

                })

            })

            .then(res => res.json())

            .then(data => {

                // Mostrar resultado de la operación
                Swal.fire({

                    title: 'Éxito',

                    text: data.message,

                    icon: 'success',

                    confirmButtonText: 'Entendido',

                    confirmButtonColor: '#093a27'

                });

                // Actualizar tabla
                cargarReportes();

            })

            .catch(err => {

                console.error(
                    "Error al cancelar:",
                    err
                );

                Swal.fire({

                    title: 'Error de red',

                    text: 'No se pudo procesar la solicitud.',

                    icon: 'error',

                    confirmButtonColor: '#093a27'

                });

            });

        }

    });

}