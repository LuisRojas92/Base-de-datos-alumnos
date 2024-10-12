// PROTOTIPO ALUMNO
function Alumno(nombre, apellidos, edad) {
  this.nombre = nombre;
  this.apellidos = apellidos;
  this.edad = edad;
  this.materias = [];
}

// METODOS DE ALUMNO

Alumno.prototype.guardarCalificacion = function (materiaNombre, calificacion) {
  const result = this.validarMateria(materiaNombre);

  // Validación para guardar calificación solo en materias inscritas
  if (result !== -1) {
    // Validación para guardar calificación solo una vez por materia
    if (this.materias[result].calificacion == null) {
      this.materias[result].calificacion = calificacion;
    } else {
      showErrors("NotNullCali");
    }
  } else {
    showErrors("NoInscrito");
  }
};

Alumno.prototype.inscribirMateria = function (materia) {
  const result = this.validarMateria(materia.nombre);
  // Validación para que el alumno no tenga materias repetidas
  if (result === -1) {
    this.materias.push(materia);
  } else {
    showErrors("Inscrito");
  }
};

Alumno.prototype.validarMateria = function (materiaNombre) {
  return this.materias.findIndex((m) => m.nombre === materiaNombre);
};

Alumno.prototype.calcularPromedio = function () {
  const materiasConCalificacion = this.materias.filter(
    (materia) => materia.calificacion !== null
  );

  if (materiasConCalificacion.length === 0) return NaN;

  const sumaCalificaciones = materiasConCalificacion.reduce(
    (acumulador, materia) => acumulador + materia.calificacion,
    0
  );

  const promedio = sumaCalificaciones / materiasConCalificacion.length;

  return promedio;
};

Alumno.prototype.obtenerDetallesCalificaciones = function () {
  return this.materias.map(
    (materia) =>
      `${materia.nombre}: ${materia.calificacion || "Sin calificación"}`
  );
};

// PROTOTIPO MATERIA
function Materia(nombre) {
  this.nombre = nombre;
  this.calificacion = null;
}

// PROTOTIPO CLASE
function Clase(nombre) {
  this.nombre = nombre;
  this.alumnosInscritos = [];
}

// METODOS DE CLASE

//Función para agregar alumnos a una clase
Clase.prototype.agregarAlumno = function (nuevoAlumno) {
  const result = this.validarAlumno(nuevoAlumno);
  if (result === -1) {
    this.alumnosInscritos.push(nuevoAlumno);
  }
};

//Función para saber si el alumno existe o no en el array de alumnos inscritos
Clase.prototype.validarAlumno = function (alumno) {
  return this.alumnosInscritos.findIndex(
    (a) =>
      a.nombre === alumno.nombre &&
      a.apellidos === alumno.apellidos &&
      a.edad === alumno.edad
  );
};

// SECCION ALTA DE ALUMNOS

function altaAlumno() {
  const nombre = document.getElementById("nombre").value.toUpperCase();
  const apellidos = document.getElementById("apellidos").value.toUpperCase();
  const edad = parseInt(document.getElementById("edad").value);

  // expresion para que solo se admitan cadenas de texto con letras al inicio y al final
  const regex = /^[a-zA-ZñÑ]+(?:\s[a-zA-ZñÑ]+)*$/;

  //Validacion para que solo se inscriban personas de 18 o mas
  if (edad > 17) {
    // validacion para que solo se guarden los datos que cumplen con la expresion
    if (regex.test(nombre) && regex.test(apellidos)) {
      const alumno = new Alumno(nombre, apellidos, edad);
      const indiceAlumno = obtenerIndiceAlumno(obtenerAlumnos(), alumno);
      // Validacion para que no existan alumnos repetidos
      if (indiceAlumno == -1) {
        guardarAlumno(alumno);
      } else {
        showErrors("ExisteAlumno");
      }
    } else {
      showErrors("Texto");
    }
  } else {
    showErrors("Edad");
  }
  mostrarAlumnosInscripcion();
  mostrarAlumnosCal();
}

