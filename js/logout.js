// Se ejecuta cuando todo el contenido HTML ha sido cargado.
document.addEventListener("DOMContentLoaded", () => {

    // Obtiene la referencia al botón de cerrar sesión.
    const btnLogout =
    document.getElementById("btnLogout");

    // Verifica que el botón exista en la página.
    if(btnLogout){

        // Agrega un evento al botón para cerrar sesión.
        btnLogout.addEventListener("click", (e) => {

            // Evita el comportamiento predeterminado del botón o enlace.
            e.preventDefault();

            // Llama a la función que cierra la sesión.
            cerrarSesion();

        });

    }

    // ==========================
    // TEMPORIZADOR DE INACTIVIDAD
    // ==========================

    // Variable que almacenará el temporizador.
    let tiempo;

    // Función que reinicia el contador de inactividad.
    function resetTimer(){

        // Elimina cualquier temporizador anterior.
        clearTimeout(tiempo);

        // Inicia un nuevo temporizador.
        tiempo = setTimeout(() => {
            
            // Si pasan 10 minutos sin actividad,
            // muestra una alerta de sesión expirada.
            Swal.fire({
                title: 'Sesión Cerrada',
                text: 'Tu sesión ha sido cerrada por inactividad.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#093a27'
            }).then(() => {
            
                // Cierra la sesión después de que el usuario
                // confirme la alerta.
                cerrarSesion();
            
            });

        }, 600000); // 600000 ms = 10 minutos

    }

    // ==========================
    // EVENTOS DE ACTIVIDAD
    // ==========================

    // Reinicia el temporizador cuando el usuario mueve el mouse.
    document.addEventListener(
        "mousemove",
        resetTimer
    );

    // Reinicia el temporizador cuando presiona una tecla.
    document.addEventListener(
        "keydown",
        resetTimer
    );

    // Reinicia el temporizador cuando hace clic.
    document.addEventListener(
        "click",
        resetTimer
    );

    // Reinicia el temporizador cuando se desplaza por la página.
    document.addEventListener(
        "scroll",
        resetTimer
    );

    // Inicia el temporizador por primera vez.
    resetTimer();

});

// ==========================
// FUNCION CERRAR SESION
// ==========================

// Envía una petición al servidor para finalizar la sesión.
function cerrarSesion(){

    fetch("../backend/logout.php", {

        // Método HTTP utilizado.
        method:"POST",

        // Incluye cookies de sesión en la petición.
        credentials:"include"

    })

    // Convierte la respuesta del servidor a JSON.
    .then(res => res.json())

    // Procesa la respuesta recibida.
    .then(data => {

        // Si el cierre de sesión fue exitoso.
        if(data.success){

            // Elimina toda la información almacenada
            // en sessionStorage.
            sessionStorage.clear();

            // Elimina todos los datos almacenados
            // en localStorage.
            localStorage.clear();

            // Redirige al usuario a la página de inicio de sesión.
            window.location.href =
            "../views/iniciosesion.html";

        }

    })

    // Captura posibles errores durante la petición.
    .catch(err => console.log(err));

}