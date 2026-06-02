// ==========================
// OBTENER RUTA BASE
// ==========================

// Determina la ruta base dependiendo de la ubicación actual.
// Esto permite que los enlaces funcionen correctamente tanto
// desde la raíz del proyecto como desde la carpeta /views.
function getBasePath() {

  // Obtiene la ruta actual de la página.
  var path = window.location.pathname;

  // Verifica si la página se encuentra dentro de /views.
  if (path.includes('/views/') || path.endsWith('/views')) {

      // Si está dentro de views, debe subir un nivel.
      return '../';
  }

  // Si está en la raíz, no necesita modificar la ruta.
  return '';
}

// ==========================
// MOSTRAR USUARIO EN NAVBAR
// ==========================

// Se ejecuta cuando el contenido HTML ha terminado de cargarse.
document.addEventListener('DOMContentLoaded', function() {

  // Obtiene la ruta base.
  var basePath = getBasePath();

  // Obtiene el nombre del usuario almacenado en sesión.
  var nombre = sessionStorage.getItem('nombreUsuario');

  // Obtiene el contenedor derecho del menú de navegación.
  var navRight = document.querySelector('.nav-right');

  // ==========================
  // AGREGAR OPCION RECOLECTOR
  // ==========================

  // Obtiene el rol del usuario.
  var rol = sessionStorage.getItem('rol');

  // Si el usuario es recolector.
  if (rol === 'recolector') {

      var navLeft = document.querySelector('.nav-left');

      // Evita agregar el enlace más de una vez.
      if (navLeft && !document.querySelector('.nav-link-recolector')) {

          // Crea un nuevo enlace.
          var linkRecolector = document.createElement('a');

          // Define la página destino.
          linkRecolector.href =
              basePath + 'views/recolectorUsuario.html';

          // Asigna clases CSS.
          linkRecolector.className =
              'nav-link nav-link-recolector';

          // Texto visible del enlace.
          linkRecolector.textContent =
              'reportes asignados';

          // Agrega el enlace al menú.
          navLeft.appendChild(linkRecolector);
      }
  }

  // Si no existe el contenedor derecho, termina la ejecución.
  if (!navRight) return;

  // ==========================
  // USUARIO AUTENTICADO
  // ==========================

  if (nombre) {

      // Construye dinámicamente el menú del usuario.
      navRight.innerHTML =
          '<div class="nav-usuario-wrapper">' +
              '<button class="nav-usuario-btn" id="btn-usuario">' +
                  nombre +
                  ' <span class="nav-flecha" id="nav-flecha">&#9660;</span>' +
              '</button>' +
              '<div class="nav-dropdown" id="nav-dropdown">' +
                  '<button class="nav-dropdown-item nav-cerrar-sesion" onclick="cerrarSesion()">Cerrar sesión</button>' +
              '</div>' +
          '</div>';

      // Evento para abrir o cerrar el menú desplegable.
      document.getElementById('btn-usuario')
      .addEventListener('click', function(e) {

          // Evita que el clic se propague al documento.
          e.stopPropagation();

          var dropdown =
              document.getElementById('nav-dropdown');

          var flecha =
              document.getElementById('nav-flecha');

          // Muestra u oculta el menú.
          dropdown.classList.toggle(
              'nav-dropdown-visible'
          );

          // Rota la flecha visualmente.
          flecha.classList.toggle(
              'nav-flecha-abierta'
          );
      });

      // Cierra el menú cuando se hace clic fuera de él.
      document.addEventListener('click', function() {

          var dropdown =
              document.getElementById('nav-dropdown');

          var flecha =
              document.getElementById('nav-flecha');

          if (dropdown)
              dropdown.classList.remove(
                  'nav-dropdown-visible'
              );

          if (flecha)
              flecha.classList.remove(
                  'nav-flecha-abierta'
              );
      });

  }

  // ==========================
  // USUARIO NO AUTENTICADO
  // ==========================

  else {

      // Muestra los enlaces de Login y Registro.
      navRight.innerHTML =

          '<a href="' +
          basePath +
          'views/iniciosesion.html" class="nav-link">Login</a>' +

          '<a href="' +
          basePath +
          'views/formulario.html" class="nav-link">Registro</a>';
  }

});

// ==========================
// CERRAR SESION
// ==========================

// Finaliza la sesión del usuario.
function cerrarSesion() {

  var basePath = getBasePath();

  // Solicita al servidor cerrar la sesión.
  fetch(basePath + 'backend/logout.php', {

      method: 'POST',

      // Incluye las cookies de sesión.
      credentials: 'include'

  })

  .then(function(res) {
      return res.json();
  })

  .then(function(data) {

      // Si el cierre fue exitoso.
      if (data.success) {

          // Elimina datos almacenados localmente.
          localStorage.clear();
          sessionStorage.clear();

          // Regresa a la página principal.
          window.location.href =
              basePath + 'index.html';
      }
  })

  .catch(function() {

      // En caso de error también limpia la sesión local.
      localStorage.clear();
      sessionStorage.clear();

      window.location.href =
          basePath + 'index.html';
  });
}

// ==========================
// VALIDAR ACCESO A REPORTAR
// ==========================

// Se ejecuta cuando la página termina de cargar.
document.addEventListener('DOMContentLoaded', function() {

  var basePath = getBasePath();

  // Obtiene el nombre del usuario actual.
  var nombre =
      sessionStorage.getItem('nombreUsuario');

  // Busca el enlace que contiene la palabra "reportar".
  var linkReportar =
      document.querySelector('a[href*="reportar"]');

  // Si existe el enlace y el usuario no ha iniciado sesión.
  if (linkReportar && !nombre) {

      linkReportar.addEventListener('click', function(e) {

          // Evita la navegación.
          e.preventDefault();

          // Muestra una alerta informativa.
          Swal.fire({
              title: '¡Atención!',
              text: 'Debes iniciar sesión para poder reportar.',
              icon: 'warning',
              confirmButtonText: 'Iniciar sesión',
              confirmButtonColor: '#28a745',
              showCancelButton: true,
              cancelButtonText: 'Cancelar'
          })

          .then((result) => {

              // Si el usuario acepta.
              if (result.isConfirmed) {

                  // Lo redirige a la página de inicio de sesión.
                  window.location.href =
                      basePath +
                      'views/iniciosesion.html';
              }
          });
      });
  }
});