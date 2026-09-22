const API_BASE_URL = "https://smart-parking-system-tz4z.onrender.com";

let allPayments = [];

let socket = null;

let reconnectTimer = null;


// =====================================================
// TOKEN
// =====================================================

function getToken() {

    return sessionStorage.getItem("access_token");

}


// =====================================================
// LOAD PAYMENTS
// =====================================================

async function loadPayments() {

    const token = getToken();

    if (!token) {

        console.error("Admin token not found");

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/admin_payments/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        if (!response.ok) {

            console.error(
                "Payment API error:",
                response.status
            );

            console.error(
                await response.text()
            );

            return;
        }


        const data = await response.json();

        console.log("Admin payments:", data);


        allPayments = Array.isArray(data)
            ? data
            : data.payments || [];


        displayPayments(allPayments);


    } catch (error) {

        console.error(
            "Error loading payments:",
            error
        );

    }

}



// =====================================================
// DISPLAY PAYMENTS
// =====================================================

function displayPayments(payments) {

    const tbody =
        document.getElementById(
            "paymentTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !payments ||
        payments.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted"
                >

                    No payments found

                </td>

            </tr>

        `;

        return;
    }


    payments.forEach(payment => {

        addPaymentRow(
            payment,
            tbody
        );

    });

}



// =====================================================
// ADD PAYMENT ROW
// =====================================================

function addPaymentRow(
    payment,
    tbody
) {

    const row =
        document.createElement("tr");


    row.id =
        `payment-row-${payment.id}`;


    row.innerHTML = `

        <td>
            ${payment.id ?? "-"}
        </td>

        <td>
            ${payment.user_id ?? "-"}
        </td>

        <td>
            ${payment.reservation_id ?? "-"}
        </td>

        <td>
            ₹${payment.amount ?? 0}
        </td>

        <td>
            ${payment.payment_method ?? "-"}
        </td>

        <td>

            ${getPaymentStatusBadge(
                payment.payment_status
                ?? payment.status
            )}

        </td>

        <td>

            <button
                class="btn btn-view btn-sm"
                onclick="viewPayment(${payment.id})"
            >

                <i class="bi bi-eye"></i>

                View

            </button>

        </td>

    `;


    tbody.appendChild(row);

}



// =====================================================
// STATUS BADGE
// =====================================================

function getPaymentStatusBadge(status) {

    const value =
        status || "Unknown";


    const lower =
        value.toLowerCase();


    let badgeClass =
        "bg-secondary";


    if (
        lower === "paid" ||
        lower === "success" ||
        lower === "successful"
    ) {

        badgeClass =
            "bg-success";

    }


    else if (
        lower === "pending"
    ) {

        badgeClass =
            "bg-warning text-dark";

    }


    else if (
        lower === "failed"
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
// VIEW PAYMENT
// =====================================================

async function viewPayment(paymentId) {

    const token = getToken();


    if (!token) {

        console.error(
            "Admin token not found"
        );

        return;
    }


    try {

        const response = await fetch(

            `${API_BASE_URL}/admin_payments/${paymentId}`,

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
                "View payment error:",
                response.status
            );

            console.error(
                await response.text()
            );

            return;
        }


        const payment =
            await response.json();


        console.log(
            "Payment details:",
            payment
        );


        fillPaymentModal(
            payment
        );


        const modalElement =
            document.getElementById(
                "paymentDetailsModal"
            );


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();


    } catch (error) {

        console.error(
            "View payment error:",
            error
        );

    }

}



// =====================================================
// FILL PAYMENT MODAL
// =====================================================

function fillPaymentModal(data) {

    console.log(
        "Filling payment modal:",
        data
    );


    const status =
        data.payment_status
        ?? data.status
        ?? "-";


    document.getElementById(
        "viewPaymentId"
    ).textContent =
        data.id ?? "-";


    document.getElementById(
        "viewPaymentStatus"
    ).innerHTML =
        getPaymentStatusBadge(status);


    document.getElementById(
        "viewUserId"
    ).textContent =
        data.user_id ?? "-";


    document.getElementById(
        "viewReservationId"
    ).textContent =
        data.reservation_id ?? "-";


    document.getElementById(
        "viewAmount"
    ).textContent =
        data.amount != null
            ? `₹${data.amount}`
            : "-";


    document.getElementById(
        "viewPaymentMethod"
    ).textContent =
        data.payment_method ?? "-";


    document.getElementById(
        "viewOrderId"
    ).textContent =
        data.order_id
        ?? data.razorpay_order_id
        ?? "-";


    document.getElementById(
        "viewRazorpayPaymentId"
    ).textContent =
        data.payment_id
        ?? data.razorpay_payment_id
        ?? "-";


    document.getElementById(
        "viewCreatedAt"
    ).textContent =
        formatDateTime(
            data.created_at
        );


    document.getElementById(
        "viewPaidAt"
    ).textContent =
        formatDateTime(
            data.paid_at
            ?? data.payment_date
            ?? data.updated_at
        );

}



// =====================================================
// DATE FORMAT
// =====================================================

function formatDateTime(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return value;

    }


    return date.toLocaleString(
        "en-IN"
    );

}



// =====================================================
// SEARCH
// =====================================================

function searchPayments() {

    const input =
        document.getElementById(
            "searchPayment"
        );


    const value =
        input.value
            .trim()
            .toLowerCase();


    if (!value) {

        displayPayments(
            allPayments
        );

        return;

    }


    const filtered =
        allPayments.filter(
            payment => {

                return (

                    String(
                        payment.id ?? ""
                    )
                    .toLowerCase()
                    .includes(value)


                    ||


                    String(
                        payment.user_id ?? ""
                    )
                    .toLowerCase()
                    .includes(value)


                    ||


                    String(
                        payment.reservation_id ?? ""
                    )
                    .toLowerCase()
                    .includes(value)


                    ||


                    String(
                        payment.amount ?? ""
                    )
                    .toLowerCase()
                    .includes(value)


                    ||


                    String(
                        payment.payment_method ?? ""
                    )
                    .toLowerCase()
                    .includes(value)


                    ||


                    String(
                        payment.payment_status
                        ?? payment.status
                        ?? ""
                    )
                    .toLowerCase()
                    .includes(value)

                );

            }
        );


    displayPayments(
        filtered
    );

}



// =====================================================
// WEBSOCKET
// =====================================================

function connectWebSocket() {

    paymentSocket = new WebSocket(
        "ws://smart-parking-system-tz4z.onrender.com/admin_payments/ws"
    );


    paymentSocket.onopen = function () {

        console.log(
            "Admin payment WebSocket connected"
        );

        const status =
            document.getElementById(
                "socketStatus"
            );

        if (status) {

            status.textContent = "Live";

            status.className =
                "badge bg-success";
        }

    };


    paymentSocket.onmessage = function (event) {

        try {

            const message =
                JSON.parse(event.data);

            console.log(
                "Payment WebSocket:",
                message
            );


            if (
                message.event ===
                "payment_created"
            ) {

                handlePaymentCreated(
                    message.data
                );

            }


            else if (
                message.event ===
                "payment_updated"
            ) {

                handlePaymentUpdated(
                    message.data
                );

            }


            else if (
                message.event ===
                "payment_deleted"
            ) {

                handlePaymentDeleted(
                    message.data
                );

            }

        }

        catch (error) {

            console.error(
                "Payment WebSocket message error:",
                error
            );

        }

    };


    paymentSocket.onerror = function (error) {

        console.error(
            "Payment WebSocket error:",
            error
        );

    };


    paymentSocket.onclose = function () {

        console.log(
            "Payment WebSocket disconnected"
        );

        setTimeout(
            connectWebSocket,
            3000
        );

    };

}


// =====================================================
// PAYMENT CREATED
// =====================================================

function handlePaymentCreated(payment) {

    console.log(
        "New payment:",
        payment
    );


    if (!payment) {
        return;
    }


    const exists =
        allPayments.some(
            item =>
                Number(item.id) ===
                Number(payment.id)
        );


    if (exists) {

        return;

    }


    allPayments.unshift(
        payment
    );


    displayPayments(
        allPayments
    );

}



// =====================================================
// PAYMENT UPDATED
// =====================================================

function handlePaymentUpdated(payment) {

    console.log(
        "Payment updated:",
        payment
    );


    if (!payment) {
        return;
    }


    const index =
        allPayments.findIndex(
            item =>
                Number(item.id) ===
                Number(payment.id)
        );


    if (index !== -1) {

        allPayments[index] =
            payment;

    }

    else {

        allPayments.unshift(
            payment
        );

    }


    displayPayments(
        allPayments
    );

}



// =====================================================
// PAYMENT DELETED
// =====================================================

function handlePaymentDeleted(data) {

    const paymentId =
        data.id
        ?? data.payment_id;


    allPayments =
        allPayments.filter(
            payment =>
                Number(payment.id) !==
                Number(paymentId)
        );


    displayPayments(
        allPayments
    );

}



// =====================================================
// ENTER SEARCH
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const search =
            document.getElementById(
                "searchPayment"
            );


        if (search) {

            search.addEventListener(
                "keyup",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchPayments();

                    }

                }
            );

        }


        loadPayments();

        connectWebSocket();

    }
);