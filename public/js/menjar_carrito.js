// /public/js/menjar_carrito.js

function agregarAlCarrito(id, nombre, precio, imagen) {
  let cantidad = parseInt(document.getElementById('cantidad-' + id).value);

  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ id, nombre, precio, cantidad, imagen });
  }

  sessionStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`Producto agregado al carrito:\n${nombre} x${cantidad}`);
}
