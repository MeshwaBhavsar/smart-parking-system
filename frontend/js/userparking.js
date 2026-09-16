
// let parkingMarkers = [];
// let map;
// let userLat = null;
// let userLng = null;

// const socket = new WebSocket("ws://127.0.0.1:8000/ws/parking");

// socket.onopen = () => {
//     console.log("✅ WebSocket Connected");
// };

// socket.onclose = () => {
//     console.log("❌ WebSocket Disconnected");
// };

// socket.onerror = (error) => {
//     console.log("WebSocket Error", error);
// };

// socket.onmessage = (event) => {

//     console.log("Message Received :", event.data);

//     if (
//         event.data === "parking_added" ||
//         event.data === "parking_updated" ||
//         event.data === "parking_deleted"
//     ) {

//         console.log("Reload Parking");

//         loadParking(userLat, userLng);

//     }

// };

// // -----------------------clear parking ---------------------
// function clearParkingMarkers(){

//     parkingMarkers.forEach(marker => {

//         map.removeLayer(marker);

//     });

//     parkingMarkers = [];

// }

// // ------------------------------------------


// console.log("JavaScript Loaded");

// if (navigator.geolocation) {

//     console.log("Geolocation Supported");

//     navigator.geolocation.getCurrentPosition(success, error);

// } else {

//     console.log("Geolocation Not Supported");

// }

// // ------------------------------------------


// function success(position) {

//     userLat = position.coords.latitude;
//     userLng = position.coords.longitude;

//     console.log(userLat);
//     console.log(userLng);

//     map = L.map("map").setView([userLat, userLng], 15);

//     L.tileLayer(
//         "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//         {
//             attribution: "© OpenStreetMap"
//         }
//     ).addTo(map);

//     L.marker([userLat, userLng])
//         .addTo(map)
//         .bindPopup("You are here")
//         .openPopup();

//     loadParking(userLat, userLng);
// }



// // ------------------------------------------------
// function error(err) {

//     console.log("ERROR:", err);
//     console.log("Code:", err.code);
//     console.log("Message:", err.message);

// }
// // ------------------load parking-------------------

// async function loadParking(userLat,userLng){

//     clearParkingMarkers();

//     const response = await fetch("http://127.0.0.1:8000/parking");

//     const parking = await response.json();

//     const container = document.getElementById("parkingCards");

//     container.innerHTML = "";

//     parking.forEach(p=>{

//         p.distance = getDistance(
//             userLat,
//             userLng,
//             p.latitude,
//             p.longitude
//         );

//     });

//     parking.sort((a,b)=>a.distance-b.distance);

//     parking.forEach(p=>{

//         // Create Marker

//         const marker = L.marker([p.latitude,p.longitude])
//             .addTo(map)
//             .bindPopup(`
//                 <b>${p.parking_name}</b><br>
//                 ${p.area}, ${p.city}
//             `);

//         // Save Marker

//         parkingMarkers.push(marker);

//         // Create Card

//         container.innerHTML += `

//         <div class="col-lg-6">

//             <div class="card parking-card shadow-sm">

//                 <div class="card-body">

//                     <h4>${p.parking_name}</h4>

//                     <p>${p.area}, ${p.city}</p>

//                     <p>${p.distance.toFixed(2)} km Away</p>

//                     <p>Available Slots : ${p.available_slots}</p>

//                     <p>₹${p.price}/Hour</p>

//                     <button
//                         class="btn btn-success"
//                         onclick="bookParking(${p.id})">

//                         Book Now

//                     </button>

//                     <button
//                         class="btn btn-primary"
//                         onclick="navigateParking(${p.latitude},${p.longitude})">

//                         Navigate

//                     </button>

//                 </div>

//             </div>

//         </div>

//         `;

//     });

// }
// // ----------------navigation---------
// function navigateParking(lat, lng) {

//     window.open(
//         `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
//         "_blank"
//     );

// }
// // ---------------------distance-------------
// function getDistance(lat1, lon1, lat2, lon2) {

