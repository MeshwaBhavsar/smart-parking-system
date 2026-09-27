
// // =====================================================
// // GET RESERVATION ID
// // =====================================================

// const params =
//     new URLSearchParams(
//         window.location.search
//     );


// const reservationId =
//     params.get("reservation_id");

// const customerAccessToken =
//     sessionStorage.getItem("access_token") ||
//     sessionStorage.getItem("token");

// let currentUser = null;

// try {
//     currentUser = JSON.parse(
//         sessionStorage.getItem("user") || "null"
//     );
// } catch (error) {
//     console.error("Unable to parse current customer:", error);
// }

// let paymentRedirected = false;


// console.log(
//     "Reservation ID:",
//     reservationId
// );

// console.log(
//     "Current Customer:",
//     currentUser
// );


// // =====================================================
// // GET QR TOKEN
// // =====================================================

// const qrToken =
//     sessionStorage.getItem(
//         "qr_token"
//     );


// console.log(
//     "QR Token:",
//     qrToken
// );


// // =====================================================
// // GENERATE QR CODE
// // =====================================================

// function generateQRCode() {

//     if (!qrToken) {

//         console.error(
//             "QR token not found"
//         );

//         document.getElementById(
//             "qrStatus"
//         ).innerText =
//             "QR token not found.";

//         return;

//     }


//     // Remove old QR

//     document.getElementById(
//         "qrcode"
//     ).innerHTML = "";


//     // Generate QR

//     new QRCode(

//         document.getElementById(
//             "qrcode"
//         ),

//         {

//             text: qrToken,

//             width: 256,

//             height: 256,

//             correctLevel:
//                 QRCode.CorrectLevel.H

//         }

//     );


//     console.log(
//         "✅ QR Code generated"
//     );

// }


// // =====================================================
// // WEBSOCKET
// // =====================================================

// let qrSocket;
// let qrReconnectTimer;

// const qrWebSocketUrl =
//     "wss://smart-parking-system-tz4z.onrender.com/ws";


// function redirectCustomerToPayment(
//     message = "Exit completed. Opening payment..."
// ) {

//     if (paymentRedirected) {
//         return;
//     }

//     paymentRedirected = true;

//     const qrStatus =
//         document.getElementById("qrStatus");

//     if (qrStatus) {
//         qrStatus.innerText = message;
//     }

//     setTimeout(
//         function() {

//             if (qrSocket) {
//                 qrSocket.close();
//             }

//             console.log(
//                 "Redirecting customer to payment:",
//                 reservationId
//             );

//             window.location.href =
//                 `payment.html?reservation_id=${encodeURIComponent(reservationId)}`;

//         },
//         500
//     );
// }

// function connectQRWebSocket() {

//     if (
//         qrSocket &&
//         (
//             qrSocket.readyState === WebSocket.OPEN ||
//             qrSocket.readyState === WebSocket.CONNECTING
//         )
//     ) {
//         return;
//     }

//     console.log(
//         "Connecting QR WebSocket..."
//     );


//     qrSocket = new WebSocket(
//         qrWebSocketUrl
//     );


//     qrSocket.onopen = function() {

//         console.log(
//             "Customer WebSocket connected"
//         );

//         if (customerAccessToken) {
//             qrSocket.send(
//                 JSON.stringify({
//                     type: "authenticate",
//                     token: customerAccessToken
//                 })
//             );
//         } else {
//             console.error("Customer access token is missing");
//         }

//     };


//     qrSocket.onmessage = function(event) {

//         try {

//             const data =
//                 JSON.parse(
//                     event.data
//                 );


//             console.log(
//                 "WebSocket event received:",
//                 data
//             );


//             if (
//                 data.event === "reservation_updated" ||
//                 data.event === "reservation_completed"
//             ) {

//                 console.log(
//                     "Matching reservation event:",
//                     data.reservation_id
//                 );

//                 console.log(
//                     "Matching customer event:",
//                     data.user_id
//                 );

//                 if (
//                     currentUser &&
//                     Number(data.user_id) === Number(currentUser.id) &&
//                     Number(
//                         data.reservation_id
//                     ) ===
//                     Number(
//                         reservationId
//                     )
//                 ) {

//                     const reservationStatus =
//                         String(data.status || "").toUpperCase();

//                     if (
//                         data.event === "reservation_updated" &&
//                         reservationStatus === "PARKED"
//                     ) {
//                         document.getElementById(
//                             "qrStatus"
//                         ).innerText =
//                             "Vehicle entered successfully.";
//                     }

//                     else if (
//                         data.event === "reservation_completed" &&
//                         reservationStatus === "COMPLETED"
//                     ) {
//                         redirectCustomerToPayment(
//                             "Parking completed. Opening payment..."
//                         );
//                     }

//                 }

//             }

//         }

//         catch(error) {

//             console.error(
//                 "WebSocket error:",
//                 error
//             );

//         }

//     };


//     qrSocket.onerror =
//         function(error) {

