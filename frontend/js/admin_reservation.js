const API_BASE_URL =
    "https://smart-parking-system-tz4z.onrender.com";


let allReservations = [];

let socket = null;


// =====================================================
// TOKEN
// =====================================================

function getToken() {

    return sessionStorage.getItem(
        "access_token"
    );

}



// =====================================================
// LOAD RESERVATIONS
// =====================================================

async function loadReservations() {

    const token =
        getToken();


    if (!token) {

        console.error(
            "Admin token not found"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin_reservations/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "Reservation API error:",
                response.status
            );

            console.error(
                await response.text()
            );

            return;

        }


        const data =
            await response.json();


        console.log(
            "Admin reservations:",
            data
        );


        allReservations = data;


        displayReservations(
            allReservations
        );


    } catch (error) {

        console.error(
            "Error loading reservations:",
            error
        );

    }

}



// =====================================================
// DISPLAY RESERVATIONS
// =====================================================

function displayReservations(
    reservations
) {

    const tbody =
        document.getElementById(
            "reservationTableBody"
        );


    tbody.innerHTML = "";


    if (
        !reservations ||
        reservations.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted"
                >

                    No reservations found

                </td>

            </tr>

        `;

        return;

    }


    reservations.forEach(
        reservation => {

            addReservationRow(
                reservation,
                tbody
            );

        }
    );

}



// =====================================================
// ADD RESERVATION ROW
// =====================================================

function addReservationRow(
    reservation,
    tbody
) {

    const row =
        document.createElement("tr");


    row.id =
        `reservation-row-${reservation.id}`;


    row.innerHTML = `

        <td>
            ${reservation.id ?? "-"}
        </td>

        <td>
            ${reservation.user_name ?? "-"}
        </td>

        <td>
            ${reservation.parking_name ?? "-"}
        </td>

        <td>
            ${reservation.slot_number ?? "-"}
        </td>

        <td>
            ${reservation.vehicle_number ?? "-"}
        </td>

        <td>

            ${getStatusBadge(
                reservation.status
            )}

        </td>

        <td>

            <button
                class="btn btn-view btn-sm"
                onclick="viewReservation(${reservation.id})"
            >

                <i class="bi bi-eye"></i>

                View

            </button>


            <button
                class="btn btn-delete btn-sm ms-2"
                onclick="deleteReservation(${reservation.id})"
            >

                <i class="bi bi-trash"></i>

                Delete

            </button>

        </td>

    `;


    tbody.appendChild(row);

}



// =====================================================
// STATUS BADGE
// =====================================================

function getStatusBadge(
    status
) {

    const value =
        status || "Unknown";


    let badgeClass =
        "bg-secondary";


    if (
        value.toLowerCase() ===
        "reserved"
    ) {

        badgeClass =
            "bg-warning text-dark";

    }


    if (
        value.toLowerCase() ===
        "parked"
    ) {

        badgeClass =
            "bg-primary";

    }


    if (
        value.toLowerCase() ===
        "completed"
    ) {

        badgeClass =
            "bg-success";

    }


    if (
        value.toLowerCase() ===
        "cancelled"
    ) {

        badgeClass =
            "bg-danger";

    }


    return `

        <span class="badge ${badgeClass}">

            ${value}

        </span>

    `;

}



// =====================================================
// VIEW RESERVATION
// =====================================================

async function viewReservation(
    reservationId
) {

    try {

        const token =
            getToken();


        const response =
            await fetch(
                `${API_BASE_URL}/admin_reservations/${reservationId}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "View reservation error:",
                response.status
            );

            return;

        }


        const reservation =
            await response.json();


        console.log(
            "Reservation details:",
            reservation
        );


        fillReservationModal(
            reservation
        );


        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "reservationModal"
                )
            );


        modal.show();


    } catch (error) {

        console.error(
            "View reservation error:",
            error
        );

    }

}



// =====================================================
// FILL MODAL
// =====================================================

