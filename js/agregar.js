//==================================================
// CREAR MAPA CON LEAFLET
// Inicializa el mapa centrado en Tijuana
//==================================================
var mapa = L.map('mapa').setView(
    [32.5149, -117.0382],
    13
);


//==================================================
// CAPA DE OPENSTREETMAP
// Carga el mapa base utilizando OpenStreetMap
//==================================================
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
)
.addTo(mapa);


//==================================================
// ACTUALIZAR TAMAÑO DEL MAPA
// Soluciona problemas de renderizado cuando
// el mapa se carga dentro de contenedores ocultos
//==================================================
setTimeout(() => {

    mapa.invalidateSize();

}, 300);


// Variable que almacenará el marcador seleccionado
var marcador;


//==================================================
// EVENTO CLICK EN EL MAPA
// Permite seleccionar una ubicación
//==================================================
mapa.on('click', function(e){

    // Si ya existe un marcador lo elimina
    if(marcador){

        mapa.removeLayer(marcador);
    }

    // Crear nuevo marcador en la posición seleccionada
    marcador =
        L.marker(e.latlng)
        .addTo(mapa);

    // Guardar latitud en input oculto
    document.getElementById("latitud").value =
        e.latlng.lat;

    // Guardar longitud en input oculto
    document.getElementById("longitud").value =
        e.latlng.lng;

});


//==================================================
// BOTON VER PUNTOS REGISTRADOS
// Carga todos los puntos oficiales registrados
//==================================================
document.getElementById("btnVerPuntos")
.addEventListener("click", function () {

    cargarPuntosRegistrados();

});