//             console.error(
//                 "WebSocket error:",
//                 error
//             );

//         };


//     qrSocket.onclose =
//         function() {

//             console.log(
//                 "WebSocket disconnected"
//             );


//             if (!paymentRedirected) {

//                 clearTimeout(qrReconnectTimer);

//                 qrReconnectTimer = setTimeout(
//                     connectQRWebSocket,
//                     3000
//                 );
//             }

//         };

// }


// // =====================================================
// // START
// // =====================================================

// generateQRCode();

// connectQRWebSocket();

// =====================================================
// CUSTOMER QR PAGE
// =====================================================

const API_URL =
    "https://smart-parking-system-tz4z.onrender.com";

const CUSTOMER_WEBSOCKET_PATH = "/ws";

const customerWebSocketUrl =
    `${API_URL.replace(/^http/, "ws")}${CUSTOMER_WEBSOCKET_PATH}`;

const params =
    new URLSearchParams(
        window.location.search
    );

const reservationId =
    params.get("reservation_id");

const customerAccessToken =
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token");

let currentUser = null;

try {

    currentUser = JSON.parse(
        sessionStorage.getItem("user") || "null"
    );

} catch (error) {

    console.error(
        "Unable to parse user",
        error
    );

}

const qrToken =
    sessionStorage.getItem("qr_token");

let qrSocket = null;

let qrReconnectTimer = null;

let qrReconnectAttempts = 0;

let reservationPollingInterval = null;

let reservationStatusRequestInFlight = false;

let paymentRedirected = false;


// =====================================================
// GENERATE QR
// =====================================================

function generateQRCode() {

    if (!qrToken) {

        console.error(
            "QR token not found"
        );

        const status =
            document.getElementById("qrStatus");

        if (status) {

            status.innerText =
                "QR token not found.";
        }

        return;
    }

    const qrContainer =
        document.getElementById("qrcode");

    if (!qrContainer) {
        return;
    }

    qrContainer.innerHTML = "";

    new QRCode(
        qrContainer,
        {
            text: qrToken,
            width: 256,
            height: 256,
            correctLevel:
                QRCode.CorrectLevel.H
        }
    );

    console.log(
        "QR generated successfully"
    );
}


// =====================================================
// RESERVATION STATUS POLLING
// =====================================================

function stopReservationStatusPolling() {

    if (reservationPollingInterval !== null) {

        clearInterval(
            reservationPollingInterval
        );

        reservationPollingInterval = null;
    }
}


