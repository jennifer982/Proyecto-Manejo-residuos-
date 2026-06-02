//==================================================
// MODULO DE EXPORTACION DE REPORTES
// Permite cargar reportes desde la base de datos
// y exportarlos en formato PDF o CSV.
//==================================================


//==================================================
// VARIABLES GLOBALES
//==================================================

// Formato seleccionado por defecto
var formatoSeleccionado = "pdf";

// Arreglo donde se almacenarán los reportes cargados
var reportesCargados = [];


//==================================================
// CARGAR REPORTES
// Obtiene los reportes desde el backend y los
// almacena en memoria para posteriormente exportarlos.
//==================================================
function cargarReportes() {

  fetch('../backend/getreportesexport.php')

    .then(function(response) {

      return response.json();

    })

    .then(function(datos) {

      // Guardar reportes obtenidos
      reportesCargados = datos;

      // Mostrar reportes en pantalla
      mostrarReportes(datos);

    })

    .catch(function() {

      // Mostrar mensaje de error
      var contenedor =
        document.getElementById(
          'lista-disponibles'
        );

      contenedor.innerHTML =
        '<p class="placeholder-texto">No se pudieron cargar los reportes.</p>';

    });

}


//==================================================
// MOSTRAR REPORTES
// Genera dinámicamente tarjetas con la información
// de cada reporte obtenido desde la base de datos.
//==================================================
function mostrarReportes(datos) {

  var contenedor =
    document.getElementById(
      'lista-disponibles'
    );

  // Limpiar contenido previo
  contenedor.innerHTML = '';

  // Verificar si existen reportes
  if (!datos || datos.length === 0) {

    contenedor.innerHTML =
      '<p class="placeholder-texto">No hay reportes disponibles.</p>';

    return;

  }

  // Recorrer reportes recibidos
  datos.forEach(function(r) {

    // Crear tarjeta
    var tarjeta =
      document.createElement('div');

    tarjeta.className =
      'tarjeta-reporte';

    // Información mostrada en la tarjeta
    tarjeta.innerHTML =

      '<div class="tarjeta-info">' +

        '<div class="tarjeta-titulo">' +

          (r.tipo_residuo || 'Sin tipo') +

        '</div>' +

        '<div class="tarjeta-ubicacion">' +

          (r.descripcion || 'Sin descripción') +

        '</div>' +

        '<div class="tarjeta-meta">' +

          '<span class="badge badge-tipo">' +

            (r.estado || 'Sin estado') +

          '</span>' +

          '<span class="badge badge-tipo">' +

            (r.fecha || '') +

          '</span>' +

        '</div>' +

      '</div>' +

      '<button class="boton-aceptar">' +

        'Aceptar' +

      '</button>';

    // Agregar tarjeta al contenedor
    contenedor.appendChild(tarjeta);

  });

}


//==================================================
// ABRIR MODAL
// Muestra la ventana emergente para seleccionar
// el formato de exportación.
//==================================================
function abrirModal() {

  document.getElementById(
    'modal-exportar'
  ).style.display = 'flex';

}


//==================================================
// CERRAR MODAL
// Oculta la ventana emergente.
//==================================================
function cerrarModal() {

  document.getElementById(
    'modal-exportar'
  ).style.display = 'none';

}


//==================================================
// SELECCIONAR FORMATO
// Permite elegir entre PDF o CSV y actualiza
// visualmente el botón seleccionado.
//==================================================
function seleccionarFormato(formato) {

  // Guardar formato elegido
  formatoSeleccionado = formato;

  // Activar botón PDF si corresponde
  document.getElementById(
    'btn-formato-pdf'
  ).classList.toggle(
    'seleccionado',
    formato === 'pdf'
  );

  // Activar botón CSV si corresponde
  document.getElementById(
    'btn-formato-csv'
  ).classList.toggle(
    'seleccionado',
    formato === 'csv'
  );

}


//==================================================
// MOSTRAR NOTIFICACION
// Muestra mensajes flotantes de éxito o error
// para informar al usuario.
//==================================================
function mostrarNotificacion(mensaje, esError) {

  var n =
    document.getElementById(
      'notificacion'
    );

  // Asignar mensaje
  n.textContent = mensaje;

  // Aplicar clase correspondiente
  n.className =
    'notificacion visible' +
    (esError ? ' error' : '');

  // Ocultar automáticamente después de 4 segundos
  setTimeout(function() {

    n.className = 'notificacion';

  }, 4000);

}
//==================================================
// DESCARGAR REPORTE
// Cierra el modal y genera el archivo en el formato
// seleccionado (PDF o CSV).
//==================================================
function descargar() {

  // Cerrar ventana modal
  cerrarModal();

  // Mostrar mensaje al usuario
  mostrarNotificacion(

    'Tu reporte se está generando y se descargará automáticamente',

    false

  );

  try {

    //==================================================
    // GENERAR PDF
    //==================================================
    if (formatoSeleccionado === 'pdf') {

      generarPDF();

    }

    //==================================================
    // GENERAR CSV
    //==================================================
    else {

      generarCSV();

    }

  }

  catch (error) {

    mostrarNotificacion(

      'No se pudo generar el reporte en este momento. Inténtalo más tarde',

      true

    );

  }

}


