/*
    PRÁCTICA 3 - APARTADO 1.2: GALERÍA DE IMÁGENES (jQuery)
    - Cuadro informativo al pasar el ratón (nombre + imagen ampliada).
    - Carrusel con desplazamiento cuando hay más imágenes de las que caben.
*/
$(function () {

    /* ---------- 1. CUADRO INFORMATIVO AL PASAR EL RATÓN ---------- */
    const $tooltip = $("#tooltip-galeria");

    // Delegamos el evento en el documento para que sirva para la tira y el carrusel
    $(document)
        .on("mouseenter", ".tira-imagenes img, .carrusel-pista img", function () {
            const $img = $(this);
            $tooltip.find("img").attr({ src: $img.attr("src"), alt: $img.attr("alt") });
            $tooltip.find(".tooltip-titulo").text($img.attr("alt"));
            $tooltip.find(".tooltip-info").text($img.data("info") || "");
            $tooltip.stop(true, true).fadeIn(150);
        })
        .on("mousemove", ".tira-imagenes img, .carrusel-pista img", function (e) {
            colocarTooltip(e.clientX, e.clientY);
        })
        .on("mouseleave", ".tira-imagenes img, .carrusel-pista img", function () {
            $tooltip.stop(true, true).fadeOut(100);
        });

    // Coloca el cuadro junto al ratón sin que se salga de la ventana
    function colocarTooltip(x, y) {
        const ancho = $tooltip.outerWidth();
        const alto = $tooltip.outerHeight();
        let left = x + 20;
        let top = y + 20;
        if (left + ancho > $(window).width()) left = x - ancho - 20;
        if (top + alto > $(window).height()) top = y - alto - 20;
        $tooltip.css({ left: Math.max(5, left), top: Math.max(5, top) });
    }


    /* ---------- 2. CARRUSEL CON DESPLAZAMIENTO ---------- */
    const $ventana = $(".carrusel-ventana");
    const $pista = $("#carrusel-pista");
    const $imagenes = $pista.children("img");
    let posicion = 0;          // índice de la primera imagen visible

    function anchoImagen() {
        return $imagenes.first().outerWidth(true);   // ancho + márgenes
    }
    function imagenesVisibles() {
        return Math.max(1, Math.floor($ventana.width() / anchoImagen()));
    }
    function posicionMaxima() {
        return Math.max(0, $imagenes.length - imagenesVisibles());
    }

    function moverCarrusel(nuevaPos) {
        posicion = Math.min(Math.max(nuevaPos, 0), posicionMaxima());
        $pista.stop().animate({ left: -posicion * anchoImagen() }, 400);
        // Desactivamos la flecha cuando ya no se puede seguir en esa dirección
        $("#carrusel-anterior").prop("disabled", posicion === 0);
        $("#carrusel-siguiente").prop("disabled", posicion === posicionMaxima());
    }

    $("#carrusel-anterior").on("click", function () { moverCarrusel(posicion - 1); });
    $("#carrusel-siguiente").on("click", function () { moverCarrusel(posicion + 1); });

    // Si cambia el tamaño de la ventana, recalculamos cuántas imágenes caben
    $(window).on("resize", function () { moverCarrusel(posicion); });

    // Las imágenes deben estar cargadas para conocer su ancho real
    $(window).on("load", function () { moverCarrusel(0); });
    moverCarrusel(0);
});
