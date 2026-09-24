const API_URL =
    "https://smart-parking-system-tz4z.onrender.com";


const token =
    sessionStorage.getItem("access_token");


if (!token) {

    alert("Please login first.");

    window.location.href =
        "login.html";

}
async function loadReservations() {

    try {

        const response = await fetch(
            `${API_URL}/owner/reservations`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        const data =
            await response.json();


        console.log(
            "Owner Reservations:",
            data
        );


        if (!response.ok) {

            if (response.status === 401) {

                alert(
                    "Login expired. Please login again."
                );

                sessionStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";

                return;

            }


            throw new Error(
                data.detail ||
                "Failed to load reservations"
            );

        }


        displayReservations(data);

    }

    catch (error) {

        console.error(
            "Reservation error:",
            error
        );

    }

}
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
                    colspan="6"
                    class="no-data"
                >

                    No reservations found.

                </td>

            </tr>

        `;

        return;

    }


    reservations.forEach(
        reservation => {

            const row =
                document.createElement("tr");


            row.dataset.id =
                reservation.reservation_id;


            row.innerHTML = `

                <td>
                    ${reservation.reservation_id}
                </td>


                <td>
                    ${reservation.user_name}
                </td>


                <td>
                    ${reservation.parking_name}
                </td>


                <td>
                    ${reservation.slot_number}
                </td>


                <td>
                    ${reservation.vehicle_number}
                </td>


                <td>

                    <details class="action-menu">
                        <summary aria-label="Open reservation actions">
                            <i class="bi bi-three-dots-vertical" aria-hidden="true"></i>
                        </summary>
                        <div class="action-menu-panel">
                            <button
                                class="view-btn"
                                onclick="viewReservation(
                                    ${reservation.reservation_id}
                                )"
                            >
                                <i class="bi bi-eye" aria-hidden="true"></i>
                                View details
                            </button>
                            <button
                                class="delete-btn"
                                onclick="deleteReservation(
                                    ${reservation.reservation_id}
                                )"
                            >
                                <i class="bi bi-trash" aria-hidden="true"></i>
                                Delete reservation
                            </button>
                        </div>
                    </details>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}
// ----------------------view-----------------------
async function viewReservation(reservationId) {

    const modal =
        document.getElementById(
            "reservationModal"
        );

    const details =
        document.getElementById(
            "reservationDetails"
        );


    // Show modal immediately

    modal.style.display = "flex";


    // Loading message

    details.innerHTML = `
        <p>Loading reservation details...</p>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/owner/reservations/${reservationId}`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Reservation details:",
            data
        );


        if (!response.ok) {

            details.innerHTML = `
                <p>
                    ${data.detail ||
                    "Unable to load reservation"}
                </p>
            `;

            return;

        }


        // =====================================
        // DISPLAY DETAILS
        // =====================================

        details.innerHTML = `

            <div class="detail-row">

                <span class="detail-label">
                    Reservation ID
                </span>

                <span class="detail-value">
                    #${data.reservation_id}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    User Name
                </span>

                <span class="detail-value">
                    ${data.user_name || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Email
                </span>

                <span class="detail-value">
                    ${data.user_email || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Phone
                </span>

                <span class="detail-value">
                    ${data.user_phone || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Parking
                </span>

                <span class="detail-value">
                    ${data.parking_name || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Area
                </span>

                <span class="detail-value">
                    ${data.parking_area || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    City
                </span>

                <span class="detail-value">
                    ${data.parking_city || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Address
                </span>

                <span class="detail-value">
                    ${data.parking_address || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Slot
                </span>

                <span class="detail-value">
                    ${data.slot_number || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Vehicle Number
                </span>

                <span class="detail-value">
                    ${data.vehicle_number || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Entry Time
                </span>

                <span class="detail-value">
                    ${formatDateTime(data.entry_time)}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Exit Time
                </span>

                <span class="detail-value">
                    ${formatDateTime(data.exit_time)}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Status
                </span>

                <span class="detail-value">
                    ${data.status || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Amount
                </span>

                <span class="detail-value">
                    ₹${data.amount ?? "-"}
                </span>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "View reservation error:",
            error
        );


        details.innerHTML = `
            <p>
                Unable to load reservation details.
            </p>
        `;

    }

}


function formatDateTime(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return value;

    }


    return date.toLocaleString();

}

function closeReservationModal() {

    document.getElementById(
        "reservationModal"
    ).style.display = "none";

}

// -----------------------delete-------------------

async function deleteReservation(
    reservationId
) {

    const confirmDelete =
        confirm(
            `Are you sure you want to delete Reservation #${reservationId}?`
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/owner/reservations/admin/reservations/${reservationId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const responseText =
            await response.text();


        let data = {};


        if (responseText) {

            try {

                data = JSON.parse(responseText);

            }

            catch (jsonError) {

                console.error(
                    "Invalid delete response:",
                    responseText
                );

            }

        }


        console.log(
            "Delete response:",
            data
        );


        if (!response.ok) {

            alert(
                data.detail ||
                `Delete failed (${response.status})`
            );

            return;

        }


        alert("Reservation deleted successfully");


        await loadReservations();

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

// ----------------------------------
let socket;


function connectWebSocket() {

    console.log(
        "Connecting WebSocket..."
    );


    socket =
        new WebSocket(
            "ws://smart-parking-system-tz4z.onrender.com/ws"
        );


    socket.onopen =
        function() {

            console.log(
                "✅ Owner WebSocket connected"
            );

        };


    socket.onmessage =
        function(event) {

            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "WebSocket:",
                    data
                );


                // =========================================
                // NEW RESERVATION
                // =========================================

                if (
                    data.event ===
                    "reservation_created"
                ) {

                    loadReservations();

                }


                // =========================================
                // UPDATED RESERVATION
                // =========================================

                if (
                    data.event ===
                    "reservation_updated"
                ) {

                    loadReservations();

                }


                // =========================================
                // DELETED RESERVATION
                // =========================================

                if (
                    data.event ===
                    "reservation_deleted"
                ) {

                    removeReservationRow(
                        data.reservation_id
                    );

                }


                // =========================================
                // SLOT UPDATED
                // =========================================

                if (
                    data.event ===
                    "slot_updated"
                ) {

                    console.log(
                        "Slot updated:",
                        data
                    );

                }

            }

            catch(error) {

                console.error(
                    "WebSocket error:",
                    error
                );

            }

        };


    socket.onerror =
        function(error) {

            console.error(
                "WebSocket error:",
                error
            );

        };


    socket.onclose =
        function() {

            console.log(
                "WebSocket disconnected"
            );


            setTimeout(
                connectWebSocket,
                3000
            );

        };

}
function removeReservationRow(
    reservationId
) {

    const row =
        document.querySelector(
            `tr[data-id="${reservationId}"]`
        );


    if (row) {

        row.remove();

        console.log(
            `Reservation ${reservationId} removed`
        );

    }

}
loadReservations();

connectWebSocket();
