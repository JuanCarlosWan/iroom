// Envolvemos todo en DOMContentLoaded para asegurar que el HTML ha cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function() {

    // =======================================================
    // 1. LÓGICA DEL NOMBRE (minombre.html - Apartado 3)
    // =======================================================
    const formNombre = document.getElementById("form-nombre");
    if (formNombre) {
        formNombre.addEventListener("submit", function(evento) {
            evento.preventDefault(); 
            const nombre = document.getElementById("fname").value;
            
            if (nombre) {
                // Almacena el nombre en la variable local fname
                localStorage.setItem("fname", nombre);
                alert("Nombre guardado correctamente");
                window.location.href = "index.html"; // Vuelve a la página principal
            }
        });
    }

    // =======================================================
    // 2. LÓGICA DE LA PÁGINA DE CONFIGURACIÓN (config.html)
    // =======================================================
    const maxInput = document.getElementById("temp-max");
    const minInput = document.getElementById("temp-min");
    const salida = document.getElementById("diferencia");
    
    // Seleccionamos el formulario de configuración (asegúrate de que en config.html le pusiste id="form-config" o usa querySelector)
    const formConfig = document.getElementById("form-config") || document.querySelector("form");

    if (maxInput && minInput && salida) {
        
        // --- Función para validar y calcular la diferencia de temperaturas ---
        function actualizar(){
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

        maxInput.addEventListener("input", actualizar);
        minInput.addEventListener("input", actualizar);

        // --- Guardar la configuración al hacer click en enviar ---
        if (formConfig && formConfig.id !== "form-nombre") {
            formConfig.addEventListener("submit", function(evento) {
                evento.preventDefault(); 

                // Guardar datos de texto
                const pais = document.getElementById("pais").value;
                const ciudad = document.getElementById("ciudad").value;
                const mapaUrl = document.getElementById("mapa").value;
                
                if(pais) localStorage.setItem("habitacion_pais", pais);
                if(ciudad) localStorage.setItem("habitacion_ciudad", ciudad);
                if(mapaUrl) localStorage.setItem("habitacion_mapa", mapaUrl);

                // Guardar el estado de los sensores (checkboxes)
                const sensorTemp = document.getElementById("temp");
                const sensorHumedad = document.getElementById("humedad");
                const sensorSonido = document.getElementById("nsonido");
                
                if(sensorTemp) localStorage.setItem("sensor_temp_activo", sensorTemp.checked);
                if(sensorHumedad) localStorage.setItem("sensor_humedad_activo", sensorHumedad.checked);
                if(sensorSonido) localStorage.setItem("sensor_sonido_activo", sensorSonido.checked);

                // Guardar Luz y Movimiento
                const sensorLuz = document.getElementById("nluz");
                const sensorMov = document.getElementById("mov");
                if(sensorLuz) localStorage.setItem("sensor_luz_activo", sensorLuz.checked);
                if(sensorMov) localStorage.setItem("sensor_mov_activo", sensorMov.checked);

                // Guardar Temperatura Max y Min
                const tMaxInput = document.getElementById("temp-max");
                const tMinInput = document.getElementById("temp-min");
                if(tMaxInput) localStorage.setItem("tempMax", tMaxInput.value);
                if(tMinInput) localStorage.setItem("tempMin", tMinInput.value);

                // Función auxiliar para terminar y redirigir
                function finalizarGuardado() {
                    alert("Configuración guardada correctamente");
                    window.location.href = "index.html"; 
                }

                // Guardar la Imagen
                const fotoInput = document.getElementById("foto");
                if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
                    const archivo = fotoInput.files[0];
                    const lector = new FileReader();

                    lector.onload = function(e) {
                        try {
                            // Guardamos la imagen convertida a Base64
                            localStorage.setItem("habitacion_foto", e.target.result);
                            finalizarGuardado();
                        } catch (error) {
                            alert("La imagen es demasiado grande para la memoria local. Prueba con una foto más pequeña.");
                            finalizarGuardado();
                        }
                    };
                    
                    // Leemos el archivo
                    lector.readAsDataURL(archivo);
                } else {
                    // Si no subió foto, terminamos directamente
                    finalizarGuardado();
                }
            });
        }
    }

    // =======================================================
    // 3. LÓGICA DE LA PÁGINA PRINCIPAL (index.html)
    // =======================================================
    
    // Comprobamos si estamos en index.html verificando la existencia de elementos clave
    const mensajeBienvenida = document.getElementById("mensaje-bienvenida");
    const mostrarPais = document.getElementById("mostrar-pais");
    const mostrarCiudad = document.getElementById("mostrar-ciudad");

    // 3.1 Cargar mensaje de bienvenida (Apartado 3)
    if (mensajeBienvenida) {
        const nombreGuardado = localStorage.getItem("fname");
        if (nombreGuardado) {
            mensajeBienvenida.textContent = `Hola ${nombreGuardado}: Bienvenido a Smart Room.`;
        } else {
            mensajeBienvenida.textContent = `Hola Invitado: Bienvenido a Smart Room.`;
        }
    }

    // 3.2 Cargar y mostrar datos de la configuración
    if (mostrarPais || mostrarCiudad) { 
        
        // Cargar País y Ciudad
        const paisGuardado = localStorage.getItem("habitacion_pais");
        const ciudadGuardada = localStorage.getItem("habitacion_ciudad");

        if (paisGuardado && mostrarPais) mostrarPais.textContent = paisGuardado;
        if (ciudadGuardada && mostrarCiudad) mostrarCiudad.textContent = ciudadGuardada;

        // Cargar Mapa URL
        const mapaGuardado = localStorage.getItem("habitacion_mapa");
        const enlaceMapa = document.getElementById("enlace-mapa");
        if (mapaGuardado && enlaceMapa) {
            enlaceMapa.href = mapaGuardado;
        }

        // Cargar Imagen
        const fotoGuardada = localStorage.getItem("habitacion_foto");
        const imgHabitacion = document.getElementById("img-habitacion");
        if (fotoGuardada && imgHabitacion) {
            imgHabitacion.src = fotoGuardada;
        }

        // Cargar estado de los sensores de forma dinámica
        const actualizarEstadoSensor = (idGuardado, idElemento, textoOk) => {
            const estado = localStorage.getItem(idGuardado);
            const elemento = document.getElementById(idElemento);
            
            if (elemento && estado !== null) { // verificamos que exista el dato en storage
                if (estado === "true") {
                    elemento.textContent = textoOk;
                    elemento.style.color = "green";
                } else {
                    elemento.textContent = "Desactivado";
                    elemento.style.color = "red";
                }
            }
        };

        actualizarEstadoSensor("sensor_temp_activo", "estado-temp", "Ok");
        actualizarEstadoSensor("sensor_humedad_activo", "estado-humedad", "Normal");
        actualizarEstadoSensor("sensor_sonido_activo", "estado-sonido", "Silencioso");
        actualizarEstadoSensor("sensor_luz_activo", "estado-luz", "Activado");
        actualizarEstadoSensor("sensor_mov_activo", "estado-mov", "Detectado");

        // Pintar Temperatura Máxima
        const tMaxGuardada = localStorage.getItem("tempMax");
        const estadoTMax = document.getElementById("estado-tmax");
        if (tMaxGuardada && tMaxGuardada !== "" && estadoTMax) {
            estadoTMax.textContent = tMaxGuardada + " ºC";
            estadoTMax.style.color = "green";
        }

        // Pintar Temperatura Mínima
        const tMinGuardada = localStorage.getItem("tempMin");
        const estadoTMin = document.getElementById("estado-tmin");
        if (tMinGuardada && tMinGuardada !== "" && estadoTMin) {
            estadoTMin.textContent = tMinGuardada + " ºC";
            estadoTMin.style.color = "green";
        }
    }
    const btnBorrar = document.getElementById("btn-borrar");
        if (btnBorrar) {
            btnBorrar.addEventListener("click", function() {
                // Esto borra toda la memoria guardada por tu página
            localStorage.clear();
            alert("Configuración borrada. La página se recargará.");
            // Recargamos la página para ver los cambios
            location.reload(); 
    });
}    
});