//==================================================
// CARGAR PUNTOS REGISTRADOS
// Obtiene los puntos desde la base de datos
// y genera la tabla dinámicamente
//==================================================
function cargarPuntosRegistrados() {

    fetch("../backend/getPuntosAdmin.php")

    .then(res => res.json())

    .then(data => {

        // Construcción inicial de la tabla
        let html = `

        <h2 class="titulo-tabla">
            Puntos Registrados
        </h2>

        <table class="tabla-puntos">

            <thead>

                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Horario</th>
                    <th>Teléfono</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                </tr>

            </thead>

            <tbody>

        `;

        // Recorrer cada punto obtenido
        data.forEach(punto => {

            html += `

            <tr>

                <td>${punto.id_punto}</td>

                <td>${punto.nombre}</td>

                <td>${punto.direccion}</td>

                <td>${punto.horario}</td>

                <td>${punto.telefono}</td>

                <td>
                    ${punto.activo == 1 ? 'Sí' : 'No'}
                </td>

                <td>

                    <button
                        class="btn-eliminar"
                        onclick="eliminarPunto(${punto.id_punto})">

                        Eliminar

                    </button>

                </td>

            </tr>

            `;
        });

        // Cierre de la tabla
        html += `

            </tbody>

        </table>

        `;

        // Insertar tabla en el contenedor
        document.getElementById(
            "tablaPuntosContainer"
        ).innerHTML = html;

    })

    .catch(error => {

        // Mostrar alerta si ocurre un error
        Swal.fire({

            title: 'Error',

            text: 'No se pudieron cargar los puntos registrados.',

            icon: 'error',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        console.log(error);

    });

}


//==================================================
// ELIMINAR PUNTO OFICIAL
// Solicita confirmación antes de eliminar
//==================================================
function eliminarPunto(id) {

    Swal.fire({

        title: '¿Estás seguro?',

        text: "Esta acción eliminará el punto oficial permanentemente.",

        icon: 'warning',

        showCancelButton: true,

        confirmButtonColor: '#093a27',

        cancelButtonColor: '#d33',

        confirmButtonText: 'Sí, eliminar',

        cancelButtonText: 'Cancelar'

    })

    .then((result) => {

        // Si el usuario confirma
        if (result.isConfirmed) {

            fetch("../backend/deletePunto.php", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"
                },

                // Enviar ID del punto a eliminar
                body: JSON.stringify({

                    id_punto: id

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

                // Recargar tabla si se eliminó correctamente
                if (data.success) {

                    cargarPuntosRegistrados();
                }

            })

            .catch(error => {

                console.error(error);

                Swal.fire({

                    title: 'Error',

                    text: 'No se pudo comunicar con el servidor.',

                    icon: 'error',

                    confirmButtonColor: '#093a27'

                });

            });

        }

    });

}
//==================================================
// CREAR MAPA CON LEAFLET
// Inicializa el mapa centrado en Tijuana
//==================================================
var mapa = L.map('mapa').setView(
    [32.5149, -117.0382],
    13
);


//==================================================
// CAPA DE OPENSTREETMAP
// Carga el mapa base utilizando OpenStreetMap
//==================================================
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
)
.addTo(mapa);


//==================================================
// ACTUALIZAR TAMAÑO DEL MAPA
// Soluciona problemas de renderizado cuando
// el mapa se carga dentro de contenedores ocultos
//==================================================
setTimeout(() => {

    mapa.invalidateSize();

}, 300);


// Variable que almacenará el marcador seleccionado
var marcador;


//==================================================
// EVENTO CLICK EN EL MAPA
// Permite seleccionar una ubicación
//==================================================
mapa.on('click', function(e){

    // Si ya existe un marcador lo elimina
    if(marcador){

        mapa.removeLayer(marcador);
    }

    // Crear nuevo marcador en la posición seleccionada
    marcador =
        L.marker(e.latlng)
        .addTo(mapa);

    // Guardar latitud en input oculto
    document.getElementById("latitud").value =
        e.latlng.lat;

    // Guardar longitud en input oculto
    document.getElementById("longitud").value =
        e.latlng.lng;

});


//==================================================
// BOTON VER PUNTOS REGISTRADOS
// Carga todos los puntos oficiales registrados
//==================================================
document.getElementById("btnVerPuntos")
.addEventListener("click", function () {

    cargarPuntosRegistrados();

});


//==================================================
// CARGAR PUNTOS REGISTRADOS
// Obtiene los puntos desde la base de datos
// y genera la tabla dinámicamente
//==================================================
function cargarPuntosRegistrados() {

    fetch("../backend/getPuntosAdmin.php")

    .then(res => res.json())

    .then(data => {

        // Construcción inicial de la tabla
        let html = `

        <h2 class="titulo-tabla">
            Puntos Registrados
        </h2>

        <table class="tabla-puntos">

            <thead>

                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Horario</th>
                    <th>Teléfono</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                </tr>

            </thead>

            <tbody>

        `;

        // Recorrer cada punto obtenido
        data.forEach(punto => {

            html += `

            <tr>

                <td>${punto.id_punto}</td>

                <td>${punto.nombre}</td>

                <td>${punto.direccion}</td>

                <td>${punto.horario}</td>

                <td>${punto.telefono}</td>

                <td>
                    ${punto.activo == 1 ? 'Sí' : 'No'}
                </td>

                <td>

                    <button
                        class="btn-eliminar"
                        onclick="eliminarPunto(${punto.id_punto})">

                        Eliminar

                    </button>

                </td>

            </tr>

            `;
        });

        // Cierre de la tabla
        html += `

            </tbody>

        </table>

        `;

        // Insertar tabla en el contenedor
        document.getElementById(
            "tablaPuntosContainer"
        ).innerHTML = html;

    })

    .catch(error => {

        // Mostrar alerta si ocurre un error
        Swal.fire({

            title: 'Error',

            text: 'No se pudieron cargar los puntos registrados.',

            icon: 'error',

            confirmButtonText: 'Entendido',

            confirmButtonColor: '#093a27'

        });

        console.log(error);

    });

}


//==================================================
// ELIMINAR PUNTO OFICIAL
// Solicita confirmación antes de eliminar
//==================================================
function eliminarPunto(id) {

    Swal.fire({

        title: '¿Estás seguro?',

        text: "Esta acción eliminará el punto oficial permanentemente.",

        icon: 'warning',

        showCancelButton: true,

        confirmButtonColor: '#093a27',

        cancelButtonColor: '#d33',

        confirmButtonText: 'Sí, eliminar',

        cancelButtonText: 'Cancelar'

    })

    .then((result) => {

        // Si el usuario confirma
        if (result.isConfirmed) {

            fetch("../backend/deletePunto.php", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"
                },

                // Enviar ID del punto a eliminar
                body: JSON.stringify({

                    id_punto: id

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

                // Recargar tabla si se eliminó correctamente
                if (data.success) {

                    cargarPuntosRegistrados();
                }

            })

            .catch(error => {

                console.error(error);

                Swal.fire({

                    title: 'Error',

                    text: 'No se pudo comunicar con el servidor.',

                    icon: 'error',

                    confirmButtonColor: '#093a27'

                });

            });

        }

    });

}