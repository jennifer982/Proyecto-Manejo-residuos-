//==================================================
// OBTENER ID DEL REPORTE
// Obtiene el parámetro "id" desde la URL
// Ejemplo:
// detalle.html?id=15
// Retorna: 15
//==================================================
function obtenerIdReporte() {

  // Leer parámetros de la URL
  var params = new URLSearchParams(
    window.location.search
  );

  // Retornar el valor del parámetro id
  return params.get('id');
}


//==================================================
// CARGAR REPORTE
// Obtiene toda la información del reporte desde
// el backend utilizando el ID recibido
//==================================================
function cargarReporte(id) {

  // Solicitud al servidor para obtener detalles
  fetch(
    '../backend/getReporteDetalle.php?id=' +
    encodeURIComponent(id)
  )

    .then(function(response) {

      // Convertir respuesta a JSON
      return response.json();

    })

    .then(function(reporte) {

      // Verificar que el reporte exista
      if (!reporte || reporte.error) {

        mostrarError(
          'No se encontró el reporte solicitado.'
        );

        return;
      }

      //==================================================
      // GUARDAR REPORTE GLOBALMENTE
      // Se utiliza posteriormente para exportar PDF
      //==================================================
      window.reporteActual = reporte;


      //==================================================
      // MOSTRAR INFORMACIÓN EN PANTALLA
      //==================================================
      renderizarReporte(reporte);


      //==================================================
      // FUNCIONES EXCLUSIVAS DEL ADMINISTRADOR
      //==================================================
      if (window.userRol === 'admin') {

        // Habilitar edición del reporte
        habilitarEdicion(reporte);

        // Crear botón para regresar al panel admin
        var btnAdmin =
          document.createElement('a');

        btnAdmin.href =
          '../views/reportes.html';

        btnAdmin.textContent =
          '← Volver al panel admin';

        // Estilos del botón
        btnAdmin.style.cssText =

          'display:block; margin:10px 0; padding:10px 16px; background:#093a27; color:white; border-radius:8px; text-decoration:none; text-align:center; font-weight:600;';

        // Buscar botón existente
        var btnHacerReporte =

          document.querySelector(
            '.acciones-generales a[href*="reportar"]'
          );

        // Insertar botón antes del botón reportar
        if (

          btnHacerReporte &&

          btnHacerReporte.parentNode

        ) {

          btnHacerReporte.parentNode.insertBefore(

            btnAdmin,

            btnHacerReporte

          );

        }

      }


      //==================================================
      // CARGAR MAPA
      // Si no existen coordenadas utiliza valores
      // predeterminados
      //==================================================
      var lat =

        parseFloat(reporte.latitud)

        ||

        32.5149;

      var lng =

        parseFloat(reporte.longitud)

        ||

        -117.0382;

      // Mostrar ubicación en el mapa
      iniciarMapaDetalle(

        lat,

        lng,

        reporte.tipo_residuo

      );


      //==================================================
      // CONFIGURAR ACCIONES DEL RECOLECTOR
      //==================================================
      configurarAccionesRecolector(id);

    })

    .catch(function() {

      // Mostrar error de conexión
      mostrarError(

        'No fue posible obtener la información. Intenta de nuevo más tarde.'

      );

    });

}//==================================================
// RENDERIZAR REPORTE
// Muestra toda la información del reporte en la
// interfaz de usuario
//==================================================
function renderizarReporte(reporte) {

  //==================================================
  // TITULO PRINCIPAL
  //==================================================

  // Crear título dinámico usando la categoría
  var titulo =
    'Reporte de ' +
    (reporte.categoria || 'Residuo');

  // Mostrar título en la página
  document.getElementById(
    'titulo-reporte'
  ).textContent = titulo;

  // Cambiar título de la pestaña del navegador
  document.title =
    titulo + ' — Reporte';


  //==================================================
  // BADGE DE ESTADO
  // Muestra el estado actual del reporte
  //==================================================
  var badge =
    document.getElementById(
      'estado-badge'
    );

  // Convertir estado a minúsculas
  var estado =
    (reporte.estado || 'pendiente')
    .toLowerCase();

  // Estados disponibles
  var estados = {

    'pendiente': {

      texto: 'Pendiente',

      clase: 'badge-pendiente'
    },

    'aceptado': {

      texto: 'Aceptado',

      clase: 'badge-aceptado'
    },

    'en proceso': {

      texto: 'En proceso',

      clase: 'badge-en-proceso'
    },

    'atendido': {

      texto: 'Atendido',

      clase: 'badge-atendido'
    },

    'rechazado': {

      texto: 'Rechazado',

      clase: 'badge-rechazado'
    }

  };

  // Obtener información correspondiente al estado
  var estadoInfo =

    estados[estado]

    ||

    {

      texto:
        reporte.estado || 'Desconocido',

      clase:
        'badge-pendiente'
    };

  // Mostrar texto del estado
  badge.textContent =
    estadoInfo.texto;

  // Aplicar estilo CSS correspondiente
  badge.className =
    'badge ' + estadoInfo.clase;


  //==================================================
  // MOSTRAR ESTADO EN CELDA DE URGENCIA
  //==================================================
  var urgenciaCelda =
    document.getElementById(
      'urgencia-reporte'
    );

  if (urgenciaCelda) {

    urgenciaCelda.textContent =
      estadoInfo.texto;

  }


  //==================================================
  // TABLA DE INFORMACION
  // Llena todos los campos del reporte
  //==================================================

  document.getElementById(
    'tipo-reporte'
  ).textContent =
    reporte.categoria || '—';

  document.getElementById(
    'material-reporte'
  ).textContent =
    reporte.material || '—';

  document.getElementById(
    'direccion-manual-reporte'
  ).textContent =
    reporte.direccion ||
    'No se ingresó dirección';

  document.getElementById(
    'ubicacion-reporte'
  ).textContent =

    reporte.latitud &&
    reporte.longitud

    ?

    reporte.latitud +
    ', ' +
    reporte.longitud

    :

    '—';

  document.getElementById(
    'fecha-reporte'
  ).textContent =

    formatearFecha(
      reporte.fecha
    );

  document.getElementById(
    'autor-reporte'
  ).textContent =

    reporte.nombre_usuario
    ||

    'Anónimo';

  document.getElementById(
    'descripcion-reporte'
  ).textContent =

    reporte.descripcion
    ||

    'Sin descripción.';

  document.getElementById(
    'riesgo-reporte'
  ).textContent =

    reporte.riesgo
    ||

    '—';


  //==================================================
  // SECCION DE FOTOGRAFIAS
  // Muestra hasta 3 evidencias fotográficas
  //==================================================
  const fotos = [

    'foto1',

    'foto2',

    'foto3'

  ];

  fotos.forEach((fotoKey, index) => {

    // Obtener ruta de la imagen
    const rutaFoto =
      reporte[fotoKey];

    // Obtener elemento IMG
    const fotoEl =
      document.getElementById(
        'foto-reporte-' +
        (index + 1)
      );

    if (fotoEl) {

      // Si existe una imagen
      if (rutaFoto) {

        fotoEl.src =
          rutaFoto;

        fotoEl.style.display =
          'block';

        fotoEl.alt =

          'Evidencia ' +

          (index + 1) +

          ' del reporte #' +

          reporte.id_reporte;

      }

      // Si no existe imagen
      else {

        fotoEl.style.display =
          'none';

      }

    }

  });

}