// function fillReservationModal(
//     reservation
// ) {

//     document.getElementById(
//         "viewReservationId"
//     ).textContent =
//         reservation.id ?? "-";


//     document.getElementById(
//         "viewStatus"
//     ).innerHTML =
//         getStatusBadge(
//             reservation.status
//         );


//     document.getElementById(
//         "viewUserName"
//     ).textContent =
//         reservation.user_name ?? "-";


//     document.getElementById(
//         "viewUserEmail"
//     ).textContent =
//         reservation.user_email ?? "-";


//     document.getElementById(
//         "viewParkingName"
//     ).textContent =
//         reservation.parking_name ?? "-";


//     document.getElementById(
//         "viewParkingAddress"
//     ).textContent =
//         reservation.parking_address ?? "-";


//     document.getElementById(
//         "viewSlot"
//     ).textContent =
//         reservation.slot_number ?? "-";


//     document.getElementById(
//         "viewVehicleNumber"
//     ).textContent =
//         reservation.vehicle_number ?? "-";


//     document.getElementById(
//         "viewVehicleType"
//     ).textContent =
//         reservation.vehicle_type ?? "-";


//     document.getElementById(
//         "viewReservationDate"
//     ).textContent =
//         formatDate(
//             reservation.reservation_date
//         );


//     document.getElementById(
//         "viewEntryTime"
//     ).textContent =
//         formatDateTime(
//             reservation.entry_time
//         );


//     document.getElementById(
//         "viewExitTime"
//     ).textContent =
//         formatDateTime(
//             reservation.exit_time
//         );


//     document.getElementById(
//         "viewTotalAmount"
//     ).textContent =
//         reservation.total_amount != null
//             ? `₹${reservation.total_amount}`
//             : "-";


//     document.getElementById(
//         "viewCreatedAt"
//     ).textContent =
//         formatDateTime(
//             reservation.created_at
//         );

// }

function fillReservationModal(data) {

    console.log("Reservation details:", data);

    // =========================================
    // RESERVATION
    // =========================================

    document.getElementById("viewReservationId").textContent =
        data.id ?? "-";

    document.getElementById("viewStatus").innerHTML =
        getStatusBadge(data.status);


    // =========================================
    // USER
    // =========================================

    document.getElementById("viewUserName").textContent =
        data.user?.name ??
        data.user?.username ??
        data.user?.email ??
        data.user_name ??
        "-";

    document.getElementById("viewUserEmail").textContent =
        data.user?.email ??
        data.user_email ??
        "-";


    // =========================================
    // PARKING
    // =========================================

    document.getElementById("viewParkingName").textContent =
        data.parking?.parking_name ??
        data.parking?.name ??
        data.parking_name ??
        "-";

    document.getElementById("viewParkingAddress").textContent =
        data.parking?.address ??
        data.parking_address ??
        "-";


    // =========================================
    // SLOT
    // =========================================

    document.getElementById("viewSlot").textContent =
        data.slot?.slot_number ??
        data.slot?.slot_name ??
        data.slot?.name ??
        data.slot?.number ??
        data.slot_number ??
        "-";


    // =========================================
    // VEHICLE
    // =========================================

    document.getElementById("viewVehicleNumber").textContent =
        data.vehicle?.vehicle_number ??
        data.vehicle?.number ??
        data.vehicle_number ??
        "-";

    document.getElementById("viewVehicleType").textContent =
        data.vehicle?.vehicle_type ??
        data.vehicle?.type ??
        data.vehicle_type ??
        "-";


    // =========================================
    // RESERVATION DATE
    // =========================================

    document.getElementById("viewReservationDate").textContent =
    formatDate(
        data.booking_date ??
        data.reservation_date ??
        data.date
    );


    // =========================================
    // ENTRY TIME
    // =========================================

    document.getElementById("viewEntryTime").textContent =
        formatDateTime(
            data.entry_time
        );


    // =========================================
    // EXIT TIME
    // =========================================

    document.getElementById("viewExitTime").textContent =
        formatDateTime(
            data.exit_time
        );


    // =========================================
    // TOTAL AMOUNT
    // =========================================

    document.getElementById("viewTotalAmount").textContent =
        data.total_amount != null
            ? `₹${data.total_amount}`
            : "-";


    // =========================================
    // CREATED AT
    // =========================================

    document.getElementById("viewCreatedAt").textContent =
        formatDateTime(
            data.created_at
        );
}

