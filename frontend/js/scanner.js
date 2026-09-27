// // =====================================================
// // STAFF QR SCANNER
// // =====================================================

// const staffAccessToken =
//     sessionStorage.getItem("access_token");

// const staffUser =
//     JSON.parse(
//         sessionStorage.getItem("user") || "null"
//     );

// const staffRole =
//     String(
//         staffUser?.role || ""
//     ).toUpperCase();

// const resultBox =
//     document.getElementById("result");

// function hasUsableStaffToken(token) {

//     try {

//         const payloadPart =
//             token.split(".")[1];

//         const normalizedPayload =
//             payloadPart
//                 .replace(/-/g, "+")
//                 .replace(/_/g, "/")
//                 .padEnd(
//                     Math.ceil(payloadPart.length / 4) * 4,
//                     "="
//                 );

//         const payload =
//             JSON.parse(
//                 atob(normalizedPayload)
//             );

//         console.log(
//             "Scanner JWT Payload:",
//             payload
//         );

//         return payload.role === "STAFF" &&
//             payload.user_id != null &&
//             payload.exp * 1000 > Date.now();

//     } catch (error) {

//         console.error(
//             "JWT validation error:",
//             error
//         );

//         return false;
//     }
// }

// if (
//     !staffAccessToken ||
//     staffRole !== "STAFF" ||
//     !hasUsableStaffToken(staffAccessToken)
// ) {

//     console.log(
//         "Invalid Staff session"
//     );

//     sessionStorage.removeItem(
//         "access_token"
//     );

//     sessionStorage.removeItem(
//         "user"
//     );

//     window.location.replace(
//         "login.html"
//     );

// } else {

//     // Existing scanner code

// // =====================================================
// // QR SCAN SUCCESS
// // =====================================================

// async function onScanSuccess(decodedText) {

//     console.log(
//         "QR Scanned:",
//         decodedText
//     );


//     // Stop scanner after successful scan

//     try {

//         await scanner.clear();

//     }

//     catch(error) {

//         console.error(
//             "Scanner clear error:",
//             error
//         );

//     }


//     resultBox.innerText =
//         "QR scanned. Processing...";


//     // =================================================
//     // SEND QR TOKEN TO FASTAPI
//     // =================================================

//     await sendQRToBackend(
//         decodedText
//     );

// }


// // =====================================================
// // SEND QR TOKEN
// // =====================================================

// async function sendQRToBackend(qrToken) {

//     try {

//         console.log(
//             "Sending QR token:",
//             qrToken
//         );


//         const response =
//             await fetch(
//                 "https://smart-parking-system-tz4z.onrender.com/qr/scan",
//                 {

//                     method: "POST",

//                     headers: {

//                         "Content-Type":
//                             "application/json",

//                         "Authorization":
//                             `Bearer ${staffAccessToken}`

//                     },

//                     body: JSON.stringify({

//                         qr_token:
//                             qrToken

//                     })

//                 }
//             );


//         const result =
//             await response.json();


//         if (response.status === 401) {

//     sessionStorage.removeItem(
//         "access_token"
//     );

//     sessionStorage.removeItem(
//         "user"
//     );

//     window.location.replace(
//         "login.html"
//     );

//     return;
// }


//         console.log(
//             "QR scan result:",
//             result
//         );

//         console.log(
//             "Scan action:",
//             result.action
//         );

//         const scanAction =
//             String(result.action || "")
//                 .toLowerCase();


//         // =================================================
//         // API ERROR
//         // =================================================

//         if (!response.ok) {

//             resultBox.innerText =
//                 result.detail ||
//                 "QR scan failed.";

//             resultBox.style.color =
//                 "red";


//             setTimeout(
//                 startScanner,
//                 2000
//             );

//             return;

//         }


//         // =================================================
//         // ENTRY
//         // =================================================

//         if (
//             scanAction ===
//             "entry"
//         ) {

//             resultBox.innerHTML = `

//                 <strong>
//                     Vehicle Entry Successful
//                 </strong>

//                 <br>