//==================================================
// FORMATEAR FECHA
// Convierte una fecha ISO a formato legible
//==================================================
function formatearFecha(fechaISO) {

  // Si no existe fecha
  if (!fechaISO)

    return '—';

  try {

    return new Date(fechaISO)

    .toLocaleDateString(

      'es-MX',

      {

        year: 'numeric',

        month: 'long',

        day: 'numeric'

      }

    );

  }

  catch (e) {

    // Si ocurre un error devuelve el texto original
    return fechaISO;

  }

}


//==================================================
// ACTUALIZAR ESTADO
// Cambia el estado del reporte en la base de datos
//==================================================
function actualizarEstado(nuevoEstado) {

  // Obtener parámetros de la URL
  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  // Obtener ID del reporte
  const idReporte =
    urlParams.get('id');

  // Validar existencia del ID
  if (!idReporte) {

    Swal.fire({

      title: 'Error',

      text: 'No se pudo encontrar el ID del reporte en la URL.',

      icon: 'error',

      confirmButtonText: 'Entendido',

      confirmButtonColor: '#093a27'

    });

    return;

  }
//==================================================
// ACTUALIZAR ESTADO DEL REPORTE
// Envía el nuevo estado seleccionado al backend
//==================================================
fetch('../backend/actualizarEstado.php', {

  method: 'POST',

  headers: {

      'Content-Type': 'application/json'

  },

  // Enviar ID del reporte y nuevo estado
  body: JSON.stringify({

      id_reporte: idReporte,

      id_estado: nuevoEstado

  })

})

.then(res => res.json())

.then(data => {

  // Si la actualización fue exitosa
  if (data.success) {

      Swal.fire({

          title: 'Éxito',

          text: '¡Estado actualizado con éxito!',

          icon: 'success',

          confirmButtonText: 'Entendido',

          confirmButtonColor: '#093a27'

      });

      // Recargar página para mostrar cambios
      location.reload();

  }

  // Si ocurrió un error en el backend
  else {

      Swal.fire({

          title: 'Error',

          text: 'Error al actualizar: ' + data.message,

          icon: 'error',

          confirmButtonText: 'Entendido',

          confirmButtonColor: '#093a27'

      });

  }

})

.catch(error => {

  // Mostrar error en consola
  console.error(

      'Error:',

      error

  );

  // Mostrar mensaje al usuario
  Swal.fire({

      title: 'Error',

      text: 'Ocurrió un error de conexión.',

      icon: 'error',

      confirmButtonText: 'Entendido',

      confirmButtonColor: '#093a27'

  });

});

}


