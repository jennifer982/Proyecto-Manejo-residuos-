//==================================================
// CUANDO CARGA LA PAGINA
// Verifica rol, sesión y configura logout
//==================================================
document.addEventListener("DOMContentLoaded", () => {

    // Obtener el rol almacenado en sessionStorage
    const rol = sessionStorage.getItem('rol');

    // Si el usuario no es administrador se redirecciona al login
    if (rol !== 'admin') {

        sessionStorage.setItem(
            'mensaje_bloqueo',
            'Esta sección es solo para administradores.'
        );

        window.location.href =
            '../views/iniciosesion.html';
    }


    //==================================================
    // VERIFICAR SESION ACTIVA
    // Consulta al servidor si existe una sesión válida
    //==================================================
    fetch("../backend/getUser.php", {

        credentials: "include"

    })

    .then(res => res.json())

    .then(user => {

        // Si la sesión expiró o el usuario no es válido
        if (!user || !user.success) {

            sessionStorage.setItem(
                'mensaje_bloqueo',
                'Tu sesión ha expirado o no tienes acceso autorizado. Por favor, inicia sesión de nuevo.'
            );

            window.location.href =
                "../views/iniciosesion.html";

            return;
        }

        // Mostrar nombre del administrador
        if (user.success) {

            document.querySelector("h1").textContent =
                "Bienvenido " + user.nombre;
        }

        // Cargar reportes en la tabla
        cargarReportes();

    })

    .catch(err =>
        console.error(
            "Error sesión:",
            err
        )
    );


    //==================================================
    // CERRAR SESION MANUALMENTE
    //==================================================
    const btnLogout =
        document.getElementById("btnLogout");

    if (btnLogout) {

        btnLogout.addEventListener("click", (e) => {

            // Evita comportamiento por defecto
            e.preventDefault();

            // Solicita al servidor cerrar la sesión
            fetch("../backend/logout.php", {

                method: "POST",

                credentials: "include"

            })

            .then(res => res.json())

            .then(data => {

                // Si se cerró correctamente
                if (data.success) {

                    Swal.fire({

                        title: '¡Sesión cerrada!',

                        text: 'Has salido del panel de administración.',

                        icon: 'success',

                        confirmButtonText: 'Entendido',

                        confirmButtonColor: '#093a27'

                    })

                    .then((result) => {

                        if (result.isConfirmed) {

                            window.location.href =
                            "../views/iniciosesion.html";
                        }

                    });

                }

            })

            .catch(err => {

                console.error(
                    "Error al cerrar sesión:",
                    err
                );

                Swal.fire({

                    title: 'Error de Conexión',

                    text: 'No se pudo finalizar la sesión en el servidor de forma segura.',

                    icon: 'error',

                    confirmButtonText: 'Cerrar',

                    confirmButtonColor: '#d33'

                });

            });

        });

    }

});


//==================================================
// CAMBIAR SECCIONES DEL PANEL
// Oculta todas las secciones y muestra la elegida
//==================================================
function mostrarSeccion(seccion) {

    document.getElementById("seccion-reportes").style.display = "none";

    document.getElementById("seccion-usuarios").style.display = "none";

    document.getElementById("seccion-config").style.display = "none";

    document.getElementById("seccion-" + seccion).style.display = "block";
}


//==================================================
// CARGAR REPORTES
// Obtiene los reportes desde PHP y llena la tabla
//==================================================
function cargarReportes() {

    fetch("../backend/getReportesAdmin.php", {

        credentials: "include"

    })

    .then(res => res.json())

    .then(response => {

        // Verifica si el servidor devolvió error
        if (response.error) {

            console.error(
                response.message
            );

            return;
        }

        const data = response;

        // Verifica que sea un arreglo válido
        if (!Array.isArray(data)) {

            console.error(
                "Respuesta inválida:",
                data
            );

            return;
        }

        // Obtener cuerpo de la tabla
        const tabla =
            document.querySelector(
                "#tablaReportes tbody"
            );

        // Limpiar contenido anterior
        tabla.innerHTML = "";

        // Recorrer todos los reportes
        data.forEach(reporte => {

            // Colores según el estado del reporte
            const colores = {

                1: "orange",

                2: "blue",

                3: "purple",

                4: "green",

                5: "red"
            };

            // Crear fila HTML
            const fila =
                document.createElement("tr");

            fila.innerHTML = `

                <td>${reporte.id_reporte}</td>

                <td>${reporte.descripcion}</td>

                <td style="color:${colores[reporte.id_estado] || 'black'}; font-weight:bold;">
                    ${traducirEstado(reporte.id_estado)}
                </td>

                <td>
                    <button onclick="verMapa(${reporte.latitud}, ${reporte.longitud})">
                        Ver
                    </button>
                </td>

                <td>
                    <img src="../../uploads/${reporte.fotos}" width="50">
                </td>

                <td>

                    <button onclick="cambiarEstado(${reporte.id_reporte}, 2)">
                        Aceptar
                    </button>

                    <button onclick="cambiarEstado(${reporte.id_reporte}, 3)">
                        En proceso
                    </button>

                    <button onclick="cambiarEstado(${reporte.id_reporte}, 4)">
                        Atendido
                    </button>

                    <button onclick="cambiarEstado(${reporte.id_reporte}, 5)">
                        Rechazar
                    </button>

                </td>

            `;

            // Agregar fila a la tabla
            tabla.appendChild(fila);

        });

    })

    .catch(err =>
        console.error(
            "Error reportes:",
            err
        )
    );

}

