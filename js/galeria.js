// Práctica 3 - Apartado 1.2: galería de imágenes con jQuery
$(function () {

    // Cuadro informativo: al pasar el ratón se muestra la imagen en grande con su nombre
    $(".tira-imagenes img, .carrusel-pista img").hover(
        function () {
            $("#tooltip-galeria img").attr("src", $(this).attr("src"));
            $("#tooltip-galeria .tooltip-titulo").text($(this).attr("alt"));
            $("#tooltip-galeria .tooltip-info").text($(this).data("info"));
            $("#tooltip-galeria").show();
        },
        function () {
            $("#tooltip-galeria").hide();
        }
    );

    // El cuadro sigue al ratón (si no cabe a la derecha o abajo, se pone al otro lado)
    $(".tira-imagenes img, .carrusel-pista img").mousemove(function (e) {
        let x = e.clientX + 20;
        let y = e.clientY + 20;
        if (x + 340 > $(window).width()) x = e.clientX - 340;
        if (y + 300 > $(window).height()) y = e.clientY - 300;
        $("#tooltip-galeria").css({ left: x, top: y });
    });

    // Carrusel: las flechas mueven la fila de fotos de una en una
    let posicion = 0;

    function moverCarrusel(paso) {
        const anchoFoto = $(".carrusel-pista img").outerWidth(true);
        const fotosVisibles = Math.floor($(".carrusel-ventana").width() / anchoFoto);
        const ultima = $(".carrusel-pista img").length - fotosVisibles;

        posicion = posicion + paso;
        if (posicion > ultima) posicion = ultima;
        if (posicion < 0) posicion = 0;

        $(".carrusel-pista").animate({ left: -posicion * anchoFoto }, 400);
    }

    $("#carrusel-anterior").click(function () { moverCarrusel(-1); });
    $("#carrusel-siguiente").click(function () { moverCarrusel(1); });
});