//==================================================
// SOLICITAR EVIDENCIA DE REPORTE ATENDIDO
// Permite al recolector subir una fotografía como
// evidencia de que el residuo fue retirado
//==================================================
async function solicitarEvidenciaAtendido() {

  // Mostrar ventana para seleccionar archivo
  const { value: file } = await Swal.fire({

      title: 'Subir evidencia',

      text: 'Para marcarlo como atendido, sube una foto del lugar limpio.',

      icon: 'info',

      // Tipo de entrada: archivo
      input: 'file',

      inputAttributes: {

          // Solo permitir imágenes
          'accept': 'image/*',

          'aria-label': 'Subir foto de evidencia'

      },

      showCancelButton: true,

      confirmButtonText: 'Enviar evidencia',

      confirmButtonColor: '#28a745',

      cancelButtonText: 'Cancelar'

  });


}
//==================================================
// VALIDAR SI EL USUARIO SELECCIONÓ UNA IMAGEN
//==================================================
if (file) {

  //==================================================
  // PREPARAR DATOS PARA ENVÍO
  // FormData permite enviar archivos e información
  // al servidor mediante una petición POST
  //==================================================
  const formData = new FormData();

  // Obtener ID del reporte desde la URL
  const idReporte =

      new URLSearchParams(
          window.location.search
      )

      .get('id');

  // Agregar ID del reporte
  formData.append(

      'id_reporte',

      idReporte

  );

  // Agregar imagen seleccionada
  formData.append(

      'evidencia',

      file

  );


  //==================================================
  // MOSTRAR MENSAJE DE CARGA
  // Informa al usuario que el archivo se está
  // enviando al servidor
  //==================================================
  Swal.fire({

      title: 'Enviando...',

      didOpen: () => {

          Swal.showLoading();

      }

  });


  //==================================================
  // ENVIAR EVIDENCIA AL BACKEND
  //==================================================
  fetch(

      '../backend/solicitarCambioEstado.php',

      {

          method: 'POST',

          body: formData

      }

  )

  .then(res => res.json())

  .then(data => {

      //==================================================
      // SI EL ENVÍO FUE EXITOSO
      //==================================================
      if (data.success) {

          Swal.fire(

              '¡Enviado!',

              'Tu evidencia ha sido enviada al administrador para revisión.',

              'success'

          )

          .then(() =>

              // Recargar página para actualizar datos
              location.reload()

          );

      }

      //==================================================
      // SI OCURRIÓ UN ERROR EN EL SERVIDOR
      //==================================================
      else {

          Swal.fire(

              'Error',

              data.message,

              'error'

          );

      }

  })

  .catch(() =>

      //==================================================
      // ERROR DE CONEXIÓN
      //==================================================
      Swal.fire(

          'Error',

          'No se pudo conectar con el servidor',

          'error'

      )

  );

}
//==================================================
// INICIAR MAPA DETALLE
// Muestra la ubicación exacta del reporte utilizando
// Leaflet y OpenStreetMap
//==================================================
function iniciarMapaDetalle(latitud, longitud, titulo) {

  // Crear mapa centrado en las coordenadas recibidas
  var mapa =

    L.map('mapa-detalle')

    .setView(

      [latitud, longitud],

      15

    );

  //==================================================
  // CAPA BASE DEL MAPA
  // Cargar OpenStreetMap
  //==================================================
  L.tileLayer(

    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

    {

      attribution:

      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

    }

  ).addTo(mapa);


  //==================================================
  // MARCADOR DE UBICACION
  //==================================================
  L.marker(

    [latitud, longitud]

  )

  .addTo(mapa)

  .bindPopup(

    titulo || 'Ubicación del residuo'

  )

  .openPopup();


  //==================================================
  // ACTUALIZAR TAMAÑO DEL MAPA
  // Soluciona problemas de renderizado
  //==================================================
  setTimeout(function() {

    mapa.invalidateSize();

  }, 200);

}