//     const R = 6371; // Radius of Earth in km

//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;

//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * Math.PI / 180) *
//         Math.cos(lat2 * Math.PI / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
// }

// // ----------------book parking function------------
// function bookParking(parkingId) {

//     // Store parking ID
//     localStorage.setItem("parking_id", parkingId);

//     // Open reservation page
//     window.location.href = "reservation.html";
  

// }

// // --------------------search parking--------------
// async function searchParking() {

//     if (userLat === null || userLng === null) {
//         alert("Location is not available yet.");
//         return;
//     }

//     const city = document.getElementById("city").value;
//     const area = document.getElementById("area").value;

//     console.log(userLat, userLng);

//     const response = await fetch(
//         `http://127.0.0.1:8000/parking/search-parking?city=${city}&area=${area}&lat=${userLat}&lng=${userLng}`
//     );

//     const parking = await response.json();

//     console.log(parking);
// }

// ----------------------user side----------------------------
const API_URL = "http://127.0.0.1:8000";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let map = null;

let userLat = null;
let userLng = null;

let allParkings = [];

let parkingMarkers = [];

let userMarker = null;

let parkingSocket = null;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("=================================");
    console.log("Live Parking Page Loaded");
    console.log("=================================");

    // Create map
    initializeMap();

    // Get user's current location
    getUserLocation();

    // Connect WebSocket
    connectParkingWebSocket();

});


// ======================================================
// INITIALIZE LEAFLET MAP
// ======================================================