//==================================================
// TRADUCIR ESTADO
// Convierte el ID numérico del estado en un texto
// entendible para mostrarlo en la interfaz
//==================================================
function traducirEstado(estado) {

    return {

        1: "Pendiente",

        2: "Aceptado",

        3: "En proceso",

        4: "Atendido",

        5: "Rechazado"

    }[estado] || "Desconocido";
}


//==================================================
// CAMBIAR ESTADO DEL REPORTE
// Envía al servidor el nuevo estado seleccionado
// por el administrador
//==================================================
function cambiarEstado(id, estado) {

    // Crear objeto FormData para enviar datos a PHP
    const formData = new FormData();

    // Agregar ID del reporte
    formData.append("id", id);

    // Agregar nuevo estado
    formData.append("estado", estado);

    // Enviar información al servidor
    fetch("../backend/updateReportes.php", {

        method: "POST",

        body: formData

    })

    .then(res => res.json())

    .then(data => {

        // Determina el tipo de alerta
        const tipoIcono =
            data.success ? 'success' : 'error';

        // Determina el título de la alerta
        const tituloAlerta =
            data.success ? '¡Éxito!' : 'Hubo un problema';

        // Mostrar mensaje al usuario
        Swal.fire({

            title: tituloAlerta,

            text: data.message,

            icon: tipoIcono,

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        })

        .then((result) => {

            // Si se actualizó correctamente recarga la tabla
            if (result.isConfirmed && data.success) {

                cargarReportes();
            }

        });

    })

    .catch(err => {

        // Mostrar error en consola
        console.error(err);

        // Mostrar alerta de error
        Swal.fire({

            title: 'Error técnico',

            text: 'No se pudieron guardar los cambios en el servidor.',

            icon: 'error',

            confirmButtonText: 'Cerrar',

            confirmButtonColor: '#d33'

        });

    });

}


//==================================================
// VER MAPA
// Abre Google Maps en una nueva pestaña utilizando
// las coordenadas del reporte
//==================================================
function verMapa(lat, lng) {

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );

}


//==================================================
// BUSCADOR DINÁMICO
// Filtra las filas de la tabla mientras el usuario
// escribe en el campo de búsqueda
//==================================================
document.addEventListener("keyup", (e) => {

    // Verificar que el evento provenga del buscador
    if (e.target.id === "buscador") {

        // Convertir texto a minúsculas
        const texto =
            e.target.value.toLowerCase();

        // Obtener todas las filas de la tabla
        const filas =
            document.querySelectorAll(
                "#tablaReportes tbody tr"
            );

        // Recorrer cada fila
        filas.forEach(fila => {

            // Mostrar u ocultar dependiendo si coincide
            fila.style.display =
                fila.textContent
                    .toLowerCase()
                    .includes(texto)
                ? ""
                : "none";
        });
    }
});


/* ==================================================
   ACTIVIDAD RECIENTE
   Obtiene las actividades registradas en el sistema
   y las muestra en el dashboard
================================================== */

fetch("../backend/getActividad.php")

.then(res => res.json())

.then(data => {

    // Contenedor donde se mostrarán las actividades
    const contenedor =
    document.getElementById(
        "contenedorActividad"
    );

    // Recorrer todas las actividades recibidas
    data.forEach(item => {

        // Insertar actividad en el HTML
        contenedor.innerHTML += `

            <div class="actividad-item">

                <span class="actividad-hora">
                    ${item.hora}
                </span>

                <p>
                    ${item.descripcion}
                </p>

            </div>

        `;
    });

})

// Manejo de errores
.catch(error => {

    console.error(
        "Error actividad:",
        error
    );

});


/* ==================================================
GRAFICA DE REPORTES
Utiliza Chart.js para mostrar estadísticas de
residuos reportados
================================================== */

// Obtener el canvas donde se dibujará la gráfica
const ctx =
document.getElementById(
    "graficaResiduos"
);


// Crear gráfica de barras
new Chart(ctx, {

    // Tipo de gráfica
    type:"bar",

    data:{

        // Etiquetas del eje X
        labels:[

            "Madera",

            "Metal",

            "Concreto",

            "Plastico",

            "Excavacion"

        ],

        datasets:[{

            // Nombre de la serie de datos
            label:"Reportes",

            // Valores de cada categoría
            data:[

                12,

                19,

                7,

                10,

                5

            ],

            // Colores de las barras
            backgroundColor:[

                "#39b54a",

                "#0b6b39",

                "#8bc34a",

                "#4caf50",

                "#66bb6a"

            ],

            // Bordes redondeados
            borderRadius:10

        }]
    },

    options:{

        // Adaptable a cualquier pantalla
        responsive:true,

        plugins:{

            // Ocultar leyenda superior
            legend:{

                display:false
            }

        }

    }

});