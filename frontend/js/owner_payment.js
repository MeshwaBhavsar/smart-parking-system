const API_URL =
    "https://smart-parking-system-tz4z.onrender.com";


const token =
    sessionStorage.getItem(
        "access_token"
    );


if (!token) {

    alert(
        "Please login first."
    );

    window.location.href =
        "login.html";

}

async function loadPayments() {

    console.log("loadPayments() started");

    try {

        const response =
            await fetch(
                `${API_URL}/owner/payments/`,
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
            "Owner Payments:",
            data
        );


        if (!response.ok) {

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";

                return;

            }


            throw new Error(
                data.detail ||
                "Failed to load payments"
            );

        }


        displayPayments(data);

    }

    catch (error) {

        console.error(
            "Payment error:",
            error
        );

    }


}

function displayPayments(
    payments
) {

    const tbody =
        document.getElementById(
            "paymentTableBody"
        );


    tbody.innerHTML = "";


    if (
        !payments ||
        payments.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="loading"
                >

                    No payments found.

                </td>

            </tr>

        `;

        return;

    }


    payments.forEach(
        payment => {

            const row =
                document.createElement(
                    "tr"
                );


            row.dataset.id =
                payment.payment_id;


            row.innerHTML = `

                <td>
                    ${payment.payment_id}
                </td>


                <td>
                    ${payment.user_id}
                </td>


                <td>
                    ${payment.reservation_id}
                </td>


                <td>
                    ₹${payment.amount}
                </td>


                <td>
                    ${payment.payment_method}
                </td>


                <td>
                    <span class="status-badge" data-status="${payment.payment_status || ""}">
                        ${payment.payment_status}
                    </span>
                </td>


                <td>

                    <button
                        class="view-btn"
                        onclick="
                            viewPayment(
                                ${payment.payment_id}
                            )
                        "
                    >
                        <i class="bi bi-eye" aria-hidden="true"></i>
                        View
                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}

async function viewPayment(
    paymentId
) {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    const details =
        document.getElementById(
            "paymentDetails"
        );


    // Open modal

    modal.style.display =
        "flex";


    // Loading

    details.innerHTML = `

        <p>
            Loading payment details...
        </p>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/owner/payments/${paymentId}`,
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
            "Payment Details:",
            data
        );


        if (!response.ok) {

            details.innerHTML = `

                <p>
                    ${
                        data.detail ||
                        "Unable to load payment"
                    }
                </p>

            `;

            return;

        }


        details.innerHTML = `

            <div class="detail-row">

                <span class="detail-label">
                    Payment ID
                </span>

                <span class="detail-value">
                    #${data.payment_id}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    User ID
                </span>

                <span class="detail-value">
                    ${data.user_id}
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
                    Reservation ID
                </span>

                <span class="detail-value">
                    #${data.reservation_id}
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
                    Amount
                </span>

                <span class="detail-value">
                    ₹${data.amount ?? "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Payment Method
                </span>

                <span class="detail-value">
                    ${data.payment_method || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Payment Status
                </span>

                <span class="detail-value">
                    ${data.payment_status || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Transaction ID
                </span>

                <span class="detail-value">
                    ${data.transaction_id || "-"}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Payment Date
                </span>

                <span class="detail-value">
                    ${formatDateTime(
                        data.payment_date
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Entry Time
                </span>

                <span class="detail-value">
                    ${formatDateTime(
                        data.entry_time
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Exit Time
                </span>

                <span class="detail-value">
                    ${formatDateTime(
                        data.exit_time
                    )}
                </span>

            </div>


            <div class="detail-row">

                <span class="detail-label">
                    Reservation Status
                </span>

                <span class="detail-value">
                    ${data.reservation_status || "-"}
                </span>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "View payment error:",
            error
        );


        details.innerHTML = `

            <p>
                Unable to load payment details.
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


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString();

}
function closePaymentModal() {

    document.getElementById(
        "paymentModal"
    ).style.display =
        "none";

}
document
    .getElementById("paymentModal")
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {

                closePaymentModal();

            }

        }
    );

let socket;


function connectWebSocket() {

    console.log(
        "Connecting Payment WebSocket..."
    );


    socket =
        new WebSocket(
            "ws://smart-parking-system-tz4z.onrender.com/ws"
        );


    socket.onopen =
        function() {

            console.log(
                "✅ Payment WebSocket connected"
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
                    "Payment WebSocket:",
                    data
                );


                // ==================================
                // PAYMENT CREATED
                // ==================================

                if (
                    data.event ===
                    "payment_created"
                ) {

                    loadPayments();

                }


                // ==================================
                // PAYMENT UPDATED
                // ==================================

                if (
                    data.event ===
                    "payment_updated"
                ) {

                    loadPayments();

                }

            }

            catch(error) {

                console.error(
                    "WebSocket JSON error:",
                    error
                );

            }

        };


    socket.onerror =
        function(error) {

            console.error(
                "Payment WebSocket error:",
                error
            );

        };


    socket.onclose =
        function() {

            console.log(
                "Payment WebSocket disconnected"
            );


            setTimeout(
                connectWebSocket,
                3000
            );

        };

}
loadPayments();