//==================================================
// GENERAR PDF
// Crea un archivo PDF con todos los reportes
// obtenidos desde la base de datos.
//==================================================
function generarPDF() {

  // Crear documento PDF
  var doc = new jspdf.jsPDF();


  //==================================================
  // ENCABEZADO
  //==================================================
  doc.setFillColor(9, 58, 39);

  doc.rect(

    0,

    0,

    210,

    35,

    'F'

  );


  //==================================================
  // TITULO PRINCIPAL
  //==================================================
  doc.setTextColor(

    255,

    255,

    255

  );

  doc.setFontSize(20);

  doc.setFont(

    'Quicksand',

    'bold'

  );

  doc.text(

    'ReportaBC',

    14,

    16

  );


  //==================================================
  // SUBTITULO
  //==================================================
  doc.setFontSize(10);

  doc.setFont(

    'Quicksand',

    'normal'

  );

  doc.text(

    'Proyecto comunitario de manejo de residuos — Baja California',

    14,

    24

  );


  //==================================================
  // FECHA DE GENERACION
  //==================================================
  var fechaHoy =

    new Date().toLocaleDateString(

      'es-MX',

      {

        day: '2-digit',

        month: 'long',

        year: 'numeric'

      }

    );

  doc.text(

    'Generado el: ' + fechaHoy,

    14,

    31

  );


  //==================================================
  // TITULO DEL REPORTE
  //==================================================
  doc.setTextColor(

    30,

    58,

    95

  );

  doc.setFontSize(14);

  doc.setFont(

    'Quicksand',

    'bold'

  );

  doc.text(

    'Reporte de Residuo',

    14,

    48

  );


  //==================================================
  // LINEA SEPARADORA
  //==================================================
  doc.setDrawColor(

    45,

    90,

    39

  );

  doc.line(

    14,

    51,

    196,

    51

  );


  //==================================================
  // TABLA DE REPORTES
  // Convierte los datos obtenidos de la BD
  // en filas dentro del PDF.
  //==================================================
  doc.autoTable({

    startY: 56,

    head: [[

      '#',

      'Tipo de residuo',

      'Estado',

      'Descripción',

      'Fecha'

    ]],

    body: reportesCargados.map(function(r, i) {

      return [

        i + 1,

        r.tipo_residuo || '—',

        r.estado || '—',

        r.descripcion || '—',

        r.direccion || '—',

        r.fecha || '—'

      ];

    }),

    headStyles: {

      fillColor: [9, 58, 39],

      textColor: [255, 255, 255],

      fontStyle: 'bold',

      fontSize: 10

    },

    bodyStyles: {

      fontSize: 9,

      textColor: [51, 51, 51]

    },

    alternateRowStyles: {

      fillColor: [240, 247, 238]

    },

    styles: {

      cellPadding: 4,

      lineColor: [220, 220, 220],

      lineWidth: 0.3

    },

    columnStyles: {

      0: {

        cellWidth: 10,

        halign: 'center'

      },

      1: {

        cellWidth: 35

      },

      2: {

        cellWidth: 30

      },

      4: {

        cellWidth: 28

      }

    }

  });


  //==================================================
  // PIE DE PAGINA
  // Agrega numeración en todas las páginas
  //==================================================
  var totalPaginas =

    doc.internal.getNumberOfPages();

  for (

    var i = 1;

    i <= totalPaginas;

    i++

  ) {

    doc.setPage(i);

    doc.setFontSize(8);

    doc.setTextColor(

      150,

      150,

      150

    );

    doc.text(

      'Reporte — Baja California | Página ' +

      i +

      ' de ' +

      totalPaginas,

      14,

      doc.internal.pageSize.height - 8

    );

  }


  //==================================================
  // DESCARGAR PDF
  //==================================================
  doc.save(

    'Reporte_reportes_' +

    new Date()

    .toLocaleDateString('es-MX')

    .replace(/\//g, '-') +

    '.pdf'

  );

}


//==================================================
// GENERAR CSV
// Convierte los reportes en formato CSV para
// abrirlos en Excel o similares.
//==================================================
function generarCSV() {

  // Encabezados del archivo
  var encabezados = [

    '#',

    'Tipo de residuo',

    'Estado',

    'Descripcion',

    'Fecha'

  ];


  // Crear filas con datos reales
  var filas =

    reportesCargados.map(

      function(r, i) {

        return [

          i + 1,

          r.tipo_residuo || '',

          r.estado || '',

          r.descripcion || '',

          r.fecha || ''

        ];

      }

    );


  // Convertir datos a texto CSV
  var contenido =

    [encabezados]

    .concat(filas)

    .map(function(fila) {

      return fila.join(',');

    })

    .join('\n');


  //==================================================
  // CREAR ARCHIVO CSV
  //==================================================
  var blob =

    new Blob(

      [contenido],

      {

        type:
        'text/csv;charset=utf-8;'

      }

    );

  var url =

    URL.createObjectURL(blob);

  var a =

    document.createElement('a');

  a.href = url;

  a.download =

    'Reporte_reportes.csv';

  a.click();

  URL.revokeObjectURL(url);

}


//==================================================
// EJECUTAR AL CARGAR LA PAGINA
// Obtiene automáticamente los reportes desde
// la base de datos.
//==================================================
cargarReportes();