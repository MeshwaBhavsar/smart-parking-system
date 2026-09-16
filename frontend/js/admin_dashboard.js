function updateDashboard(data) {

    document.getElementById("totalUsers").textContent =
        data.total_users;


    document.getElementById("parkingAreas").textContent =
        data.parking_areas;


    document.getElementById("activeParking").textContent =
        data.active_parking;


    document.getElementById("todayRevenue").textContent =
        "₹" + Number(data.today_revenue).toLocaleString("en-IN");


    document.getElementById("availableSlots").textContent =
        data.available_slots;


    document.getElementById("occupiedSlots").textContent =
        data.occupied_slots;


    document.getElementById("todayBookings").textContent =
        data.today_bookings;


    document.getElementById("pendingPayments").textContent =
        data.pending_payments;

}

async function loadDashboard() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/admin/dashboard"
        );


        if (!response.ok) {

            throw new Error(
                "Dashboard API failed"
            );

        }


        const data = await response.json();


        updateDashboard(data);


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


let socket;


function connectWebSocket() {

    socket = new WebSocket(
        "ws://127.0.0.1:8000/admin/ws/dashboard"
    );


    socket.onopen = function() {

        console.log(
            "WebSocket connected"
        );


        document.getElementById(
            "connectionStatus"
        ).textContent = "● Live";


        document.getElementById(
            "connectionStatus"
        ).style.color = "green";

    };


    socket.onmessage = function(event) {

        const message =
            JSON.parse(event.data);


        console.log(
            "Real-time update:",
            message
        );


        if (
            message.type ===
            "dashboard_update"
        ) {

            updateDashboard(
                message.data
            );

        }

    };


    socket.onclose = function() {

        console.log(
            "WebSocket disconnected"
        );


        document.getElementById(
            "connectionStatus"
        ).textContent =
            "● Reconnecting...";


        document.getElementById(
            "connectionStatus"
        ).style.color = "orange";


        setTimeout(
            connectWebSocket,
            3000
        );

    };


    socket.onerror = function(error) {

        console.error(
            "WebSocket error:",
            error
        );

    };

}


loadDashboard();

connectWebSocket();