function guardarAlumno(alumno) {
  let alumnosArray = JSON.parse(localStorage.getItem("alumnos")) || [];
  alumnosArray.push(alumno);
  localStorage.setItem("alumnos", JSON.stringify(alumnosArray));
}

// SECCION CREAR CLASES

function crearClase() {
  const claseNombre = document
    .getElementById("materiaNombre")
    .value.toUpperCase();
  const clase = new Clase(claseNombre);
  const indiceClase = obtenerIndiceClase(obtenerClases(), clase);

  // Expresion para que los nombres de materias inicien y terminen con letras
  const regex = /^[a-zA-ZñÑ]+(?:\s[a-zA-ZñÑ]+)*$/;

  // validacion para que solo los nombres correctos se admitan
  if (regex.test(claseNombre)) {
    // Validacion para que no existan clases repetidas
    if (indiceClase == -1) {
      guardarClase(clase);
    } else {
      showErrors("ClaseInscrita");
    }
  } else {
    showErrors("TextoClase");
  }
  mostrarClasesInscripcion();
  mostrarClasesCal();
}

function guardarClase(clase) {
  let clasesArray = JSON.parse(localStorage.getItem("clases")) || [];
  clasesArray.push(clase);
  localStorage.setItem("clases", JSON.stringify(clasesArray));
}

// FUNCIONES PARA RECUPERAR ARRAYS ALUMNOS Y CLASES

function obtenerAlumnos() {
  const alumnosGuardados = JSON.parse(localStorage.getItem("alumnos")) || [];
  return alumnosGuardados.map((alumno) => {
    const { nombre, apellidos, edad, materias } = alumno;
    const nuevoAlumno = new Alumno(nombre, apellidos, edad);
    nuevoAlumno.materias = materias.map((materia) => {
      const nuevaMateria = new Materia(materia.nombre);
      nuevaMateria.calificacion = materia.calificacion; // Aseguramos que se recupere la calificación
      return nuevaMateria;
    });
    return nuevoAlumno;
  });
}

function obtenerClases() {
  const clasesGuardadas = JSON.parse(localStorage.getItem("clases")) || [];
  return clasesGuardadas.map((clase) => {
    const { nombre, alumnosInscritos } = clase;
    const nuevaClase = new Clase(nombre);
    nuevaClase.alumnosInscritos = alumnosInscritos;
    return nuevaClase;
  });
}

// SECCION INSCRIBIR ALUMNO A UNA CLASE

function asignarClase() {
  const alumnoSeleccionado = JSON.parse(
    document.getElementById("alumnosInscripcion").value
  );
  const materiaSeleccionada = document.getElementById(
    "materiasInscripcion"
  ).value;
  const nuevaMateria = new Materia(materiaSeleccionada);

  const alumnosArray = obtenerAlumnos();
  const clasesArray = obtenerClases();

  const indiceAlumno = obtenerIndiceAlumno(alumnosArray, alumnoSeleccionado);
  const indiceClase = obtenerIndiceClase(clasesArray, nuevaMateria);

  // Validacion para asignar clase solo si la clase y alumno existen
  if (indiceAlumno !== -1 && indiceClase !== -1) {
    alumnosArray[indiceAlumno].inscribirMateria(nuevaMateria);
    clasesArray[indiceClase].agregarAlumno(alumnosArray[indiceAlumno]);
    actualizarAlumno(alumnosArray);
    actualizarClase(clasesArray);
    console.log(alumnosArray[indiceAlumno]); //delete
    console.log(clasesArray); //delete
  } else {
    alert("Error: No se pudo encontrar al alumno.");
  }
}

//Funcion para que se muestren los alumnos en el selector
function mostrarAlumnosInscripcion() {
  const alumnos = obtenerAlumnos();
  const selectAlumnosInscripcion =
    document.getElementById("alumnosInscripcion");
  selectAlumnosInscripcion.innerHTML = "";

  alumnos.forEach((alumno) => {
    const option = document.createElement("option");
    option.text = `${alumno.nombre} ${alumno.apellidos}`;
    option.value = JSON.stringify(alumno);
    selectAlumnosInscripcion.appendChild(option);
  });
}