//==================================================
// CONFIGURAR ACCIONES DEL RECOLECTOR
// Habilita botones exclusivos para usuarios con
// rol de recolector
//==================================================
function configurarAccionesRecolector(idReporte) {

  // Verificar si el usuario es recolector
  var esRecolector =

    sessionStorage.getItem('rol')

    ===

    'recolector';

  // Si no es recolector salir de la función
  if (!esRecolector)

    return;


  // Mostrar sección de acciones
  document.getElementById(

    'acciones-recolector'

  ).style.display = 'block';


  //==================================================
  // BOTON ACEPTAR REPORTE
  //==================================================
  document.getElementById(

    'btn-aceptar-reporte'

  )

  .addEventListener(

    'click',

    function() {

      enviarAccion(

        idReporte,

        'aceptar'

      );

    }

  );


  //==================================================
  // BOTON MARCAR COMO RESUELTO
  //==================================================
  document.getElementById(

    'btn-marcar-resuelto'

  )

  .addEventListener(

    'click',

    function() {

      enviarAccion(

        idReporte,

        'resolver'

      );

    }

  );

}


//==================================================
// ENVIAR ACCION AL BACKEND
// Envía acciones realizadas por el recolector
//==================================================
function enviarAccion(idReporte, accion) {

  fetch(

    '../backend/updateReportes.php',

    {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json'

      },

      // Enviar ID y acción seleccionada
      body: JSON.stringify({

        id: idReporte,

        accion: accion

      })

    }

  )

  .then(function(response) {

    return response.json();

  })

  .then(function(data) {

    //==================================================
    // ACCION EXITOSA
    //==================================================
    if (data.success) {

      // Recargar página para mostrar cambios
      window.location.reload();

    }

    //==================================================
    // ERROR DEVUELTO POR EL SERVIDOR
    //==================================================
    else {

      Swal.fire({

        title: 'Error',

        text:

          'No se pudo completar la acción: ' +

          (data.message || 'error desconocido'),

        icon: 'error',

        confirmButtonText: 'Entendido',

        confirmButtonColor: '#093a27'

      });

    }

  })

  .catch(function() {

    //==================================================
    // ERROR DE CONEXION
    //==================================================
    Swal.fire({

      title: 'Error',

      text: 'Ocurrió un error de conexión. Intenta de nuevo.',

      icon: 'error',

      confirmButtonText: 'Entendido',

      confirmButtonColor: '#093a27'

    });

  });

}
//==================================================
// MOSTRAR ERROR EN PANTALLA
// Se ejecuta cuando el reporte no existe o ocurre
// un problema al cargar la información
//==================================================
function mostrarError(mensaje) {

  // Cambiar título principal
  document.getElementById(
    'titulo-reporte'
  ).textContent =
    'Reporte no encontrado';

  // Mostrar mensaje de error
  document.getElementById(
    'descripcion-reporte'
  ).textContent =
    mensaje;

}


