// Función que obtiene el ID del reporte desde la URL.
// Ejemplo: si la URL es detalle.html?id=123, devuelve "123".
function obtenerIdReporte() {
  // Crea un objeto para leer los parámetros de la URL.
  var params = new URLSearchParams(window.location.search);

  // Obtiene el valor asociado al parámetro "id".
  return params.get('id');
}

// Función que carga la información de un reporte desde el servidor.
function cargarReporte(id) {

  // Realiza una petición al backend enviando el ID del reporte.
  fetch('../backend/getReporteDetalle.php?id=' + encodeURIComponent(id))

    // Convierte la respuesta recibida a formato JSON.
    .then(function(response) {
      return response.json();
    })

    // Procesa los datos obtenidos del reporte.
    .then(function(reporte) {

      // Verifica si el reporte existe o si ocurrió un error.
      if (!reporte || reporte.error) {
        mostrarError('No se encontró el reporte solicitado.');
        return;
      }

      // Guarda la información del reporte en una variable global
      // para que otros archivos JavaScript puedan utilizarla.
      window.reporteActual = reporte;

      // Muestra los datos del reporte en la interfaz.
      renderizarReporte(reporte);

      // Inicializa el mapa usando las coordenadas del reporte.
      // Si no existen coordenadas válidas, usa las de Tijuana como referencia.
      iniciarMapaDetalle(
        parseFloat(reporte.latitud)  || 32.5149,
        parseFloat(reporte.longitud) || -117.0382
      );

      // Configura las acciones disponibles para el recolector.
      configurarAccionesRecolector(id);
    })

    // Maneja errores de conexión o fallos en la petición.
    .catch(function() {
      mostrarError('No fue posible obtener la información. Intenta de nuevo más tarde.');
    });
}

// Función encargada de mostrar la información del reporte en la página.
function renderizarReporte(reporte) {

  // Obtiene el título principal del reporte usando el tipo de residuo.
  // Si no existe, muestra el número de reporte.
  var titulo = reporte.tipo_residuo || 'Reporte #' + reporte.id_reporte;

  // Actualiza el título visible en la página.
  document.getElementById('titulo-reporte').textContent = titulo;

  // Cambia el título de la pestaña del navegador.
  document.title = titulo + ' — ReportaBC';

  // Obtiene el elemento visual que mostrará el estado del reporte.
  var badge = document.getElementById('estado-badge');

  // Convierte el estado a minúsculas para facilitar la comparación.
  var estado = (reporte.estado || 'pendiente').toLowerCase();

  // Diccionario con los estados disponibles y sus estilos CSS.
  var estados = {
    'pendiente':  { texto: 'Pendiente',  clase: 'badge-pendiente'  },
    'en proceso': { texto: 'En proceso', clase: 'badge-en-proceso' },
    'resuelto':   { texto: 'Resuelto',   clase: 'badge-resuelto'   }
  };

  // Busca la configuración correspondiente al estado actual.
  // Si no existe, utiliza "pendiente" como valor predeterminado.
  var estadoInfo = estados[estado] || {
    texto: reporte.estado,
    clase: 'badge-pendiente'
  };

  // Actualiza el texto mostrado en la insignia de estado.
  badge.textContent = estadoInfo.texto;

  // Aplica la clase CSS correspondiente para cambiar su apariencia.
  badge.className = 'badge ' + estadoInfo.clase;
  // ==========================
  // TABLA DE INFORMACION
  // ==========================

  // Muestra el tipo de residuo reportado.
  // Si no existe información, muestra un guion.
  document.getElementById('tipo-reporte').textContent =
    reporte.tipo_residuo || '—';

  // Muestra el estado actual del reporte.
  // Ejemplo: Pendiente, En proceso o Resuelto.
  document.getElementById('urgencia-reporte').textContent =
    reporte.estado || '—';

  // Muestra la dirección escrita manualmente por el usuario.
  // Si no se proporcionó una dirección, muestra un mensaje predeterminado.
  document.getElementById('direccion-manual-reporte').textContent =
    reporte.direccion || 'No se ingresó dirección.';

  // Muestra las coordenadas geográficas del reporte.
  // Si faltan latitud o longitud, muestra un guion.
  document.getElementById('ubicacion-reporte').textContent =
    reporte.latitud && reporte.longitud
      ? reporte.latitud + ', ' + reporte.longitud
      : '—';

  // Convierte la fecha a un formato más amigable para el usuario.
  document.getElementById('fecha-reporte').textContent =
    formatearFecha(reporte.fecha || reporte.fechas);

  // Muestra el identificador del usuario que creó el reporte.
  // Si no existe, se considera un reporte anónimo.
  document.getElementById('autor-reporte').textContent =
    reporte.id_usuario
      ? 'Usuario #' + reporte.id_usuario
      : 'Anónimo';

  // Muestra la descripción proporcionada por el usuario.
  // Si está vacía, indica que no hay descripción.
  document.getElementById('descripcion-reporte').textContent =
    reporte.descripcion || 'Sin descripción.';

  // ==========================
  // FOTO DEL REPORTE
  // ==========================

  // Verifica si existe una imagen asociada al reporte.
  if (reporte.fotos) {

    // Obtiene el elemento <img> donde se mostrará la fotografía.
    var fotoEl = document.getElementById('foto-reporte');

    // Construye la ruta de la imagen.
    fotoEl.src = '../assets/img/reportes/' + reporte.fotos;

    // Texto alternativo para accesibilidad.
    fotoEl.alt = 'Foto del reporte';
  }
}