//Funcion para que se muestren las clases en el selector
function mostrarClasesInscripcion() {
  const clases = obtenerClases();
  const selectClasesInscripcion = document.getElementById(
    "materiasInscripcion"
  );
  selectClasesInscripcion.innerHTML = "";

  clases.forEach((clase) => {
    const option = document.createElement("option");
    option.text = clase.nombre;
    option.value = clase.nombre;
    selectClasesInscripcion.appendChild(option);
  });
}

//SECCION ASIGNAR CALIFICACIONES

function asignarCalificacion() {
  const alumnoSeleccionado = JSON.parse(
    document.getElementById("alumnosCal").value
  );
  const materiaSeleccionada = document.getElementById("materiasCal").value;
  const calificacion = parseFloat(
    document.getElementById("calificacion").value
  );

  const alumnosArray = obtenerAlumnos();

  const indiceAlumno = obtenerIndiceAlumno(alumnosArray, alumnoSeleccionado);

  // Validacion para que solo se guarden calificaciones en numeros positivos en un alumno
  if (indiceAlumno !== -1 && calificacion >= 0) {
    alumnosArray[indiceAlumno].guardarCalificacion(
      materiaSeleccionada,
      calificacion
    );
    actualizarAlumno(alumnosArray); // Asegura que esto esté actualizando bien
    console.log(alumnosArray[indiceAlumno]); // Verificar los resultados en la consola
  } else if (indiceAlumno == -1) {
    alert("Error: No se pudo encontrar al alumno.");
  } else {
    showErrors("NumNegativo");
  }
}

//Funcion para que se muestren los alumnos en los selectores
function mostrarAlumnosCal() {
  const alumnos = obtenerAlumnos();
  const selectAlumnosCal = document.getElementById("alumnosCal");
  selectAlumnosCal.innerHTML = "";

  alumnos.forEach((alumno) => {
    const option = document.createElement("option");
    option.text = `${alumno.nombre} ${alumno.apellidos}`;
    option.value = JSON.stringify(alumno);
    selectAlumnosCal.appendChild(option);
  });

  //mostrarMateriasPromedio();
}

//Funcion para que se muestren las clases en los selectores
function mostrarClasesCal() {
  const materias = obtenerClases();
  const selectMateriasCal = document.getElementById("materiasCal");
  selectMateriasCal.innerHTML = "";

  materias.forEach((materia) => {
    const option = document.createElement("option");
    option.text = materia.nombre;
    option.value = materia.nombre;
    selectMateriasCal.appendChild(option);
  });
}

//FUNCIONES AUXILIARES

function obtenerIndiceAlumno(alumnosArray, alumnoSeleccionado) {
  return alumnosArray.findIndex(
    (a) =>
      a.nombre === alumnoSeleccionado.nombre &&
      a.apellidos === alumnoSeleccionado.apellidos &&
      a.edad === alumnoSeleccionado.edad
  );
}

function obtenerIndiceClase(clasesArray, clase) {
  return clasesArray.findIndex((c) => c.nombre === clase.nombre);
}

function actualizarAlumno(alumnosArray) {
  localStorage.setItem("alumnos", JSON.stringify(alumnosArray));
}

function actualizarClase(clasesArray) {
  localStorage.setItem("clases", JSON.stringify(clasesArray));
}

function showErrors(tipo) {
  let error = document.getElementById(`error${tipo}`);

  error.classList.remove("oculto");
  error.classList.add("error");
  setTimeout(() => {
    error.classList.remove("error");
    error.classList.add("oculto");
  }, 6000);
}

//SECCION RESULTADOS

function buscarPorNombreApellido() {
  const query = prompt("Ingrese el nombre o apellido del alumno a buscar:");
  const alumnos = obtenerAlumnos();
  const resultados = alumnos.filter((alumno) => {
    const nombreCompleto = `${alumno.nombre} ${alumno.apellidos}`;
    return nombreCompleto.toLowerCase().includes(query.toLowerCase());
  });
  mostrarResultados(resultados);
}

