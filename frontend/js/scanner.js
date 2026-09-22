// =====================================================
// STAFF QR SCANNER
// =====================================================

const resultBox =
    document.getElementById("result");


// =====================================================
// QR SCAN SUCCESS
// =====================================================

async function onScanSuccess(decodedText) {

    console.log(
        "QR Scanned:",
        decodedText
    );


    // Stop scanner after successful scan

    try {

        await scanner.clear();

    }

    catch(error) {

        console.error(
            "Scanner clear error:",
            error
        );

    }


    resultBox.innerText =
        "QR scanned. Processing...";


    // =================================================
    // SEND QR TOKEN TO FASTAPI
    // =================================================

    await sendQRToBackend(
        decodedText
    );

}


// =====================================================
// SEND QR TOKEN
// =====================================================

async function sendQRToBackend(qrToken) {

    try {

        console.log(
            "Sending QR token:",
            qrToken
        );


        const response =
            await fetch(
                "https://smart-parking-system-tz4z.onrender.com/scan-qr",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        qr_token:
                            qrToken

                    })

                }
            );


        const result =
            await response.json();


        console.log(
            "Staff API response:",
            result
        );


        // =================================================
        // API ERROR
        // =================================================

        if (!response.ok) {

            resultBox.innerText =
                result.detail ||
                "QR scan failed.";

            resultBox.style.color =
                "red";


            setTimeout(
                startScanner,
                2000
            );

            return;

        }


        // =================================================
        // ENTRY
        // =================================================

        if (
            result.action ===
            "entry"
        ) {

            resultBox.innerHTML = `

                <strong>
                    Vehicle Entry Successful
                </strong>

                <br>

                Vehicle:
                ${result.vehicle_number}

                <br>

                Slot:
                ${result.slot_number}

                <br>

                Entry Time:
                ${result.entry_time}

            `;

            resultBox.style.color =
                "green";


            console.log(
                "ENTRY SUCCESS"
            );


            // Start scanner again

            setTimeout(
                startScanner,
                3000
            );

        }


        // =================================================
        // EXIT
        // =================================================

        else if (
            result.action ===
            "exit"
        ) {

            resultBox.innerHTML = `

                <strong>
                    Vehicle Exit Successful
                </strong>

                <br>

                Vehicle:
                ${result.vehicle_number}

                <br>

                Slot:
                ${result.slot_number}

                <br>

                Exit Time:
                ${result.exit_time}

                <br>

                Amount:
                ₹${result.total_amount}

            `;

            resultBox.style.color =
                "green";


            console.log(
                "EXIT SUCCESS"
            );


            // =============================================
            // OPEN PAYMENT PAGE
            // =============================================

            setTimeout(
                function() {

                    window.location.href =
                        `payment.html?reservation_id=${result.reservation_id}`;

                },
                3000
            );

        }

    }

    catch(error) {

        console.error(
            "Scanner API error:",
            error
        );


        resultBox.innerText =
            "Unable to connect to server.";

        resultBox.style.color =
            "red";


        setTimeout(
            startScanner,
            3000
        );

    }

}


// =====================================================
// QR ERROR
// =====================================================

function onScanFailure(error) {

    // Don't print every scanning frame error.
    // Camera continuously tries to read QR.
}


// =====================================================
// CREATE SCANNER
// =====================================================

let scanner;


function startScanner() {

    console.log(
        "Starting scanner..."
    );


    resultBox.innerText =
        "Scan customer's QR code...";


    resultBox.style.color =
        "black";


    scanner =
        new Html5Qrcode(
            "reader"
        );


    scanner.start(

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

    )
    .catch(
        function(error) {

            console.error(
                "Camera error:",
                error
            );


            resultBox.innerText =
                "Camera permission denied or camera unavailable.";

            resultBox.style.color =
                "red";

        }
    );

}


// =====================================================
// START
// =====================================================

startScanner();

const qrImage =
    document.getElementById("qrImage");

qrImage.addEventListener(
    "change",
    async function(event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        try {

            const scanner =
                new Html5Qrcode("reader");

            const result =
                await scanner.scanFile(
                    file,
                    true
                );

            console.log(
                "QR TOKEN:",
                result
            );

            document.getElementById(
                "result"
            ).innerText =
                "QR Token: " + result;

            await scanner.clear();

            // Send to your backend
            await sendQRToBackend(result);

        }

        catch(error) {

            console.error(
                "QR image scan failed:",
                error
            );

            document.getElementById(
                "result"
            ).innerText =
                "Could not read QR image.";

        }

    }
);