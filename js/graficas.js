/*
    PRÁCTICA 3 - APARTADO 2.4 (acciones adicionales)
    Copia del apartado 2.3 en otra página, pero TODOS los datos llegan por Ajax desde
    json-server y de forma PARCIAL: cada página de 5 estaciones es una petición distinta
    (parámetros _start y _end). Además se dibuja una gráfica con la librería Chart.js.

    Para arrancar json-server (en la carpeta de la práctica, donde está db.json):
        npm install -g json-server
        json-server --watch db.json --port 3000
    Si json-server no responde, se usa el fichero estático datos/estaciones.json.
*/
const POR_PAGINA = 5;
const URL_JSON_SERVER = "http://" + (location.hostname || "localhost") + ":3000/estaciones";
const URL_FICHERO = "datos/estaciones.json";

const COLUMNAS_G = [
    { clave: "ciudad",      titulo: "Ciudad",               numerica: false },
    { clave: "temperatura", titulo: "Temperatura (º)",      numerica: true  },
    { clave: "humedad",     titulo: "Humedad (%)",          numerica: true  },
    { clave: "ruido",       titulo: "Ruido",                numerica: true  },
    { clave: "luz",         titulo: "Nivel de luz",         numerica: true  },
    { clave: "color",       titulo: "Color de Iluminación", numerica: false }
];

let usarJsonServer = true;     // pasa a false si json-server no responde
let datosPagina = [];          // datos recibidos de la página actual
let paginaActualG = 1;
let totalEstaciones = 20;
let columnaMarcada = null;
let grafica = null;


/* Pide UNA página de datos. Devuelve una promesa de jQuery con el array de estaciones */
function pedirPagina(numPagina) {
    const inicio = (numPagina - 1) * POR_PAGINA;

    if (usarJsonServer) {
        return $.ajax({
            url: URL_JSON_SERVER,
            data: { _start: inicio, _end: inicio + POR_PAGINA },
            dataType: "json",
            timeout: 2000
        }).then(function (datos, estado, jqXHR) {
            const total = Number(jqXHR.getResponseHeader("X-Total-Count"));
            if (total) totalEstaciones = total;
            $("#origen-datos").text("Datos parciales recibidos de json-server: " + URL_JSON_SERVER +
                "?_start=" + inicio + "&_end=" + (inicio + POR_PAGINA));
            return datos;
        }, function () {
            // json-server no está disponible: usamos el fichero estático
            usarJsonServer = false;
            return pedirPagina(numPagina);
        });
    }

    return $.getJSON(URL_FICHERO).then(function (todas) {
        totalEstaciones = todas.length;
        $("#origen-datos").text("json-server no responde: datos leídos de " + URL_FICHERO +
            " (página " + numPagina + ")");
        return todas.slice(inicio, inicio + POR_PAGINA);
    });
}


function pintarTabla() {
    const $tabla = $("<table>").addClass("tabla-dinamica");
    const $cab = $("<tr>");
    const $filaChk = $("<tr>").addClass("fila-histograma");

    $.each(COLUMNAS_G, function (i, col) {
        $("<th>").text(col.titulo).appendTo($cab);
        const $th = $("<th>").appendTo($filaChk);
        if (i === 0) $th.text("Mostrar histograma");
        else if (col.numerica) {
            $("<input>", { type: "checkbox", "class": "chk-hist-g", "data-columna": col.clave })
                .prop("checked", col.clave === columnaMarcada).appendTo($th);
        } else $th.text("-");
    });
    $("<thead>").append($cab, $filaChk).appendTo($tabla);

    const $tbody = $("<tbody>").appendTo($tabla);
    $.each(datosPagina, function (i, est) {
        const $tr = $("<tr>");
        $.each(COLUMNAS_G, function (j, col) {
            const $td = $("<td>").text(est[col.clave]);
            if (col.clave === "color") {
                $td.prepend($("<span>").addClass("muestra-color").css("background-color", "#" + est.color));
            }
            $tr.append($td);
        });
        $tbody.append($tr);
    });

    $("#tabla-dinamica").hide().empty().append($tabla).fadeIn(200);

    // Enlaces de paginación según el total de estaciones
    const $pag = $("#paginacion-dinamica").empty();
    const paginas = Math.ceil(totalEstaciones / POR_PAGINA);
    for (let p = 1; p <= paginas; p++) {
        $("<a>", { href: "#", "data-pagina": p, text: "Página " + p })
            .toggleClass("activa", p === paginaActualG).appendTo($pag);
    }
}


