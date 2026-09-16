// async function loadNearbyParking(){

// // loadNearbyParking();
//  const response = await fetch("http://127.0.0.1:8000/parking/");

//     let parking = await response.json();

//     parking.forEach(p => {

//         p.distance = calculateDistance(

//             userLat,
//             userLng,
//             p.latitude,
//             p.longitude

//         );

//     });

//     parking.sort((a, b) => a.distance - b.distance);

//     displayParking(parking);
// }

// // ------------------------------
// async function searchParkingUser() {

//     const area = document.getElementById("searchArea").value;

//     const response = await fetch(
//         `http://127.0.0.1:8000/parking/search?area=${encodeURIComponent(area)}`
//     );

//     const data = await response.json();

//     console.log(data);

//     showParking(data);
// }


// navigator.geolocation.getCurrentPosition(

//     position => {

//         userLat = position.coords.latitude;
//         userLng = position.coords.longitude;

//         loadNearbyParking();

//     },

//     error => {

//         console.log("Location blocked");

//         // Default location (Ahmedabad)
//         userLat = 23.0225;
//         userLng = 72.5714;

//         loadNearbyParking();

//     }

// );

// // show map on screen  
// const map = L.map("map").setView([23.0225,72.5714],13);

// L.tileLayer(

// 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

// {

// maxZoom:19

// }

// ).addTo(map);

// // ---------------------------
// function calculateDistance(lat1, lon1, lat2, lon2) {

//     const R = 6371;

//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;

//     const a =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos(lat1 * Math.PI / 180) *
//         Math.cos(lat2 * Math.PI / 180) *
//         Math.sin(dLon / 2) ** 2;

//     return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
// }

// // ---------------------------------------
// async function searchParking() {

//     const value = document.getElementById("searchArea").value.trim();

//     let response;

//     if (!isNaN(value) && value !== "") {

//         response = await fetch(
//             `http://127.0.0.1:8000/parking/search?id=${value}`
//         );

//     } else {

//         response = await fetch(
//             `http://127.0.0.1:8000/parking/search?area=${encodeURIComponent(value)}&city=${encodeURIComponent(value)}`
//         );

//     }

//     let parking = await response.json();

//     parking.forEach(p => {

//         p.distance = calculateDistance(
//             userLat,
//             userLng,
//             p.latitude,
//             p.longitude
//         );

//     });

//     parking.sort((a, b) => a.distance - b.distance);

//     displayParking(parking);
//     showParking(data);

// }

// // --------------------------------------------
// function displayParking(parkingList) {

//     const container = document.getElementById("nearbyParking");

//     container.innerHTML = "";

//     parkingList.forEach(parking => {

//         container.innerHTML += `

//         <div class="col-lg-3 mb-4">

//             <div class="card shadow border-0 rounded-4 p-3">

//                 <h4>${parking.parking_name}</h4>

//                 <p>${parking.area}, ${parking.city}</p>

//                 <p>${parking.address}</p>

//                 <p><b>${parking.distance.toFixed(2)} KM Away</b></p>

//                 <h5>₹${parking.price}/Hour</h5>

//                 <button
//                     class="btn btn-success w-100"
//                     onclick="bookParking(${parking.id})">

//                     Book Now

//                 </button>

//             </div>

//         </div>

//         `;

//     });

// }
// // ----------------------------
// function bookParking(id){

//     window.location.href =
//         `reservation.html?parking_id=${id}`;

// }

// // --------------------user location 


// navigator.geolocation.getCurrentPosition(

// position=>{

// const lat=position.coords.latitude;

// const lng=position.coords.longitude;

// map.setView([lat,lng],15);

// L.marker([lat,lng])

// .addTo(map)

// .bindPopup("You are here")

// .openPopup();

// loadParking();

// }

// );

// // ------------------fetch parking--------------
// async function loadParking(){

// const response=await fetch(

// "http://127.0.0.1:8000/parking/"

// );

// const parkingList=await response.json();

// showParking(parkingList);

// }

// // -----------------------------show parking on map-----------------
// function showParking(parkingList){

// parkingList.forEach(parking=>{

// L.marker(

// [parking.latitude,parking.longitude]

// )

// .addTo(map)

// .bindPopup(

// `

// <h5>${parking.parking_name}</h5>

// <p>${parking.area}</p>

// <p>₹${parking.price}/Hour</p>

// <button onclick="bookParking(${parking.id})">

// Book Now

// </button>

// `

// );

// });

// }


// ======================================================
// LIVE PARKING - USER SIDE
// ======================================================

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

                                <span class="badge bg-success">

                                    Available

                                </span>

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

                                    <i class="bi bi-navigation"></i>

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


    // Remove existing markers
    parkingMarkers.forEach(marker => {

        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }

    });

    parkingMarkers = [];


    // Check map
    if (!map) {

        console.error("Leaflet map is not initialized");

        return;
    }


    // Check parking list
    if (!parkingList || parkingList.length === 0) {

        console.warn("No parking data available");

        return;
    }


    parkingList.forEach(parking => {

        console.log(
            "Processing parking:",
            parking.parking_name
        );


        // Convert latitude / longitude to numbers
        const latitude =
            Number(parking.latitude);

        const longitude =
            Number(parking.longitude);


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
                "INVALID COORDINATES:",
                parking
            );

            return;
        }


        // Create marker
        const marker =
            L.marker(
                [
                    latitude,
                    longitude
                ]
            ).addTo(map);


        // Popup
        marker.bindPopup(`

            <div style="min-width:220px">

                <h5 class="fw-bold mb-2">
                    ${escapeHTML(
                        parking.parking_name
                    )}
                </h5>

                <p class="mb-1">
                    <i class="bi bi-geo-alt"></i>

                    ${escapeHTML(
                        parking.area
                    )},

                    ${escapeHTML(
                        parking.city
                    )}
                </p>

                <p class="mb-1">

                    <strong>Address:</strong>

                    ${escapeHTML(
                        parking.address
                    )}

                </p>

                <p class="mb-1">

                    <strong>Total Slots:</strong>

                    ${parking.total_slots}

                </p>

                <p class="mb-2">

                    <strong>Price:</strong>

                    ₹${parking.price}/Hour

                </p>

                <button
                    class="btn btn-success btn-sm w-100"
                    onclick="bookParking(${parking.id})"
                >

                    <i class="bi bi-calendar-check"></i>

                    Book Now

                </button>

            </div>

        `);


        // Save marker
        parkingMarkers.push(marker);


        console.log(
            "Marker added:",
            parking.parking_name
        );

    });


    console.log(
        "TOTAL MARKERS:",
        parkingMarkers.length
    );

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
    localStorage.setItem(
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