function initializeMap() {

    map = L.map("map").setView(
        [23.0225, 72.5714],
        13
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    console.log("Map initialized");

}


// ======================================================
// GET USER CURRENT LOCATION
// ======================================================

function getUserLocation() {

    console.log(
        "Getting user location..."
    );


    if (!navigator.geolocation) {

        console.log(
            "Geolocation is not supported"
        );

        useDefaultLocation();

        return;
    }


    navigator.geolocation.getCurrentPosition(

        // ==========================================
        // SUCCESS
        // ==========================================

        position => {

            userLat =
                position.coords.latitude;

            userLng =
                position.coords.longitude;


            console.log(
                "User Latitude:",
                userLat
            );

            console.log(
                "User Longitude:",
                userLng
            );


            // Move map to user
            map.setView(
                [userLat, userLng],
                15
            );


            // Add current location marker
            addUserLocationMarker();


            // Load parking
            loadParking();

        },


        // ==========================================
        // ERROR
        // ==========================================

        error => {

            console.log(
                "Location permission denied or unavailable"
            );


            console.log(
                "Using Ahmedabad default location"
            );


            useDefaultLocation();

        },

        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


// ======================================================
// DEFAULT LOCATION
// ======================================================

function useDefaultLocation() {

    userLat = 23.0225;

    userLng = 72.5714;


    map.setView(
        [userLat, userLng],
        13
    );


    addUserLocationMarker();

    loadParking();

}


// ======================================================
// USER LOCATION MARKER
// ======================================================

function addUserLocationMarker() {

    // Remove old user marker
    if (userMarker) {

        map.removeLayer(
            userMarker
        );

    }


    userMarker =
        L.marker(
            [userLat, userLng]
        )
        .addTo(map)
        .bindPopup(
            "<b>You are here</b>"
        );


    console.log(
        "User location marker added"
    );

}


// ======================================================
// FETCH ALL PARKING
// ======================================================

async function loadParking() {

    console.log(
        "Loading parking data..."
    );


    try {

        const response =
            await fetch(
                `${API_URL}/parking/`
            );


        console.log(
            "Parking API status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Parking API error: ${response.status}`
            );

        }


        const parkingList =
            await response.json();


        console.log(
            "Parking data:",
            parkingList
        );


        // Save globally
        allParkings = parkingList;


        // Display cards
        displayParking(
            allParkings
        );


        // Display map markers
        showParkingMarkers(
            allParkings
        );

    }

    catch (error) {

        console.error(
            "Parking fetch error:",
            error
        );


        const container =
            document.getElementById(
                "parkingCards"
            );


        if (container) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load parking data.

                    </div>

                </div>

            `;

        }

    }

}


// ======================================================
// DISPLAY PARKING CARDS
// ======================================================

function displayParking(
    parkingList
) {

    const container =
        document.getElementById(
            "parkingCards"
        );


    if (!container) {

        console.error(
            "parkingCards element not found"
        );

        return;

    }


    container.innerHTML = "";


    if (
        !parkingList ||
        parkingList.length === 0
    ) {

        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-info text-center">

                    No parking available.

                </div>

            </div>

        `;

        return;

    }


    // Calculate distance
    const parkingWithDistance =
        parkingList.map(
            parking => {

                let distance = null;


                if (
                    userLat !== null &&
                    userLng !== null &&
                    parking.latitude !== null &&
                    parking.longitude !== null
                ) {

                    distance =
                        calculateDistance(
                            userLat,
                            userLng,
                            parking.latitude,
                            parking.longitude
                        );

                }


                return {
                    ...parking,
                    distance: distance
                };

            }
        );


    // Sort nearest first
    parkingWithDistance.sort(
        (a, b) => {

            if (
                a.distance === null
            ) {

                return 1;

            }


            if (
                b.distance === null
            ) {

                return -1;

            }


            return (
                a.distance -
                b.distance
            );

        }
    );


    parkingWithDistance.forEach(
        parking => {

            const distanceText =
                parking.distance !== null
                    ? `${parking.distance.toFixed(2)} KM Away`
                    : "Distance unavailable";


            container.innerHTML += `

                <div class="col-lg-6 col-md-6 mb-4">

                    <div class="card shadow border-0 rounded-4 h-100">

                        <div class="card-body p-4">

                            <div class="d-flex justify-content-between">

                                <h4 class="fw-bold">

                                    <i class="bi bi-p-square-fill"></i>

                                    ${escapeHTML(
                                        parking.parking_name
                                    )}

                                </h4>

                               

                            </div>


                            <p class="text-muted mb-2">

                                <i class="bi bi-geo-alt"></i>

                                ${escapeHTML(
                                    parking.area
                                )},

                                ${escapeHTML(
                                    parking.city
                                )}

                            </p>


                            <p>

                                <strong>Address:</strong>

                                ${escapeHTML(
                                    parking.address
                                )}

                            </p>


                            <p>

                                <i class="bi bi-signpost"></i>

                                <strong>

                                    ${parking.total_slots}

                                </strong>

                                Total Slots

                            </p>


                            <p>

                                <i class="bi bi-geo"></i>

                                <strong>

                                    ${distanceText}

                                </strong>

                            </p>


                            <h5 class="fw-bold">

                                ₹${parking.price}/Hour

                            </h5>


                            <div class="d-flex gap-2 mt-3">

                                <button
                                    class="btn btn-success flex-fill"
                                    onclick="bookParking(${parking.id})"
                                >

                                    <i class="bi bi-calendar-check"></i>

                                    Book Now

                                </button>


                                <button
                                    class="btn btn-outline-primary"
                                    onclick="navigateToParking(
                                        ${parking.latitude},
                                        ${parking.longitude}
                                    )"
                                >

                                    <i class="bi bi-navigation">Navigation</i>

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}


// ======================================================
// SHOW PARKING MARKERS ON MAP
// ======================================================

// function showParkingMarkers(
//     parkingList
// ) {

//     console.log(
//         "Updating parking markers..."
//     );


//     // ==========================================
//     // REMOVE OLD PARKING MARKERS
//     // ==========================================

//     parkingMarkers.forEach(
//         marker => {

//             map.removeLayer(
//                 marker
//             );

//         }
//     );


//     parkingMarkers = [];


//     // ==========================================
//     // ADD NEW MARKERS
//     // ==========================================

//     parkingList.forEach(
//         parking => {

//             if (
//                 parking.latitude === null ||
//                 parking.longitude === null
//             ) {

//                 return;

//             }


//             const marker =
//                 L.marker([
//                     parking.latitude,
//                     parking.longitude
//                 ])
//                 .addTo(map);


//             marker.bindPopup(`

//                 <div>

//                     <h5 class="fw-bold">

//                         ${escapeHTML(
//                             parking.parking_name
//                         )}

//                     </h5>


//                     <p>

//                         <i class="bi bi-geo-alt"></i>

//                         ${escapeHTML(
//                             parking.area
//                         )}

//                         <br>

//                         ${escapeHTML(
//                             parking.city
//                         )}

//                     </p>


//                     <p>

//                         <strong>Address:</strong>

//                         ${escapeHTML(
//                             parking.address
//                         )}

//                     </p>


//                     <p>

//                         <strong>Total Slots:</strong>

//                         ${parking.total_slots}

//                     </p>


//                     <p>

//                         <strong>Price:</strong>

//                         ₹${parking.price}/Hour

//                     </p>


//                     <button
//                         class="btn btn-success btn-sm"
//                         onclick="bookParking(${parking.id})"
//                     >

//                         Book Now

//                     </button>

//                 </div>

//             `);


//             parkingMarkers.push(
//                 marker
//             );

//         }
//     );


//     console.log(
//         "Parking markers:",
//         parkingMarkers.length
//     );

// }

function showParkingMarkers(parkingList) {

    console.log("=================================");
    console.log("SHOW PARKING MARKERS");
    console.log("Parking count:", parkingList.length);
    console.log("=================================");

    if (!map) {
        console.error("Map is not initialized");
        return;
    }

    // Remove previous parking markers
    parkingMarkers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });

    parkingMarkers = [];

    const bounds = [];

    parkingList.forEach((parking, index) => {

        console.log(`Parking ${index + 1}:`, parking);

        const latitude = Number(parking.latitude);
        const longitude = Number(parking.longitude);

        console.log(
            "Coordinates:",
            latitude,
            longitude
        );

        // Validate coordinates
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            console.error(
                "Invalid parking coordinates:",
                parking
            );
            return;
        }

        // Create marker
        const marker = L.marker([
            latitude,
            longitude
        ]).addTo(map);

        // Popup
        marker.bindPopup(`
            <div style="min-width:220px">

                <h5 class="fw-bold">
                    ${escapeHTML(parking.parking_name)}
                </h5>

                <p>
                    <i class="bi bi-geo-alt"></i>
                    ${escapeHTML(parking.area)},
                    ${escapeHTML(parking.city)}
                </p>

                <p>
                    <strong>Address:</strong><br>
                    ${escapeHTML(parking.address)}
                </p>

                <p>
                    <strong>Total Slots:</strong>
                    ${parking.total_slots}
                </p>

                <p>
                    <strong>Available:</strong>
                    ${parking.available_slots}
                </p>

                <p>
                    <strong>Price:</strong>
                    ₹${parking.price}/Hour
                </p>

                <button
                    class="btn btn-success btn-sm w-100"
                    onclick="bookParking(${parking.id})"
                >
                    Book Now
                </button>

            </div>
        `);

        parkingMarkers.push(marker);

        bounds.push([
            latitude,
            longitude
        ]);

        console.log(
            "Marker created:",
            parking.parking_name
        );

    });

    console.log(
        "TOTAL PARKING MARKERS:",
        parkingMarkers.length
    );

    // Move map so all parking markers are visible
    if (bounds.length > 0) {

        const parkingBounds =
            L.latLngBounds(bounds);

        map.fitBounds(
            parkingBounds,
            {
                padding: [50, 50]
            }
        );

    }

}

// ======================================================
// WEBSOCKET CONNECTION
// ======================================================

function connectParkingWebSocket() {

    console.log(
        "Connecting to parking WebSocket..."
    );


    parkingSocket =
        new WebSocket(
            "ws://127.0.0.1:8000/ws"
        );


    // ==========================================
    // CONNECTED
    // ==========================================

    parkingSocket.onopen =
        () => {

            console.log(
                "Parking WebSocket connected"
            );

        };


    // ==========================================
    // MESSAGE
    // ==========================================

    parkingSocket.onmessage =
        event => {

            console.log(
                "WebSocket message:",
                event.data
            );


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "WebSocket event:",
                    data.event
                );


                // ==================================
                // ADD
                // ==================================

                if (
                    data.event ===
                    "parking_added"
                ) {

                    console.log(
                        "New parking added:",
                        data.parking_id
                    );


                    // Fetch latest data
                    loadParking();

                }


                // ==================================
                // UPDATE
                // ==================================

                else if (
                    data.event ===
                    "parking_updated"
                ) {

                    console.log(
                        "Parking updated:",
                        data.parking_id
                    );


                    // Fetch latest data
                    loadParking();

                }


                // ==================================
                // DELETE
                // ==================================

                else if (
                    data.event ===
                    "parking_deleted"
                ) {

                    console.log(
                        "Parking deleted:",
                        data.parking_id
                    );


                    // Fetch latest data
                    loadParking();

                }

            }

            catch (error) {

                console.error(
                    "WebSocket message error:",
                    error
                );

            }

        };


    // ==========================================
    // ERROR
    // ==========================================

    parkingSocket.onerror =
        error => {

            console.error(
                "Parking WebSocket error:",
                error
            );

        };


    // ==========================================
    // CLOSE
    // ==========================================

    parkingSocket.onclose =
        () => {

            console.log(
                "Parking WebSocket disconnected"
            );


            // Reconnect
            setTimeout(
                () => {

                    console.log(
                        "Reconnecting WebSocket..."
                    );

                    connectParkingWebSocket();

                },
                3000
            );

        };

}


