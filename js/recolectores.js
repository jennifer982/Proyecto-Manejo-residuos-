document.addEventListener("DOMContentLoaded", () => {
    cargarReportes();
    cargarSolicitudes();
});

function cargarReportes() {
    fetch("../backend/getReportesPendientes.php")
    .then(res => res.json())
    .then(data => {
        const tabla = document.getElementById("tabla-reportes");
        tabla.innerHTML = "";

        if (!data.length) {
            tabla.innerHTML = '<tr><td colspan="5">No hay reportes aceptados pendientes de asignación.</td></tr>';
            return;
        }

        data.forEach(rep => {
            tabla.innerHTML += `
               <tr>
            <td>${rep.id_reporte}</td>
            <td>${rep.categoria}</td>
            <td>${rep.fecha}</td>
            <td>${rep.riesgo}</td>
            <td>
                ${rep.nombre_recolector 
                    ? `<span style="color:#093a27; font-weight:600;">✓ ${rep.nombre_recolector}</span>`
                    : `<select id="rec-${rep.id_reporte}">
                            <option value="">-- Seleccionar --</option>
                       </select>`}
            </td>
            <td>${rep.fecha_asignacion || '— Sin asignar —'}</td>
            <td>
                ${rep.nombre_recolector
                    ? `<button class="btn-cancelar" onclick="cancelarAsignacion(${rep.id_reporte})">Cancelar</button>`
                    : `<button class="btn-asignar" onclick="asignar(${rep.id_reporte})">Asignar</button>
                       <button class"btn-cancelar" onclick="cancelarAsignacion(${rep.id_reporte})">Cancelar</button>`}
            </td>
     </tr>
            `;
            if(!rep.nombre_recolector) {
            cargarRecolectores(rep.id_reporte);
            }
        });
    })
    .catch(err => console.error("Error al cargar reportes:", err));
}

function cargarRecolectores(idReporte) {
    fetch("../backend/getRecolectores.php")
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById(`rec-${idReporte}`);
        data.forEach(rec => {
            const option = document.createElement("option");
            option.value = rec.id_usuario;
            option.textContent = rec.nombre;
            select.appendChild(option);
        });
    })
    .catch(err => console.error("Error al cargar recolectores:", err));
}

function asignar(idReporte) {
    const idRecolector = document.getElementById(`rec-${idReporte}`).value;

    if (!idRecolector) {
        Swal.fire({
            title: 'Selección Requerida',
            text: 'Por favor, selecciona un recolector.',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });
        return;
    }

    fetch("../backend/asignarRecolector.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_reporte:    idReporte,
            id_recolector: idRecolector
        })
    })
    .then(res => res.json())
    .then(data => {
        Swal.fire({
            title: 'Asignación Exitosa',
            text: data.message,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });
        cargarReportes();
    })
    .catch(err => console.error("Error al asignar:", err));
}

function cancelarAsignacion(idReporte) {
    Swal.fire({
        title: '¿Cancelar asignación?',
        text: "¿Estás seguro de que deseas quitarle este reporte al recolector?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#093a27',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Mantener asignado'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("../backend/cancelarAsignacion.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_reporte: idReporte })
            })
            .then(res => res.json())
            .then(data => {
                Swal.fire({
                    title: 'Asignación Cancelada',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#093a27'
                });
                cargarReportes();
            })
            .catch(err => console.error("Error al cancelar:", err));
        }
    });
}

// ── SOLICITUDES DE RECOLECTORES ──

function cargarSolicitudes() {
    fetch("../backend/getSolicitudesRecolectores.php", {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        const tabla = document.querySelector("#tablaSolicitudes tbody");
        tabla.innerHTML = "";
        if (data.length === 0) {
            tabla.innerHTML = '<tr><td colspan="5">No hay solicitudes pendientes</td></tr>';
            return;
        }
        data.forEach(sol => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${sol.id_solicitud}</td>
                <td>${sol.nombre}</td>
                <td>${sol.correo}</td>
                <td>${sol.fecha_registro}</td>
                <td>
                    <button onclick="verSolicitud(${sol.id_solicitud}, '${sol.nombre}', '${sol.correo}', '${sol.fecha_registro}', '${sol.licencia_manejo_residuos || ''}', '${sol.Certificado_capacitacion || ''}', '${sol.titulo_vehiculo || ''}', '${sol.tarjeta_circulacion || ''}', '${sol.licencia_conducir || ''}')">Ver solicitud</button>
                    <button class="btn-aceptar" onclick="gestionarSolicitud(${sol.id_solicitud}, 'aceptar')">Aceptar</button>
                    <button class="btn-rechazar" onclick="gestionarSolicitud(${sol.id_solicitud}, 'rechazar')">Rechazar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    })
    .catch(err => {
        console.error("Error:", err);
        Swal.fire({
            title: 'Error de Carga',
            text: 'No se pudieron recuperar las solicitudes pendientes del servidor.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#093a27'
        });
    });
}

function verSolicitud(id, nombre, correo, fecha, licencia, certificado, titulo, tarjeta, licenciaCondutor) {
    const pdfs = [
        { nombre: 'Licencia', ruta: licencia },
        { nombre: 'Certificado', ruta: certificado },
        { nombre: 'Título', ruta: titulo },
        { nombre: 'Tarjeta', ruta: tarjeta },
        { nombre: 'Licencia conductor', ruta: licenciaCondutor }
    ].filter(p => p.ruta);

    const links = pdfs.map(p =>
    `<a href="${p.ruta}" target="_blank"
        style="display:flex; align-items:center; gap:8px; margin:6px 0; padding:10px 14px; background:#093a27; color:white; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600;">
         ${p.nombre}
    </a>`
    ).join('');

    Swal.fire({
        title: `Solicitud #${id}`,
        html: `
             <div style="text-align:left;">
            <p><b>Nombre:</b> ${nombre}</p>
            <p><b>Correo:</b> ${correo}</p>
            <p><b>Fecha:</b> ${fecha}</p>
            <hr style="margin:12px 0;">
            <p><b>Documentos:</b></p>
            ${links || '<p>Sin documentos adjuntos</p>'}
        </div>
    `,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#093a27',
    width: '500px'
    });
}

function gestionarSolicitud(idSolicitud, accion) {
    fetch("../backend/gestionarSolicitud.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            id_solicitud: idSolicitud,
            accion: accion
        })
    })
    .then(res => res.json())
    .then(data => {
        Swal.fire({
            title: 'Solicitud Gestionada',
            text: data.message,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });
        cargarSolicitudes();
    })
    .catch(err => {
        console.error("Error:", err);
        Swal.fire({
            title: 'Error de Gestión',
            text: 'Ocurrió un error al gestionar la solicitud.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#093a27'
        });
    });
}