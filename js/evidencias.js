//==================================================
// CARGAR EVIDENCIAS AL INICIAR LA PAGINA
// Cuando el DOM termina de cargar, se obtienen
// todas las evidencias pendientes desde el backend.
//==================================================
document.addEventListener(

    "DOMContentLoaded",

    cargarEvidencias

);


//==================================================
// CARGAR EVIDENCIAS
// Consulta las evidencias registradas y las muestra
// dentro de la tabla.
//==================================================
function cargarEvidencias(){

    fetch("../backend/getEvidencias.php")

    .then(res => res.json())

    .then(data => {

        // Obtener cuerpo de la tabla
        const tabla =

            document.querySelector(
                "#tablaEvidencias tbody"
            );

        // Limpiar contenido previo
        tabla.innerHTML = "";

        // Recorrer evidencias recibidas
        data.forEach(rep => {

            tabla.innerHTML += `

            <tr>

                <td>${rep.id_reporte}</td>

                <td>${rep.descripcion}</td>

                <td>${rep.fecha}</td>

                <td>${rep.id_estado}</td>

                <td>

                    <button
                        class="btn-tabla btn-ver"
                        onclick="verImagen('${rep.foto_evidencia}')">
                        Ver
                    </button>

                    <button
                        class="btn-tabla btn-aceptar"
                        onclick="aceptar(${rep.id_reporte})">
                        Aceptar
                    </button>

                    <button
                        class="btn-tabla btn-rechazar"
                        onclick="rechazar(${rep.id_reporte})">
                        Rechazar
                    </button>

                </td>

            </tr>

            `;

        });

    })

    .catch(err => {

        console.error(
            "ERROR CARGANDO:",
            err
        );

    });

}


//==================================================
// VER IMAGEN
// Muestra la evidencia seleccionada en una ventana
// modal ampliada.
//==================================================
function verImagen(ruta){

    document.getElementById(
        "modalImg"
    ).style.display = "flex";

    document.getElementById(
        "imgGrande"
    ).src = ruta;

}


//==================================================
// CERRAR MODAL
// Si el usuario hace clic sobre el modal,
// éste se oculta.
//==================================================
const modal =

    document.getElementById(
        "modalImg"
    );

if(modal){

    modal.onclick = function(){

        this.style.display = "none";

    }

}


//==================================================
// ACEPTAR EVIDENCIA
// Envía al backend la solicitud para aprobar
// la evidencia enviada por el recolector.
//==================================================
function aceptar(id){

    fetch(

        "../backend/aceptar_evidencia.php",

        {

            method: "POST",

            headers: {

                "Content-Type":
                "application/x-www-form-urlencoded"

            },

            body:
                "id_reporte=" + id

        }

    )

    .then(res => res.json())

    .then(data => {

        // Evidencia aceptada correctamente
        if (data.success) {

            Swal.fire({

                title: 'Éxito',

                text: 'Evidencia aceptada correctamente.',

                icon: 'success',

                confirmButtonText: 'Entendido',

                confirmButtonColor: '#093a27'

            });

        }

        // Error al aceptar
        else {

            Swal.fire({

                title: 'Error',

                text: 'Error: ' + data.message,

                icon: 'error',

                confirmButtonText: 'Entendido',

                confirmButtonColor: '#093a27'

            });

        }

        // Recargar tabla
        cargarEvidencias();

    })

    .catch(err =>

        console.error(
            "ERROR aceptar:",
            err
        )

    );

}


//==================================================
// RECHAZAR EVIDENCIA
// Envía al backend la solicitud para rechazar
// la evidencia enviada por el recolector.
//==================================================
function rechazar(id){

    fetch(

        "../backend/rechazar_evidencia.php",

        {

            method: "POST",

            headers: {

                "Content-Type":
                "application/x-www-form-urlencoded"

            },

            body:
                "id_reporte=" + id

        }

    )

    .then(res => res.json())

    .then(data => {

        Swal.fire({

            title: 'Éxito',

            text: data.message,

            icon: 'success',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        // Actualizar tabla
        cargarEvidencias();

    })

    .catch(err => {

        console.error(

            "ERROR al rechazar:",

            err

        );

        Swal.fire({

            title: 'Error',

            text: 'Ocurrió un problema de conexión con el servidor.',

            icon: 'error',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

    });

}


//==================================================
// HACER FUNCIONES GLOBALES
// Permite que puedan ser utilizadas desde los
// botones generados dinámicamente en la tabla.
//==================================================
window.aceptar = aceptar;

window.rechazar = rechazar;

window.verImagen = verImagen;