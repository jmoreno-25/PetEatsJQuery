API_BASE_URL = "https://backendpeteatsclient.runasp.net/api/usuario"; // Cambia esto por la URL de tu API

// Función para validar la cédula ecuatoriana
function validarCedula(cedula) {
  if (!/^[0-9]{10}$/.test(cedula)) {
    return false;
  }
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) {
    return false;
  }
  const digitos = cedula.split('').map(Number);
  const suma = digitos.slice(0, 9).reduce((acc, curr, index) => {
    if (index % 2 === 0) {
      const doble = curr * 2;
      acc += (doble > 9) ? doble - 9 : doble;
    } else {
      acc += curr;
    }
    return acc;
  }, 0);
  const modulo = suma % 10;
  const verificador = (modulo === 0) ? 0 : 10 - modulo;
  return verificador === digitos[9];
}

// Función para validar que el nombre y apellido no contengan números
function validarNombreApellido(nombre) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚÑñ\s]+$/.test(nombre);
}

// Función para validar teléfono
function validarTelefono(telefono) {
  return /^[0]{1}[0-9]{9}$/.test(telefono);  // Comienza con 0 y tiene 10 dígitos
}

// Función para validar contraseña segura
function validarContrasena(contrasena) {
  const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return regex.test(contrasena);
}
function validarCorreo(correo) {
  const regex = /^[a-zA-Z0-9._%+-]+@(?:gmail\.com|hotmail\.com|yahoo\.com|outlook\.com|puce\.edu\.ec|espe\.edu\.ec|uio\.edu\.ec|[\w.-]+\.(com|ec|edu\.ec|gob\.ec))$/i;
  return regex.test(correo);
}
// Función para iniciar sesión
function iniciarSesion() {
  const correo = document.getElementById("loginCorreo").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");

  // Paso 1: Validar si el correo y la contraseña no están vacíos
  if (!correo || !password) {
    error.textContent = "Correo y contraseña son obligatorios.";
    return;
  }
  document.getElementById("loadingSpinner").style.display = "flex";
  // Paso 3: Hacer la llamada AJAX para validar el usuario
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
        document.getElementById("loadingSpinner").style.display = "none";
      if (xhr.status === 401) {
        error.textContent = "Correo o contraseña incorrectos.";
      } else {
        error.textContent = "Error inesperado, intente más tarde.";
      }
    }
  });
}
// Función para registrar usuario
function registrarUsuario() {
  const cedula = document.getElementById("registroCedula").value.trim();
  const nombre = document.getElementById("registroNombre").value.trim();
  const apellido = document.getElementById("registroApellido").value.trim();
  const telefono = document.getElementById("registroTelefono").value.trim();
  const usuario = document.getElementById("registroNombreUsuario").value.trim();
  const correo = document.getElementById("registroCorreo").value.trim();
  const password = document.getElementById("registroPassword").value.trim();
  const confirmarContrasena = document.getElementById("registroConfirmar").value.trim();

  const error = document.getElementById("registroError");

  // Validaciones
  if (!validarCedula(cedula)) {
    error.textContent = "Cédula no válida. Debe ser un número de 10 dígitos que empiece con 0.";
    return;
  }
  if (!validarNombreApellido(nombre)) {
    error.textContent = "El nombre no puede contener números.";
    return;
  }
  if (!validarNombreApellido(apellido)) {
    error.textContent = "El apellido no puede contener números.";
    return;
  }
  if (!validarTelefono(telefono)) {
    error.textContent = "El teléfono debe tener 10 dígitos y empezar con 0.";
    return;
  }
  if(!validarCorreo(correo)){
    error.textContent = "El correo debe ser válido al contener @ y un dominio legitimo (.com,.ec,.edu)"
    return;
  }
  if (!validarContrasena(password)) {
    error.textContent = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";
    return;
  }
  if (password !== confirmarContrasena) {
    error.textContent = "Las contraseñas no coinciden.";
    return;
  }
  document.getElementById("loadingSpinner").style.display = "flex";
  // Paso 2: Realizar el registro
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
    // Si la solicitud es exitosa, redirigir a la página de login
    window.location.href = "/public/pages/Usuario/Login.html";
  },
  error: function (xhr, status, error) {
    // Mostrar los detalles del error en la consola
    console.error("Error al registrar usuario:");
    console.error("Estado:", status);
    console.error("Error:", error);
    console.error("Respuesta del servidor:", xhr.responseText);

    // Mostrar el mensaje de error en el frontend
    let errorMsg = "Error al registrar usuario, nombre de usuario o correo asociado a otra cuenta.";

    // Si la respuesta es un error específico (como el correo o el nombre de usuario ya existe), lo maneja
    if (xhr.status === 400) {
      try {
        const response = JSON.parse(xhr.responseText);
        errorMsg = response.error || "Error al registrar usuario, nombre de usuario o correo asociado a otra cuenta.";
      } catch (e) {
        errorMsg = "Error en el servidor, intente más tarde.";
      }
    }

    // Mostrar el mensaje de error en el elemento de error
    document.getElementById("registroError").textContent = errorMsg;
  }
});
}
// Función para guardar cliente en sessionStorage
function guardarClienteEnSessionStorage(usuario) {
  fetch(`https://backendpeteatsclient.runasp.net/api/usuario/${usuario}`)
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
