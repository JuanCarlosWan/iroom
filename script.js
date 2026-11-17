/* VENTANA MODAL ÚNICA
   Sustituye a la función alert() en toda la web sin utilizar Bootstrap.
 */
function mostrarModal(mensaje, callbackAlCerrar = null) {
    let modal = document.getElementById("ventana-modal-unica");

    // Si la ventana modal no existe en el HTML, la creamos dinámicamente
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "ventana-modal-unica";
        modal.style.cssText = `
            display: none; position: fixed; z-index: 9999; left: 0; top: 0;
            width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);
            justify-content: center; align-items: center;
        `;

        const cuadro = document.createElement("div");
        cuadro.style.cssText = `
            background-color: #ffffff; color: #000000; padding: 25px 30px;
            border-radius: 6px; min-width: 300px; max-width: 450px;
            text-align: center; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            font-family: Arial, sans-serif;
        `;

        const parrafo = document.createElement("p");
        parrafo.id = "texto-ventana-modal";
        parrafo.style.cssText = "margin-bottom: 20px; font-size: 16px; line-height: 1.4;";

        const boton = document.createElement("button");
        boton.id = "btn-cerrar-modal";
        boton.type = "button";
        boton.textContent = "Aceptar";
        boton.style.cssText = `
            padding: 8px 20px; background-color: #e2e8f0; border: 1px solid #3b82f6;
            border-radius: 4px; cursor: pointer; font-size: 14px;
        `;

        cuadro.appendChild(parrafo);
        cuadro.appendChild(boton);
        modal.appendChild(cuadro);
        document.body.appendChild(modal);
    }

    document.getElementById("texto-ventana-modal").innerHTML = mensaje;
    modal.style.display = "flex";

    document.getElementById("btn-cerrar-modal").onclick = function () {
        modal.style.display = "none";
        if (typeof callbackAlCerrar === "function") {
            callbackAlCerrar();
        }
    };
}


/* 
    COORDENADAS GPS Y ENLACE A GOOGLE MAPS
    Admite Grados Decimales y Grados, Minutos y Segundos (GMS).
    Convierte siempre a latitud y longitud decimales (Sur y Oeste negativos).
*/
function convertirCoordenadaADecimal(coordTexto) {
    let str = coordTexto.trim().toUpperCase();

    // Caso 1: Ya está en grados decimales (ejemplo: +40.513 o -3.3486)
    if (/^[+-]?\d+(\.\d+)?$/.test(str)) {
        return parseFloat(str);
    }

    // Caso 2: Formato Grados, Minutos y Segundos (ejemplo: N 40° 30' 45.00" o O 3° 20' 54.00")
    const esNegativo = str.includes("S") || str.includes("O") || str.includes("W") || str.startsWith("-");

    // Extraemos los números (grados, minutos y segundos)
    const numeros = str.match(/\d+(\.\d+)?/g);
    if (!numeros || numeros.length === 0) {
        return NaN;
    }

    const grados = parseFloat(numeros[0]) || 0;
    const minutos = parseFloat(numeros[1]) || 0;
    const segundos = parseFloat(numeros[2]) || 0;

    if (minutos >= 60 || segundos >= 60) {
        return NaN;
    }

    const decimal = grados + (minutos / 60) + (segundos / 3600);
    return esNegativo ? -decimal : decimal;
}

function obtenerEnlaceGoogleMaps(valorCampoGps) {
    if (!valorCampoGps || valorCampoGps.trim() === "") return null;

    // El orden siempre es latitud, longitud separados por coma
    const partes = valorCampoGps.split(",");
    if (partes.length !== 2) return null;

    const lat = convertirCoordenadaADecimal(partes[0]);
    const lon = convertirCoordenadaADecimal(partes[1]);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return null;
    }

    const latFormateada = (lat >= 0 ? "+" : "") + parseFloat(lat.toFixed(4));
    const lonFormateada = parseFloat(lon.toFixed(4));

    return `https://maps.google.com/maps?q=${latFormateada},${lonFormateada}`;
}


/*
    VERIFICACIÓN DE CORREO ELECTRÓNICO
    Función 1: Solo con operaciones de cadenas (sin RegExp).
    Función 2: Con Expresiones Regulares (RegExp).
*/

