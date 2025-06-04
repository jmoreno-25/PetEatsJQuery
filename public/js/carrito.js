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

// Verificar que los valores son correctos antes de enviarlos
console.log("Subtotal:", subtotal);
console.log("IVA:", iva);
console.log("Total:", total);

const detalles = carrito.map(item => ({
  PRD_ID: item.id,
  DF_CANTIDAD: item.cantidad,
  DF_PRECIO: item.precio
}));

// Verificar detalles
console.log("Detalles de los productos:", detalles);

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
    console.log("Respuesta de la API:", response);
    const facturaId = response.IdFactura || response;

    // Verificar si los datos de la factura se recibieron correctamente
    console.log("Factura recibida:", facturaId);
    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

// Mapea el carrito para crear los detalles que se enviarán
    const detallespdf = carrito.map(item => ({
      PRD_ID: item.id,  // ID del producto
      DF_CANTIDAD: item.cantidad,  // Cantidad de productos
      DF_PRECIO: item.precio,  // Precio del producto
      nombre: item.nombre  // Nombre del producto
    }));
    const factura = {
      id: facturaId,
      cliente: {
        nombre: usuario.CLI_NOMBRE,
        apellido: usuario.CLI_APELLIDO,
        cedula: usuario.CLI_CEDULA_RUC,
        correo: usuario.USUARIO_CORREO,
        telefono: usuario.CLI_TELEFONO
      },
      subtotal: subtotal,
      iva: iva,
      total: total,
      detalles: detallespdf
    };

    console.log("Factura lista para generar PDF:", factura);

    // Generar el PDF con los detalles de la factura
    generarPDF(factura);
    // Si fue exitoso, rediriges
    //sessionStorage.removeItem("carrito"); // Limpiamos el carrito
    //window.location.href = "/public/pages/Carrito/Confirmacion.html";
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

//  Función para mantener el contador actualizado en todas las páginas
function actualizarContadorCarrito() {
  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  const totalCantidad = carrito.reduce((sum, p) => sum + (p.cantidad || 0), 0);
  const contador = document.getElementById("contador-carrito");
  if (contador) {
    contador.textContent = totalCantidad;
    contador.style.display = totalCantidad > 0 ? "inline-block" : "none";
  }
}

//  Ejecutar al cargar la página del carrito
document.addEventListener("DOMContentLoaded", function() {
  cargarCarrito();
  actualizarContadorCarrito();
});

function generarPDF(factura) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Cabecera de la factura
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text( `FACTURA: ${factura.id}`, 105, 20, null, null, 'center'); // Centrado en la parte superior

  // Información de la empresa
  doc.setFontSize(12);
  doc.text("PetEats", 20, 40);
  doc.text("Dirección: Quito", 20, 50);
  doc.text("Teléfono: 0983707315", 20, 60);

   // Datos del cliente
  doc.text("FACTURAR A:", 120, 40);
  doc.text(`Nombre: ${factura.cliente.nombre} ${factura.cliente.apellido}`, 120, 50);
  doc.text(`Cédula: ${factura.cliente.cedula}`, 120, 60);
  doc.text(`Correo: ${factura.cliente.correo}`, 120, 70);
  doc.text(`Teléfono: ${factura.cliente.telefono}`, 120, 80);


  // Datos de la factura
  doc.text("FECHA: " + new Date().toLocaleDateString(), 20, 70);

  // Tabla de productos
  doc.setFontSize(10);
  doc.setLineWidth(0.5);
  doc.line(20, 120, 190, 120);  // Línea superior de la tabla
  doc.text("DESCRIPCIÓN", 20, 130);
  doc.text("CANTIDAD", 70, 130);
  doc.text("PRECIO UNITARIO", 110, 130);
  doc.text("TOTAL", 160, 130);

  doc.line(20, 135, 190, 135);  // Línea debajo del encabezado de la tabla

  let y = 140; // Posición Y para las filas de la tabla

  factura.detalles.forEach((producto, index) => {
    doc.text(producto.nombre, 20, y);
    doc.text(producto.DF_CANTIDAD.toString(), 70, y);
    doc.text(producto.DF_PRECIO.toFixed(2), 110, y);
    doc.text((producto.DF_CANTIDAD * producto.DF_PRECIO).toFixed(2), 160, y);
    y += 10;
  });

  // Subtotales y total
  doc.line(20, y, 190, y);  // Línea inferior de la tabla
  doc.text("SUBTOTAL", 100, y + 30);
  doc.text(`$${factura.subtotal.toFixed(2)}`, 160, y + 30);

  doc.text("IVA 15%", 100, y + 40);
  doc.text(`$${factura.iva.toFixed(2)}`, 160, y + 40);

  doc.line(20, y + 50, 190, y + 50);  // Línea del total
  doc.text("TOTAL", 100, y + 60);
  doc.text(`$${factura.total.toFixed(2)}`, 160, y + 60);

  // Pie de página
  doc.setFontSize(10);
  doc.text("Gracias por su confianza", 20, y + 90);

  // Descargar el PDF
  doc.save(`factura_${factura.id}_de_${factura.cliente.nombre}_${factura.cliente.apellido}.pdf`);
}
