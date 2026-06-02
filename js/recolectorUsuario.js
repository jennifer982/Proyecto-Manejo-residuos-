document.addEventListener('DOMContentLoaded', () => {
    const rol = sessionStorage.getItem('rol');
    if (rol !== 'recolector') {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'Esta sección es solo para recolectores.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        });
        window.location.href = '../index.html';
    }

    cargarReportes();
});

function cargarReportes() {
    fetch('../backend/getReportesRecolector.php', {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {

        if (!Array.isArray(data)) {
            console.error('Error al cargar reportes:', data);
            return;
        }

        const tbody = document.getElementById('tabla-reportes');
        tbody.innerHTML = '';

        const asignados  = data.length;
        const aceptados  = data.filter(r => r.estado === 'En proceso').length;
        const rechazados = data.filter(r => r.estado === 'Re rechazo').length;

        document.querySelectorAll('.card-resumen .valor')[0].textContent = asignados;
        document.querySelectorAll('.card-resumen .valor')[1].textContent = aceptados;
        document.querySelectorAll('.card-resumen .valor')[2].textContent = rechazados;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No tienes reportes asignados</td></tr>';
            return;
        }

        const estadoClase = {
            'Pendiente':  'badge-pendiente',
            'Aceptado':   'badge-aceptado',
            'Rechazado':  'badge-rechazado',
            'En proceso': 'badge-medio',
            'Atendido':   'badge-bajo',
            'Asignado':   'badge-aceptado',
            'Re rechazo': 'badge-rechazado'
        };

        const riesgoClase = (r) => {
            const n = parseInt(r);
            if (n >= 4) return 'badge-alto';
            if (n >= 2) return 'badge-medio';
            return 'badge-bajo';
        };

        data.forEach(r => {
            const colorFila = r.resultado_evidencia === 'Aceptada' 
                ? 'background-color: #d1e7dd;' 
                : r.resultado_evidencia === 'Rechazada' 
                ? 'background-color: #f8d7da;' 
                : '';

            const btnEliminar = r.resultado_evidencia === 'Aceptada' 
                ? `<button class="btn-rechazar" onclick="eliminarReporte(${r.id_reporte})">Eliminar</button>` 
                : '';

            tbody.innerHTML += `
            <tr style="${colorFila}">
                <td style="color:#666;">#${r.id_reporte}</td>
                <td>${r.categoria || '—'}</td>
                <td style="color:#666; font-size:13px;">${r.fecha || '—'}</td>
                <td><span class="badge ${riesgoClase(r.riesgo)}">${r.riesgo}/5</span></td>
                <td>
                    <span class="badge ${estadoClase[r.estado] || ''}">${r.estado || '—'}</span>
                    ${r.resultado_evidencia ? `<br><small style="color:${r.resultado_evidencia === 'Aceptada' ? '#28a745' : '#dc3545'};">Evidencia: ${r.resultado_evidencia}</small>` : ''}
                </td>
                <td>
                    <div class="acciones">
                        <button class="btn-aceptar" onclick="cambiarEstado(${r.id_reporte}, 3)">Aceptar</button>
                        <button class="btn-rechazar" onclick="cambiarEstado(${r.id_reporte}, 7)">Rechazar</button>
                        <button class="btn-ver" onclick="verReporte(${r.id_reporte})">Ver</button>
                        <button class="btn-ver" onclick="subirEvidencia(${r.id_reporte})">Marcar resuelto</button>
                        ${btnEliminar}
                    </div>
                </td>
            </tr>`;
        });
    })
    .catch(err => console.error('Error:', err));
}

function eliminarReporte(idReporte) {
    Swal.fire({
        title: '¿Eliminar reporte?',
        text: 'El reporte fue atendido y será eliminado de tu lista.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            fetch('../backend/cancelarAsignacion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id_reporte: idReporte })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('¡Listo!', 'El reporte fue eliminado de tu lista.', 'success')
                    .then(() => cargarReportes());
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo conectar con el servidor', 'error'));
        }
    });
}

function cambiarEstado(idReporte, idEstado) {
    fetch('../backend/actualizarEstado.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            id_reporte: idReporte,
            id_estado: idEstado
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
            title: '¡Estado Actualizado!',
            text: 'Se ha registrado tu respuesta al reporte correctamente.',
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#093a27'
        }).then((result) => {
            if (result.isConfirmed) {
                cargarReportes();
            }
        });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Error: ' + data.message,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#093a27'
            });
        }
    })
    .catch(err => console.error('Error:', err));
}

function verReporte(id) {
    window.location.href = `../views/detalle.html?id=${id}`;
}

async function subirEvidencia(idReporte) {
    const { value: file } = await Swal.fire({
        title: 'Subir evidencia',
        text: 'Sube una foto del lugar limpio para marcar como resuelto.',
        icon: 'info',
        input: 'file',
        inputAttributes: {
            'accept': 'image/*',
            'aria-label': 'Subir foto de evidencia'
        },
        showCancelButton: true,
        confirmButtonText: 'Enviar evidencia',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'Cancelar'
    });

    if (file) {
        const formData = new FormData();
        formData.append('id_reporte', idReporte);
        formData.append('evidencia', file);

        Swal.fire({
            title: 'Enviando...',
            didOpen: () => { Swal.showLoading(); }
        });

        fetch('../backend/solicitarCambioEstado.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire('¡Enviado!', 'Tu evidencia fue enviada al administrador.', 'success')
                .then(() => cargarReportes());
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        })
        .catch(() => Swal.fire('Error', 'No se pudo conectar con el servidor', 'error'));
    }
}