//==================================================
// HABILITAR EDICION PARA ADMINISTRADOR
// Permite modificar los datos del reporte
//==================================================
function habilitarEdicion(reporte) {

    // Obtener contenedor del formulario
    const contenedor =
        document.getElementById(
            'form-edicion'
        );

    // Limpiar contenido previo
    contenedor.innerHTML = '';

    // Mostrar panel de edición
    document.getElementById(
        'edicion-admin'
    ).style.display = 'block';


    //==================================================
    // CAMPO TIPO DE RESIDUO
    //==================================================
    const divTipo =
        document.createElement('div');

    divTipo.className =
        'campo';

    divTipo.innerHTML =
        '<label for="edit-tipo">Tipo de residuo *</label>';

    // Crear select
    const selectTipo =
        document.createElement('select');

    selectTipo.id =
        'edit-tipo';

    selectTipo.required =
        true;


    //==================================================
    // LISTA DE TIPOS DE RESIDUOS
    //==================================================
    const tipos = [

        { id: 1, nombre: 'Concreto' },

        { id: 2, nombre: 'Metales' },

        { id: 3, nombre: 'Mampostería' },

        { id: 4, nombre: 'Pétreos' },

        { id: 5, nombre: 'Mezcla asfáltica' },

        { id: 6, nombre: 'Excavación' },

        { id: 7, nombre: 'Elementos prefabricados' },

        { id: 8, nombre: 'Otros residuos' }

    ];

    // Opción por defecto
    selectTipo.appendChild(

        new Option(
            '-- Selecciona el tipo --',
            ''
        )

    );

    // Agregar tipos al select
    tipos.forEach(t => {

        const opt =
            new Option(
                t.nombre,
                t.id
            );

        // Marcar el tipo actual del reporte
        if (reporte.id_tipo == t.id)

            opt.selected = true;

        selectTipo.appendChild(opt);

    });

    // Agregar select al formulario
    divTipo.appendChild(selectTipo);

    contenedor.appendChild(divTipo);


    //==================================================
    // CAMPO MATERIAL ESPECIFICO
    //==================================================
    const divMaterial =
        document.createElement('div');

    divMaterial.className =
        'campo';

    divMaterial.id =
        'contenedor-material-edit';

    divMaterial.innerHTML =
        '<label for="edit-material">Material específico *</label>';

    // Crear select de materiales
    const selectMaterial =
        document.createElement('select');

    selectMaterial.id =
        'edit-material';

    selectMaterial.required =
        true;

    // Opción por defecto
    selectMaterial.appendChild(

        new Option(
            '-- Selecciona el material --',
            ''
        )

    );

    divMaterial.appendChild(
        selectMaterial
    );

    contenedor.appendChild(
        divMaterial
    );


    //==================================================
    // MATERIALES AGRUPADOS POR TIPO
    // Relación entre categoría y materiales
    //==================================================
    const materialesPorTipo = {

        1: [

            { id: 1, nombre: "Concreto simple" },

            { id: 2, nombre: "Concreto armado" }

        ],

        2: [

            { id: 3, nombre: "Acero de refuerzo" },

            { id: 4, nombre: "Metales ferrosos" },

            { id: 5, nombre: "Metales no ferrosos (aluminio, cobre)" }

        ],

        3: [

            { id: 6, nombre: "Blocks" },

            { id: 7, nombre: "Tabicones" },

            { id: 8, nombre: "Adoquines" },

            { id: 9, nombre: "Tabiques" },

            { id: 10, nombre: "Muros de piedra braza" }

        ],

        4: [

            { id: 11, nombre: "Agregados sin recubrimiento" },

            { id: 12, nombre: "Agregados sin mortero" }

        ],

        5: [

            { id: 13, nombre: "Bases asfálticas" },

            { id: 14, nombre: "Bases negras" }

        ],

        6: [

            { id: 15, nombre: "Suelo no contaminado" },

            { id: 16, nombre: "Suelo con material arcilloso" }

        ],

        7: [

            { id: 17, nombre: "Panel de yeso" },

            { id: 18, nombre: "Panel de cemento" }

        ],

        8: [

            { id: 19, nombre: "Madera" },

            { id: 20, nombre: "Unicel" },

            { id: 21, nombre: "Textil" },

            { id: 22, nombre: "Llantas" }

        ]

    };


    //==================================================
    // CARGAR MATERIALES SEGUN EL TIPO SELECCIONADO
    //==================================================
    function cargarMateriales(idTipo) {

        // Limpiar opciones anteriores
        selectMaterial.innerHTML =

            '<option value="">-- Selecciona el material --</option>';

        // Verificar si existen materiales
        if (materialesPorTipo[idTipo]) {

            // Agregar materiales al select
            materialesPorTipo[idTipo]

            .forEach(mat => {

                const opt =

                    new Option(
                        mat.nombre,
                        mat.id
                    );

                // Seleccionar material actual
                if (
                    reporte.id_residuo == mat.id
                )

                    opt.selected = true;

                selectMaterial.appendChild(opt);

            });

            // Mostrar selector
            divMaterial.style.visibility =
                'visible';

            divMaterial.style.height =
                'auto';

            selectMaterial.required =
                true;

        }

        else {

            // Ocultar selector si no hay materiales
            divMaterial.style.visibility =
                'hidden';

            divMaterial.style.height =
                '0';

            selectMaterial.required =
                false;

        }

    }
    // Evento cambio de tipo
    selectTipo.addEventListener('change', function() {
        cargarMateriales(this.value);
    });

    // Cargar materiales iniciales si ya hay tipo seleccionado
    if (reporte.id_tipo) {
        cargarMateriales(reporte.id_tipo);
    } else {
        divMaterial.style.visibility = 'hidden';
        divMaterial.style.height = '0';
    }

//==================================================
// EVENTO CAMBIO DE TIPO DE RESIDUO
// Cuando el usuario selecciona otro tipo de residuo,
// se actualiza automáticamente la lista de materiales
// correspondientes a esa categoría.
//==================================================
selectTipo.addEventListener('change', function() {

  cargarMateriales(this.value);

});


//==================================================
// CARGAR MATERIALES INICIALES
// Si el reporte ya tiene un tipo asignado,
// se cargan automáticamente los materiales.
// Si no existe tipo, se oculta el selector.
//==================================================
if (reporte.id_tipo) {

  cargarMateriales(reporte.id_tipo);

}

else {

  divMaterial.style.visibility = 'hidden';

  divMaterial.style.height = '0';

}


//==================================================
// CAMPO DESCRIPCIÓN
// Se crea dinámicamente un área de texto para
// modificar la descripción del reporte.
//==================================================
const divDesc = document.createElement('div');

divDesc.className = 'campo';

divDesc.innerHTML =
  '<label for="edit-descripcion">Descripción *</label>';

// Crear textarea
const textarea = document.createElement('textarea');

textarea.id = 'edit-descripcion';

textarea.rows = 4;

// Cargar descripción actual
textarea.value =
  reporte.descripcion || '';

// Agregar textarea al contenedor
divDesc.appendChild(textarea);

contenedor.appendChild(divDesc);


//==================================================
// CAMPO NIVEL DE RIESGO
// Se utiliza un slider para seleccionar el nivel
// de riesgo del reporte (1 al 5).
//==================================================
const divRiesgo = document.createElement('div');

divRiesgo.className = 'campo';

divRiesgo.innerHTML =
  '<label for="edit-riesgo">Nivel de Riesgo:</label>';

// Crear slider
const inputRiesgo = document.createElement('input');

inputRiesgo.type = 'range';

inputRiesgo.classList.add('slider');

inputRiesgo.id = 'edit-riesgo';

// Valor mínimo permitido
inputRiesgo.min = 1;

// Valor máximo permitido
inputRiesgo.max = 5;

// Incremento de valores
inputRiesgo.step = 1;

// Valor actual del reporte
inputRiesgo.value =
  reporte.riesgo || 1;

// Agregar slider al contenedor
divRiesgo.appendChild(inputRiesgo);


//==================================================
// ETIQUETAS DEL SLIDER
// Muestra visualmente los niveles de riesgo
// disponibles del 1 al 5.
//==================================================
const labelsRiesgo = document.createElement('div');

labelsRiesgo.className = 'labels-riesgo';

labelsRiesgo.style =
  'display: flex; justify-content: space-between; font-size: 12px; color: #666;';

// Crear números visibles debajo del slider
labelsRiesgo.innerHTML =
  '<span>1</span>' +
  '<span>2</span>' +
  '<span>3</span>' +
  '<span>4</span>' +
  '<span>5</span>';

// Agregar etiquetas
divRiesgo.appendChild(labelsRiesgo);

// Agregar sección completa al formulario
contenedor.appendChild(divRiesgo);

   //==================================================
// UBICACION
// Se crea una sección para mostrar y modificar
// la ubicación del reporte desde el mapa.
//==================================================
const divUbicacion = document.createElement('div');

divUbicacion.className = 'campo';

divUbicacion.innerHTML =
    '<label>Ubicación (haz clic en el mapa para cambiarla)</label>';


//==================================================
// CONTENEDOR DEL MAPA
// Aquí se mostrará el mapa de Leaflet donde el
// administrador podrá seleccionar una ubicación.
//==================================================
const mapaEdit = document.createElement('div');

mapaEdit.id = 'mapa-edit-admin';

mapaEdit.style =
    'height: 250px; border-radius: 4px; border: 1px solid #ccc; margin-bottom: 6px;';

// Agregar mapa al contenedor de ubicación
divUbicacion.appendChild(mapaEdit);


//==================================================
// INFORMACION DE COORDENADAS
// Muestra la latitud y longitud actuales del reporte.
//==================================================
const coordsInfo = document.createElement('div');

coordsInfo.id = 'coords-edit-info';

coordsInfo.style =
    'font-size:12px; color:#2d5a27; margin-bottom:6px;';

// Mostrar coordenadas actuales
coordsInfo.textContent =
    ' Lat: ' +
    (reporte.latitud || '—') +
    ', Lng: ' +
    (reporte.longitud || '—');

// Agregar texto de coordenadas
divUbicacion.appendChild(coordsInfo);


//==================================================
// INPUT OCULTO LATITUD
// Guarda la latitud seleccionada en el mapa para
// enviarla posteriormente al backend.
//==================================================
const hiddenLat = document.createElement('input');

hiddenLat.type = 'hidden';

hiddenLat.id = 'edit-latitud';

hiddenLat.value = reporte.latitud || '';


//==================================================
// INPUT OCULTO LONGITUD
// Guarda la longitud seleccionada en el mapa para
// enviarla posteriormente al backend.
//==================================================
const hiddenLng = document.createElement('input');

hiddenLng.type = 'hidden';

hiddenLng.id = 'edit-longitud';

hiddenLng.value = reporte.longitud || '';


//==================================================
// AGREGAR INPUTS OCULTOS AL CONTENEDOR
//==================================================
divUbicacion.appendChild(hiddenLat);

divUbicacion.appendChild(hiddenLng);


//==================================================
// AGREGAR SECCION DE UBICACION AL FORMULARIO
//==================================================
contenedor.appendChild(divUbicacion);
//==================================================
// INICIALIZAR MAPA DE EDICION
// Crea un mapa interactivo para que el administrador
// pueda modificar la ubicación del reporte.
//==================================================
setTimeout(() => {

  // Obtener coordenadas iniciales del reporte
  const latInit =

      parseFloat(reporte.latitud)

      ||

      32.5149;

  const lngInit =

      parseFloat(reporte.longitud)

      ||

      -117.0382;


  // Crear mapa centrado en las coordenadas
  const mapaAdmin =

      L.map('mapa-edit-admin')

      .setView(

          [latInit, lngInit],

          15

      );


  //==================================================
  // CARGAR CAPA DE OPENSTREETMAP
  //==================================================
  L.tileLayer(

      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

      {

          attribution:
              '© OpenStreetMap'

      }

  ).addTo(mapaAdmin);


  //==================================================
  // CREAR MARCADOR INICIAL
  //==================================================
  let markerAdmin =

      L.marker(

          [latInit, lngInit]

      )

      .addTo(mapaAdmin);


  //==================================================
  // EVENTO CLICK EN EL MAPA
  // Permite seleccionar una nueva ubicación
  //==================================================
  mapaAdmin.on('click', function(e) {

      // Obtener coordenadas seleccionadas
      const lat =

          e.latlng.lat.toFixed(6);

      const lng =

          e.latlng.lng.toFixed(6);

      // Eliminar marcador anterior
      if (markerAdmin)

          mapaAdmin.removeLayer(markerAdmin);

      // Crear nuevo marcador
      markerAdmin =

          L.marker([lat, lng])

          .addTo(mapaAdmin);

      // Guardar coordenadas en inputs ocultos
      document.getElementById(
          'edit-latitud'
      ).value = lat;

      document.getElementById(
          'edit-longitud'
      ).value = lng;

      // Actualizar coordenadas visibles
      document.getElementById(
          'coords-edit-info'
      ).textContent =

          ' Lat: ' +

          lat +

          ', Lng: ' +

          lng;

  });


  //==================================================
  // AJUSTAR TAMAÑO DEL MAPA
  // Evita problemas de visualización
  //==================================================
  setTimeout(() => {

      mapaAdmin.invalidateSize();

  }, 200);

}, 100);


//==================================================
// SECCION DE IMAGENES
// Permite visualizar y reemplazar fotografías
// del reporte.
//==================================================
const divFotos = document.createElement('div');

divFotos.className = 'campo';

divFotos.innerHTML =
  '<label>Fotografías actuales (sube una nueva solo si deseas reemplazarla)</label>';


// Contenedor principal de imágenes
const contenedorFotos = document.createElement('div');

contenedorFotos.className =
  'fotos-edicion';

contenedorFotos.style =
  'display: flex; flex-wrap: wrap; gap: 15px; margin-top: 8px;';


//==================================================
// RECORRER LAS 3 POSIBLES FOTOGRAFIAS
//==================================================
for (let i = 1; i <= 3; i++) {

  const fotoBox =
      document.createElement('div');

  fotoBox.style =
      'flex: 1; min-width: 120px; text-align: center;';


  //==================================================
  // MOSTRAR FOTO ACTUAL
  //==================================================
  if (reporte[`foto${i}`]) {

      const img =
          document.createElement('img');

      img.src =
          reporte[`foto${i}`];

      img.style =
          'width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 5px;';

      fotoBox.appendChild(img);

  }

  //==================================================
  // SI NO EXISTE FOTO MOSTRAR PLACEHOLDER
  //==================================================
  else {

      const placeholder =
          document.createElement('div');

      placeholder.style =
          'width: 100%; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; margin-bottom: 5px;';

      placeholder.textContent =
          'Sin foto';

      fotoBox.appendChild(placeholder);

  }


  //==================================================
  // INPUT PARA SUBIR NUEVA IMAGEN
  //==================================================
  const inputFile =
      document.createElement('input');

  inputFile.type =
      'file';

  inputFile.id =
      `edit-foto${i}`;

  inputFile.accept =
      'image/*';

  inputFile.style =
      'font-size: 12px;';

  fotoBox.appendChild(inputFile);

  contenedorFotos.appendChild(fotoBox);

}


// Agregar contenedor de imágenes
divFotos.appendChild(contenedorFotos);

contenedor.appendChild(divFotos);


//==================================================
// BOTON GUARDAR CAMBIOS
// Cuando se presiona, se envían los cambios
// realizados por el administrador.
//==================================================
document.getElementById(

  'btn-guardar-cambios'

).onclick = function() {

  guardarCambios(

      reporte.id_reporte

  );

};

}

