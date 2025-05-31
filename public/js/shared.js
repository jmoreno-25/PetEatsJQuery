function actualizarContadorCarrito() {
  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  const totalCantidad = carrito.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const contador = document.getElementById("contador-carrito");
  if (contador) {
    contador.textContent = totalCantidad;
    contador.style.display = totalCantidad > 0 ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", function() {
  actualizarContadorCarrito();
});
