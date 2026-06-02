//==================================================
// VARIABLE GLOBAL DEL REPORTE
// Almacena temporalmente toda la información del
// reporte que se está visualizando
//==================================================
var reporteActual = {};


//==================================================
// OBTENER ID DESDE LA URL
// Extrae el parámetro "id" enviado en la URL
// Ejemplo:
// detalle.html?id=5
// Retorna: 5
//==================================================
function obtenerIdDesdeURL() {

    // Obtener parámetros de la URL actual
    var params =
        new URLSearchParams(
            window.location.search
        );

    // Obtener el parámetro "id"
    // Si no existe devuelve 1 por defecto
    return params.get("id") || 1;
}


//==================================================
// INICIALIZAR MAPA
// Crea un mapa centrado en la ubicación del reporte
// utilizando Leaflet y OpenStreetMap
//==================================================
function inicializarMapa(lat, lng) {

    // Crear mapa y centrarlo en las coordenadas recibidas
    var mapaDetalle =
        L.map("mapa-detalle")
        .setView([lat, lng], 15);

    // Agregar capa de OpenStreetMap
    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            attribution: "© OpenStreetMap",
        }

    ).addTo(mapaDetalle);

    // Agregar marcador en la ubicación del residuo
    L.marker([lat, lng])

    .addTo(mapaDetalle)

    .bindPopup(
        "Ubicación del residuo"
    )

    .openPopup();
}
//==================================================
// ABRIR MODAL DE DESCARGA
// Muestra la ventana de confirmación para generar
// el reporte PDF
//==================================================
function confirmarDescarga() {

    document.getElementById(
        "modal-descarga"
    ).style.display = "flex";

}


//==================================================
// CERRAR MODAL
// Oculta la ventana de confirmación
//==================================================
function cerrarModal() {

    document.getElementById(
        "modal-descarga"
    ).style.display = "none";

}


//==================================================
// MOSTRAR NOTIFICACION
// Muestra un mensaje temporal en pantalla
//==================================================
function mostrarNotificacion(mensaje) {

    var n =
        document.getElementById(
            "notificacion"
        );

    // Asignar texto
    n.textContent = mensaje;

    // Mostrar notificación
    n.className =
        "notificacion visible";

    // Ocultarla después de 4 segundos
    setTimeout(function () {

        n.className =
            "notificacion";

    }, 4000);
}