//                 Vehicle:
//                 ${result.vehicle_number}

//                 <br>

//                 Slot:
//                 ${result.slot_number}

//                 <br>

//                 Entry Time:
//                 ${result.entry_time}

//             `;

//             resultBox.style.color =
//                 "green";


//             console.log(
//                 "ENTRY SUCCESS"
//             );


//             // Start scanner again

//             setTimeout(
//                 startScanner,
//                 3000
//             );

//         }


//         // =================================================
//         // EXIT
//         // =================================================

//         else if (
//             scanAction ===
//             "exit"
//         ) {

//             resultBox.innerHTML = `

//                 <strong>
//                     Vehicle Exit Successful
//                 </strong>

//                 <br>

//                 Vehicle:
//                 ${result.vehicle_number}

//                 <br>

//                 Slot:
//                 ${result.slot_number}

//                 <br>

//                 Exit Time:
//                 ${result.exit_time}

//                 <br>

//                 Amount:
//                 ₹${result.total_amount}

//             `;

//             resultBox.style.color =
//                 "green";


//             console.log(
//                 "Exit completed:",
//                 result
//             );


//             setTimeout(
//                 startScanner,
//                 3000
//             );

//         }

//     }

//     catch(error) {

//         console.error(
//             "Scanner API error:",
//             error
//         );


//         resultBox.innerText =
//             "Unable to connect to server.";

//         resultBox.style.color =
//             "red";


//         setTimeout(
//             startScanner,
//             3000
//         );

//     }

// }


// // =====================================================
// // QR ERROR
// // =====================================================

// function onScanFailure(error) {

//     // Don't print every scanning frame error.
//     // Camera continuously tries to read QR.
// }


// // =====================================================
// // CREATE SCANNER
// // =====================================================

// let scanner;


// function startScanner() {

//     console.log(
//         "Starting scanner..."
//     );


//     resultBox.innerText =
//         "Scan customer's QR code...";


//     resultBox.style.color =
//         "black";


//     scanner =
//         new Html5Qrcode(
//             "reader"
//         );


//     scanner.start(

//         {
//             facingMode:
//                 "environment"
//         },

//         {
//             fps: 10,

//             qrbox: {
//                 width: 250,
//                 height: 250
//             }

//         },

//         onScanSuccess,

//         onScanFailure

//     )
//     .catch(
//         function(error) {

//             console.error(
//                 "Camera error:",
//                 error
//             );


//             resultBox.innerText =
//                 "Camera permission denied or camera unavailable.";

//             resultBox.style.color =
//                 "red";

//         }
//     );

// }


// // =====================================================
// // START
// // =====================================================

// startScanner();

// const qrImage =
//     document.getElementById("qrImage");

// qrImage.addEventListener(
//     "change",
//     async function(event) {

//         const file =
//             event.target.files[0];

//         if (!file) {
//             return;
//         }

//         try {

//             const scanner =
//                 new Html5Qrcode("reader");

//             const result =
//                 await scanner.scanFile(
//                     file,
//                     true
//                 );

//             console.log(
//                 "QR TOKEN:",
//                 result
//             );

//             document.getElementById(
//                 "result"
//             ).innerText =
//                 "QR Token: " + result;

//             await scanner.clear();

//             // Send to your backend
//             await sendQRToBackend(result);

//         }

//         catch(error) {

//             console.error(
//                 "QR image scan failed:",
//                 error
//             );

//             document.getElementById(
//                 "result"
//             ).innerText =
//                 "Could not read QR image.";

//         }

//     }
// );

// }

// =====================================================
// STAFF QR SCANNER
// =====================================================

// =====================================================
// STAFF SESSION
// =====================================================

const staffAccessToken =
    sessionStorage.getItem("access_token");

let staffUser = null;

try {

    staffUser = JSON.parse(
        sessionStorage.getItem("user") || "null"
    );

} catch (error) {

    console.error(
        "Unable to read staff user:",
        error
    );

}

const staffRole =
    String(
        staffUser?.role || ""
    ).trim().toUpperCase();