// =====================================================
// FORMAT DATE
// =====================================================

// function formatDate(
//     value
// ) {

//     if (!value) {
//         return "-";
//     }


//     const date =
//         new Date(value);


//     if (isNaN(date)) {
//         return value;
//     }


//     return date.toLocaleDateString(
//         "en-IN"
//     );

// }

function formatDate(value) {

    if (!value) {
        return "-";
    }

    let dateString = String(value);

    if (
        !dateString.endsWith("Z") &&
        !dateString.includes("+") &&
        !/[+-]\d{2}:\d{2}$/.test(dateString)
    ) {
        dateString = dateString.replace(" ", "T") + "Z";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}



// =====================================================
// FORMAT DATE TIME
// =====================================================

// function formatDateTime(
//     value
// ) {

//     if (!value) {
//         return "-";
//     }


//     const date =
//         new Date(value);


//     if (isNaN(date)) {
//         return value;
//     }


//     return date.toLocaleString(
//         "en-IN"
//     );

// }

function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    let dateString = String(value);

    // If backend sends UTC without timezone information
    if (
        !dateString.endsWith("Z") &&
        !dateString.includes("+") &&
        !/[+-]\d{2}:\d{2}$/.test(dateString)
    ) {
        dateString = dateString.replace(" ", "T") + "Z";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}


// =====================================================
// SEARCH
// =====================================================

function searchReservations() {

    const input =
        document.getElementById(
            "searchReservation"
        );


    const value =
        input.value
            .trim()
            .toLowerCase();


    if (!value) {

        displayReservations(
            allReservations
        );

        return;

    }


    const filtered =
        allReservations.filter(
            reservation => {

                return (

                    String(
                        reservation.id ?? ""
                    )
                    .toLowerCase()
                    .includes(value)

                    ||

                    String(
                        reservation.user_name ?? ""
                    )
                    .toLowerCase()
                    .includes(value)

                    ||

                    String(
                        reservation.parking_name ?? ""
                    )
                    .toLowerCase()
                    .includes(value)

                    ||

                    String(
                        reservation.slot_number ?? ""
                    )
                    .toLowerCase()
                    .includes(value)

                    ||

                    String(
                        reservation.vehicle_number ?? ""
                    )
                    .toLowerCase()
                    .includes(value)

                );

            }
        );


    displayReservations(
        filtered
    );

}



// =====================================================
// DELETE RESERVATION
// =====================================================

async function deleteReservation(
    reservationId
) {

    const confirmDelete =
        confirm(
            `Delete reservation #${reservationId}?`
        );


    if (!confirmDelete) {
        return;
    }


    const token =
        getToken();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin_reservations/${reservationId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "Delete error:",
                await response.text()
            );

            return;

        }


        console.log(
            "Reservation deleted:",
            reservationId
        );


        removeReservation(
            reservationId
        );


    } catch (error) {

        console.error(
            "Delete reservation error:",
            error
        );

    }

}



// =====================================================
// REMOVE RESERVATION FROM UI
// =====================================================

function removeReservation(
    reservationId
) {

    allReservations =
        allReservations.filter(
            reservation =>
                Number(reservation.id) !==
                Number(reservationId)
        );


    displayReservations(
        allReservations
    );

}



// =====================================================
// WEBSOCKET
// =====================================================

