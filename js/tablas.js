/*
    PRÁCTICA 3
    - Apartado 1.3: tablas paginadas (5 estaciones por página) formateadas con selectores jQuery
      en el momento de mostrar cada contenedor.
    - Apartado 2.2: página 3 cargada por Ajax en XML con JavaScript puro (XMLHttpRequest)
                    página 4 cargada por Ajax en JSON con jQuery ($.ajax / dataType "json")
    - Apartado 2.3: histograma de la columna marcada (sin librerías externas).
*/

// Columnas de la tabla. "numerica" indica si se puede representar en el histograma
const COLUMNAS = [
    { clave: "ciudad",      titulo: "Ciudad",               numerica: false },
    { clave: "temperatura", titulo: "Temperatura (º)",      numerica: true  },
    { clave: "humedad",     titulo: "Humedad (%)",          numerica: true  },
    { clave: "ruido",       titulo: "Ruido",                numerica: true  },
    { clave: "luz",         titulo: "Nivel de luz",         numerica: true  },
    { clave: "color",       titulo: "Color de Iluminación", numerica: false }
];

// Datos de cada página. Las páginas que llegan por Ajax se guardan aquí al recibirlas,
// así el histograma puede consultarlos (como sugiere la NOTA del enunciado).
const datosPaginas = {};
let paginaActual = 1;
let columnaHistograma = null;   // clave de la columna marcada (o null)


/* =====================================================================
   APARTADO 2.2 (a): PÁGINA 3 CON AJAX + XML EN JAVASCRIPT PURO
   ===================================================================== */
function cargarPaginaXML(numPagina, url, alTerminar) {
    const contenedor = document.getElementById("pagina-" + numPagina);
    const estado = document.getElementById("estado-carga");
    estado.textContent = "Cargando página " + numPagina + " desde el servidor (XML)...";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);           // petición asíncrona
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;  // 4 = respuesta completa

        if (xhr.status === 200 && xhr.responseXML) {
            const xml = xhr.responseXML;
            const nodos = xml.getElementsByTagName("estacion");
            const filas = [];

            // Recorremos cada <estacion> y leemos sus etiquetas hijas
            for (let i = 0; i < nodos.length; i++) {
                const fila = {};
                for (let c = 0; c < COLUMNAS.length; c++) {
                    const clave = COLUMNAS[c].clave;
                    const nodo = nodos[i].getElementsByTagName(clave)[0];
                    const texto = nodo ? nodo.textContent.trim() : "";
                    fila[clave] = COLUMNAS[c].numerica ? Number(texto) : texto;
                }
                filas.push(fila);
            }
            datosPaginas[numPagina] = filas;

            // Construimos la tabla con el DOM de JavaScript (sin jQuery)
            const tabla = document.createElement("table");
            const thead = document.createElement("thead");
            const trCab = document.createElement("tr");
            for (let c = 0; c < COLUMNAS.length; c++) {
                const th = document.createElement("th");
                th.textContent = COLUMNAS[c].titulo;
                trCab.appendChild(th);
            }
            thead.appendChild(trCab);
            tabla.appendChild(thead);

            const tbody = document.createElement("tbody");
            for (let i = 0; i < filas.length; i++) {
                const tr = document.createElement("tr");
                for (let c = 0; c < COLUMNAS.length; c++) {
                    const td = document.createElement("td");
                    td.textContent = filas[i][COLUMNAS[c].clave];
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            tabla.appendChild(tbody);

            contenedor.innerHTML = "";
            contenedor.appendChild(tabla);
            estado.textContent = "Página " + numPagina + " recibida del servidor en formato XML (JavaScript puro).";
            alTerminar();
        } else {
            estado.textContent = "Error " + xhr.status + " al cargar " + url +
                ". Recuerda abrir la web desde el servidor (http://...), no como fichero local.";
        }
    };
    xhr.send();
}


/* =====================================================================
   APARTADO 2.2 (b): PÁGINA 4 CON AJAX + JSON EN JQUERY
   ===================================================================== */