//==================================================
// DESCARGAR PDF
// Genera un reporte PDF utilizando jsPDF
// incluyendo datos e imágenes del reporte
//==================================================
async function descargarPDF() {

    // Cerrar modal antes de iniciar descarga
    cerrarModal();

    // Informar al usuario que el PDF se está generando
    mostrarNotificacion(
        "Tu reporte con imágenes se está generando..."
    );

    try {

        // Crear documento PDF
        var doc =
            new jspdf.jsPDF();

        // Obtener datos del reporte actual
        const reporte =
            window.reporteActual;


        //==================================================
        // ENCABEZADO DEL PDF
        //==================================================

        // Fondo verde superior
        doc.setFillColor(
            9,
            58,
            39
        );

        doc.rect(
            0,
            0,
            210,
            35,
            "F"
        );

        // Texto blanco
        doc.setTextColor(
            255,
            255,
            255
        );

        doc.setFontSize(20);

        doc.setFont(
            "helvetica",
            "bold"
        );

        // Título principal
        doc.text(
            "Reporte",
            14,
            16
        );

        // Subtítulo
        doc.setFontSize(10);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            "Manejo de residuos",
            14,
            24
        );

        // Obtener fecha actual
        var fechaHoy =
            new Date()
            .toLocaleDateString(
                "es-MX",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }
            );

        // Mostrar fecha de generación
        doc.text(
            "Generado el: " + fechaHoy,
            14,
            31
        );


        //==================================================
        // TITULO Y LINEA DECORATIVA
        //==================================================
        doc.setTextColor(
            9,
            58,
            39
        );

        doc.setFontSize(14);

        doc.setDrawColor(
            9,
            58,
            39
        );

        // Línea horizontal decorativa
        doc.line(
            14,
            51,
            196,
            51
        );


        //==================================================
        // TABLA DE DATOS
        // Muestra la información principal del reporte
        //==================================================
        doc.autoTable({

            startY: 56,

            head: [[
                "Campo",
                "Detalle"
            ]],

            body: [

                [
                    "Categoría",
                    reporteActual.categoria || "—"
                ],

                [
                    "Residuo Específico",
                    reporteActual.material || "—"
                ],

                [
                    "Estado actual",
                    reporte.estado || "—"
                ],

                [
                    "Nivel de Riesgo",
                    (reporte.riesgo || "0") + " / 5"
                ],

                [
                    "Descripción",
                    reporte.descripcion || "Sin descripción"
                ],

                [
                    "Dirección o referencia",
                    reporte.direccion || "No se ingresó dirección"
                ],

                [
                    "Ubicación (Lat, Lng)",

                    (reporte.latitud || "—")
                    + ", " +

                    (reporte.longitud || "—")

                ],

                [
                    "Fecha de reporte",
                    reporte.fecha || "—"
                ]

            ],

            // Estilo del encabezado
            headStyles: {

                fillColor: [
                    9,
                    58,
                    39
                ],

                fontSize: 10

            },

            // Estilo general
            styles: {

                cellPadding: 5,

                fontSize: 10

            },

            // Configuración de columnas
            columnStyles: {

                0: {

                    fontStyle: "bold",

                    cellWidth: 50

                }

            }

        });


        //==================================================
        // SECCION DE IMAGENES
        //==================================================

        // Obtener posición final de la tabla
        let finalY =
            doc.lastAutoTable.finalY + 15;

        doc.setFontSize(12);

        doc.text(
            "Evidencia Fotográfica:",
            14,
            finalY
        );


        //==================================================
        // FUNCION PARA CARGAR IMAGENES
        // Convierte imágenes externas para agregarlas
        // al PDF posteriormente
        //==================================================
        const cargarImagen = (url) => {

            return new Promise(

                (
                    resolve,
                    reject
                ) => {

                    const img =
                        new Image();

                    // Permitir cargar imágenes externas
                    img.crossOrigin =
                        "Anonymous";

                    // Cuando cargue correctamente
                    img.onload =
                        () => resolve(img);

                    // Si ocurre un error
                    img.onerror =
                        reject;

                    // URL de la imagen
                    img.src = url;

                }

            );

        };
    //==================================================
// EVIDENCIA FOTOGRAFICA
// Obtiene las imágenes asociadas al reporte y las
// agrega al PDF generado
//==================================================

// Crear arreglo con las fotografías disponibles
const fotos = [

    reporte.foto1,

    reporte.foto2,

    reporte.foto3

].filter(

    (f) => f // Elimina valores vacíos o nulos

);


// Verificar si existen fotografías
if (fotos.length > 0) {

    // Posición horizontal inicial
    let xPos = 14;

    // Recorrer todas las fotografías
    for (const ruta of fotos) {

        try {

            // Determinar ruta correcta de la imagen
            const imgUrl =

                ruta.startsWith("..")

                ? ruta

                : "../assets/img/reportes/" + ruta;

            // Cargar imagen de forma asíncrona
            const imgData =
                await cargarImagen(imgUrl);

            // Insertar imagen dentro del PDF
            doc.addImage(

                imgData,

                "JPEG",

                xPos,

                finalY + 5,

                55,

                45

            );

            // Mover posición para la siguiente imagen
            xPos += 60;

        }

        catch (e) {

            console.error(

                "No se pudo cargar una imagen para el PDF",

                e

            );

        }

    }

}

else {

    // Si no existen fotografías mostrar mensaje
    doc.setFontSize(10);

    doc.setTextColor(100);

    doc.text(

        "No se adjuntaron imágenes en este reporte.",

        14,

        finalY + 10

    );

}


//==================================================
// PIE DE PAGINA
// Agrega información en la parte inferior del PDF
//==================================================
doc.setFontSize(8);

doc.setTextColor(

    150,

    150,

    150

);

doc.text(

    "Reporte",

    14,

    doc.internal.pageSize.height - 8

);


//==================================================
// GUARDAR PDF
// Descarga el documento generado en el navegador
//==================================================
doc.save(

    "Reporte_" +

    (reporteActual.categoria || "Residuo")

    +

    ".pdf"

);

}

//==================================================
// MANEJO DE ERRORES
// Captura cualquier error durante la generación
// del PDF
//==================================================
catch (error) {

    // Mostrar error en consola
    console.error(error);

    // Mostrar notificación al usuario
    mostrarNotificacion(

        "Error al generar el PDF. Revisa la consola."

    );

}

}