async function checkReservationStatus() {

    if (
        paymentRedirected ||
        reservationStatusRequestInFlight
    ) {
        return;
    }

    reservationStatusRequestInFlight = true;

    console.log(
        "Checking reservation status:",
        reservationId
    );

    try {

        const response = await fetch(
            `${API_URL}/reservation/${encodeURIComponent(reservationId)}`,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${customerAccessToken}`
                }
            }
        );

        if (!response.ok) {

            console.error(
                "Reservation status check failed:",
                response.status
            );

            return;
        }

        const reservation =
            await response.json();

        const reservationStatus =
            String(
                reservation.status || ""
            ).toUpperCase();

        console.log(
            "Current reservation status:",
            reservationStatus
        );

        if (reservationStatus === "PARKED") {

            const qrStatus =
                document.getElementById(
                    "qrStatus"
                );

            if (qrStatus) {
                qrStatus.innerText =
                    "Vehicle is currently parked.";
            }
        }

        if (
            reservationStatus === "COMPLETED" &&
            !paymentRedirected
        ) {

            const completedReservationId =
                reservation.reservation_id ??
                reservation.id ??
                reservationId;

            console.log(
                "Reservation completed. Opening payment page."
            );

            stopReservationStatusPolling();

            redirectCustomerToPayment(
                "Parking completed. Opening payment...",
                {
                    ...reservation,
                    reservation_id:
                        completedReservationId
                }
            );
        }

    } catch (error) {

        console.error(
            "Reservation status check error:",
            error
        );

    } finally {

        reservationStatusRequestInFlight = false;
    }
}


function startReservationStatusPolling() {

    if (!reservationId) {

        console.error(
            "Reservation ID is missing"
        );

        return;
    }

    if (!customerAccessToken) {

        console.error(
            "Customer access token missing"
        );

        return;
    }

    stopReservationStatusPolling();

    reservationPollingInterval =
        setInterval(
            checkReservationStatus,
            3000
        );

    checkReservationStatus();
}


// =====================================================
// PAYMENT REDIRECT
// =====================================================

function redirectCustomerToPayment(
    message,
    data
) {

    if (paymentRedirected) {
        return;
    }

    paymentRedirected = true;

    stopReservationStatusPolling();

    const qrStatus =
        document.getElementById(
            "qrStatus"
        );

    if (qrStatus) {

        qrStatus.innerText =
            message;
    }

    // Save latest exit information
    sessionStorage.setItem(
        "exit_amount",
        data.total_amount
    );

    sessionStorage.setItem(
        "exit_time",
        data.exit_time || ""
    );

    sessionStorage.setItem(
        "entry_time",
        data.entry_time || ""
    );

    sessionStorage.setItem(
        "billed_hours",
        data.billed_hours
    );

    sessionStorage.setItem(
        "reservation_status",
        "COMPLETED"
    );

    sessionStorage.setItem(
        "payment_reservation_id",
        String(data.reservation_id)
    );

    console.log(
        "Opening payment page for reservation:",
        data.reservation_id
    );

    setTimeout(
        function() {

            if (qrSocket) {

                try {
                    qrSocket.close();
                } catch (e) {}
            }

            window.location.href =
                `payment.html?reservation_id=${encodeURIComponent(
                    data.reservation_id
                )}`;

        },
        800
    );
}


// =====================================================
// CONNECT WEBSOCKET
// =====================================================

function connectQRWebSocket() {

    if (
        qrSocket &&
        (
            qrSocket.readyState ===
            WebSocket.OPEN ||

            qrSocket.readyState ===
            WebSocket.CONNECTING
        )
    ) {

        return;
    }

    console.log(
        "Connecting customer WebSocket..."
    );

    qrSocket =
        new WebSocket(
            customerWebSocketUrl
        );


    // =================================================
    // OPEN
    // =================================================

    qrSocket.onopen =
        function() {

            console.log(
                "Customer WebSocket connected"
            );

            qrReconnectAttempts = 0;

            if (!customerAccessToken) {

                console.error(
                    "Customer access token missing"
                );

                return;
            }

            qrSocket.send(
                JSON.stringify({
                    type:
                        "authenticate",

                    token:
                        customerAccessToken
                })
            );

        };


    // =================================================
    // MESSAGE
    // =================================================

    qrSocket.onmessage =
        function(event) {

            try {

                const data =
                    JSON.parse(
                        event.data
                    );

                console.log(
                    "Customer WebSocket message:",
                    data
                );

                if (
                    data.event ===
                    "authenticated"
                ) {

                    console.log(
                        "Customer WebSocket user ID:",
                        data.user_id
                    );

                    return;
                }

                if (
                    data.event ===
                    "authentication_failed"
                ) {

                    console.error(
                        "Customer WebSocket authentication failed"
                    );

                    return;
                }


                // =====================================
                // ENTRY
                // =====================================

                if (
                    data.event ===
                    "reservation_updated"
                ) {

                    if (
                        Number(
                            data.reservation_id
                        ) !==
                        Number(
                            reservationId
                        )
                    ) {

                        return;
                    }

                    if (
                        currentUser &&
                        Number(data.user_id) !==
                        Number(currentUser.id)
                    ) {

                        return;
                    }

                    const status =
                        String(
                            data.status || ""
                        ).toUpperCase();

                    if (
                        status ===
                        "PARKED"
                    ) {

                        const qrStatus =
                            document.getElementById(
                                "qrStatus"
                            );

                        if (qrStatus) {

                            qrStatus.innerText =
                                "Vehicle entered successfully. Your parking is active.";
                        }

                        console.log(
                            "ENTRY CONFIRMED"
                        );
                    }
                }


                // =====================================
                // EXIT
                // =====================================

                if (
                    data.event ===
                    "reservation_completed"
                ) {

                    console.log(
                        "Reservation completed event received"
                    );

                    if (
                        Number(
                            data.reservation_id
                        ) !==
                        Number(
                            reservationId
                        )
                    ) {

                        return;
                    }

                    if (
                        currentUser &&
                        Number(data.user_id) !==
                        Number(currentUser.id)
                    ) {

                        return;
                    }

                    const status =
                        String(
                            data.status || ""
                        ).toUpperCase();

                    if (
                        status ===
                        "COMPLETED"
                    ) {

                        console.log(
                            "EXIT CONFIRMED"
                        );

                        console.log(
                            "Amount:",
                            data.total_amount
                        );

                        redirectCustomerToPayment(
                            "Parking completed. Opening payment...",
                            data
                        );
                    }
                }

            } catch (error) {

                console.error(
                    "WebSocket message error:",
                    error
                );
            }
        };


    // =================================================
    // ERROR
    // =================================================

    qrSocket.onerror =
        function(error) {

            console.error(
                "Customer WebSocket error:",
                error
            );
        };


    // =================================================
    // CLOSE
    // =================================================

    qrSocket.onclose =
        function() {

            console.log(
                "Customer WebSocket disconnected"
            );

            if (
                !paymentRedirected
            ) {

                clearTimeout(
                    qrReconnectTimer
                );

                qrReconnectTimer =
                    setTimeout(
                        connectQRWebSocket,
                        Math.min(
                            5000 *
                            (2 ** qrReconnectAttempts++),
                            30000
                        )
                    );
            }
        };
}


// =====================================================
// START
// =====================================================

generateQRCode();

startReservationStatusPolling();

window.addEventListener(
    "pagehide",
    stopReservationStatusPolling
);