function cargarPaginaJSON(numPagina, url, alTerminar) {
    const $estado = $("#estado-carga").text("Cargando página " + numPagina + " desde el servidor (JSON)...");

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",     // jQuery convierte la respuesta en objeto JavaScript
        cache: false
    })
    .done(function (respuesta) {
        datosPaginas[numPagina] = respuesta.estaciones;

        const $tabla = $("<table>");
        const $filaCab = $("<tr>");
        $.each(COLUMNAS, function (i, col) {
            $("<th>").text(col.titulo).appendTo($filaCab);
        });
        $("<thead>").append($filaCab).appendTo($tabla);

        const $tbody = $("<tbody>").appendTo($tabla);
        $.each(respuesta.estaciones, function (i, estacion) {
            const $tr = $("<tr>");
            $.each(COLUMNAS, function (j, col) {
                $("<td>").text(estacion[col.clave]).appendTo($tr);
            });
            $tbody.append($tr);
        });

        $("#pagina-" + numPagina).empty().append($tabla);
        $estado.text("Página " + numPagina + " recibida del servidor en formato JSON (jQuery).");
        alTerminar();
    })
    .fail(function (jqXHR, textStatus) {
        $estado.text("Error al cargar " + url + " (" + textStatus + "). " +
            "Recuerda abrir la web desde el servidor (http://...), no como fichero local.");
    });
}


/* =====================================================================
   APARTADO 1.3: DAR FORMATO A LA TABLA CON SELECTORES JQUERY AL MOSTRARLA
   ===================================================================== */
function formatearTabla($contenedor) {
    const $tabla = $contenedor.find("table");

    $tabla.css({
        width: "100%",
        borderCollapse: "collapse",
        background: "rgba(255, 255, 255, 0.75)",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px"
    });

    // Cabecera: fondo oscuro, texto blanco y centrado
    $tabla.find("thead tr:first-child th").css({
        background: "#1e3a5f",
        color: "#ffffff",
        textAlign: "center"
    });

    // Filas alternas (efecto cebra) con los selectores :nth-child(odd / even)
    $tabla.find("tbody tr:nth-child(odd)").css("background", "rgba(255, 255, 255, 0.9)");
    $tabla.find("tbody tr:nth-child(even)").css("background", "rgba(143, 240, 227, 0.35)");

    // Primera columna (ciudad) en negrita; columnas numéricas alineadas a la derecha
    $tabla.find("tbody td:first-child").css("font-weight", "bold");
    $tabla.find("tbody td:not(:first-child):not(:last-child)").css("text-align", "right");

    // Columna de color: letra monoespaciada y centrada
    $tabla.find("tbody td:last-child").css({ fontFamily: "monospace", textAlign: "center" });

    // APARTADO 2.3: fila "Mostrar histograma" con una casilla por columna numérica
    if ($tabla.find("thead .fila-histograma").length === 0) {
        const $fila = $("<tr>").addClass("fila-histograma");
        $.each(COLUMNAS, function (i, col) {
            const $th = $("<th>");
            if (i === 0) {
                $th.text("Mostrar histograma");
            } else if (col.numerica) {
                $("<input>", { type: "checkbox", "class": "chk-hist", "data-columna": col.clave,
                               title: "Histograma de " + col.titulo }).appendTo($th);
            } else {
                $th.text("-");
            }
            $fila.append($th);
        });
        $tabla.find("thead").append($fila);
    }
    $tabla.find("thead .fila-histograma th").css({
        background: "#e8f1f8", color: "#1e3a5f", textAlign: "center", fontSize: "0.8rem"
    });

    // Celdas: borde y relleno
    $tabla.find("th, td").css({ border: "1px solid #c9d3dd", padding: "6px 12px" });
}


/* Lee los datos de la tabla que hay en un contenedor (sirve para las páginas estáticas
   y para volver a sincronizar los datos tras ordenar) */
