<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubicaciones de Personas</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Cartel de Presencia</h1>
        <div class="register-form">
            <form id="registerForm">
                <label for="username">Selecciona tu nombre:</label>
                <select id="username">
                    <option value="Manuel de Soto">Manuel de Soto</option>
                    <option value="Juan Lopez">Juan Lopez</option>
                    <!-- Agrega más opciones según tus usuarios -->
                </select>
                <button type="submit">Registrar</button>
            </form>
        </div>
        <div class="locations">
            <div class="location" id="ubicacion1">Fin de la Jornada</div>
            <div class="location" id="ubicacion2">Utrera</div>
            <div class="location" id="ubicacion3">Cerrado</div>
            <div class="location" id="ubicacion4">Coronil</div>
            <div class="location" id="ubicacion5">Otra Localización</div>
        </div>
    </div>

    <script type="module">
        // Importa las funciones necesarias del SDK de Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
        import { getDatabase, ref, set, update, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

        // Configuración de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDOHPagA5tTsapHT7mLp9Go-JCAVc4ChhI",
            authDomain: "ubicaion-8ef85.firebaseapp.com",
            projectId: "ubicaion-8ef85",
            storageBucket: "ubicaion-8ef85.appspot.com",
            messagingSenderId: "629776815605",
            appId: "1:629776815605:web:65804b46473ea77ed6fcbc",
            measurementId: "G-WBFY42G0PD"
        };
        
        // Inicializar Firebase y los servicios de Analytics y Database
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const db = getDatabase(app);

        const registerForm = document.getElementById('registerForm');
        const usernameSelect = document.getElementById('username');
        
        // Lista de ubicaciones y coordenadas
        const ubicaciones = [
            { id: "ubicacion1", nombre: "Fin de la Jornada", latitud: null, longitud: null },
            { id: "ubicacion2", nombre: "Utrera", latitud: 37.2071, longitud: -5.8204 },
            { id: "ubicacion3", nombre: "Cerrado", latitud: 37.1294, longitud: -5.8377 },
            { id: "ubicacion4", nombre: "Coronil", latitud: 37.0855, longitud: -5.6115 },
            { id: "ubicacion5", nombre: "Otra Localización", latitud: null, longitud: null },
        ];

        // Calcula la distancia entre dos puntos geográficos
        function calcularDistancia(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

        // Asigna la ubicación más cercana según la posición actual
        function asignarUbicacionMasCercana(lat, lon) {
            let ubicacionCercana = ubicaciones.find(ubic => ubic.nombre === "Otra Localización");
            let distanciaMinima = 2; // Límite de 2 km
            
            ubicaciones.forEach(ubicacion => {
                if (ubicacion.latitud && ubicacion.longitud) {
                    const distancia = calcularDistancia(lat, lon, ubicacion.latitud, ubicacion.longitud);
                    if (distancia < distanciaMinima) {
                        distanciaMinima = distancia;
                        ubicacionCercana = ubicacion;
                    }
                }
            });

            return ubicacionCercana;
        }

        // Envía los datos del usuario a Firebase
        function guardarUbicacionFirebase(username, ubicacion, tiempo) {
            update(ref(db, 'usuarios/' + username), {
                ubicacion: ubicacion,
                tiempo: tiempo
            }).then(() => {
                console.log(`Ubicación de ${username} guardada exitosamente en Firebase.`);
            }).catch((error) => {
                console.error('Error al guardar en Firebase:', error);
            });
        }

        // Función que se ejecuta a las 18:00
        function actualizarFinDeJornada() {
            const ahora = new Date();
            if (ahora.getHours() === 18 && ahora.getMinutes() === 0) {
                get(ref(db, 'usuarios')).then(snapshot => {
                    if (snapshot.exists()) {
                        snapshot.forEach(childSnapshot => {
                            const username = childSnapshot.key;
                            guardarUbicacionFirebase(username, "Fin de la Jornada", ahora.toLocaleTimeString());
                        });
                        console.log("Todos los usuarios han sido actualizados a 'Fin de la Jornada'.");
                    }
                }).catch(error => console.error("Error al actualizar usuarios:", error));
            }
        }

        // Llama a actualizarFinDeJornada cada minuto
        setInterval(actualizarFinDeJornada, 60000);

        // Manejador de evento del formulario
        registerForm.addEventListener("submit", event => {
            event.preventDefault();

            const username = usernameSelect.value;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(posicion => {
                    const lat = posicion.coords.latitude;
                    const lon = posicion.coords.longitude;
                    const ubicacionCercana = asignarUbicacionMasCercana(lat, lon);
                    const tiempo = new Date().toLocaleTimeString();
                    
                    guardarUbicacionFirebase(username, ubicacionCercana.nombre, tiempo);
                }, error => {
                    console.error("Error al obtener la ubicación", error);
                });
            } else {
                console.error("La geolocalización no es compatible con este navegador.");
            }
        });
    </script>
</body>
</html>
