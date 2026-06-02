
// Cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {

    cargarTareas();

});

// Guardar tarea
document.getElementById("formTarea").addEventListener("submit", function(e){

    e.preventDefault();

    fetch("../backend/insertTarea.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            titulo: document.getElementById("titulo").value,

            descripcion: document.getElementById("descripcion").value

        })

    })

    .then(r => r.json())

    .then(data => {

        console.log(data);
    
        if(data.success){
    
            alert("Guardado");
    
            cargarTareas();
    
        }else{
    
            alert("Error");
    
            console.log(data);
    
        }
    
    });

});


// Cargar tareas
function cargarTareas(){

    fetch("../backend/getTareas.php")

    .then(r => r.json())

    .then(data => {

        const lista = document.getElementById("lista");

        lista.innerHTML = "";

        data.forEach(t => {

            lista.innerHTML += `

                <div>

                    <h3>${t.titulo}</h3>

                    <p>${t.descripcion}</p>

                    <p>${t.estado}</p>

                    <button onclick="eliminarTarea(${t.id_tarea})">

                        Eliminar

                    </button>

                </div>

            `;

        });

    });

}


// Eliminar tarea
function eliminarTarea(id){

    fetch("../backend/deleteTarea.php", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            id_tarea: id

        })

    })

    .then(r => r.json())

    .then(data => {

        cargarTareas();

    });

}


// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {

    fetch("../backend/logout.php")

    .then(r => r.json())

    .then(data => {

        window.location.href = "login.html";

    });

});

