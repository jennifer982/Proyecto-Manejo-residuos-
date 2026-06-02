// Se ejecuta cuando todo el contenido HTML ha sido cargado.
document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // REFERENCIAS A FORMULARIOS
    // ==========================

    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');
    const step3Form = document.getElementById('step3Form');

    // ==========================
    // ELEMENTOS PASO 1
    // ==========================

    const emailInput = document.getElementById('recoveryEmail');
    const sendBtn = document.getElementById('sendCodeBtn');
    const msgStep1 = document.getElementById('msgStep1');

    // ==========================
    // ELEMENTOS PASO 2
    // ==========================

    const emailDisplay = document.getElementById('emailDisplay');
    const codeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const backBtn = document.getElementById('backToStep1Btn');
    const msgStep2 = document.getElementById('msgStep2');

    // ==========================
    // ELEMENTOS PASO 3
    // ==========================

    const newPass = document.getElementById('newPassword');
    const confirmPass = document.getElementById('confirmPassword');
    const resetBtn = document.getElementById('resetPasswordBtn');
    const msgStep3 = document.getElementById('msgStep3');

    // Variables que almacenan temporalmente
    // el correo y el código verificado.
    let currentEmail = '';
    let currentCode = '';

    // ==========================
    // PASO 1: ENVIAR CÓDIGO
    // ==========================

    step1Form.addEventListener('submit', async (e) => {

        e.preventDefault();

        // Obtiene y limpia el correo ingresado.
        const email = emailInput.value.trim();

        // Verifica que el campo no esté vacío.
        if (!email) {
            msgStep1.textContent =
                'Ingresa un correo electrónico';
            return;
        }

        // Valida el formato del correo.
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            msgStep1.textContent =
                'Formato de correo no válido';
            return;
        }

        // Deshabilita el botón mientras se procesa.
        sendBtn.disabled = true;

        msgStep1.textContent =
            'Enviando código...';

        msgStep1.style.color =
            '#2c3e50';

        try {

            // Envía el correo al backend para generar y enviar el código.
            const response =
                await fetch('../backend/solicitar_codigo.php', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email
                    })
                });

            const data = await response.json();

            // Si el código fue enviado correctamente.
            if (data.success) {

                currentEmail = email;

                // Muestra el correo en la siguiente pantalla.
                emailDisplay.textContent = email;

                // Oculta el paso 1.
                step1Form.style.display = 'none';

                // Muestra el paso 2.
                step2Form.style.display = 'block';

                msgStep1.textContent = '';
                codeInput.value = '';
                msgStep2.textContent = '';

            } else {

                msgStep1.textContent =
                    data.message ||
                    'Error al enviar el código';

                msgStep1.style.color =
                    '#e74c3c';
            }

        } catch (error) {

            console.error(error);

            msgStep1.textContent =
                'Error de conexión. Intenta más tarde.';

            msgStep1.style.color =
                '#e74c3c';

        } finally {

            // Reactiva el botón.
            sendBtn.disabled = false;
        }
    });

    // ==========================
    // PASO 2: VERIFICAR CÓDIGO
    // ==========================

    step2Form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const code =
            codeInput.value.trim();

        // Verifica que el código tenga 6 dígitos.
        if (code.length !== 6) {

            msgStep2.textContent =
                'El código debe tener 6 dígitos';

            msgStep2.style.color =
                '#e74c3c';

            return;
        }

        verifyBtn.disabled = true;

        msgStep2.textContent =
            'Verificando...';

        msgStep2.style.color =
            '#2c3e50';

        try {

            // Envía el código para validarlo.
            const response =
                await fetch('../backend/verificar_codigo.php', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: currentEmail,
                        codigo: code
                    })
                });

            const data = await response.json();

            if (data.success) {

                // Guarda el código validado.
                currentCode = code;

                // Avanza al paso 3.
                step2Form.style.display = 'none';
                step3Form.style.display = 'block';

                msgStep2.textContent = '';

                newPass.value = '';
                confirmPass.value = '';

                msgStep3.textContent = '';

            } else {

                msgStep2.textContent =
                    data.message ||
                    'Código incorrecto o expirado';

                msgStep2.style.color =
                    '#e74c3c';
            }

        } catch (error) {

            console.error(error);

            msgStep2.textContent =
                'Error de conexión';

            msgStep2.style.color =
                '#e74c3c';

        } finally {

            verifyBtn.disabled = false;
        }
    });

    // ==========================
    // VOLVER AL PASO 1
    // ==========================

    backBtn.addEventListener('click', () => {

        // Regresa al formulario de correo.
        step2Form.style.display = 'none';
        step1Form.style.display = 'block';

        msgStep1.textContent = '';
        msgStep2.textContent = '';

        // Conserva el correo ingresado.
        emailInput.value = currentEmail;
    });

    // ==========================
    // PASO 3: RESTABLECER CONTRASEÑA
    // ==========================

    step3Form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const pass1 = newPass.value;
        const pass2 = confirmPass.value;

        // Valida longitud mínima.
        if (pass1.length < 6) {

            msgStep3.textContent =
                'La contraseña debe tener al menos 6 caracteres';

            msgStep3.style.color =
                '#e74c3c';

            return;
        }

        // Verifica coincidencia de contraseñas.
        if (pass1 !== pass2) {

            msgStep3.textContent =
                'Las contraseñas no coinciden';

            msgStep3.style.color =
                '#e74c3c';

            return;
        }

        resetBtn.disabled = true;

        msgStep3.textContent =
            'Actualizando contraseña...';

        msgStep3.style.color =
            '#2c3e50';

        try {

            // Envía la nueva contraseña al servidor.
            const response =
                await fetch('../backend/restablecer.php', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        email: currentEmail,
                        codigo: currentCode,
                        newPassword: pass1
                    })
                });

            const data = await response.json();

            if (data.success) {

                msgStep3.textContent =
                    'Contraseña actualizada. Redirigiendo al inicio de sesión...';

                msgStep3.style.color =
                    '#27ae60';

                // Redirige al login después de 2.5 segundos.
                setTimeout(() => {

                    window.location.href =
                        '../views/iniciosesion.html';

                }, 2500);

            } else {

                msgStep3.textContent =
                    data.message ||
                    'Error al restablecer la contraseña';

                msgStep3.style.color =
                    '#e74c3c';
            }

        } catch (error) {

            console.error(error);

            msgStep3.textContent =
                'Error de conexión';

            msgStep3.style.color =
                '#e74c3c';

        } finally {

            resetBtn.disabled = false;
        }
    });

});