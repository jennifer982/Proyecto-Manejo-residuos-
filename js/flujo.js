document.addEventListener("DOMContentLoaded", () => {

    fetch("../backend/getDashboard.php")

    .then(res => res.json())

    .then(data => {

        // TARJETAS

        document.getElementById("total").textContent =
        data.total;

        document.getElementById("pendientes").textContent =
        data.pendientes;

        document.getElementById("resueltos").textContent =
        data.atendidos;


        document.getElementById("aceptados").textContent =
        data.aceptados;

        
        // GRAFICA

        new Chart(document.getElementById("graficaEstados"), {

            type: "doughnut",

            data: {

                labels: [
                    "Pendiente",
                    "Aceptado",
                    "Proceso",
                    "Atendido",
                    "Rechazado"
                ],

                datasets: [{

                    data: [

                        data.pendientes,
                        data.aceptados,
                        data.proceso,
                        data.atendidos,
                        data.rechazados

                    ],

                    backgroundColor: [

                        "#F4A6C1", // pendiente
                        "#2D5BFF", // aceptado
                        "#8B2BBF", // proceso
                        "#5BE14B", // atendido
                        "#F2994A"  // rechazado

                    ],

                    borderWidth: 0

                }]
            },

            options: {

                responsive: true,

                plugins: {

                    // QUITA LOS CUADROS DE ARRIBA
                    legend: {
                        display: false
                    }

                }

            }

        });

    })

    .catch(error => {

        console.error(error);
        Swal.fire({
            title: 'Error de Conexión',
            text: 'No se pudo cargar el dashboard. Inténtalo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });

    });

});