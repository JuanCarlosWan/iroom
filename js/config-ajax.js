// Práctica 3 - Apartado 2.1: al elegir un país se cargan sus ciudades con Ajax
// Cada país tiene un fichero de texto en el servidor con una ciudad por línea.
$(function () {
    $("#pais").change(function () {
        const fichero = $("#pais option:selected").data("fichero");
        $("#ciudad").html('<option value="">-- Elige una ciudad --</option>');
        if (!fichero) return;

        $.get("datos/ciudades/" + fichero + ".txt", function (texto) {
            const ciudades = texto.split("\n");
            for (let i = 0; i < ciudades.length; i++) {
                const ciudad = ciudades[i].trim();
                if (ciudad != "") {
                    $("#ciudad").append("<option>" + ciudad + "</option>");
                }
            }
        });
    });
});
