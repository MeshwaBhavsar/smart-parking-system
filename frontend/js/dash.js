// const sidebar = document.querySelector(".sidebar");
// const menuBtn = document.querySelector(".menu-btn");

// menuBtn.addEventListener("click", () => {
//     sidebar.classList.toggle("show");
// });

// const mainContent = document.getElementById("main-content");

// document.getElementById("dashboardLink").onclick = function(e){

//     e.preventDefault();

//     mainContent.innerHTML = dashboardPage();

// }

// document.getElementById("liveParkingLink").onclick = function(e){

//     e.preventDefault();

//     mainContent.innerHTML = liveParkingPage();

// }

// document.getElementById("reservationLink").onclick = function(e){

//     e.preventDefault();

//     mainContent.innerHTML = reservationPage();

// }
const API_URL = "http://127.0.0.1:8000";


// =====================================================
// GET TOKEN
// =====================================================



// =====================================================
// LOGIN CHECK
// =====================================================

const token = sessionStorage.getItem("access_token");

// const role = String(
//     localStorage.getItem("role") || ""
// ).toUpperCase();

// console.log("Dashboard token:", token);
// console.log("Dashboard role:", role);

// if (!token || role !== "CUSTOMER") {

//     console.log("Customer authentication failed");

//     window.location.href = "login.html";
// }

if (!token) {

    window.location.href = "login.html";

}


// =====================================================
// LOAD USER DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        console.log("Loading User Dashboard...");


        const response = await fetch(
            `${API_URL}/users/dashboard`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );


        const data = await response.json();


        console.log(
            "================================="
        );

        console.log(
            "USER DASHBOARD API RESPONSE:"
        );

        console.log(data);

        console.log(
            "================================="
        );


        // =================================================
        // API ERROR
        // =================================================

        if (!response.ok) {

            console.error(
                "Dashboard API Error:",
                data
            );

            if (
                response.status === 401
            ) {

                sessionStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";

            }

            return;
        }


        // =================================================
        // USER NAME
        // =================================================

        const userNameElement =
            document.getElementById(
                "userName"
            );


        if (userNameElement) {

            userNameElement.innerText =
                data.user_name ?? "User";

        }


        // =================================================
        // TOTAL BOOKINGS
        // =================================================

        const totalBookingsElement =
            document.getElementById(
                "totalBookings"
            );


        if (totalBookingsElement) {

            totalBookingsElement.innerText =
                data.total_bookings ?? 0;

        }
        else {

            console.error(
                "❌ #totalBookings not found in HTML"
            );

        }


        // =================================================
        // TOTAL VEHICLES
        // =================================================

        const totalVehiclesElement =
            document.getElementById(
                "totalVehicles"
            );


        if (totalVehiclesElement) {

            totalVehiclesElement.innerText =
                data.total_vehicles ?? 0;

        }
        else {

            console.error(
                "❌ #totalVehicles not found in HTML"
            );

        }


        // =================================================
        // TOTAL SPENT
        // =================================================

        const totalSpentElement =
            document.getElementById(
                "totalSpent"
            );


        if (totalSpentElement) {

            totalSpentElement.innerText =
                `₹${data.total_spent ?? 0}`;

        }
        else {

            console.error(
                "❌ #totalSpent not found in HTML"
            );

        }


        // =================================================
        // AVAILABLE SLOTS
        // =================================================

        const availableSlotsElement =
            document.getElementById(
                "availableSlots"
            );


        if (availableSlotsElement) {

            availableSlotsElement.innerText =
                data.available_slots ?? 0;

        }
        else {

            console.error(
                "❌ #availableSlots not found in HTML"
            );

        }


        // =================================================
        // CURRENT RESERVATION
        // =================================================

        displayCurrentReservation(
            data.current_reservation
        );

    }

    catch (error) {

        console.error(
            "❌ Dashboard Error:",
            error
        );

    }

}


// =====================================================
// DISPLAY CURRENT RESERVATION
// =====================================================