function connectWebSocket() {

    socket =
        new WebSocket(
            "ws://smart-parking-system-tz4z.onrender.com/admin_reservations/ws"
        );


    socket.onopen =
        function() {

            console.log(
                "Admin reservation WebSocket connected"
            );


            document.getElementById(
                "socketStatus"
            ).textContent =
                "Live";


            document.getElementById(
                "socketStatus"
            ).className =
                "badge bg-success";


            socket.send(
                "admin_connected"
            );

        };


    socket.onmessage =
        function(event) {

            try {

                const message =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "Reservation WebSocket:",
                    message
                );


                if (
                    message.event ===
                    "reservation_created"
                ) {

                    handleReservationCreated(
                        message.data
                    );

                }


                else if (
                    message.event ===
                    "reservation_updated"
                ) {

                    handleReservationUpdated(
                        message.data
                    );

                }


                else if (
                    message.event ===
                    "reservation_deleted"
                ) {

                    handleReservationDeleted(
                        message.data
                    );

                }


            } catch (error) {

                console.error(
                    "WebSocket message error:",
                    error
                );

            }

        };


    socket.onerror =
        function(error) {

            console.error(
                "Reservation WebSocket error:",
                error
            );

            document.getElementById(
                "socketStatus"
            ).textContent =
                "Disconnected";


            document.getElementById(
                "socketStatus"
            ).className =
                "badge bg-danger";

        };


    socket.onclose =
        function() {

            console.log(
                "Reservation WebSocket disconnected"
            );


            document.getElementById(
                "socketStatus"
            ).textContent =
                "Reconnecting...";


            document.getElementById(
                "socketStatus"
            ).className =
                "badge bg-warning text-dark";


            setTimeout(
                connectWebSocket,
                3000
            );

        };

}



// =====================================================
// NEW RESERVATION
// =====================================================

function handleReservationCreated(
    reservation
) {

    console.log(
        "New reservation:",
        reservation
    );


    const exists =
        allReservations.some(
            item =>
                Number(item.id) ===
                Number(reservation.id)
        );


    if (exists) {
        return;
    }


    allReservations.unshift(
        reservation
    );


    displayReservations(
        allReservations
    );

}



// =====================================================
// UPDATED RESERVATION
// =====================================================

function handleReservationUpdated(
    reservation
) {

    const index =
        allReservations.findIndex(
            item =>
                Number(item.id) ===
                Number(reservation.id)
        );


    if (index !== -1) {

        allReservations[index] =
            reservation;

    }


    else {

        allReservations.unshift(
            reservation
        );

    }


    displayReservations(
        allReservations
    );

}



// =====================================================
// DELETED RESERVATION
// =====================================================

function handleReservationDeleted(
    data
) {

    const reservationId =
        data.id ??
        data.reservation_id;


    removeReservation(
        reservationId
    );

}



// =====================================================
// ENTER KEY SEARCH
// =====================================================

document
    .getElementById(
        "searchReservation"
    )
    ?.addEventListener(
        "keyup",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                searchReservations();

            }

        }
    );



// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadReservations();

        connectWebSocket();

    }
);

// --------------delete----------------------\
async function deleteReservation(reservationId) {

    const confirmDelete = confirm(
        `Are you sure you want to delete Reservation #${reservationId}?`
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/owner/reservations/${reservationId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        // -----------------------------------------
        // Safely read response
        // -----------------------------------------

        const text = await response.text();

        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        }
        catch (jsonError) {

            console.error(
                "Invalid JSON response:",
                text
            );
        }

        console.log(
            "Delete status:",
            response.status
        );

        console.log(
            "Delete response:",
            data
        );

        // -----------------------------------------
        // ERROR
        // -----------------------------------------

        if (!response.ok) {

            alert(
                data.detail ||
                `Delete failed (${response.status})`
            );

            return;
        }

        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        alert(
            "Reservation deleted successfully"
        );

        // -----------------------------------------
        // Remove row immediately
        // -----------------------------------------

        const row = document.querySelector(
            `tr[data-id="${reservationId}"]`
        );

        if (row) {
            row.remove();
        }

    }
    catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete reservation."
        );
    }
}