const resultBox =
    document.getElementById("result");


// =====================================================
// CHECK STAFF JWT
// =====================================================

function hasUsableStaffToken(token) {

    if (!token) {
        return false;
    }

    try {

        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return false;
        }

        const payloadPart =
            parts[1];

        const normalizedPayload =
            payloadPart
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(
                    Math.ceil(
                        payloadPart.length / 4
                    ) * 4,
                    "="
                );

        const payload =
            JSON.parse(
                atob(normalizedPayload)
            );

        console.log(
            "Scanner JWT Payload:",
            payload
        );

        return (
            String(
                payload.role || ""
            ).toUpperCase() === "STAFF" &&

            payload.user_id != null &&

            payload.exp != null &&

            payload.exp * 1000 > Date.now()
        );

    } catch (error) {

        console.error(
            "JWT validation error:",
            error
        );

        return false;
    }
}


// =====================================================
// STAFF LOGIN CHECK
// =====================================================

if (
    !staffAccessToken ||
    staffRole !== "STAFF" ||
    !hasUsableStaffToken(staffAccessToken)
) {

    console.log(
        "Invalid Staff session"
    );

    sessionStorage.removeItem(
        "access_token"
    );

    sessionStorage.removeItem(
        "user"
    );

    window.location.replace(
        "login.html"
    );

} else {

    console.log(
        "Staff scanner session valid"
    );


// =====================================================
// VARIABLES
// =====================================================

let scanner = null;

let isProcessingScan = false;

let restartingScanner = false;


// =====================================================
// SHOW RESULT
// =====================================================

function showResult(
    message,
    color = "black"
) {

    if (!resultBox) {
        return;
    }

    resultBox.innerHTML =
        message;

    resultBox.style.color =
        color;
}


// =====================================================
// START CAMERA SCANNER
// =====================================================

async function startScanner() {

    if (isProcessingScan) {
        return;
    }

    if (restartingScanner) {
        return;
    }

    restartingScanner = true;

    console.log(
        "Starting staff QR scanner..."
    );

    try {

        // ---------------------------------------------
        // If old scanner exists, clear it first
        // ---------------------------------------------

        if (scanner) {

            try {

                await scanner.clear();

            } catch (error) {

                console.log(
                    "Previous scanner already cleared."
                );

            }

            scanner = null;
        }


        showResult(
            "Scan customer's QR code...",
            "black"
        );


        // ---------------------------------------------
        // Create scanner
        // ---------------------------------------------

        scanner =
            new Html5Qrcode(
                "reader"
            );


        // ---------------------------------------------
        // Start camera
        // ---------------------------------------------

        await scanner.start(

            {
                facingMode:
                    "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                }

            },

            onScanSuccess,

            onScanFailure

        );

        console.log(
            "Staff camera scanner started"
        );

    } catch (error) {

        console.error(
            "Camera start error:",
            error
        );

        showResult(
            "Camera permission denied or camera unavailable.",
            "red"
        );

    } finally {

        restartingScanner = false;
    }
}


// =====================================================
// STOP SCANNER
// =====================================================

async function stopScanner() {

    if (!scanner) {
        return;
    }

    try {

        await scanner.stop();

        console.log(
            "Scanner stopped"
        );

    } catch (error) {

        console.log(
            "Scanner stop:",
            error
        );
    }

    try {

        await scanner.clear();

    } catch (error) {

        console.log(
            "Scanner clear:",
            error
        );
    }

    scanner = null;
}


// =====================================================
// QR SCAN SUCCESS
// =====================================================

async function onScanSuccess(
    decodedText
) {

    // ---------------------------------------------
    // Prevent duplicate scans
    // ---------------------------------------------

    if (isProcessingScan) {

        console.log(
            "Scan already processing..."
        );

        return;
    }

    isProcessingScan = true;


    console.log(
        "QR Scanned:",
        decodedText
    );


    // ---------------------------------------------
    // Stop camera
    // ---------------------------------------------

    await stopScanner();


    showResult(
        "QR scanned. Processing...",
        "black"
    );


    // ---------------------------------------------
    // Send QR to backend
    // ---------------------------------------------

    await sendQRToBackend(
        decodedText
    );
}


// =====================================================
// SEND QR TOKEN TO FASTAPI
// =====================================================

async function sendQRToBackend(
    qrToken
) {

    try {

        console.log(
            "Sending QR token to backend:",
            qrToken
        );


        // ---------------------------------------------
        // Validate QR token
        // ---------------------------------------------

        if (!qrToken) {

            showResult(
                "Invalid QR code.",
                "red"
            );

            isProcessingScan = false;

            setTimeout(
                startScanner,
                2500
            );

            return;
        }


        // ---------------------------------------------
        // API request
        // ---------------------------------------------

        const response =
            await fetch(
                "https://smart-parking-system-tz4z.onrender.com/qr/scan",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${staffAccessToken}`

                    },

                    body: JSON.stringify({

                        qr_token:
                            qrToken

                    })

                }
            );


        // ---------------------------------------------
        // Read response
        // ---------------------------------------------

        let result;

        try {

            result =
                await response.json();

        } catch (error) {

            result = {
                detail:
                    "Invalid server response."
            };

        }


        console.log(
            "QR API HTTP status:",
            response.status
        );

        console.log(
            "QR API response:",
            result
        );


        // =================================================
        // UNAUTHORIZED
        // =================================================

        if (
            response.status === 401
        ) {

            console.log(
                "Staff token expired."
            );

            sessionStorage.removeItem(
                "access_token"
            );

            sessionStorage.removeItem(
                "user"
            );

            window.location.replace(
                "login.html"
            );

            return;
        }


        // =================================================
        // FORBIDDEN
        // =================================================

        if (
            response.status === 403
        ) {

            showResult(
                result.detail ||
                "Only staff can scan QR codes.",
                "red"
            );

            isProcessingScan = false;

            setTimeout(
                startScanner,
                3000
            );

            return;
        }


        // =================================================
        // BACKEND ERROR
        // =================================================

        if (!response.ok) {

            console.error(
                "QR scan failed:",
                result
            );

            showResult(
                result.detail ||
                "QR scan failed.",
                "red"
            );

            isProcessingScan = false;

            setTimeout(
                startScanner,
                3000
            );

            return;
        }


        // =================================================
        // SUCCESS
        // =================================================

        console.log(
            "QR scan successful:",
            result
        );


        const scanAction =
            String(
                result.action || ""
            )
                .trim()
                .toUpperCase();


        // =================================================
        // ENTRY
        // BOOKED -> PARKED
        // =================================================

        if (
            scanAction === "ENTRY"
        ) {

            showResult(

                `
                <strong>
                    Vehicle Entry Successful
                </strong>

                <br><br>

                Vehicle:
                ${result.vehicle_number || "-"}

                <br>

                Vehicle Type:
                ${result.vehicle_type || "-"}

                <br>

                Slot:
                ${result.slot_number || "-"}

                <br>

                Entry Time:
                ${formatDateTime(
                    result.entry_time
                )}

                <br>

                Status:
                ${result.status || "PARKED"}
                `,

                "green"

            );


            console.log(
                "ENTRY SUCCESS"
            );

            console.log(
                "Reservation:",
                result.reservation_id
            );

            console.log(
                "Status:",
                result.status
            );


            // -----------------------------------------
            // Restart scanner
            // -----------------------------------------

            setTimeout(
                function() {

                    isProcessingScan =
                        false;

                    startScanner();

                },
                3000
            );

            return;
        }


        // =================================================
        // EXIT
        // PARKED -> COMPLETED
        // =================================================

        if (
            scanAction === "EXIT"
        ) {

            showResult(

                `
                <strong>
                    Vehicle Exit Successful
                </strong>

                <br><br>

                Vehicle:
                ${result.vehicle_number || "-"}

                <br>

                Slot:
                ${result.slot_number || "-"}

                <br>

                Entry Time:
                ${formatDateTime(
                    result.entry_time
                )}

                <br>

                Exit Time:
                ${formatDateTime(
                    result.exit_time
                )}

                <br>

                Duration:
                ${result.duration_minutes || 0}
                minutes

                <br>

                Billed Hours:
                ${result.billed_hours || 1}

                <br>

                Amount:
                ₹${result.total_amount || 0}

                <br>

                Status:
                ${result.status || "COMPLETED"}
                `,

                "green"

            );


            console.log(
                "EXIT SUCCESS"
            );

            console.log(
                "Reservation:",
                result.reservation_id
            );

            console.log(
                "Total Amount:",
                result.total_amount
            );

            console.log(
                "Status:",
                result.status
            );


            // -----------------------------------------
            // Restart scanner
            // -----------------------------------------

            setTimeout(
                function() {

                    isProcessingScan =
                        false;

                    startScanner();

                },
                4000
            );

            return;
        }


        // =================================================
        // ALREADY COMPLETED
        // =================================================

        if (
            scanAction === "COMPLETED"
        ) {

            showResult(

                `
                <strong>
                    Booking Already Completed
                </strong>

                <br><br>

                Reservation:
                ${result.reservation_id || "-"}

                <br>

                Amount:
                ₹${result.total_amount || 0}
                `,

                "orange"

            );


            isProcessingScan = false;

            setTimeout(
                startScanner,
                3000
            );

            return;
        }


        // =================================================
        // UNKNOWN ACTION
        // =================================================

        showResult(

            `
            ${result.message ||
                "Unknown QR scan result."}
            `,

            "red"

        );


        console.error(
            "Unknown scan action:",
            result
        );


        isProcessingScan = false;

        setTimeout(
            startScanner,
            3000
        );


    } catch (error) {

        console.error(
            "Scanner API error:",
            error
        );


        showResult(
            "Unable to connect to server.",
            "red"
        );


        isProcessingScan = false;


        setTimeout(
            startScanner,
            3000
        );
    }
}


// =====================================================
// FORMAT DATE/TIME
// =====================================================

function formatDateTime(
    value
) {

    if (!value) {
        return "-";
    }

    try {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;
        }

        return date.toLocaleString(
            "en-IN",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );

    } catch (error) {

        return value;
    }
}


// =====================================================
// QR SCAN FAILURE
// =====================================================

function onScanFailure(
    error
) {

    // Do not display continuous
    // camera scanning errors.
}


// =====================================================
// IMAGE QR SCANNER
// =====================================================

const qrImage =
    document.getElementById(
        "qrImage"
    );


if (qrImage) {

    qrImage.addEventListener(
        "change",
        async function(event) {

            if (isProcessingScan) {

                return;
            }


            const file =
                event.target.files[0];


            if (!file) {

                return;
            }


            isProcessingScan = true;


            showResult(
                "Reading QR image...",
                "black"
            );


            try {

                // -----------------------------------------
                // Create temporary scanner
                // -----------------------------------------

                const imageScanner =
                    new Html5Qrcode(
                        "reader"
                    );


                // -----------------------------------------
                // Scan image
                // -----------------------------------------

                const result =
                    await imageScanner.scanFile(
                        file,
                        true
                    );


                console.log(
                    "QR image token:",
                    result
                );


                // -----------------------------------------
                // Clear image scanner
                // -----------------------------------------

                try {

                    await imageScanner.clear();

                } catch (error) {

                    console.log(
                        "Image scanner clear:",
                        error
                    );
                }


                // -----------------------------------------
                // Send token
                // -----------------------------------------

                await sendQRToBackend(
                    result
                );


            } catch (error) {

                console.error(
                    "QR image scan failed:",
                    error
                );


                showResult(
                    "Could not read QR image.",
                    "red"
                );


                isProcessingScan = false;


                setTimeout(
                    startScanner,
                    2500
                );
            }


            // Reset file input
            event.target.value = "";

        }
    );
}


// =====================================================
// START SCANNER
// =====================================================

startScanner();

}