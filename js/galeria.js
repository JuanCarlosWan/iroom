/*
    PRÁCTICA 3 - APARTADO 1.2: GALERÍA DE IMÁGENES (jQuery)
    - Cuadro informativo al pasar el ratón (nombre + imagen ampliada).
    - Carrusel con desplazamiento cuando hay más imágenes de las que caben.
    APARTADO 1.4 (mejoras): visor a pantalla completa, navegación con teclado,
    puntos indicadores y reproducción automática del carrusel.
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
    const $puntos = $("#carrusel-puntos");
    let posicion = 0;          // índice de la primera imagen visible
    let temporizador = null;   // para la reproducción automática

    function anchoImagen() {
        return $imagenes.first().outerWidth(true);   // ancho + márgenes
    }
    function imagenesVisibles() {
        return Math.max(1, Math.floor($ventana.width() / anchoImagen()));
    }
    function posicionMaxima() {
        return Math.max(0, $imagenes.length - imagenesVisibles());
    }

    function pintarPuntos() {
        $puntos.empty();
        for (let i = 0; i <= posicionMaxima(); i++) {
            $("<span>").addClass("punto").attr("data-pos", i).appendTo($puntos);
        }
    }

    function moverCarrusel(nuevaPos, animar = true) {
        posicion = Math.min(Math.max(nuevaPos, 0), posicionMaxima());
        const desplazamiento = -posicion * anchoImagen();
        if (animar) {
            $pista.stop().animate({ left: desplazamiento }, 400);
        } else {
            $pista.css("left", desplazamiento);
        }
        // Activamos/desactivamos flechas y marcamos el punto actual
        $("#carrusel-anterior").prop("disabled", posicion === 0);
        $("#carrusel-siguiente").prop("disabled", posicion === posicionMaxima());
        $puntos.children().removeClass("activo").eq(posicion).addClass("activo");
    }

    $("#carrusel-anterior").on("click", function () { moverCarrusel(posicion - 1); });
    $("#carrusel-siguiente").on("click", function () { moverCarrusel(posicion + 1); });
    $puntos.on("click", ".punto", function () { moverCarrusel(Number($(this).data("pos"))); });

    // Si cambia el tamaño de la ventana, recalculamos cuántas imágenes caben
    $(window).on("resize", function () {
        pintarPuntos();
        moverCarrusel(posicion, false);
    });

    // Reproducción automática (mejora 1.4)
    $("#carrusel-auto").on("change", function () {
        clearInterval(temporizador);
        if (this.checked) {
            temporizador = setInterval(function () {
                moverCarrusel(posicion >= posicionMaxima() ? 0 : posicion + 1);
            }, 2500);
        }
    });

    // Las imágenes deben estar cargadas para conocer su ancho real
    $(window).on("load", function () {
        pintarPuntos();
        moverCarrusel(0, false);
    });
    pintarPuntos();
    moverCarrusel(0, false);


    /* ---------- 3. VISOR A PANTALLA COMPLETA (mejora 1.4) ---------- */
    const $visor = $("#visor");
    let $grupoVisor = $();   // imágenes del bloque en el que se hizo clic
    let indiceVisor = 0;

    function mostrarEnVisor(indice) {
        indiceVisor = (indice + $grupoVisor.length) % $grupoVisor.length;   // circular
        const $img = $grupoVisor.eq(indiceVisor);
        const $grande = $visor.find("figure img");
        $grande.fadeOut(120, function () {
            $grande.attr({ src: $img.attr("src"), alt: $img.attr("alt") }).fadeIn(200);
        });
        $visor.find("figcaption").text(
            $img.attr("alt") + " - " + ($img.data("info") || "") +
            "  (" + (indiceVisor + 1) + " / " + $grupoVisor.length + ")"
        );
    }

    $(document).on("click", ".tira-imagenes img, .carrusel-pista img", function () {
        $grupoVisor = $(this).parent().children("img");
        $tooltip.hide();
        mostrarEnVisor($grupoVisor.index(this));
        $visor.css("display", "flex").hide().fadeIn(200);
    });

    function cerrarVisor() { $visor.fadeOut(200); }

    $visor.find(".visor-cerrar").on("click", cerrarVisor);
    $visor.find(".visor-anterior").on("click", function () { mostrarEnVisor(indiceVisor - 1); });
    $visor.find(".visor-siguiente").on("click", function () { mostrarEnVisor(indiceVisor + 1); });
    // Clic en el fondo oscuro cierra el visor
    $visor.on("click", function (e) { if (e.target === this) cerrarVisor(); });

    // Teclado: flechas para navegar y Escape para cerrar
    $(document).on("keydown", function (e) {
        if (!$visor.is(":visible")) return;
        if (e.key === "Escape") cerrarVisor();
        if (e.key === "ArrowLeft") mostrarEnVisor(indiceVisor - 1);
        if (e.key === "ArrowRight") mostrarEnVisor(indiceVisor + 1);
    });
});