function pintarHistogramaG(clave) {
    const col = COLUMNAS_G.find(function (c) { return c.clave === clave; });
    const $histo = $("#histograma");
    const $filas = $histo.find(".histograma-filas").empty();
    $histo.find(".histograma-titulo").text(col.titulo + " - Página " + paginaActualG);

    let maximo = clave === "humedad" ? 100 : 0;
    $.each(datosPagina, function (i, d) { maximo = Math.max(maximo, d[clave]); });

    $.each(datosPagina, function (i, d) {
        const $barra = $("<div>").addClass("hist-barra hist-" + clave).css("width", 0)
            .append($("<span>").addClass("hist-valor").text(d[clave]));
        $("<div>").addClass("hist-fila")
            .append($("<span>").addClass("hist-etiqueta").text(d.ciudad))
            .append($("<div>").addClass("hist-pista").append($barra))
            .appendTo($filas);
        $barra.animate({ width: (maximo ? d[clave] / maximo * 100 : 0) + "%" }, 600);
    });
    $histo.slideDown(200);
}


function irAPagina(numPagina) {
    paginaActualG = numPagina;
    return pedirPagina(numPagina).done(function (datos) {
        datosPagina = datos;
        pintarTabla();
        if (columnaMarcada) pintarHistogramaG(columnaMarcada);
    }).fail(function () {
        $("#origen-datos").text("No se han podido obtener los datos. Abre la web desde el servidor (http://...).")
            .css("color", "red");
    });
}


/* Gráfica de barras con Chart.js con TODAS las estaciones */
function pintarGrafica(clave) {
    // Petición de TODOS los datos (sin _start/_end); si falla, fichero estático
    const peticion = usarJsonServer
        ? $.ajax({ url: URL_JSON_SERVER, dataType: "json", timeout: 2000 })
              .then(null, function () { return $.getJSON(URL_FICHERO); })
        : $.getJSON(URL_FICHERO);

    peticion.done(function (todas) {
        const col = COLUMNAS_G.find(function (c) { return c.clave === clave; });
        const etiquetas = $.map(todas, function (e) { return e.ciudad; });
        const valores = $.map(todas, function (e) { return e[clave]; });

        if (grafica) grafica.destroy();
        grafica = new Chart(document.getElementById("grafica-estaciones"), {
            type: "bar",
            data: {
                labels: etiquetas,
                datasets: [{ label: col.titulo, data: valores,
                             backgroundColor: "rgba(30, 58, 95, 0.75)", borderRadius: 4 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false },
                           title: { display: true, text: col.titulo + " en todas las estaciones" } },
                scales: { y: { beginAtZero: true } }
            }
        });
    });
}


$(function () {
    $("#histograma").hide();

    $("#paginacion-dinamica").on("click", "a", function (e) {
        e.preventDefault();
        irAPagina(Number($(this).data("pagina")));
    });

    $(document).on("change", ".chk-hist-g", function () {
        if (this.checked) {
            $(".chk-hist-g").not(this).prop("checked", false);
            columnaMarcada = $(this).data("columna");
            pintarHistogramaG(columnaMarcada);
        } else {
            columnaMarcada = null;
            $("#histograma").slideUp(200);
        }
    });

    $("#variable-grafica").on("change", function () { pintarGrafica($(this).val()); });

    // Primero la página 1 (así sabemos si json-server responde) y después la gráfica
    irAPagina(1).always(function () { pintarGrafica($("#variable-grafica").val()); });
});