// 3.1 Validación SIN expresiones regulares (Operaciones sobre cadenas)
function validarEmailPorCadenas(correo) {
    if (!correo || typeof correo !== "string") return false;

    // No puede contener espacios
    if (correo.includes(" ")) return false;

    // Separamos por '@' (debe haber exactamente 2 partes: usuario y dominio)
    const partesArroba = correo.split("@");
    if (partesArroba.length !== 2) return false;

    const usuario = partesArroba[0];
    const dominioCompleto = partesArroba[1];

    if (usuario.length === 0 || dominioCompleto.length === 0) return false;

    // Ni usuario ni dominio pueden empezar/terminar por punto ni tener dos puntos seguidos
    if (usuario.startsWith(".") || usuario.endsWith(".") || usuario.includes("..")) return false;
    if (dominioCompleto.startsWith(".") || dominioCompleto.endsWith(".") || dominioCompleto.includes("..")) return false;

    // El dominio debe tener al menos un punto (dominio + TLD, admitiendo subdominios como edu.uah.es)
    const subdominios = dominioCompleto.split(".");
    if (subdominios.length < 2) return false;

    for (let i = 0; i < subdominios.length; i++) {
        if (subdominios[i].length === 0) return false;
        if (subdominios[i].startsWith("-") || subdominios[i].endsWith("-")) return false;
    }

    // El TLD final debe tener al menos 2 caracteres
    const tld = subdominios[subdominios.length - 1];
    if (tld.length < 2) return false;

    return true;
}

// 3.2 Validación CON Expresiones Regulares
function validarEmailPorRegex(correo) {
    if (!correo || typeof correo !== "string") return false;
    const expresion = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
    return expresion.test(correo);
}

/* 
CALCULADORA DE TEMPERATURAS (calculadora.html)
Operaciones básicas (+, -, *, /), indicación de unidad (°C, K, °F)
y conversión directa entre escalas.
*/
let operacionCalc = "";
let escalaCalc = "C"; // 'C' (Celsius), 'K' (Kelvin), 'F' (Fahrenheit)

function pintarPantallaCalc(textoManual) {
    const pantalla = document.getElementById("pantalla-calc");
    if (!pantalla) return;

    const unidadTxt = escalaCalc === "C" ? "°C" : (escalaCalc === "F" ? "°F" : "K");
    const valor = textoManual !== undefined ? textoManual : (operacionCalc || "0");
    pantalla.value = `${valor} ${unidadTxt}`;
}

function pulsarBotonCalc(simbolo) {
    operacionCalc += simbolo;
    pintarPantallaCalc();
}

function limpiarPantallaCalc() {
    operacionCalc = "";
    pintarPantallaCalc("0");
}

function calcularResultadoCalc() {
    if (operacionCalc.trim() === "") return;

    try {
        if (!/^[0-9+\-*/.() ]+$/.test(operacionCalc)) {
            mostrarModal("Expresión no válida.");
            return;
        }
        const resultado = Function('"use strict"; return (' + operacionCalc + ')')();
        if (!isFinite(resultado)) {
            mostrarModal("Error matemático: División por cero.");
            limpiarPantallaCalc();
            return;
        }
        operacionCalc = parseFloat(resultado.toFixed(2)).toString();
        pintarPantallaCalc();
    } catch (e) {
        mostrarModal("Operación incompleta o mal formada.");
    }
}

function convertirEscalaCalc(nuevaEscala) {
    if (nuevaEscala === escalaCalc) return;

    // Si hay una cuenta pendiente en la pantalla, la resolvemos antes de convertir
    if (operacionCalc !== "" && /[+\-*/]/.test(operacionCalc.slice(1))) {
        calcularResultadoCalc();
    }

    const valorNum = parseFloat(operacionCalc);
    if (isNaN(valorNum)) {
        escalaCalc = nuevaEscala;
        pintarPantallaCalc("0");
        return;
    }

    // 1. Pasar de la escala actual a Celsius
    let gradosCelsius = valorNum;
    if (escalaCalc === "K") {
        gradosCelsius = valorNum - 273.15;
    } else if (escalaCalc === "F") {
        gradosCelsius = (valorNum - 32) * (5 / 9);
    }

    // 2. Pasar de Celsius a la nueva escala seleccionada
    let resultadoConvertido = gradosCelsius;
    if (nuevaEscala === "K") {
        resultadoConvertido = gradosCelsius + 273.15;
    } else if (nuevaEscala === "F") {
        resultadoConvertido = (gradosCelsius * (9 / 5)) + 32;
    }

    escalaCalc = nuevaEscala;
    operacionCalc = parseFloat(resultadoConvertido.toFixed(2)).toString();
    pintarPantallaCalc();
}


