function iniciarBusqueda() {
  const lupa = document.querySelector(".busqueda-toggle");
  const input = document.getElementById("inputBuscar");

  if (lupa && input) {
    lupa.addEventListener("click", function () {
      const visible = input.style.display === "inline-block";
      input.style.display = visible ? "none" : "inline-block";
      if (!visible) input.focus();
    });

    input.addEventListener("input", function () {
      const filtro = input.value.toLowerCase();
      const productos = document.querySelectorAll(".tarjeta_producto");

      productos.forEach(producto => {
        const nombre = producto.getAttribute("data-nombre").toLowerCase();
        producto.style.display = nombre.includes(filtro) ? "block" : "none";
      });
    });
  }
}
