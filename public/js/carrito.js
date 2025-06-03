// /public/js/carrito.js

const API_BASE_URL = "https://backendpeteatsclient.runasp.net/api/facturas";
const API_BASE_URL_DETALLE = "https://backendpeteatsclient.runasp.net/api/detallefacturas";

function cargarCarrito() {
  const contenedor = document.getElementById("carrito-contenedor");
  const total = document.getElementById("total-carrito");

  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

  contenedor.innerHTML = "";
  let subtotal = 0;

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en el carrito.</p>";
    total.textContent = "0.00";
    actualizarContadorCarrito();
    return;
  }

  carrito.forEach(p => {
    const card = document.createElement("div");
    card.className = "tarjeta_producto";

    const sub = p.precio * p.cantidad;
    subtotal += sub;

    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" style="width:100%; height:180px; object-fit:cover; border-radius:10px;">
      <h3>${p.nombre}</h3>
      <p>Precio: $${p.precio.toFixed(2)}</p>
      <p>Cantidad: ${p.cantidad}</p>
      <p><strong>Subtotal:</strong> $${sub.toFixed(2)}</p>
      <button class="btn-cerrar-sesion" onclick="eliminarProducto(${p.id})">Eliminar</button>
    `;

    contenedor.appendChild(card);
  });

  const iva = subtotal * 0.15;
  const totalFinal = subtotal + iva;

  const resumen = `
    <p>Subtotal: $${subtotal.toFixed(2)}</p>
    <p>IVA (15%): $${iva.toFixed(2)}</p>
    <h3>Total: $${totalFinal.toFixed(2)}</h3>
  `;

  total.innerHTML = resumen;
  actualizarContadorCarrito();
}

function calcularTotales(carrito) {
  let subtotal = 0;
  carrito.forEach(item => {
    subtotal += item.precio * item.cantidad;
  });
  const iva = subtotal * 0.15;
  const total = subtotal + iva;
  return { subtotal, iva, total };
}

function enviarDetallesFactura(facturaId, detalles) {
  const detallesConFactura = detalles.map(d => ({
    FAC_ID: facturaId,
    PRD_ID: d.PRD_ID,
    DF_CANTIDAD: d.DF_CANTIDAD,
    DF_PRECIO: d.DF_PRECIO
  }));

  return $.ajax({
    url: API_BASE_URL_DETALLE,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(detallesConFactura),
  });
}

function completarPedido() {
  const carrito = JSON.parse(sessionStorage.getItem("carrito"));
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  if (!usuario || !usuario.CLI_CEDULA_RUC) {
    alert("Debes iniciar sesión para completar el pedido");
    return;
  }

  if (!carrito || carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const { subtotal, iva, total } = calcularTotales(carrito);
  const detalles = carrito.map(item => ({
        PRD_ID: item.id,
        DF_CANTIDAD: item.cantidad,
        DF_PRECIO: item.precio
      }));
  $.ajax({
    url: API_BASE_URL,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      Cedula: usuario.CLI_CEDULA_RUC,
      SubTotal: subtotal,
      Iva: iva,
      Total: total,
      cuentaDest: 114,
      Detalles: detalles
    }),
    success: function(response) {
    // Si fue exitoso, rediriges
    sessionStorage.removeItem("carrito"); // Limpiamos el carrito
    window.location.href = "/public/pages/Carrito/Confirmacion.html";
    },
    error: function(jqXHR) {
      // Intentamos obtener el mensaje de error devuelto por la API
      let mensaje = "Error desconocido";

      if (jqXHR.responseJSON && jqXHR.responseJSON.Message) {
        // En caso de que uses InternalServerError(e) que suele enviar Message
        mensaje = jqXHR.responseJSON.Message;
      } else if (jqXHR.responseText) {
        // Si envías BadRequest("texto") el texto está en responseText
        mensaje = jqXHR.responseText;
      }

      alert("Error: " + mensaje);
    }
  });
}

function eliminarProducto(id) {
  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  carrito = carrito.filter(p => p.id !== id);
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();
}

// ✅ Función para mantener el contador actualizado en todas las páginas
function actualizarContadorCarrito() {
  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  const totalCantidad = carrito.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const contador = document.getElementById("contador-carrito");
  if (contador) {
    contador.textContent = totalCantidad;
    contador.style.display = totalCantidad > 0 ? "inline-block" : "none";
  }
}

// ✅ Ejecutar al cargar la página del carrito
document.addEventListener("DOMContentLoaded", function() {
  cargarCarrito();
  actualizarContadorCarrito();
});
