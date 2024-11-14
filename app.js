document.addEventListener("DOMContentLoaded", () => {
    // Lista de ubicaciones y coordenadas
    const ubicaciones = [
        { id: "ubicacion1", nombre: "Fin de la Jornada", latitud: null, longitud: null },
        { id: "ubicacion2", nombre: "Utrera", latitud: 37.2071, longitud: -5.8204 },
        { id: "ubicacion3", nombre: "Cerrado", latitud: 37.1294, longitud: -5.8377 },
        { id: "ubicacion4", nombre: "Coronil", latitud: 37.0855, longitud: -5.6115 },
        { id: "ubicacion5", nombre: "Otra Localización", latitud: null, longitud: null },
    ];

    // Función para calcular la distancia entre dos puntos
    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en km
    }

    // Función para asignar la ubicación más cercana
    function asignarUbicacionMasCercana(lat, lon) {
        let ubicacionCercana = null;
        let distanciaMinima = Infinity;
        const distanciaLimite = 2; // Límite de 2 km

        ubicaciones.forEach(ubicacion => {
            if (ubicacion.latitud && ubicacion.longitud) {
                const distancia = calcularDistancia(lat, lon, ubicacion.latitud, ubicacion.longitud);
                if (distancia < distanciaMinima) {
                    distanciaMinima = distancia;
                    ubicacionCercana = ubicacion;
                }
            }
        });

        // Si está fuera del rango, asignar a "Otra Localización"
        if (distanciaMinima > distanciaLimite) {
            ubicacionCercana = ubicaciones.find(ubic => ubic.id === "ubicacion5");
        }

        if (ubicacionCercana) {
            console.log(`Ubicación asignada: ${ubicacionCercana.nombre}`);
            const personaNombre = document.getElementById("username").value;
            let personaDiv = document.querySelector(`.person[data-nombre='${personaNombre}']`);

            // Crear la personaDiv si no existe
            if (!personaDiv) {
                personaDiv = document.createElement("div");
                personaDiv.className = "person";
                personaDiv.dataset.nombre = personaNombre;
                personaDiv.textContent = personaNombre;
            }

            // Si la persona ya está en la ubicación asignada, no hacer nada
            const nuevaUbicacion = document.getElementById(ubicacionCercana.id);
            if (nuevaUbicacion && !nuevaUbicacion.contains(personaDiv)) {
                // Remover de la ubicación anterior y agregar a la nueva
                if (personaDiv.parentNode) {
                    personaDiv.parentNode.removeChild(personaDiv);
                }
                nuevaUbicacion.appendChild(personaDiv);
            }
        }
    }

    // Función para obtener la ubicación del usuario
    function obtenerUbicacion() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(posicion => {
                const latitud = posicion.coords.latitude;
                const longitud = posicion.coords.longitude;
                console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);
                asignarUbicacionMasCercana(latitud, longitud);
            }, error => {
                console.error("Error al obtener la ubicación", error);
            });
        } else {
            console.error("La geolocalización no es compatible con este navegador.");
        }
    }

    // Manejar el envío del formulario de registro
    document.getElementById("registerForm").addEventListener("submit", event => {
        event.preventDefault(); // Evita que se recargue la página
        obtenerUbicacion();
    });
});

// Importa las funciones necesarias
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Inicializa la base de datos
const db = getDatabase();

// Selecciona el formulario y el campo de nombre
const registerForm = document.getElementById('registerForm');
const usernameSelect = document.getElementById('username');

// Escucha el evento de envío del formulario
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Obtiene el valor seleccionado en el formulario
  const username = usernameSelect.value;
  const ubicacion = "Utrera"; // Aquí puedes ajustar según la lógica que desees
  const tiempo = new Date().toLocaleTimeString(); // Guarda la hora actual

  // Envía los datos a Firebase
  set(ref(db, 'usuarios/' + username), {
    ubicacion: ubicacion,
    tiempo: tiempo
  }).then(() => {
    console.log('Datos guardados exitosamente');
  }).catch((error) => {
    console.error('Error al guardar datos:', error);
  });
});
