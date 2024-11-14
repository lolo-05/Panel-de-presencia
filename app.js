document.addEventListener("DOMContentLoaded", () => {
    // Lista de ubicaciones y coordenadas
    const ubicaciones = [
        { id: "ubicacion1", nombre: "Fin de la Jornada", latitud: null, longitud: null },
        { id: "ubicacion2", nombre: "Utrera", latitud: 37.2071, longitud: -5.8204 },
        { id: "ubicacion3", nombre: "Cerrado", latitud: 37.1294, longitud: -5.8377 },
        { id: "ubicacion4", nombre: "Coronil", latitud: 37.0855, longitud: -5.6115 },
        { id: "ubicacion5", nombre: "Otra Localización", latitud: null, longitud: null },
    ];

    // Función para calcular la distancia entre dos puntos (en kilómetros)
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

    // Función para asignar la ubicación más cercana según las coordenadas
    function asignarUbicacionMasCercana(lat, lon, usuarioId) {
        let ubicacionCercana = null;
        let distanciaMinima = Infinity;
        const distanciaLimite = 2; // Límite de 2 km

        // Buscar la ubicación más cercana
        ubicaciones.forEach(ubicacion => {
            if (ubicacion.latitud && ubicacion.longitud) {
                const distancia = calcularDistancia(lat, lon, ubicacion.latitud, ubicacion.longitud);
                if (distancia < distanciaMinima) {
                    distanciaMinima = distancia;
                    ubicacionCercana = ubicacion;
                }
            }
        });

        // Si la ubicación está fuera del límite, asignar "Otra Localización"
        if (distanciaMinima > distanciaLimite) {
            ubicacionCercana = ubicaciones.find(ubic => ubic.id === "ubicacion5");
        }

        // Guardar la ubicación en Firebase
        if (ubicacionCercana) {
            const dbRef = firebase.database().ref('usuarios/' + usuarioId);
            dbRef.set({
                ubicacion: ubicacionCercana.nombre,
                timestamp: new Date().toISOString()
            }).then(() => {
                console.log(`Ubicación de ${usuarioId} actualizada a: ${ubicacionCercana.nombre}`);
            }).catch((error) => {
                console.error("Error al guardar la ubicación:", error);
            });
        }
    }

    // Función para obtener la ubicación del usuario mediante geolocalización
    function obtenerUbicacion(usuarioId) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(posicion => {
                const latitud = posicion.coords.latitude;
                const longitud = posicion.coords.longitude;
                console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);
                asignarUbicacionMasCercana(latitud, longitud, usuarioId);
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
        const usuarioId = document.getElementById("username").value;
        obtenerUbicacion(usuarioId);
    });

    // Escuchar cambios en Firebase y actualizar el DOM en tiempo real
    const usuariosRef = firebase.database().ref('usuarios/');
    usuariosRef.on('value', snapshot => {
        const data = snapshot.val();
        // Limpiar las ubicaciones actuales
        document.querySelectorAll('.person').forEach(person => person.remove());
        for (const usuarioId in data) {
            const ubicacionNombre = data[usuarioId].ubicacion;
            const ubicacionDiv = document.querySelector(`.location:contains('${ubicacionNombre}')`);
            if (ubicacionDiv) {
                const personaDiv = document.createElement("div");
                personaDiv.className = "person";
                personaDiv.textContent = usuarioId;
                ubicacionDiv.appendChild(personaDiv);
            }
        }
    });
});