function mostrarResultados(resultados) {
  ocultarTablaDiv("promedioAlumnosResultados");
  ocultarTablaDiv("mostrarResultadosCalificacion");
  const busquedaDiv = document.getElementById("busqueda");
  busquedaDiv.innerHTML = "";

  if (resultados.length === 0) {
    busquedaDiv.innerText = "No se encontraron resultados.";
  } else {
    const table = document.createElement("table");
    table.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Edad</th>
                <th>Materia</th>
                <th>Calificación</th>
            </tr>
        `;
    resultados.forEach((alumno) => {
      alumno.materias.forEach((materia) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${alumno.nombre}</td>
                <td>${alumno.apellidos}</td>
                <td>${alumno.edad}</td>
                <td>${materia.nombre}</td>
                <td>${
                  materia.calificacion !== null
                    ? materia.calificacion
                    : "Sin calificación"
                }</td>
            `;
        table.appendChild(row);
      });
    });
    busquedaDiv.appendChild(table);
  }
}

// Devuelve un array con los promedios de todos los alumnos con calificacion
function obtenerPromedioAlumnos() {
  const alumnos = obtenerAlumnos();
  const resultados = alumnos
    .map((alumno) => {
      const promedio = alumno.calcularPromedio();
      if (!isNaN(promedio)) {
        return {
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          promedio: promedio.toFixed(2),
          calificaciones: alumno.obtenerDetallesCalificaciones(),
        };
      }
    })
    .filter(Boolean); // Elimina del array a los alumnos cuyo promedio es NaN
  mostrarPromedioAlumnos(resultados);
}

function mostrarPromedioAlumnos(resultados) {
  ocultarTablaDiv("busqueda");
  ocultarTablaDiv("mostrarResultadosCalificacion");
  const promediosDiv = document.getElementById("promedioAlumnosResultados");
  promediosDiv.innerHTML = "";

  // Crear un div para la tabla
  const tablaDiv = document.createElement("div");

  // Crear la tabla
  const table = document.createElement("table");
  table.innerHTML = `
        <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Promedio</th>
        </tr>
    `;
  resultados.forEach((alumno) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${alumno.nombre}</td>
            <td>${alumno.apellidos}</td>
            <td>${alumno.promedio}</td>
        `;
    table.appendChild(row);
  });

  // Agregar la tabla al div
  tablaDiv.appendChild(table);

  // Agregar el div con la tabla al final del div "resultados"
  promediosDiv.appendChild(tablaDiv);
}

//Ordena alumnos por nombre
function ordenarAlumnosAscendente() {
  const alumnos = obtenerAlumnos();
  alumnos.sort((a, b) => {
    const nombreA = `${a.nombre} ${a.apellidos}`;
    const nombreB = `${b.nombre} ${b.apellidos}`;
    return nombreA.localeCompare(nombreB);
  });
  mostrarResultados(alumnos);
}

//Ordena alumnos por nombre
function ordenarAlumnosDescendente() {
  const alumnos = obtenerAlumnos();
  alumnos.sort((a, b) => {
    const nombreA = `${a.nombre} ${a.apellidos}`;
    const nombreB = `${b.nombre} ${b.apellidos}`;
    return nombreB.localeCompare(nombreA);
  });
  mostrarResultados(alumnos);
}

//Ordenar alumnos por calificacion
//Funcion Ordenar por calificacion Ascendente
function ordenarAlumnosCalificacionAscendente() {
  //const alumnos = obtenerAlumnos().filter(alumno => alumno.materias.some(materia => materia.calificacion !== null));
  const alumnos = obtenerAlumnos();
  const resultados = alumnos
    .map((alumno) => {
      const promedio = alumno.calcularPromedio();
      if (!isNaN(promedio)) {
        return {
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          promedio: promedio.toFixed(2),
        };
      }
    })
    .filter(Boolean);
  resultados.sort((a, b) => {
    const promedioA = a.promedio;
    const promedioB = b.promedio;
    return promedioB - promedioA;
  });
  mostrarCalificacionAD(resultados);
}
//Funcion Ordenar por calificacion Descendente
function ordenarAlumnosCalificacionDescendente() {
  //const alumnos = obtenerAlumnos().filter(alumno => alumno.materias.some(materia => materia.calificacion !== null));
  const alumnos = obtenerAlumnos();
  const resultados = alumnos
    .map((alumno) => {
      const promedio = alumno.calcularPromedio();
      if (!isNaN(promedio)) {
        return {
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          promedio: promedio.toFixed(2),
        };
      }
    })
    .filter(Boolean);
  resultados.sort((a, b) => {
    const promedioA = a.promedio;
    const promedioB = b.promedio;
    return promedioA - promedioB;
  });
  mostrarCalificacionAD(resultados);
}

function mostrarCalificacionAD(resultados) {
  ocultarTablaDiv("mostrarResultadosCalificacion");
  ocultarTablaDiv("busqueda");
  ocultarTablaDiv("promedioAlumnosResultados");
  const resultadosDiv = document.getElementById(
    "mostrarResultadosCalificacion"
  );
  resultadosDiv.innerHTML = "";

  // Crear un div para la tabla
  const tablaDiv = document.createElement("div");

  // Crear la tabla
  const table = document.createElement("table");
  table.innerHTML = `
        <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Calificacion</th>
        </tr>
    `;
  resultados.forEach((alumno) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${alumno.nombre}</td>
            <td>${alumno.apellidos}</td>
            <td>${alumno.promedio}</td>
        `;
    table.appendChild(row);
  });
  // Agregar la tabla al div
  tablaDiv.appendChild(table);

  // Agregar el div con la tabla al final del div "resultados"
  resultadosDiv.appendChild(tablaDiv);
}

