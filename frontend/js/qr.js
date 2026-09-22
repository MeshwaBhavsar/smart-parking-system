// // const API_URL = "http://127.0.0.1:8000";

// // async function loadReservation() {

// //     try {

// //         // Get reservation ID from URL
// //         const params = new URLSearchParams(window.location.search);

// //         const reservationId = params.get("reservation_id");

// //         console.log("Reservation ID:", reservationId);

// //         if (!reservationId) {

// //             document.getElementById("reservationId").innerText =
// //                 "Reservation ID not found";

// //             document.getElementById("status").innerText =
// //                 "Unknown";

// //             return;
// //         }

// //         // Call backend
// //         const response = await fetch(
// //             `${API_URL}/reservations/${reservationId}`
// //         );

// //         console.log("API status:", response.status);

// //         if (!response.ok) {

// //             throw new Error("Failed to load reservation");

// //         }

// //         const data = await response.json();

// //         console.log("Reservation data:", data);


// //         // Reservation ID
// //         document.getElementById("reservationId").innerText =
// //             data.reservation_id;


// //         // Status
// //         document.getElementById("status").innerText =
// //             data.status;


// //         // QR image
// //         if (data.qr_code) {

// //             const qrImage = document.getElementById("qrImage");

// //             qrImage.src = `${API_URL}${data.qr_code}`;

// //             console.log(
// //                 "QR Image:",
// //                 qrImage.src
// //             );

// //         } else {

// //             console.error("QR code URL is missing");

// //         }

// //     } catch (error) {

// //         console.error(
// //             "Error loading reservation:",
// //             error
// //         );

// //         document.getElementById("reservationId").innerText =
// //             "Error";

// //         document.getElementById("status").innerText =
// //             "Unable to load";

// //     }

// // }

// // loadReservation();

// const API_URL = "http://127.0.0.1:8000";

// async function loadReservation() {

//     try {

//         const params =
//             new URLSearchParams(window.location.search);

//         const reservationId =
//             params.get("reservation_id");

//         console.log(
//             "Reservation ID:",
//             reservationId
//         );

//         if (!reservationId) {
//             console.error("Reservation ID missing");
//             return;
//         }

//         const response = await fetch(
//             `${API_URL}/reservations/${reservationId}`
//         );

//         console.log(
//             "Response status:",
//             response.status
//         );

//         if (!response.ok) {

//             const errorText =
//                 await response.text();

//             console.error(
//                 "Backend error:",
//                 errorText
//             );

//             throw new Error(
//                 `API Error: ${response.status}`
//             );
//         }

//         const data =
//             await response.json();

//         console.log(
//             "Reservation data:",
//             data
//         );

//         // Reservation ID
//         document.getElementById(
//             "reservationId"
//         ).innerText =
//             data.reservation_id;

//         // Status
//         document.getElementById(
//             "status"
//         ).innerText =
//             data.status;

//         // QR Image
//         if (data.qr_code) {

//             const qrImage =
//                 document.getElementById("qrImage");

//             qrImage.src =
//                 `${API_URL}${data.qr_code}`;

//             console.log(
//                 "QR image URL:",
//                 qrImage.src
//             );

//         } else {

//             console.error(
//                 "QR code path is missing"
//             );
//         }

//     } catch (error) {

//         console.error(
//             "Error loading reservation:",
//             error
//         );

//         document.getElementById(
//             "reservationId"
//         ).innerText = "Error";

//         document.getElementById(
//             "status"
//         ).innerText = "Unable to load";
//     }
// }

// loadReservation();

// =====================================================
// GET RESERVATION ID
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const reservationId =
    params.get("reservation_id");


console.log(
    "Reservation ID:",
    reservationId
);


// =====================================================
// GET QR TOKEN
// =====================================================

const qrToken =
    sessionStorage.getItem(
        "qr_token"
    );


console.log(
    "QR Token:",
    qrToken
);


// =====================================================
// GENERATE QR CODE
// =====================================================

function generateQRCode() {

    if (!qrToken) {

        console.error(
            "QR token not found"
        );

        document.getElementById(
            "qrStatus"
        ).innerText =
            "QR token not found.";

        return;

    }


    // Remove old QR

    document.getElementById(
        "qrcode"
    ).innerHTML = "";


    // Generate QR

    new QRCode(

        document.getElementById(
            "qrcode"
        ),

        {

            text: qrToken,

            width: 256,

            height: 256,

            correctLevel:
                QRCode.CorrectLevel.H

        }

    );


    console.log(
        "✅ QR Code generated"
    );

}


// =====================================================
// WEBSOCKET
// =====================================================

let qrSocket;


function connectQRWebSocket() {

    console.log(
        "Connecting QR WebSocket..."
    );


    qrSocket = new WebSocket(
        "ws://smart-parking-system-tz4z.onrender.com/ws"
    );


    qrSocket.onopen = function() {

        console.log(
            "✅ QR WebSocket connected"
        );

    };


    qrSocket.onmessage = function(event) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "WebSocket:",
                data
            );


            // ==========================================
            // ENTRY
            // ==========================================

            if (
                data.event ===
                "slot_updated" &&
                data.status ===
                "Occupied"
            ) {

                document.getElementById(
                    "qrStatus"
                ).innerText =
                    "Vehicle entered parking.";

            }


            // ==========================================
            // EXIT
            // ==========================================

            if (
                data.event ===
                "reservation_completed"
            ) {


                if (
                    Number(
                        data.reservation_id
                    ) ===
                    Number(
                        reservationId
                    )
                ) {


                    console.log(
                        "Reservation completed"
                    );


                    document.getElementById(
                        "qrStatus"
                    ).innerText =
                        "Parking completed. Opening payment...";


                    // Save amount

                    if (
                        data.total_amount !==
                        undefined
                    ) {

                        sessionStorage.setItem(

                            "total_amount",

                            data.total_amount

                        );

                    }


                    // Wait 1 second

                    setTimeout(
                        function() {

                            window.location.href =
                                `payment.html?reservation_id=${reservationId}`;

                        },
                        1000
                    );

                }

            }

        }

        catch(error) {

            console.error(
                "WebSocket error:",
                error
            );

        }

    };


    qrSocket.onerror =
        function(error) {

            console.error(
                "WebSocket error:",
                error
            );

        };


    qrSocket.onclose =
        function() {

            console.log(
                "WebSocket disconnected"
            );


            setTimeout(
                connectQRWebSocket,
                3000
            );

        };

}


// =====================================================
// START
// =====================================================

generateQRCode();

connectQRWebSocket();