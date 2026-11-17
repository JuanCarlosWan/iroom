const pais_intro = document.getElementById("mostrar-pais");
let listaPaises = ["ESPAÑA","PORTUGAL"]; /*todo en mayuscula, porque luego uso la funcion de .toUpperCase*/
function verificar(){
    let texto_limpio = pais_intro.value.trim().toUpperCase();
    if(texto_limpio.length === 0){
        salida.textContent = "No hay dato introducido";
        salida.classList.add("error");
        // Apararicion de la ventana de Error
        return;
    }
    else if(!listaPaises.includes(texto_limpio)){
        salida.textContent = "País introducido no es correcto";
        salida.classList.add("error");
        // Aparicion de la ventana de Error
        return;
    }


}
