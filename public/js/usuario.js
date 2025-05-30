// /public/js/usuario.js
API_BASE_URL = "http://backendpeteatsclient.runasp.net/api/usuario"; // Cambia esto por la URL de tu API // Cambia esto por la URL de tu API
function iniciarSesion() {
  const correo = document.getElementById("loginCorreo").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");

  // Paso 1: validar usuario
  $.ajax({
    url: API_BASE_URL + "/validar-usuario",
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ Correo: correo, Password: password }),
    success: function () {
      // Si el usuario es válido, obtener sus datos
      $.ajax({
        url: API_BASE_URL + "/" + encodeURIComponent(correo), // o nombre de usuario
        method: 'GET',
        success: function (usuario) {
          sessionStorage.setItem("usuario", JSON.stringify(usuario));
          window.location.href = "/index.html";
        },
        error: function () {
          error.textContent = "Error al obtener datos del usuario.";
        }
      });
    },
    error: function (xhr) {
      if (xhr.status === 401) {
        error.textContent = "Correo o contraseña incorrectos.";
      } else {
        error.textContent = "Error inesperado, intente más tarde.";
      }
    }
  });
}


function registrarUsuario() {
  const cedula = document.getElementById("registroCedula").value.trim();
  const nombre = document.getElementById("registroNombre").value.trim();
  const apellido = document.getElementById("registroApellido").value.trim();
  const telefono = document.getElementById("registroTelefono").value.trim();
  const usuario = document.getElementById("registroNombreUsuario").value.trim();
  const correo = document.getElementById("registroCorreo").value.trim();
  const password = document.getElementById("registroPassword").value.trim();

  $.ajax({
    url: API_BASE_URL,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      Cedula: cedula,
      Nombre: nombre,
      Apellido: apellido,
      Telefono: telefono,
      Correo: correo,
      Password: password,
      Usuario: usuario
    }),
    success: function (data) {
      sessionStorage.setItem("usuario", JSON.stringify({ nombre, usuario }));
      window.location.href = "/index.html";
    },
    error: function (xhr, status, error) {
      console.error("Error al registrar usuario:", xhr.responseText || error);
      document.getElementById("registroError").innerText = "Error al registrar usuario. Intenta más tarde.";
    }
  });
}

function guardarClienteEnSessionStorage(clienteId) {
  fetch(`http://backendpeteatsclient.runasp.net/api/usuario/${usuario}`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener datos del cliente');
      return response.json();
    })
    .then(clienteData => {
      // Guardar en sessionStorage como string JSON
      sessionStorage.setItem('cliente', JSON.stringify(clienteData));
      console.log('Cliente guardado en sessionStorage');
    })
    .catch(error => {
      console.error('Error:', error);
    });
}