const API_URL = "http://127.0.0.1:8000";

const token = sessionStorage.getItem("access_token");

// ======================================
// CHECK LOGIN
// ======================================

if (!token) {
    window.location.href = "login.html";
}


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_URL}/owner_parking/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        const data = await response.json();

        console.log("Dashboard data:", data);


        // ==================================
        // CHECK API RESPONSE
        // ==================================

        if (!response.ok) {

            console.error(
                "Dashboard API Error:",
                data
            );

            return;
        }


        // ==================================
        // DASHBOARD DATA
        // ==================================

        let ownerName = "Owner";
        let totalParkings = 0;
        let totalSlots = 0;
        let availableSlots = 0;
        let occupiedSlots = 0;
        let totalReservations = 0;
        let totalRevenue = 0;


        // ==================================
        // CASE 1:
        // API RETURNS DASHBOARD OBJECT
        // ==================================

        if (!Array.isArray(data)) {

            ownerName =
                data.owner_name || "Owner";

            totalParkings =
                data.total_parkings || 0;

            totalSlots =
                data.total_slots || 0;

            availableSlots =
                data.available_slots || 0;

            occupiedSlots =
                data.occupied_slots || 0;

            totalReservations =
                data.total_reservations || 0;

            totalRevenue =
                data.total_revenue || 0;

        }


        // ==================================
        // CASE 2:
        // API RETURNS PARKING ARRAY
        // ==================================

        else {

            console.log(
                "Parking array received:",
                data
            );


            // --------------------------------
            // OWNER NAME
            // --------------------------------

            if (data.length > 0) {

                ownerName =
                    data[0].owner_name ||
                    sessionStorage.getItem("owner_name") ||
                    "Owner";
            }


            // --------------------------------
            // TOTAL PARKINGS
            // --------------------------------

            totalParkings = data.length;


            // --------------------------------
            // TOTAL SLOTS
            // --------------------------------

            totalSlots = data.reduce(
                (total, parking) => {

                    return total +
                        Number(
                            parking.total_slots || 0
                        );

                },
                0
            );


            // --------------------------------
            // AVAILABLE SLOTS
            // --------------------------------

            availableSlots = data.reduce(
                (total, parking) => {

                    return total +
                        Number(
                            parking.available_slots || 0
                        );

                },
                0
            );


            // --------------------------------
            // OCCUPIED SLOTS
            // --------------------------------

            occupiedSlots = data.reduce(
                (total, parking) => {

                    return total +
                        Number(
                            parking.occupied_slots || 0
                        );

                },
                0
            );


            // --------------------------------
            // TOTAL RESERVATIONS
            // --------------------------------

            totalReservations = data.reduce(
                (total, parking) => {

                    return total +
                        Number(
                            parking.total_reservations || 0
                        );

                },
                0
            );


            // --------------------------------
            // TOTAL REVENUE
            // --------------------------------

            totalRevenue = data.reduce(
                (total, parking) => {

                    return total +
                        Number(
                            parking.total_revenue || 0
                        );

                },
                0
            );

        }


        // ==================================
        // UPDATE OWNER NAME
        // ==================================

        const ownerNameElement =
            document.getElementById("ownerName");

        if (ownerNameElement) {

            ownerNameElement.innerText =
                ownerName;

        }


        // ==================================
        // UPDATE TOTAL PARKINGS
        // ==================================

        document.getElementById(
            "totalParkings"
        ).innerText = totalParkings;


        // ==================================
        // UPDATE TOTAL SLOTS
        // ==================================

        document.getElementById(
            "totalSlots"
        ).innerText = totalSlots;


        // ==================================
        // UPDATE AVAILABLE SLOTS
        // ==================================

        document.getElementById(
            "availableSlots"
        ).innerText = availableSlots;


        // ==================================
        // UPDATE OCCUPIED SLOTS
        // ==================================

        document.getElementById(
            "occupiedSlots"
        ).innerText = occupiedSlots;


        // ==================================
        // UPDATE RESERVATIONS
        // ==================================

        document.getElementById(
            "totalReservations"
        ).innerText = totalReservations;


        // ==================================
        // UPDATE REVENUE
        // ==================================

        document.getElementById(
            "totalRevenue"
        ).innerText =
            `₹ ${totalRevenue}`;


        // ==================================
        // DEBUG
        // ==================================

        console.log(
            "Dashboard Summary:",
            {
                ownerName,
                totalParkings,
                totalSlots,
                availableSlots,
                occupiedSlots,
                totalReservations,
                totalRevenue
            }
        );

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ======================================
// INITIAL LOAD
// ======================================

loadDashboard();


// ======================================
// WEBSOCKET
// ======================================

let socket;


function connectWebSocket() {

    console.log(
        "Connecting Owner Dashboard WebSocket..."
    );


    socket = new WebSocket(
        "ws://127.0.0.1:8000/ws"
    );


    // ==================================
    // CONNECTED
    // ==================================

    socket.onopen = function () {

        console.log(
            "✅ Dashboard WebSocket connected"
        );

    };


    // ==================================
    // MESSAGE
    // ==================================

    socket.onmessage = function (event) {

        try {

            const data =
                JSON.parse(event.data);


            console.log(
                "Dashboard WebSocket:",
                data
            );


            // ==================================
            // RESERVATION CREATED
            // ==================================

            if (
                data.event ===
                "reservation_created"
            ) {

                loadDashboard();

            }


            // ==================================
            // RESERVATION UPDATED
            // ==================================

            if (
                data.event ===
                "reservation_updated"
            ) {

                loadDashboard();

            }


            // ==================================
            // PAYMENT COMPLETED
            // ==================================

            if (
                data.event ===
                "payment_completed"
            ) {

                loadDashboard();

            }


            // ==================================
            // SLOT UPDATED
            // ==================================

            if (
                data.event ===
                "slot_updated"
            ) {

                loadDashboard();

            }


            // ==================================
            // RESERVATION DELETED
            // ==================================

            if (
                data.event ===
                "reservation_deleted"
            ) {

                loadDashboard();

            }

        }

        catch (error) {

            console.error(
                "WebSocket JSON error:",
                error
            );

        }

    };


    // ==================================
    // WEBSOCKET ERROR
    // ==================================

    socket.onerror = function (error) {

        console.error(
            "Dashboard WebSocket error:",
            error
        );

    };


    // ==================================
    // WEBSOCKET CLOSED
    // ==================================

    socket.onclose = function () {

        console.log(
            "Dashboard WebSocket disconnected"
        );


        setTimeout(
            connectWebSocket,
            3000
        );

    };

}


// ======================================
// CONNECT WEBSOCKET
// ======================================

connectWebSocket();