function leerDatosDeTabla(numPagina) {
    const filas = [];
    $("#pagina-" + numPagina + " tbody tr").each(function () {
        const fila = {};
        $(this).children("td").each(function (i) {
            const col = COLUMNAS[i];
            const texto = $(this).text().trim();
            fila[col.clave] = col.numerica ? Number(texto) : texto;
        });
        filas.push(fila);
    });
    datosPaginas[numPagina] = filas;
}


/* =====================================================================
   PAGINACIÓN: mostrar un contenedor y ocultar los demás
   ===================================================================== */
function mostrarPagina(numPagina) {
    const $contenedor = $("#pagina-" + numPagina);

    // Si es una página Ajax que aún no se ha pedido al servidor, la pedimos primero
    if ($contenedor.children("table").length === 0) {
        const origen = $contenedor.data("origen");
        if (origen === "xml") {
            cargarPaginaXML(numPagina, "datos/pagina3.xml", function () { mostrarPagina(numPagina); });
        } else if (origen === "json") {
            cargarPaginaJSON(numPagina, "datos/pagina4.json", function () { mostrarPagina(numPagina); });
        }
        return;
    }

    if (!datosPaginas[numPagina]) leerDatosDeTabla(numPagina);
    paginaActual = numPagina;

    formatearTabla($contenedor);   // el formato se aplica al visualizar el contenedor

    $(".pagina-tabla").not($contenedor).hide();
    $contenedor.fadeIn(250);

    $("#paginacion a").removeClass("activa")
        .filter("[data-pagina='" + numPagina + "']").addClass("activa");

    // Si había una columna marcada, la mantenemos al cambiar de página
    $contenedor.find(".chk-hist").prop("checked", false);
    if (columnaHistograma) {
        $contenedor.find(".chk-hist[data-columna='" + columnaHistograma + "']").prop("checked", true);
        pintarHistograma(columnaHistograma);
    }
}


/* =====================================================================
   APARTADO 2.3: HISTOGRAMA (sin bibliotecas externas)
   ===================================================================== */
function pintarHistograma(clave) {
    const $histo = $("#histograma");
    const $filas = $histo.find(".histograma-filas").empty();
    const columna = COLUMNAS.find(function (c) { return c.clave === clave; });
    const datos = datosPaginas[paginaActual] || [];

    // Cambiamos el título del contenedor
    $histo.find(".histograma-titulo").text(columna.titulo + " - Página " + paginaActual);

    // El valor máximo ocupa el 100 % del ancho; la humedad se mide sobre 100 %
    let maximo = clave === "humedad" ? 100 : 0;
    $.each(datos, function (i, d) { maximo = Math.max(maximo, d[clave]); });

    // Una fila por ciudad: etiqueta + barra cuyo ancho depende del valor
    $.each(datos, function (i, d) {
        const porcentaje = maximo > 0 ? (d[clave] / maximo) * 100 : 0;
        const $barra = $("<div>").addClass("hist-barra hist-" + clave).css("width", 0)
            .append($("<span>").addClass("hist-valor").text(d[clave]));
        $("<div>").addClass("hist-fila")
            .append($("<span>").addClass("hist-etiqueta").text(d.ciudad))
            .append($("<div>").addClass("hist-pista").append($barra))
            .appendTo($filas);
        $barra.animate({ width: porcentaje + "%" }, 600);
    });

    $histo.slideDown(200);
}


/* =====================================================================
   INICIALIZACIÓN Y EVENTOS
   ===================================================================== */
$(function () {
    $(".pagina-tabla").hide();
    $("#histograma").hide();

    // Enlaces "Página #"
    $("#paginacion").on("click", "a", function (e) {
        e.preventDefault();
        mostrarPagina(Number($(this).data("pagina")));
    });

    // Casillas del histograma: solo puede haber UNA marcada
    $(document).on("change", ".chk-hist", function () {
        if (this.checked) {
            $(".chk-hist").not(this).prop("checked", false);
            columnaHistograma = $(this).data("columna");
            pintarHistograma(columnaHistograma);
        } else {
            columnaHistograma = null;
            $("#histograma").slideUp(200);
        }
    });

    mostrarPagina(1);
});