//==================================================
// GUARDAR CAMBIOS DEL REPORTE
// Envía al backend todas las modificaciones
// realizadas por el administrador.
//==================================================
async function guardarCambios(idReporte) {

  // Crear objeto FormData para enviar datos
  const formData = new FormData();

  //==================================================
  // DATOS PRINCIPALES DEL REPORTE
  //==================================================
  formData.append(

      'id_reporte',

      idReporte

  );

  formData.append(

      'id_residuo',

      document.getElementById(
          'edit-material'
      ).value

  );

  formData.append(

      'descripcion',

      document.getElementById(
          'edit-descripcion'
      ).value

  );

  formData.append(

      'riesgo',

      document.getElementById(
          'edit-riesgo'
      ).value

  );

  formData.append(

      'latitud',

      document.getElementById(
          'edit-latitud'
      ).value

  );

  formData.append(

      'longitud',

      document.getElementById(
          'edit-longitud'
      ).value

  );


  //==================================================
  // FOTOGRAFIAS
  // Si el administrador seleccionó nuevas imágenes,
  // se agregan al formulario para reemplazarlas.
  //==================================================
  for (let i = 1; i <= 3; i++) {

      const fileInput =

          document.getElementById(
              `edit-foto${i}`
          );

      if (

          fileInput &&

          fileInput.files[0]

      ) {

          formData.append(

              `foto${i}`,

              fileInput.files[0]

          );

      }

  }


  try {

      //==================================================
      // ENVIAR CAMBIOS AL BACKEND
      //==================================================
      const response =

          await fetch(

              '../backend/modificarReporte.php',

              {

                  method: 'POST',

                  body: formData

              }

          );

      // Convertir respuesta a JSON
      const data =
          await response.json();


      //==================================================
      // ACTUALIZACION EXITOSA
      //==================================================
      if (data.success) {

          Swal.fire({

              title: 'Éxito',

              text: 'Reporte actualizado correctamente.',

              icon: 'success',

              confirmButtonText: 'Entendido',

              confirmButtonColor: '#093a27'

          });

          // Recargar página para mostrar cambios
          location.reload();

      }

      //==================================================
      // ERROR DEVUELTO POR EL SERVIDOR
      //==================================================
      else {

          Swal.fire({

              title: 'Error',

              text: 'Error ' + data.message,

              icon: 'error',

              confirmButtonText: 'Entendido',

              confirmButtonColor: '#093a27'

          });

      }

  }

  catch (error) {

      //==================================================
      // ERROR DE CONEXION
      //==================================================
      Swal.fire({

          title: 'Error',

          text: 'Error de conexión. Intenta de nuevo.',

          icon: 'error',

          confirmButtonText: 'Entendido',

          confirmButtonColor: '#093a27'

      });

  }

}


