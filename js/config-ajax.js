/*
    PRÁCTICA 3 - APARTADO 2.1: SELECT DE CIUDADES CONDICIONADO AL PAÍS (Ajax con jQuery)
    Cada país tiene en el servidor un fichero de texto plano (datos/ciudades/<pais>.txt)
    con una ciudad por línea. Al cambiar el país se pide ese fichero y se rellena el SELECT.
*/
$(function () {
    const $pais = $("#pais");
    const $ciudad = $("#ciudad");
    const $estado = $("#estado-ciudades");
    if ($pais.length === 0 || $ciudad.length === 0) return;   // no estamos en config.html

    function cargarCiudades(ciudadASeleccionar) {
        const fichero = $pais.find("option:selected").data("fichero");

        // Sin país elegido: vaciamos y desactivamos el select de ciudades
        if (!fichero) {
            $ciudad.html('<option value="">-- Elige primero un país --</option>').prop("disabled", true);
            $estado.text("");
            return;
        }

        $ciudad.prop("disabled", true).html('<option value="">Cargando...</option>');

        $.ajax({
            url: "datos/ciudades/" + fichero + ".txt",
            method: "GET",
            dataType: "text"
        })
        .done(function (texto) {
            $ciudad.empty().append('<option value="">-- Elige una ciudad --</option>');

            // Una ciudad por línea; ignoramos líneas vacías y espacios sobrantes
            $.each(texto.split(/\r?\n/), function (i, linea) {
                const nombre = $.trim(linea);
                if (nombre !== "") {
                    $("<option>").val(nombre).text(nombre).appendTo($ciudad);
                }
            });

            if (ciudadASeleccionar) $ciudad.val(ciudadASeleccionar);
            $ciudad.prop("disabled", false);
            $estado.text("");
        })
        .fail(function (jqXHR, textStatus) {
            $ciudad.html('<option value="">No se pudieron cargar las ciudades</option>');
            $estado.text("Error " + jqXHR.status + " (" + textStatus + "). Abre la web desde el servidor (http://...).")
                   .css("color", "red");
        });
    }

    $pais.on("change", function () { cargarCiudades(null); });

    // Si ya había una configuración guardada, la dejamos seleccionada al entrar
    const paisGuardado = localStorage.getItem("habitacion_pais");
    if (paisGuardado) {
        $pais.val(paisGuardado);
        cargarCiudades(localStorage.getItem("habitacion_ciudad"));
    }
});
