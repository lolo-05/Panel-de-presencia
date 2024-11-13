document.addEventListener("DOMContentLoaded", () => {
    const locations = document.querySelectorAll(".location");

    // Lista de ubicaciones y coordenadas
    const ubicaciones = [
        { id: "ubicacion1", nombre: "Fin de la Jornada", latitud: null, longitud: null },
        { id: "ubicacion2", nombre: "Utrera", latitud: 37.2071, longitud: -5.8204 },
        { id: "ubicacion3", nombre: "Cerrado", latitud: 37.1294, longitud: -5.8377 },
        { id: "ubicacion4", nombre: "Coronil", latitud: 37.0855, longitud: -5.6115 },
        { id: "ubicacion5", nombre: "Otra Localizacion", latitud: null, longitud: null },
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

            if (!personaDiv) {
                personaDiv = document.createElement("div");
                personaDiv.className = "person";
                personaDiv.dataset.nombre = personaNombre;
                personaDiv.textContent = personaNombre;
            } else if (personaDiv.parentNode) {
                personaDiv.parentNode.removeChild(personaDiv);
            }

            const nuevaUbicacion = document.getElementById(ubicacionCercana.id);
            if (nuevaUbicacion) {
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
        event.preventDefault();
        obtenerUbicacion();
    });
});

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDOHPagA5tTsapHT7mLp9Go-JCAVc4ChhI",
    authDomain: "ubicaion-8ef85.firebaseapp.com",
    projectId: "ubicaion-8ef85",
    storageBucket: "ubicaion-8ef85.firebasestorage.app",
    messagingSenderId: "629776815605",
    appId: "1:629776815605:web:713437877558e185d6fcbc",
    measurementId: "G-2943V443QZ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
