// Realiza una petición al backend para obtener los puntos de reciclaje.
fetch("../backend/getPuntos.php")

// Convierte la respuesta del servidor a formato JSON.
.then(r => r.json())

// Procesa los datos recibidos.
.then(data => {

    // Recorre cada punto de reciclaje obtenido.
    data.forEach(p => {

        // Crea un ícono personalizado de color verde.
        var iconoVerde = L.icon({

            // Ruta de la imagen utilizada como marcador.
            iconUrl: '../assets/img/pin-verde.png',

            // Tamaño del ícono en píxeles [ancho, alto].
            iconSize: [35, 45]

        });

        // Agrega un marcador al mapa utilizando las coordenadas del punto.
        L.marker(
            [p.latitud, p.longitud],
            { icon: iconoVerde }
        )

        // Añade el marcador al mapa.
        .addTo(mapa)

        // Muestra información cuando se hace clic en el marcador.
        .bindPopup(`
            <b>${p.nombre}</b><br>
            ${p.direccion}<br>
            ${p.horario}
        `);

    });

});