// ======================================================
// SEARCH PARKING
// ======================================================

function searchParking() {

    const cityInput =
        document.getElementById(
            "city"
        );


    const areaInput =
        document.getElementById(
            "area"
        );


    const city =
        cityInput
            ? cityInput.value
                .trim()
                .toLowerCase()
            : "";


    const area =
        areaInput
            ? areaInput.value
                .trim()
                .toLowerCase()
            : "";


    console.log(
        "Search City:",
        city
    );


    console.log(
        "Search Area:",
        area
    );


    // ==========================================
    // FILTER LOCAL PARKING DATA
    // ==========================================

    const filtered =
        allParkings.filter(
            parking => {

                const parkingCity =
                    String(
                        parking.city || ""
                    )
                    .toLowerCase();


                const parkingArea =
                    String(
                        parking.area || ""
                    )
                    .toLowerCase();


                const cityMatch =
                    city === "" ||
                    parkingCity.includes(
                        city
                    );


                const areaMatch =
                    area === "" ||
                    parkingArea.includes(
                        area
                    );


                return (
                    cityMatch &&
                    areaMatch
                );

            }
        );


    console.log(
        "Search result:",
        filtered
    );


    displayParking(
        filtered
    );


    showParkingMarkers(
        filtered
    );

}


// ======================================================
// DISTANCE CALCULATION
// ======================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;


    const dLat =
        (
            lat2 - lat1
        ) *
        Math.PI /
        180;


    const dLon =
        (
            lon2 - lon1
        ) *
        Math.PI /
        180; 


    const a =
        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;


    return (
        R *
        (
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            )
        )
    );

}


// ======================================================
// BOOK PARKING
// ======================================================

function bookParking(
    parkingId
) {

    console.log(
        "Book Parking:",
        parkingId
    );


    // Save parking ID
    sessionStorage.setItem(
        "parking_id",
        parkingId
    );


    // Open reservation/details page
    window.location.href =
        `reservation.html?parking_id=${parkingId}`;

}


// ======================================================
// NAVIGATE TO PARKING
// ======================================================

function navigateToParking(
    latitude,
    longitude
) {

    const url =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;


    window.open(
        url,
        "_blank"
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}