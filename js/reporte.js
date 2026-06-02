// Se ejecuta cuando todo el contenido HTML ha terminado de cargarse.
document.addEventListener('DOMContentLoaded', function() {

    // ==========================
    // OBTENER COORDENADAS DESDE LA URL
    // ==========================

    // Obtiene los parámetros de la URL.
    const urlParams = new URLSearchParams(window.location.search);

    // Recupera latitud y longitud enviadas desde otra página.
    const latUrl = urlParams.get('lat');
    const lngUrl = urlParams.get('lng');

    // Si existen coordenadas en la URL.
    if (latUrl && lngUrl) {

        const lat = parseFloat(latUrl);
        const lng = parseFloat(lngUrl);

        // Centra el mapa en las coordenadas recibidas.
        mapaReporte.setView([lat, lng], 17);

        // Elimina el marcador anterior si existe.
        if (marcador) {
            mapaReporte.removeLayer(marcador);
        }

        // Crea un nuevo marcador.
        marcador = L.marker([lat, lng]).addTo(mapaReporte);

        // Guarda las coordenadas en campos ocultos.
        document.getElementById('latitud').value = lat;
        document.getElementById('longitud').value = lng;

        // Muestra la información de coordenadas.
        const coordsInfo =
            document.getElementById('coords-info');

        if (coordsInfo)
            coordsInfo.style.display = 'block';
    }

    // ==========================
    // CATÁLOGO DE MATERIALES
    // ==========================

    // Relaciona cada tipo de residuo con sus materiales.
    const materialesPorTipo = {

        "1": [
            { id: 1, nombre: "Concreto simple" },
            { id: 2, nombre: "Concreto armado" }
        ],

        "2": [
            { id: 3, nombre: "Acero de refuerzo" },
            { id: 4, nombre: "Metales ferrosos" },
            { id: 5, nombre: "Metales no ferrosos (aluminio, cobre)" }
        ],

        "3": [
            { id: 6, nombre: "Blocks" },
            { id: 7, nombre: "Tabicones" },
            { id: 8, nombre: "Adoquines" },
            { id: 9, nombre: "Tabiques" },
            { id: 10, nombre: "Muros de piedra braza" }
        ],

        "4": [
            { id: 11, nombre: "Agregados sin recubrimiento" },
            { id: 12, nombre: "Agregados sin mortero" }
        ],

        "5": [
            { id: 13, nombre: "Bases asfálticas" },
            { id: 14, nombre: "Bases negras" }
        ],

        "6": [
            { id: 15, nombre: "Suelo no contaminado" },
            { id: 16, nombre: "Suelo con material arcilloso" }
        ],

        "7": [
            { id: 17, nombre: "Panel de yeso" },
            { id: 18, nombre: "Panel de cemento" }
        ],

        "8": [
            { id: 19, nombre: "Madera" },
            { id: 20, nombre: "Unicel" },
            { id: 21, nombre: "Textil" },
            { id: 22, nombre: "Llantas" }
        ]
    };

    // ==========================
    // ELEMENTOS DEL FORMULARIO
    // ==========================

    const selectTipo =
        document.getElementById('tipo-residuo');

    const selectMaterial =
        document.getElementById('material-especifico');

    const contenedorMaterial =
        document.getElementById('contenedor-material');

    // ==========================
    // CARGAR MATERIALES SEGÚN TIPO
    // ==========================

    if (selectTipo) {

        selectTipo.addEventListener('change', function() {

            const tipoSeleccionado = this.value;

            // Limpia opciones anteriores.
            selectMaterial.innerHTML =
                '<option value="">-- Selecciona el material --</option>';

            // Si existe una lista de materiales para el tipo seleccionado.
            if (
                tipoSeleccionado &&
                materialesPorTipo[tipoSeleccionado]
            ) {

                materialesPorTipo[tipoSeleccionado]
                .forEach(mat => {

                    const option =
                        document.createElement('option');

                    option.value = mat.id;
                    option.textContent = mat.nombre;

                    selectMaterial.appendChild(option);
                });

                // Muestra el selector de materiales.
                contenedorMaterial.style.visibility =
                    'visible';

                contenedorMaterial.style.height =
                    'auto';

                // Hace obligatorio seleccionar un material.
                selectMaterial.required = true;

            } else {

                // Oculta el selector.
                contenedorMaterial.style.visibility =
                    'hidden';

                contenedorMaterial.style.height =
                    '0';

                selectMaterial.required = false;
            }
        });
    }

    // ==========================
    // ENVÍO DEL FORMULARIO
    // ==========================

    const formulario =
        document.getElementById('formulario-reporte');

    if (formulario) {

        formulario.addEventListener('submit', function(e) {

            // Evita la recarga de la página.
            e.preventDefault();

            // Obtiene el botón de envío.
            const btnEnviar =
                document.getElementById('btn-enviar-reporte');

            // Lo deshabilita temporalmente.
            btnEnviar.disabled = true;

            btnEnviar.textContent =
                'Enviando...';

            // Obtiene todos los datos del formulario.
            const formData =
                new FormData(this);

            // ==========================
            // ASEGURAR DATOS IMPORTANTES
            // ==========================

            formData.set(
                'latitud',
                document.getElementById('latitud').value
            );

            formData.set(
                'longitud',
                document.getElementById('longitud').value
            );

            formData.set(
                'direccion',
                document.getElementById('direccion').value
            );

            // Determina si el reporte será anónimo.
            const anonimoCheck =
                document.getElementById('reporte-anonimo').checked
                    ? '1'
                    : '0';

            formData.set(
                'anonimo',
                anonimoCheck
            );

            // ==========================
            // ENVIAR REPORTE
            // ==========================

            fetch('../backend/insertreporte.php', {

                method: 'POST',

                body: formData
            })

            .then(res => res.json())

            .then(resultado => {

                // ==========================
                // REPORTE EXITOSO
                // ==========================

                if (resultado.success) {

                    // Oculta el formulario.
                    document.getElementById(
                        'formulario-reporte'
                    ).style.display = 'none';

                    // Muestra mensaje de confirmación.
                    document.getElementById(
                        'mensaje-confirmacion'
                    ).style.display = 'block';
                }

                // ==========================
                // ERROR DE VALIDACIÓN
                // ==========================

                else {

                    Swal.fire({

                        title: '¡Atención!',

                        text: resultado.message,

                        icon: 'warning',

                        confirmButtonText: 'Entendido',

                        confirmButtonColor: '#28a745'

                    }).then(() => {

                        btnEnviar.disabled = false;

                        btnEnviar.textContent =
                            'Enviar reporte';
                    });
                }
            })

            // ==========================
            // ERROR DE CONEXIÓN
            // ==========================

            .catch(error => {

                console.error('Error:', error);

                Swal.fire({

                    title: 'Error',

                    text: 'Ocurrió un error al enviar el reporte.',

                    icon: 'error',

                    confirmButtonText: 'Entendido',

                    confirmButtonColor: '#093a27'
                });

                btnEnviar.disabled = false;

                btnEnviar.textContent =
                    'Enviar reporte';
            });
        });
    }
});