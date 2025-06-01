const API_BASE_URL = "http://backendpeteatsclient.runasp.net/api/Productos/productos-destacados";

function cargarProductosDestacados() {
  $.ajax({
    url: API_BASE_URL,
    method: 'GET',
    success: function(data) {
      const contenedor = document.getElementById("productos-destacados");
      contenedor.innerHTML = ""; // Limpiar contenido previo

      data.forEach(p => {
        const card = document.createElement("div");
        card.className = "tarjeta_producto";
        card.setAttribute("data-nombre", p.PRD_NOMBRE);

        card.innerHTML = `
          <span class="etiqueta_nuevo">★</span>
          <img src="${p.PRD_IMAGEN}" alt="${p.PRD_NOMBRE}" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
          <h3>${p.PRD_NOMBRE}</h3>
          <p class="precio">$${p.PRD_PRECIO.toFixed(2)}</p>

          <div class="acciones_producto">
            <label for="cantidad-${p.PRD_ID}">Cantidad:</label>
            <input type="number" id="cantidad-${p.PRD_ID}" class="cantidad_producto" min="0" max="200" placeholder="Seleccione" step="1" />
          </div>

          <button class="añadir_carrito"
            onclick="agregarAlCarrito(${p.PRD_ID}, '${p.PRD_NOMBRE}', ${p.PRD_PRECIO}, '${p.PRD_IMAGEN}', document.getElementById('cantidad-${p.PRD_ID}').value)">
            Agregar al carrito
          </button>
        `;

        contenedor.appendChild(card);
      });
    },
    error: function(xhr, status, error) {
      console.error("Error al cargar productos destacados:", error);
    }
  });
}

// ✅ Función central de carrito compatible con productos normales y destacados
function agregarAlCarrito(id, nombre, precio, imagen, cantidadSeleccionada = 1) {
  const cantidad = parseInt(cantidadSeleccionada);
  if (isNaN(cantidad) || cantidad < 1) return;

  const producto = {
    id,
    nombre,
    precio,
    imagen,
    cantidad
  };

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const index = carrito.findIndex(p => p.id === id);

  if (index !== -1) {
    carrito[index].cantidad += cantidad;
  } else {
    carrito.push(producto);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`🛒 ${nombre} agregado al carrito (${cantidad})`);
}

$(document).ready(function () {
  cargarProductosDestacados();
});
