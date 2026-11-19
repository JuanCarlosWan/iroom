// Práctica 3
// Apartado 1.3: tablas paginadas con formato dado por jQuery
// Apartado 2.2: página 3 en XML (JavaScript puro) y página 4 en JSON (jQuery)
// Apartado 2.3: histograma de la columna marcada

const CABECERA = "<thead><tr><th>Ciudad</th><th>Temperatura (º)</th><th>Humedad (%)</th>" +
                 "<th>Ruido</th><th>Nivel de luz</th><th>Color de Iluminación</th></tr></thead>";

$(function () {
    $(".pagina-tabla").hide();
    $("#histograma").hide();
    mostrarPagina(1);

    $("#paginacion a").click(function (e) {
        e.preventDefault();
        mostrarPagina($(this).data("pagina"));
    });
});

// Muestra una página y oculta las demás
function mostrarPagina(numero) {
    // Las páginas 3 y 4 se piden al servidor la primera vez que se abren
    if (numero == 3 && $("#pagina-3 table").length == 0) { cargarXML(); return; }
    if (numero == 4 && $("#pagina-4 table").length == 0) { cargarJSON(); return; }

    darFormato($("#pagina-" + numero + " table"));
    $(".pagina-tabla").hide();
    $("#pagina-" + numero).fadeIn();
    $(".fila-casillas input").prop("checked", false);
    $("#histograma").hide();
}

// Apartado 1.3: el formato se da con selectores jQuery al mostrar la tabla
function darFormato($tabla) {
    $tabla.css({ width: "100%", borderCollapse: "collapse", background: "white" });
    $tabla.find("th, td").css({ border: "1px solid #c9d3dd", padding: "6px 12px" });
    $tabla.find("th").css({ background: "#1e3a5f", color: "white" });
    $tabla.find("tbody tr:nth-child(even)").css("background", "#e3f7f4");
    $tabla.find("tbody td:first-child").css("font-weight", "bold");

    // Apartado 2.3: fila con una casilla debajo de cada columna numérica (solo una vez)
    if ($tabla.find(".fila-casillas").length == 0) {
        $tabla.find("thead").append(
            '<tr class="fila-casillas"><th>Histograma</th>' +
            '<th><input type="checkbox" value="1"></th>' +
            '<th><input type="checkbox" value="2"></th>' +
            '<th><input type="checkbox" value="3"></th>' +
            '<th><input type="checkbox" value="4"></th>' +
            '<th></th></tr>'
        );
    }
}

// Apartado 2.2: página 3 con XMLHttpRequest y XML, sin jQuery
function cargarXML() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "datos/pagina3.xml");
    xhr.onload = function () {
        const estaciones = xhr.responseXML.getElementsByTagName("estacion");
        const etiquetas = ["ciudad", "temperatura", "humedad", "ruido", "luz", "color"];
        let html = "<table>" + CABECERA + "<tbody>";
        for (let i = 0; i < estaciones.length; i++) {
            html += "<tr>";
            for (let j = 0; j < etiquetas.length; j++) {
                html += "<td>" + estaciones[i].getElementsByTagName(etiquetas[j])[0].textContent + "</td>";
            }
            html += "</tr>";
        }
        document.getElementById("pagina-3").innerHTML = html + "</tbody></table>";
        mostrarPagina(3);
    };
    xhr.send();
}

// Apartado 2.2: página 4 con jQuery y JSON
function cargarJSON() {
    $.getJSON("datos/pagina4.json", function (datos) {
        let html = "<table>" + CABECERA + "<tbody>";
        $.each(datos.estaciones, function (i, e) {
            html += "<tr><td>" + e.ciudad + "</td><td>" + e.temperatura + "</td><td>" + e.humedad +
                    "</td><td>" + e.ruido + "</td><td>" + e.luz + "</td><td>" + e.color + "</td></tr>";
        });
        $("#pagina-4").html(html + "</tbody></table>");
        mostrarPagina(4);
    });
}

// Apartado 2.3: solo puede haber una casilla marcada
$(document).on("change", ".fila-casillas input", function () {
    $(".fila-casillas input").not(this).prop("checked", false);
    if (this.checked) {
        pintarHistograma($(this).val());
    } else {
        $("#histograma").hide();
    }
});

// Dibuja una barra por ciudad con los datos de la columna elegida de la tabla visible
function pintarHistograma(columna) {
    const $filas = $(".pagina-tabla:visible tbody tr");
    const titulo = $(".pagina-tabla:visible thead tr:first th").eq(columna).text();

    let maximo = 0;
    $filas.each(function () {
        maximo = Math.max(maximo, Number($(this).children().eq(columna).text()));
    });

    $("#histograma .histograma-titulo").text(titulo);
    $("#histograma .histograma-filas").empty();
    $filas.each(function () {
        const ciudad = $(this).children().eq(0).text();
        const valor = Number($(this).children().eq(columna).text());
        $("#histograma .histograma-filas").append(
            '<div class="hist-fila"><span class="hist-etiqueta">' + ciudad + '</span>' +
            '<div class="hist-pista"><div class="hist-barra" style="width:' + (valor / maximo * 100) + '%">' +
            '<span class="hist-valor">' + valor + '</span></div></div></div>'
        );
    });
    $("#histograma").show();
}
