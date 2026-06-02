//==================================================
// CUANDO CARGA LA PAGINA
// Configura el formulario para cambiar la contraseña
// del usuario administrador
//==================================================
document.addEventListener("DOMContentLoaded", () => {

    // Obtener formulario de configuración
    const form =
        document.getElementById(
            "formConfig"
        );

    // Si el formulario no existe, termina la ejecución
    if (!form) return;

    //==================================================
    // EVENTO SUBMIT
    // Se ejecuta cuando el usuario guarda cambios
    //==================================================
    form.addEventListener("submit", (e) => {

        // Evita que la página se recargue
        e.preventDefault();

        // Obtener nueva contraseña ingresada
        const nuevaPass =
            document.getElementById(
                "nuevaPass"
            ).value;

        // Enviar nueva contraseña al backend
        fetch("../backend/configuracion.php", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            // Convertir datos a formato JSON
            body: JSON.stringify({

                nuevaPass

            })

        })

        .then(res => res.json())

        .then(data => {

            // Mostrar respuesta en consola
            console.log(data);

            // Mostrar mensaje de éxito
            Swal.fire({

                title: 'Éxito',

                text: 'Contraseña actualizada',

                icon: 'success',

                confirmButtonText: 'Entendido',

                confirmButtonColor: '#093a27'

            });

        })

        .catch(err =>

            console.error(err)

        );

    });

});