const API_BASE_URL = "https://backendpeteatsclient.runasp.net/api/productos";
const API_BASE_URL_CATEGORIAS = "https://backendpeteats.runasp.net/api/productos/categorias";

let productos = [];
let categorias = [];

// ✅ Obtener ?categoria=Nombre desde la URL
function getCategoriaDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categoria"); // ejemplo: "Alimento"
}

// ✅ Renderizar productos
function renderizarProductos(lista) {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "tarjeta_producto";
    card.setAttribute("data-nombre", p.PRD_NOMBRE);

    card.innerHTML = `
      <img src="${p.PRD_IMAGEN}" alt="${p.PRD_NOMBRE}">
      <h3>${p.PRD_NOMBRE}</h3>
      <p class="precio">$${p.PRD_PRECIO.toFixed(2)}</p>
      <div class="acciones_producto">
        <label for="cantidad-${p.PRD_ID}">Cantidad:</label>
        <input type="number" id="cantidad-${p.PRD_ID}" class="cantidad_producto" min="0" max="200" placeholder="Seleccione" step="1" />
      </div>
      <button class="añadir_carrito" onclick="agregarAlCarrito(${p.PRD_ID}, '${p.PRD_NOMBRE}', ${p.PRD_PRECIO}, '${p.PRD_IMAGEN}')">
        Agregar al carrito
      </button>
    `;
    contenedor.appendChild(card);
  });
}

// ✅ Cargar categorías y detectar filtro por nombre
async function cargarCategoriasYFiltrarSiEsNecesario() {
  try {
    const response = await fetch(API_BASE_URL_CATEGORIAS);
    if (!response.ok) throw new Error("Error al cargar categorías");

    categorias = await response.json();

    const select = document.getElementById("selectCategoria");
    if (select) {
      select.innerHTML = "";

      const optionTodas = document.createElement("option");
      optionTodas.value = "todas";
      optionTodas.textContent = "Filtrar por categoría";
      select.appendChild(optionTodas);

      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = String(cat.CAT_ID);
        option.textContent = cat.CAT_DESCRIPCION;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        const catId = select.value;
        const activa = document.getElementById("categoria-activa");
        if (!activa) return;

        if (catId === "todas") {
          renderizarProductos(productos);
          activa.textContent = "Todas las categorías";
        } else {
          const filtrados = productos.filter(p => String(p.CAT_ID) === catId);
          renderizarProductos(filtrados);
          const categoriaNombre = categorias.find(c => c.CAT_ID == catId)?.CAT_DESCRIPCION;
          activa.textContent = categoriaNombre || "Categoría";
        }

        select.style.display = "none";
      });
    }

    // ⏳ Esperar hasta que productos esté lleno
    if (productos.length) aplicarFiltroDesdeURL();

  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

// ✅ Aplica el filtro usando el nombre de categoría
function aplicarFiltroDesdeURL() {
  const nombreCategoria = getCategoriaDesdeURL();
  if (!nombreCategoria) {
    renderizarProductos(productos);
    return;
  }

  const categoria = categorias.find(c => c.CAT_DESCRIPCION.toLowerCase() === nombreCategoria.toLowerCase());
  if (!categoria) {
    renderizarProductos(productos);
    return;
  }

  const productosFiltrados = productos.filter(p => p.CAT_ID === categoria.CAT_ID);
  renderizarProductos(productosFiltrados);
}

// ✅ Al cargar
document.addEventListener("DOMContentLoaded", () => {
  cargarCategoriasYFiltrarSiEsNecesario();

  $.ajax({
    url: API_BASE_URL,
    method: 'GET',
    success: function (data) {
      productos = data;

      if (categorias.length) aplicarFiltroDesdeURL(); // si ya están cargadas
      else renderizarProductos(productos); // si no hay filtro
    },
    error: function (xhr, status, error) {
      console.error("Error al cargar productos:", error);
    }
  });

  const activa = document.getElementById("categoria-activa");
  const select = document.getElementById("selectCategoria");

  if (activa && select) {
    activa.addEventListener("click", () => {
      select.style.display = select.style.display === "block" ? "none" : "block";
    });
  }
});
