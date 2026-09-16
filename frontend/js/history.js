const API_URL =
    "http://127.0.0.1:8000";


// ==========================================
// GET TOKEN
// ==========================================

function getToken() {

    return sessionStorage.getItem(
        "access_token"
    );

}


// ==========================================
// CHECK LOGIN
// ==========================================

const token =
    getToken();


if (!token) {

    window.location.replace(
        "login.html"
    );

}


// ==========================================
// STORE HISTORY
// ==========================================

let historyData = [];


// ==========================================
// LOAD HISTORY
// ==========================================

async function loadHistory() {

    try {

        const response =
            await fetch(
                `${API_URL}/reservation/my-history`,
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


        const data =
            await response.json();


        console.log(
            "History API:",
            data
        );


        // =====================================
        // TOKEN ERROR
        // =====================================

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.replace(
                "login.html"
            );

            return;
        }


        // =====================================
        // OTHER ERROR
        // =====================================

        if (!response.ok) {

            console.error(
                data
            );

            showMessage(
                data.detail ||
                "Unable to load history"
            );

            return;
        }


        historyData =
            Array.isArray(data)
                ? data
                : [];


        displayHistory(
            historyData
        );

    }

    catch (error) {

        console.error(
            "History error:",
            error
        );

        showMessage(
            "Server error. Please try again."
        );

    }

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory(
    history
) {

    const tbody =
        document.getElementById(
            "historyTableBody"
        );


    tbody.innerHTML = "";


    // =====================================
    // NO HISTORY
    // =====================================

    if (
        !history ||
        history.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    class="loading"
                >

                    <i class="bi bi-clock-history"></i>

                    No parking history found.

                </td>

            </tr>

        `;

        return;
    }


    // =====================================
    // LOOP
    // =====================================

    history.forEach(
        booking => {

            const entry =
                booking.entry_time
                    ? new Date(
                        booking.entry_time
                    )
                    : null;


            const exit =
                booking.exit_time
                    ? new Date(
                        booking.exit_time
                    )
                    : null;


            // Calculate duration

            const duration =
                calculateDuration(
                    entry,
                    exit
                );


            // Format date

            const date =
                entry
                    ? entry.toLocaleDateString()
                    : "-";


            // Format entry

            // const entryTime =
            //     entry
            //         ? entry.toLocaleTimeString(
            //             [],
            //             {
            //                 hour: "2-digit",
            //                 minute: "2-digit"
            //             }
            //         )
            //         : "-";

            const entryTime =
    booking.entry_time
        ? formatIST(booking.entry_time)
        : "-";


            // Format exit

            // const exitTime =
            //     exit
            //         ? exit.toLocaleTimeString(
            //             [],
            //             {
            //                 hour: "2-digit",
            //                 minute: "2-digit"
            //             }
            //         )
            //         : "-";

            const exitTime =
    booking.exit_time
        ? formatIST(booking.exit_time)
        : "-";

            const amount =
                booking.amount ??
                booking.total_amount ??
                0;


            const paymentStatus =
                booking.payment_status ||
                "PENDING";


            const status =
                booking.status ||
                "UNKNOWN";


            tbody.innerHTML += `

                <tr>

                    <td>

                        #${booking.reservation_id}

                    </td>


                    <td>

                        ${escapeHTML(
                            booking.parking_name ||
                            "N/A"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            booking.slot_number ||
                            "N/A"
                        )}

                    </td>


                    <td>

                        ${date}

                    </td>


                    <td>

                        ${entryTime}

                    </td>


                    <td>

                        ${exitTime}

                    </td>


                    <td>

                        ${duration}

                    </td>


                    <td>

                        ₹${amount}

                    </td>


                    <td>

                        <span
                            class="status ${getStatusClass(
                                paymentStatus
                            )}"
                        >

                            ${paymentStatus}

                        </span>

                    </td>


                    <td>

                        <span
                            class="status ${getStatusClass(
                                status
                            )}"
                        >

                            ${status}

                        </span>

                    </td>


                    <td>

                        <button
                            class="btn btn-sm btn-primary"
                            onclick="viewDetails(
                                ${booking.reservation_id}
                            )"
                        >

                            <i class="bi bi-eye"></i>

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// ==========================================
// CALCULATE DURATION
// ==========================================