// ==========================
// FORMATEAR FECHA
// ==========================

// Convierte una fecha ISO a formato legible en español.
function formatearFecha(fechaISO) {

  // Si no existe fecha, devuelve un guion.
  if (!fechaISO) return '—';

  try {

    // Convierte la fecha al formato:
    // "1 de junio de 2026"
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  } catch (e) {

    // Si ocurre un error, devuelve la fecha original.
    return fechaISO;
  }
}

// ==========================
// MAPA LEAFLET
// ==========================

// Inicializa el mapa y coloca un marcador en la ubicación del reporte.
function iniciarMapaDetalle(latitud, longitud) {

  // Crea el mapa centrado en las coordenadas indicadas.
  var mapa = L.map('mapa-detalle').setView([latitud, longitud], 15);

  // Agrega la capa de OpenStreetMap.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapa);

  // Agrega un marcador en la ubicación del residuo.
  L.marker([latitud, longitud])
    .addTo(mapa)
    .bindPopup('Ubicación del residuo')
    .openPopup();

  // Fuerza el recálculo del tamaño del mapa
  // en caso de que el contenedor aún no estuviera visible.
  setTimeout(function() {
    mapa.invalidateSize();
  }, 200);
}

// ==========================
// ACCIONES DEL RECOLECTOR
// ==========================

// Habilita botones especiales para usuarios con rol de recolector.
function configurarAccionesRecolector(idReporte) {

  // Verifica si el usuario actual es recolector.
  var esRecolector = sessionStorage.getItem('rol') === 'recolector';

  // Si no es recolector, no muestra las acciones.
  if (!esRecolector) return;

  // Hace visible la sección de acciones.
  document.getElementById('acciones-recolector').style.display = 'block';

  // Evento para aceptar un reporte.
  document.getElementById('btn-aceptar-reporte')
    .addEventListener('click', function() {
      enviarAccion(idReporte, 'aceptar');
    });

  // Evento para marcar un reporte como resuelto.
  document.getElementById('btn-marcar-resuelto')
    .addEventListener('click', function() {
      enviarAccion(idReporte, 'resolver');
    });
}

// ==========================
// ENVIAR ACCION AL SERVIDOR
// ==========================

// Envía al backend la acción realizada por el recolector.
function enviarAccion(idReporte, accion) {

  fetch('../backend/updateReportes.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

    // Envía el ID del reporte y la acción en formato JSON.
    body: JSON.stringify({
      id: idReporte,
      accion: accion
    })
  })

  // Convierte la respuesta a JSON.
  .then(function(response) {
    return response.json();
  })

  // Procesa la respuesta del servidor.
  .then(function(data) {

    // Si la operación fue exitosa.
    if (data.success) {

      // Recarga la página para reflejar los cambios.
      window.location.reload();

    } else {

      // Muestra un mensaje de error.
      Swal.fire({
        title: 'Error',
        text: 'No se pudo completar la acción: ' +
              (data.message || 'error desconocido'),
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#093a27'
      });
    }
  })

  // Captura errores de conexión.
  .catch(function() {

    Swal.fire({
      title: 'Error de Conexión',
      text: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#093a27'
    });
  });
}

// ==========================
// MOSTRAR ERROR
// ==========================

// Muestra un mensaje de error en la interfaz.
function mostrarError(mensaje) {

  // Cambia el título de la página.
  document.getElementById('titulo-reporte').textContent =
    'Reporte no encontrado';

  // Muestra la descripción del error.
  document.getElementById('descripcion-reporte').textContent =
    mensaje;
}

// ==========================
// INICIO DE LA APLICACION
// ==========================

// Se ejecuta cuando el HTML termina de cargarse.
document.addEventListener('DOMContentLoaded', function() {

  // Obtiene el ID del reporte desde la URL.
  var id = obtenerIdReporte();

  // Verifica que exista un ID válido.
  if (!id) {

    mostrarError(
      'No se proporciono un ID de reporte. Vuelve al mapa y selecciona un reporte.'
    );

    return;
  }

  // Carga la información del reporte solicitado.
  cargarReporte(id);
});