// /public/js/carrito.js
API_BASE_URL = "http://backendpeteatsclient.runasp.net/api/facturas"; // Cambia esto por la URL de tu API de productos
API_BASE_URL_DETALLE = "http://backendpeteatsclient.runasp.net/api/detallefacturas"; // Cambia esto por la URL de tu API
function cargarCarrito() {
  const contenedor = document.getElementById("carrito-contenedor");
  const total = document.getElementById("total-carrito");

  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  contenedor.innerHTML = "";

  let subtotal = 0;

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en el carrito.</p>";
    total.textContent = "0.00";
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
}
const carrito = JSON.parse(sessionStorage.getItem("carrito"));
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
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

  // Crear la factura (cabecera)
  $.ajax({
    url: API_BASE_URL,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      CLI_CEDULA_RUC: usuario.CLI_CEDULA_RUC,
      FAC_SUBTOTAL: subtotal,
      FAC_IVA: iva,
      FAC_TOTAL: total
    }),
    success: function(response) {
      const facturaId = response.facturaId || response;

      // Mapear carrito a detalles con las propiedades esperadas
      const detalles = carrito.map(item => ({
        PRD_ID: item.id,
        DF_CANTIDAD: item.cantidad,
        DF_PRECIO: item.precio
      }));

      // Enviar detalles de factura
      enviarDetallesFactura(facturaId, detalles)
        .done(() => {
          sessionStorage.removeItem("carrito");
          window.location.href = "/public/pages/Carrito/Confirmacion.html";
        })
        .fail(() => {
          alert("Error al guardar los detalles del pedido");
        });
    },
    error: function() {
      alert("Error al crear la factura");
    }
  });
}

function eliminarProducto(id) {
  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  carrito = carrito.filter(p => p.id !== id);
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();
}

// function completarPedido() {
//   sessionStorage.removeItem("carrito");
//   window.location.href = "/public/paginas/Carrito/Confirmacion.html";
// }

document.addEventListener("DOMContentLoaded", cargarCarrito);