function displayCurrentReservation(
    reservation
) {

    const container =
        document.getElementById(
            "currentReservation"
        );


    if (!container) {

        console.error(
            "❌ #currentReservation not found in HTML"
        );

        return;

    }


    // =================================================
    // NO CURRENT RESERVATION
    // =================================================

    if (!reservation) {

        container.innerHTML = `

            <div class="text-center p-5">

                <div
                    style="
                        font-size:45px;
                        margin-bottom:15px;
                    "
                >
                    🚗
                </div>

                <h4>
                    No Current Reservation
                </h4>

                <p class="text-muted">
                    You don't have an active
                    parking reservation.
                </p>

                <a
                    href="liveparking.html"
                    class="btn btn-primary"
                >
                    Make Reservation
                </a>

            </div>

        `;

        return;

    }


    // =================================================
    // CURRENT RESERVATION
    // =================================================

    container.innerHTML = `

        <div class="reservation-card">

            <div class="reservation-info">

                <h3>
                    🚗 Current Reservation
                </h3>


                <h2>
                    ${reservation.parking_name ?? "N/A"}
                </h2>


                <p>
                    📅
                    ${formatDate(reservation.date)}
                </p>


                <p>
                    🚗 Vehicle:
                    <strong>
                        ${reservation.vehicle_number ?? "N/A"}
                    </strong>
                </p>

            </div>


            <div class="reservation-slot">

                <h5>
                    Slot
                </h5>

                <h2>
                    ${reservation.slot_number ?? "N/A"}
                </h2>

            </div>


            <div class="reservation-status">

                <span class="status-badge">

                    ${reservation.status ?? "N/A"}

                </span>

            </div>


            <div class="reservation-actions">

                <button
                    class="btn btn-success"
                    onclick="
                        viewQR(
                            ${reservation.reservation_id}
                        )
                    "
                >

                    <i class="bi bi-qr-code"></i>

                    View QR

                </button>


                <button
                    class="btn btn-primary"
                    onclick="
                        viewDetails(
                            ${reservation.reservation_id}
                        )
                    "
                >

                    <i class="bi bi-eye"></i>

                    View Details

                </button>

            </div>

        </div>

    `;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "N/A";

    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// VIEW QR
// =====================================================

function viewQR(
    reservationId
) {

    console.log(
        "Opening QR for reservation:",
        reservationId
    );


    window.location.href =
        `qr.html?reservation_id=${reservationId}`;

}


// =====================================================
// VIEW DETAILS
// =====================================================

function viewDetails(
    reservationId
) {

    console.log(
        "Opening details for reservation:",
        reservationId
    );


    window.location.href =
        `history.html?reservation_id=${reservationId}`;

}


// =====================================================
// WEBSOCKET
// =====================================================

let socket = null;


function connectWebSocket() {

    console.log(
        "Connecting User Dashboard WebSocket..."
    );


    socket = new WebSocket(
        "ws://127.0.0.1:8000/ws"
    );


    // =================================================
    // CONNECTED
    // =================================================

    socket.onopen = function () {

        console.log(
            "✅ User Dashboard WebSocket connected"
        );

    };


    // =================================================
    // MESSAGE
    // =================================================

    socket.onmessage = function (
        event
    ) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "📡 Dashboard WebSocket:",
                data
            );


            // =============================================
            // CURRENT USER CHECK
            // =============================================

            const currentUserId =
                sessionStorage.getItem(
                    "user_id"
                );


            if (
                data.user_id &&
                currentUserId &&
                String(data.user_id) !==
                String(currentUserId)
            ) {

                console.log(
                    "Ignoring event for another user"
                );

                return;

            }


            // =============================================
            // RESERVATION CREATED
            // =============================================

            if (
                data.event ===
                "reservation_created"
            ) {

                console.log(
                    "🔄 Reservation created → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // RESERVATION UPDATED
            // =============================================

            if (
                data.event ===
                "reservation_updated"
            ) {

                console.log(
                    "🔄 Reservation updated → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // RESERVATION DELETED
            // =============================================

            if (
                data.event ===
                "reservation_deleted"
            ) {

                console.log(
                    "🔄 Reservation deleted → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // VEHICLE ADDED
            // =============================================

            if (
                data.event ===
                "vehicle_added"
            ) {

                console.log(
                    "🚗 Vehicle added → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // VEHICLE UPDATED
            // =============================================

            if (
                data.event ===
                "vehicle_updated"
            ) {

                console.log(
                    "🚗 Vehicle updated → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // VEHICLE DELETED
            // =============================================

            if (
                data.event ===
                "vehicle_deleted"
            ) {

                console.log(
                    "🚗 Vehicle deleted → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // PAYMENT COMPLETED
            // =============================================

            if (
                data.event ===
                "payment_completed"
            ) {

                console.log(
                    "💰 Payment completed → Reload dashboard"
                );

                loadDashboard();

            }


            // =============================================
            // SLOT UPDATED
            // =============================================

            if (
                data.event ===
                "slot_updated"
            ) {

                console.log(
                    "🅿️ Slot updated → Reload dashboard"
                );

                loadDashboard();

            }

        }

        catch (error) {

            console.error(
                "❌ WebSocket JSON Error:",
                error
            );

        }

    };


    // =================================================
    // ERROR
    // =================================================

    socket.onerror = function (
        error
    ) {

        console.error(
            "❌ Dashboard WebSocket Error:",
            error
        );

    };


    // =================================================
    // CLOSED
    // =================================================

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


// ------------------------------
const sidebar = document.querySelector(".sidebar");
const menuBtn = document.querySelector(".menu-btn");

if (sidebar && menuBtn) {

    menuBtn.addEventListener("click", function () {

        sidebar.classList.toggle("show");

    });

}



// =====================================================
// START
// =====================================================

loadDashboard();

connectWebSocket();
loadNavbarUser();
