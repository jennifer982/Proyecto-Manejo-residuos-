document.getElementById("formRegistro").addEventListener("submit", function(e){

    e.preventDefault();

    fetch("../backend/register.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            nombre: document.getElementById("nombre").value,

            correo: document.getElementById("correo").value,

            contrasena: document.getElementById("contrasena").value

        })

    })

    .then(r => r.json())

    .then(data => {

        if(data.success){

            alert("Usuario registrado correctamente");

            window.location.href = "login.html";

        }else{

            alert(data.message);

        }

    });

});