// Funcion para que no se muestren varias tablas al mismo tiempo
function ocultarTablaDiv(id) {
  const div = document.getElementById(id);
  div.innerHTML = "";
}

function borrarDatos() {
  localStorage.removeItem("alumnos");
  localStorage.removeItem("clases");
  mostrarAlumnosInscripcion();
  mostrarClasesInscripcion();
  mostrarAlumnosCal();
  mostrarClasesCal();
  //mostrarMateriasPromedio();
}

// Estas dos funciones no se están llamando en el documento, tampoco se ha comprobado funcionalidad
// si sirven para desarrollar otras funcionalidades o apoyar en tu trabajo, úsenlas, adáptenlas y/o elimínenlas
function obtenerClasesPromedio() {
  const materias = obtenerClases();
  const selectMateriasPromedio = document.getElementById("materiasPromedio");
  selectMateriasPromedio.innerHTML = "";

  materias.forEach((materia) => {
    const option = document.createElement("option");
    option.text = materia.nombre;
    option.value = materia.nombre;
    selectMateriasPromedio.appendChild(option);
  });
}
function obtenerPromedioMateria() {
  const materiaSeleccionada = document.getElementById("materiasPromedio").value;
  const alumnos = obtenerAlumnos();
  const calificacionesMateria = alumnos.flatMap((alumno) => {
    const index = alumno.materias.indexOf(materiaSeleccionada);
    return index !== -1 ? [alumno.calificaciones[index]] : [];
  });
  if (calificacionesMateria.length === 0) {
    alert("No hay calificaciones registradas para esta materia.");
  } else {
    const promedio =
      calificacionesMateria.reduce((a, b) => a + b, 0) /
      calificacionesMateria.length;
    alert(
      `El promedio de la materia ${materiaSeleccionada} es: ${promedio.toFixed(
        2
      )}`
    );
  }
}

// Funciones para que cuando la página  se recargue o se guarden cambios, los datos en los selectors del html se sigan mostrando

mostrarAlumnosInscripcion();
mostrarClasesInscripcion();
mostrarAlumnosCal();
mostrarClasesCal();