/*
   INICIALIZACIÓN DE LA APLICACIÓN
*/
document.addEventListener("DOMContentLoaded", function () {

    // BLOQUE 1: PÁGINA minombre.html
    const formNombre = document.getElementById("form-nombre");
    if (formNombre) {
        const inputFname = document.getElementById("fname");
        if (inputFname && localStorage.getItem("fname")) {
            inputFname.value = localStorage.getItem("fname");
        }

        // Si en minombre.html aún no están creados el input de correo y los 2 botones de la P2,
        // los inyectamos automáticamente en el formulario para que funcione sin tocar el HTML
        if (!document.getElementById("email")) {
            const contenedorEmail = document.createElement("div");
            contenedorEmail.style.marginTop = "15px";
            contenedorEmail.innerHTML = `
                <label for="email">Correo electrónico:</label>
                <input type="text" id="email" name="email" placeholder="nombre.apellidos@edu.uah.es">
                <br><br>
                <button type="button" id="btn-email-cadenas">Verificar Email (Cadenas)</button>
                <button type="button" id="btn-email-regex">Verificar Email (RegExp)</button>
                <br><br>
            `;
            const botonSubmitNombre = formNombre.querySelector('input[type="submit"]');
            formNombre.insertBefore(contenedorEmail, botonSubmitNombre);
        }

        // Evento Botón 1: Comprobar email SIN expresiones regulares
        const btnCadenas = document.getElementById("btn-email-cadenas");
        if (btnCadenas) {
            btnCadenas.addEventListener("click", function () {
                const valorCorreo = document.getElementById("email").value;
                if (validarEmailPorCadenas(valorCorreo)) {
                    mostrarModal("Validación por Cadenas: El correo es <strong>VÁLIDO</strong>.");
                } else {
                    mostrarModal("Validación por Cadenas: El correo es <strong>INVÁLIDO</strong>.");
                }
            });
        }

        // Evento Botón 2: Comprobar email CON expresiones regulares
        const btnRegex = document.getElementById("btn-email-regex");
        if (btnRegex) {
            btnRegex.addEventListener("click", function () {
                const valorCorreo = document.getElementById("email").value;
                if (validarEmailPorRegex(valorCorreo)) {
                    mostrarModal("Validación por Expresión Regular: El correo es <strong>VÁLIDO</strong>.");
                } else {
                    mostrarModal("Validación por Expresión Regular: El correo es <strong>INVÁLIDO</strong>.");
                }
            });
        }

        // Guardar el nombre en localStorage (fname)
        formNombre.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const nombre = document.getElementById("fname").value.trim();

            if (nombre === "") {
                mostrarModal("El nombre no puede estar vacío.");
                return;
            }

            localStorage.setItem("fname", nombre);
            mostrarModal("Nombre guardado correctamente", function () {
                window.location.href = "index.html";
            });
        });
    }


    // PÁGINA config.html
    const formConfig = document.getElementById("form-config");
    const maxInput = document.getElementById("temp-max");
    const minInput = document.getElementById("temp-min");
    const salida = document.getElementById("diferencia");

    // 2.1 Cálculo en tiempo real de diferencia entre Temperatura Máxima y Mínima (P1 Apartado 2)
    if (maxInput && minInput && salida) {
        function actualizarDiferencia() {
            const maxValue = maxInput.value;
            const minValue = minInput.value;

            if (maxValue === "" || minValue === "") {
                salida.textContent = "";
                return;
            }

            const max = parseFloat(maxValue);
            const min = parseFloat(minValue);
            if (max < min) {
                salida.textContent = "La temperatura máxima no puede ser menor que la mínima";
                salida.classList.add("error");
                return;
            }

            salida.textContent = Math.abs(max - min);
            salida.classList.remove("error");
        }

        maxInput.addEventListener("input", actualizarDiferencia);
        minInput.addEventListener("input", actualizarDiferencia);
    }

    if (formConfig) {
        // Si en config.html no está puesto el campo de "Temperatura Actual" que pide la P2 Apartado 1,
        // lo añadimos automáticamente debajo del campo Ciudad o Temperatura para poder validarlo
        if (!document.getElementById("temp-actual")) {
            const tempCheckbox = document.getElementById("temp");
            if (tempCheckbox) {
                const labelTempActual = document.createElement("label");
                labelTempActual.setAttribute("for", "temp-actual");
                labelTempActual.textContent = " Temperatura Actual (°C): ";
                const inputTempActual = document.createElement("input");
                inputTempActual.type = "text";
                inputTempActual.id = "temp-actual";
                inputTempActual.name = "temp-actual";
                inputTempActual.value = "22";
                tempCheckbox.insertAdjacentElement("afterend", inputTempActual);
                tempCheckbox.insertAdjacentElement("afterend", labelTempActual);
            }
        }

        // 2.2 Indicador orientativo de longitud de contraseña
        const passInput = document.getElementById("password");
        if (passInput) {
            let infoLongitud = document.getElementById("evaluacion-longitud-pass");
            if (!infoLongitud) {
                infoLongitud = document.createElement("span");
                infoLongitud.id = "evaluacion-longitud-pass";
                infoLongitud.style.cssText = "display: block; font-size: 13px; margin-top: 4px; font-weight: bold;";
                passInput.insertAdjacentElement("afterend", infoLongitud);
            }

            passInput.addEventListener("input", function () {
                const lon = passInput.value.length;
                if (lon === 0) {
                    infoLongitud.textContent = "";
                } else if (lon < 9) {
                    infoLongitud.textContent = `Evaluación de longitud: Corta (${lon}/9 caracteres mínimos)`;
                    infoLongitud.style.color = "red";
                } else if (lon >= 9 && lon <= 12) {
                    infoLongitud.textContent = `Evaluación de longitud: Aceptable (${lon} caracteres)`;
                    infoLongitud.style.color = "orange";
                } else {
                    infoLongitud.textContent = `Evaluación de longitud: Larga (${lon} caracteres)`;
                    infoLongitud.style.color = "green";
                }
            });
        }

        // 2.3 Generar enlace a Google Maps desde el campo Coordenadas GPS (P2 Apartado 2)
        const coordInput = document.getElementById("coord");
        const mapaInput = document.getElementById("gps");
        if (coordInput && mapaInput) {
            let enlaceMapsDirecto = document.getElementById("enlace-maps-directo");
            if (!enlaceMapsDirecto) {
                enlaceMapsDirecto = document.createElement("a");
                enlaceMapsDirecto.id = "enlace-maps-directo";
                enlaceMapsDirecto.target = "_blank";
                enlaceMapsDirecto.style.cssText = "display: none; margin-left: 10px; color: #ffeb3b; font-weight: bold;";
                mapaInput.insertAdjacentElement("afterend", enlaceMapsDirecto);
            }

            coordInput.addEventListener("input", function () {
                const urlGenerada = obtenerEnlaceGoogleMaps(coordInput.value);
                if (urlGenerada) {
                    mapaInput.value = urlGenerada;
                    enlaceMapsDirecto.href = urlGenerada;
                    enlaceMapsDirecto.textContent = "Ver en Google Maps";
                    enlaceMapsDirecto.style.display = "inline-block";
                } else {
                    enlaceMapsDirecto.style.display = "none";
                }
            });
        }

        // 2.4 Envío del formulario: Verificación P2 + Guardado exclusivo de País y Ciudad (P1 corregida)
        const listaPaisesPermitidos = [
            "españa", "espana", "francia", "portugal", "italia", "alemania", "andorra", "reino unido"
        ];

        formConfig.addEventListener("submit", function (evento) {
            evento.preventDefault();

            let errores = [];
            let advertencias = [];

            // A) Validar PAÍS (sin espacios iniciales/finales, sin distinguir mayúsculas/minúsculas, no vacío)
            const paisInput = document.getElementById("pais");
            const paisLimpio = paisInput ? paisInput.value.trim() : "";
            if (paisLimpio === "" || !listaPaisesPermitidos.includes(paisLimpio.toLowerCase())) {
                errores.push("Pais Erroneo");
            }

            // B) Validar CIUDAD (obligatorio para configurar país y ciudad)
            const ciudadInput = document.getElementById("ciudad");
            const ciudadLimpia = ciudadInput ? ciudadInput.value.trim() : "";
            if (ciudadLimpia === "") {
                errores.push("El campo Ciudad no puede estar vacío");
            }

            // C) Validar TEMPERATURA ACTUAL (número válido obligatorio; advertencia si está fuera de 22 a 26 °C)
            const tempActualInput = document.getElementById("temp-actual");
            if (tempActualInput) {
                const tempTxt = tempActualInput.value.trim();
                if (tempTxt === "" || isNaN(Number(tempTxt))) {
                    errores.push("El campo de temperatura actual debe contener un número válido");
                } else {
                    const tempValor = Number(tempTxt);
                    if (tempValor < 22 || tempValor > 26) {
                        advertencias.push(`Advertencia: La temperatura actual (${tempValor} °C) está fuera del intervalo de 22 a 26 °C.`);
                    }
                }
            }

            // D) Validar CONTRASEÑA (al menos 9 caracteres)
            const passValor = passInput ? passInput.value : "";
            if (passValor.length < 9) {
                errores.push("La contraseña debe tener al menos 9 caracteres");
            }

            // E) Validar Coordenadas GPS si el usuario ha introducido texto en ese campo
            if (coordInput && coordInput.value.trim() !== "") {
                const urlGenerada = obtenerEnlaceGoogleMaps(coordInput.value);
                if (!urlGenerada) {
                    errores.push("Coordenadas GPS inválidas. Use formato decimal (40.513, -3.3486) o GMS (N 40° 30' 45.00\", O 3° 20' 54.00\")");
                } else if (mapaInput) {
                    mapaInput.value = urlGenerada;
                }
            }

            // Si hay errores de formato o campos vacíos, mostramos la ventana modal e impedimos guardar
            if (errores.length > 0) {
                mostrarModal(errores.join("<br>"));
                return;
            }

            // GUARDADO CORREGIDO (P1): Solo guardamos País y Ciudad como indicó el profesor
            localStorage.setItem("habitacion_pais", paisLimpio);
            localStorage.setItem("habitacion_ciudad", ciudadLimpia);

            // Si hay advertencia de temperatura (fuera de 22-26 °C), no impide registrar la lectura
            if (advertencias.length > 0) {
                mostrarModal(advertencias.join("<br>") + "<br><br>Configuración guardada correctamente.", function () {
                    window.location.href = "index.html";
                });
            } else {
                mostrarModal("Configuración guardada correctamente", function () {
                    window.location.href = "index.html";
                });
            }
        });
    }


    //PÁGINA PRINCIPAL index.html
    const mensajeBienvenida = document.getElementById("mensaje-bienvenida");
    const mostrarPais = document.getElementById("mostrar-pais");
    const mostrarCiudad = document.getElementById("mostrar-ciudad");

    // 3.1 Mensaje de bienvenida con fname (P1 Apartado 3)
    if (mensajeBienvenida) {
        const nombreGuardado = localStorage.getItem("fname");
        if (nombreGuardado) {
            mensajeBienvenida.textContent = `Hola ${nombreGuardado}: Bienvenido a Smart Room.`;
        } else {
            mensajeBienvenida.textContent = `Hola Invitado: Bienvenido a Smart Room.`;
        }
    }

    // 3.2 Mostrar exclusivamente País y Ciudad (sin tocar sensores ni foto)
    if (mostrarPais || mostrarCiudad) {
        const paisGuardado = localStorage.getItem("habitacion_pais");
        const ciudadGuardada = localStorage.getItem("habitacion_ciudad");

        if (paisGuardado && mostrarPais) mostrarPais.textContent = paisGuardado;
        if (ciudadGuardada && mostrarCiudad) mostrarCiudad.textContent = ciudadGuardada;
    }

    // 3.3 Botón para borrar la configuración
    const btnBorrar = document.getElementById("btn-borrar");
    if (btnBorrar) {
        btnBorrar.addEventListener("click", function () {
            localStorage.removeItem("habitacion_pais");
            localStorage.removeItem("habitacion_ciudad");
            mostrarModal("Configuración borrada. La página se recargará.", function () {
                location.reload();
            });
        });
    }

});