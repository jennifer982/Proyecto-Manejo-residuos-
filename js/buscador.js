// Temporizador para no hacer demasiadas peticiones
var temporizador = null;

// -----------------------------------------------
// FILTRAR SUGERENCIAS MIENTRAS EL USUARIO ESCRIBE
// -----------------------------------------------
function filtrarSugerencias(texto) {
  var lista = document.getElementById('sugerencias');

  // Si el texto es muy corto, ocultar sugerencias
  if (texto.length < 3) {
    lista.style.display = 'none';
    lista.innerHTML = '';
    return;
  }

  // Mostrar mensaje de cargando
  lista.innerHTML = '<div class="sin-resultados">Buscando...</div>';
  lista.style.display = 'block';

  // Esperar 500ms antes de buscar para no hacer
  // una peticion por cada letra que escribe el usuario
  clearTimeout(temporizador);
  temporizador = setTimeout(function() {
    buscarEnNominatim(texto);
  }, 500);
}

// -----------------------------------------------
// BUSCAR EN NOMINATIM (OpenStreetMap)
// -----------------------------------------------
function buscarEnNominatim(texto) {
  var lista = document.getElementById('sugerencias');

  // Agregar Baja California para limitar resultados a BC
  var query = encodeURIComponent(texto + ', Baja California, México');
  var url = 'https://nominatim.openstreetmap.org/search?q=' + query +
            '&format=json&limit=6&countrycodes=mx&addressdetails=1';

  fetch(url, {
    headers: {
      // Nominatim requiere un User-Agent para identificar la app
      'Accept-Language': 'es'
    }
  })
  .then(function(r) { return r.json(); })
  .then(function(resultados) {
    lista.innerHTML = '';

    if (!resultados || resultados.length === 0) {
      lista.innerHTML = '<div class="sin-resultados">Sin resultados para "' + texto + '"</div>';
      lista.style.display = 'block';
      return;
    }

    // Crear un elemento por cada resultado
    resultados.forEach(function(lugar) {
      var item = document.createElement('div');
      item.className = 'sugerencia-item';

      // Usar el nombre corto del lugar
      var nombre = lugar.display_name.split(',').slice(0, 3).join(',');
      item.textContent = nombre;

      item.onclick = function() {
        seleccionarLugar(nombre, parseFloat(lugar.lat), parseFloat(lugar.lon));
      };

      lista.appendChild(item);
    });

    lista.style.display = 'block';
  })
  .catch(function() {
    Swal.fire({
      title: 'Error',
      text: 'Error al buscar. Intenta de nuevo.',
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#093a27'
    });
    lista.innerHTML = '<div class="sin-resultados">Error al buscar. Intenta de nuevo.</div>';
    lista.style.display = 'block';
  });
}

// -----------------------------------------------
// AL SELECCIONAR UN LUGAR — MOVER EL MAPA
// -----------------------------------------------
function seleccionarLugar(nombre, lat, lng) {
  // Poner el nombre en el input
  document.getElementById('input-buscar').value = nombre;

  // Ocultar sugerencias
  document.getElementById('sugerencias').style.display = 'none';

  // Mover el mapa suavemente con flyTo
  if (typeof mapa !== 'undefined') {
    mapa.flyTo([lat, lng], 15, {
      animate: true,
      duration: 1.5
    });
  }
}

// -----------------------------------------------
// CERRAR SUGERENCIAS AL HACER CLIC FUERA
// -----------------------------------------------
document.addEventListener('click', function(e) {
  var buscador = document.getElementById('seccion-buscador');
  if (buscador && !buscador.contains(e.target)) {
    document.getElementById('sugerencias').style.display = 'none';
  }
});