//==================================================
// EJECUTAR AL CARGAR LA PAGINA
// Obtiene el ID del reporte y verifica la sesión
// del usuario antes de cargar la información.
//==================================================
document.addEventListener(

  'DOMContentLoaded',

  function() {

      // Obtener ID del reporte desde la URL
      var id = obtenerIdReporte();

      //==================================================
      // VALIDAR EXISTENCIA DEL ID
      //==================================================
      if (!id) {

          Swal.fire({

              title: 'Error',

              text: 'No se proporcionó un ID de reporte. Vuelve al mapa y selecciona un reporte.',

              icon: 'error',

              confirmButtonText: 'Entendido',

              confirmButtonColor: '#093a27'

          });

          return;

      }


      //==================================================
      // CONSULTAR SESION DEL USUARIO
      // Obtiene el rol desde el backend
      //==================================================
      fetch(

          '../backend/getUser.php',

          {

              credentials: 'include'

          }

      )

      .then(res => res.json())

      .then(user => {

          // Si existe sesión activa
          if (user.success) {

              // Guardar rol del usuario
              window.userRol = user.rol;

          }

          // Si no hay sesión
          else {

              window.userRol = 0;

          }

          // Cargar información del reporte
          cargarReporte(id);

      })

      .catch(() => {

          // Si ocurre un error,
          // cargar el reporte igualmente
          window.userRol = 0;

          cargarReporte(id);

      });

});