// Esperar envío del formulario
document
.getElementById("formLogin")

.addEventListener(
"submit",

function(e){

    e.preventDefault();

    const correo =
    document
    .getElementById("correo")
    .value;

    const contrasena =
    document
    .getElementById("contrasena")
    .value;

    fetch(
        "../backend/login.php",
        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                correo,

                contrasena

            })

        }
    )

    .then(
        r=>r.json()
    )

    .then(data=>{

        if(data.success){

            alert(
                "Bienvenido"
            );

            window.location.href =
            "dashboard.html";

        }else{

            alert(
                data.message
            );

        }

    });

});