function calculateDuration(
    entry,
    exit
) {

    if (!entry || !exit) {

        return "-";

    }


    const difference =
        exit.getTime() -
        entry.getTime();


    if (difference < 0) {

        return "-";

    }


    const totalMinutes =
        Math.floor(
            difference /
            (1000 * 60)
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (hours === 0) {

        return `${minutes} min`;

    }


    return `${hours}h ${minutes}m`;

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(
    status
) {

    const value =
        String(status)
            .toLowerCase();


    if (
        value === "paid" ||
        value === "completed"
    ) {

        return "completed";

    }


    if (
        value === "pending" ||
        value === "pending_payment"
    ) {

        return "pending";

    }


    if (
        value === "cancelled"
    ) {

        return "cancelled";

    }


    return "pending";

}


// ==========================================
// SEARCH + DATE FILTER
// ==========================================

function filterHistory() {

    const search =
        document.getElementById(
            "searchHistory"
        )
        .value
        .trim()
        .toLowerCase();


    const fromDate =
        document.getElementById(
            "fromDate"
        ).value;


    const toDate =
        document.getElementById(
            "toDate"
        ).value;


    const filtered =
        historyData.filter(
            booking => {

                // Search

                const searchText = (

                    String(
                        booking.reservation_id
                    )

                    + " " +

                    String(
                        booking.parking_name || ""
                    )

                    + " " +

                    String(
                        booking.slot_number || ""
                    )

                ).toLowerCase();


                if (
                    search &&
                    !searchText.includes(
                        search
                    )
                ) {

                    return false;

                }


                // Date filter

                if (
                    booking.entry_time
                ) {

                    const bookingDate =
                        new Date(
                            booking.entry_time
                        );

                    const dateOnly =
                        bookingDate
                            .toISOString()
                            .split("T")[0];


                    if (
                        fromDate &&
                        dateOnly < fromDate
                    ) {

                        return false;

                    }


                    if (
                        toDate &&
                        dateOnly > toDate
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    displayHistory(
        filtered
    );

}


// ==========================================
// RESET FILTER
// ==========================================

function resetFilter() {

    document.getElementById(
        "searchHistory"
    ).value = "";


    document.getElementById(
        "fromDate"
    ).value = "";


    document.getElementById(
        "toDate"
    ).value = "";


    displayHistory(
        historyData
    );

}


// ==========================================
// VIEW DETAILS
// ==========================================

// ==========================================
// VIEW RESERVATION DETAILS
// ==========================================

async function viewDetails(reservationId) {

    console.log(
        "Viewing reservation:",
        reservationId
    );


    // ======================================
    // GET MODAL CONTENT
    // ======================================

    const content =
        document.getElementById(
            "reservationDetailsContent"
        );


    if (!content) {

        console.error(
            "reservationDetailsContent not found"
        );

        return;
    }


    // ======================================
    // SHOW LOADING
    // ======================================

    content.innerHTML = `

        <div class="text-center py-4">

            <div
                class="spinner-border text-success"
            ></div>

            <p class="mt-2">
                Loading reservation details...
            </p>

        </div>

    `;


    // ======================================
    // OPEN MODAL
    // ======================================

    const modalElement =
        document.getElementById(
            "reservationDetailsModal"
        );


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();


    // ======================================
    // GET TOKEN
    // ======================================

    const token =
        sessionStorage.getItem(
            "access_token"
        );


    if (!token) {

        window.location.replace(
            "login.html"
        );

        return;
    }


    try {

        // ==================================
        // API CALL
        // ==================================

        const response =
            await fetch(
                `${API_URL}/reservation/details/${reservationId}`,
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


        const data =
            await response.json();


        console.log(
            "Reservation details:",
            data
        );


        // ==================================
        // ERROR
        // ==================================

        if (!response.ok) {

            content.innerHTML = `

                <div
                    class="alert alert-danger"
                >

                    ${data.detail ||
                        "Unable to load reservation details"}

                </div>

            `;

            return;
        }


        // ==================================
        // DISPLAY DETAILS
        // ==================================

        displayReservationDetails(
            data
        );


    }

    catch (error) {

        console.error(
            "View details error:",
            error
        );


        content.innerHTML = `

            <div
                class="alert alert-danger"
            >

                Server error.
                Please try again.

            </div>

        `;

    }

}
// ==========================================
// DISPLAY RESERVATION DETAILS
// ==========================================

function displayReservationDetails(
    booking
) {

    const content =
        document.getElementById(
            "reservationDetailsContent"
        );


    // ======================================
    // DATE
    // ======================================

    const entry =
        booking.entry_time
            ? new Date(
                booking.entry_time
            )
            : null;


    const exit =
        booking.exit_time
            ? new Date(
                booking.exit_time
            )
            : null;


    const date =
        entry
            ? entry.toLocaleDateString()
            : "N/A";


    // ======================================
    // ENTRY TIME
    // ======================================

    // const entryTime =
    //     entry
    //         ? entry.toLocaleTimeString(
    //             [],
    //             {
    //                 hour: "2-digit",
    //                 minute: "2-digit"
    //             }
    //         )
    //         : "N/A";
    const entryTime =
    booking.entry_time
        ? formatIST(booking.entry_time)
        : "N/A";


    // ======================================
    // EXIT TIME
    // ======================================

    // const exitTime =
    //     exit
    //         ? exit.toLocaleTimeString(
    //             [],
    //             {
    //                 hour: "2-digit",
    //                 minute: "2-digit"
    //             }
    //         )
    //         : "N/A";
    const exitTime =
    booking.exit_time
        ? formatIST(booking.exit_time)
        : "N/A";


    // ======================================
    // DURATION
    // ======================================

    const duration =
        calculateDuration(
            entry,
            exit
        );


    // ======================================
    // VALUES
    // ======================================

    const parkingName =
        booking.parking_name ||
        "N/A";


    const area =
        booking.area ||
        "N/A";


    const city =
        booking.city ||
        "N/A";


    const address =
        booking.address ||
        "N/A";


    const slotNumber =
        booking.slot_number ||
        "N/A";


    const amount =
        booking.amount ??
        booking.total_amount ??
        0;


    const paymentStatus =
        booking.payment_status ||
        "PENDING";


    const status =
        booking.status ||
        "N/A";


    // ======================================
    // HTML
    // ======================================

    content.innerHTML = `

        <div class="row g-3">

            <!-- BOOKING ID -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Booking ID
                    </small>

                    <strong>
                        #${booking.reservation_id}
                    </strong>

                </div>

            </div>


            <!-- PARKING -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Parking
                    </small>

                    <strong>
                        ${escapeHTML(
                            parkingName
                        )}
                    </strong>

                </div>

            </div>


            <!-- AREA -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Area
                    </small>

                    <strong>
                        ${escapeHTML(
                            area
                        )}
                    </strong>

                </div>

            </div>


            <!-- CITY -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        City
                    </small>

                    <strong>
                        ${escapeHTML(
                            city
                        )}
                    </strong>

                </div>

            </div>


            <!-- ADDRESS -->

            <div class="col-12">

                <div class="details-box">

                    <small>
                        Address
                    </small>

                    <strong>
                        ${escapeHTML(
                            address
                        )}
                    </strong>

                </div>

            </div>


            <!-- SLOT -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Parking Slot
                    </small>

                    <strong>
                        ${escapeHTML(
                            slotNumber
                        )}
                    </strong>

                </div>

            </div>


            <!-- DATE -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Date
                    </small>

                    <strong>
                        ${date}
                    </strong>

                </div>

            </div>


            <!-- ENTRY -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Entry Time
                    </small>

                    <strong>
                        ${entryTime}
                    </strong>

                </div>

            </div>


            <!-- EXIT -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Exit Time
                    </small>

                    <strong>
                        ${exitTime}
                    </strong>

                </div>

            </div>


            <!-- DURATION -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Duration
                    </small>

                    <strong>
                        ${duration}
                    </strong>

                </div>

            </div>


            <!-- AMOUNT -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Amount
                    </small>

                    <strong>
                        ₹${amount}
                    </strong>

                </div>

            </div>


            <!-- PAYMENT -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Payment
                    </small>

                    <span
                        class="status ${getStatusClass(
                            paymentStatus
                        )}"
                    >

                        ${paymentStatus}

                    </span>

                </div>

            </div>


            <!-- STATUS -->

            <div class="col-md-6">

                <div class="details-box">

                    <small>
                        Reservation Status
                    </small>

                    <span
                        class="status ${getStatusClass(
                            status
                        )}"
                    >

                        ${status}

                    </span>

                </div>

            </div>

        </div>

    `;
}

// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message
) {

    const tbody =
        document.getElementById(
            "historyTableBody"
        );


    tbody.innerHTML = `

        <tr>

            <td
                colspan="11"
                class="loading"
            >

                ${message}

            </td>

        </tr>

    `;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "token"
    );

    window.location.replace(
        "login.html"
    );

}



// ==========================================
// WEBSOCKET
// ==========================================

let socket = null;


function connectHistoryWebSocket() {

    console.log(
        "Connecting User History WebSocket..."
    );


    socket = new WebSocket(
        "ws://127.0.0.1:8000/ws"
    );


    socket.onopen = function () {

        console.log(
            "✅ History WebSocket connected"
        );

    };


    socket.onmessage = function (event) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "History WebSocket:",
                data
            );


            // ==================================
            // HISTORY RELATED EVENTS
            // ==================================

            if (
                data.event ===
                "payment_completed"
            ) {

                console.log(
                    "Payment completed. Updating history..."
                );

                loadHistory();

            }


            if (
                data.event ===
                "parking_exit"
            ) {

                console.log(
                    "Parking exit completed. Updating history..."
                );

                loadHistory();

            }


            if (
                data.event ===
                "reservation_updated"
            ) {

                loadHistory();

            }


            if (
                data.event ===
                "reservation_deleted"
            ) {

                loadHistory();

            }

        }

        catch (error) {

            console.error(
                "History WebSocket JSON error:",
                error
            );

        }

    };


    socket.onerror = function (error) {

        console.error(
            "History WebSocket error:",
            error
        );

    };


    socket.onclose = function () {

        console.log(
            "History WebSocket disconnected"
        );


        setTimeout(
            connectHistoryWebSocket,
            3000
        );

    };

}
function parseUTCDate(dateTime) {

    if (!dateTime) {
        return null;
    }

    let value = String(dateTime).trim();

    // If backend sends datetime without timezone,
    // treat it as UTC.
    if (
        !value.endsWith("Z") &&
        !/[+-]\d{2}:\d{2}$/.test(value)
    ) {
        value += "Z";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
}


function formatIST(dateTime) {

    const date = parseUTCDate(dateTime);

    if (!date) {
        return "-";
    }

    return date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}


function formatDateIST(dateTime) {

    const date = parseUTCDate(dateTime);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}
loadHistory();

connectHistoryWebSocket();