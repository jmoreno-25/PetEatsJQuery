function agregarAlCarrito(id, nombre, precio, imagen) {
  let cantidad = parseInt(document.getElementById('cantidad-' + id).value);
  if (cantidad <= 0) return;

  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ id, nombre, precio, cantidad, imagen });
  }

  sessionStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();

  const boton = document.getElementById('cantidad-' + id);
  animarProductoAlCarrito(boton);
}

function animarProductoAlCarrito(origenElemento) {
  const carritoIcono = document.getElementById("carrito-icono");
  const origenRect = origenElemento.getBoundingClientRect();
  const destinoRect = carritoIcono.getBoundingClientRect();

  const circulo = document.createElement("div");
  circulo.className = "animacion-circulo";
  document.body.appendChild(circulo);

  circulo.style.top = origenRect.top + "px";
  circulo.style.left = origenRect.left + "px";

  requestAnimationFrame(() => {
    circulo.style.top = destinoRect.top + "px";
    circulo.style.left = destinoRect.left + "px";
    circulo.style.transform = "scale(1.5)";
  });

  setTimeout(() => {
    document.body.removeChild(circulo);
  }, 800);
}
