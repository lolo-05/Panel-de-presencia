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


// Función para registrar ubicación
async function registrarUbicacion(nombre, ubicacion) {
    try {
        await db.collection("ubicaciones").doc(nombre).set({
            nombre: nombre,
            ubicacion: ubicacion,
            timestamp: new Date()
        });
        console.log("Ubicación registrada correctamente.");
    } catch (error) {
        console.error("Error al registrar la ubicación:", error);
    }
}

// Cuando se envíe el formulario
document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("username").value;
    const ubicacion = determinarUbicacion(); // Ajusta esta función según tu lógica
    registrarUbicacion(nombre, ubicacion);
});

// Función para obtener y mostrar las ubicaciones en tiempo real
function mostrarUbicaciones() {
    db.collection("ubicaciones").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const container = document.querySelector(".locations");
        container.innerHTML = ""; // Limpia la lista antes de actualizar

        snapshot.forEach((doc) => {
            const data = doc.data();
            const ubicacionDiv = document.createElement("div");
            ubicacionDiv.className = "person";
            ubicacionDiv.textContent = `${data.nombre}: ${data.ubicacion}`;
            container.appendChild(ubicacionDiv);
        });
    });
}

// Llama a mostrarUbicaciones para comenzar a escuchar los cambios
mostrarUbicaciones();
