const API_BASE_URL_STOCK = "https://backendpeteats.runasp.net/api/integracion/stock";

function agregarAlCarrito(id, nombre, precio, imagen) {
  let cantidad = parseInt(document.getElementById('cantidad-' + id).value);
  if (cantidad <= 0) return;

  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
 console.log("Carrito actual:", carrito);
 console.log("API_BASE_URL_STOCK:", API_BASE_URL_STOCK + "?idProducto=" + id + "&cantidad=" + cantidad);
  fetch(API_BASE_URL_STOCK + "?idProducto=" + id + "&cantidad=" + cantidad)
    .then(response => response.json())
    .then(data => {
      console.log("Respuesta del servidor:", data);
      if (data == true) {
        console.log("Producto agregado al carrito:", data);
        const existente = carrito.find(p => p.id === id);
        if (existente) {
          existente.cantidad += cantidad;
        } else {
          carrito.push({ id, nombre, precio, cantidad, imagen });
        }
        // Guardar carrito actualizado
        sessionStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarContadorCarrito();

        // Animar
        const boton = document.getElementById('cantidad-' + id);
        animarProductoAlCarrito(boton);

      } else {
        alert("Stock insuficiente para el producto: " + nombre );
      }
    })
    .catch(error => {
      console.error("Error al conectar con el servidor:", error);
      alert("No se pudo agregar el producto al carrito. Inténtalo más tarde.");
    });
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
