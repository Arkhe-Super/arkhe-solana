const switchModo = document.getElementById("switch");

switchModo.addEventListener("change", function () {

    document.body.classList.toggle("modo-escuro");
    document.body.classList.toggle("modo-claro");

});