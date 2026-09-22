// =====================================================
// GET RESERVATION ID
// =====================================================

const API_URL = "https://smart-parking-system-tz4z.onrender.com";

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const reservationId =
    urlParams.get("reservation_id");


console.log(
    "Reservation ID:",
    reservationId
);


// =====================================================
// CHECK RESERVATION ID
// =====================================================

if (!reservationId) {

    alert(
        "Reservation ID is missing."
    );

    throw new Error(
        "Reservation ID missing"
    );

}


// =====================================================
// GET TOKEN
// =====================================================

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


// =====================================================
// LOAD RESERVATION
// =====================================================

// async function loadReservation() {

//     try {

//         console.log(
//             "Loading reservation..."
//         );


//         const response =
//             await fetch(
//                 `http://127.0.0.1:8000/reservation/${reservationId}`,
//                 {

//                     method: "GET",

//                     headers: {

//                         "Authorization":
//                             `Bearer ${token}`

//                     }

//                 }
//             );


//         const data =
//             await response.json();


//         console.log(
//             "Reservation:",
//             data
//         );


//         // =================================================
//         // ERROR
//         // =================================================

//         if (!response.ok) {

//             console.error(
//                 "Reservation error:",
//                 data
//             );

//             alert(
//                 data.detail ||
//                 "Unable to load reservation"
//             );

//             return;

//         }


//         // =================================================
//         // RESERVATION DETAILS
//         // =================================================

//         document.getElementById(
//             "reservationId"
//         ).value =
//             data.reservation_id;


//         document.getElementById(
//             "parkingName"
//         ).value =
//             data.parking_name;


//         document.getElementById(
//             "vehicleNumber"
//         ).value =
//             data.vehicle_number;


//         document.getElementById(
//             "vehicleType"
//         ).value =
//             data.vehicle_type;


//         // =================================================
//         // TIME
//         // =================================================

//         const entry =
//             new Date(
//                 data.entry_time
//             );

//         const exit =
//             new Date(
//                 data.exit_time
//             );


//         document.getElementById(
//             "entryTime"
//         ).value =
//             formatDateTime(entry);


//         document.getElementById(
//             "exitTime"
//         ).value =
//             formatDateTime(exit);


//         // =================================================
//         // DURATION
//         // =================================================

//         const duration =
//             calculateDuration(
//                 entry,
//                 exit
//             );


//         document.getElementById(
//             "duration"
//         ).value =
//             duration.text;


//         document.getElementById(
//             "billingDuration"
//         ).innerText =
//             duration.hours +
//             " Hour(s)";


//         // =================================================
//         // PRICE
//         // =================================================

//         const parkingPrice =
//             Number(
//                 data.parking_price
//             );


//         document.getElementById(
//             "parkingPrice"
//         ).innerText =
//             "₹" +
//             parkingPrice;


//         // =================================================
//         // AMOUNT
//         // =================================================

//         const totalAmount =
//             Number(
//                 data.total_amount
//             );


//         document.getElementById(
//             "parkingCharges"
//         ).innerText =
//             "₹" +
//             totalAmount;


//         document.getElementById(
//             "totalAmount"
//         ).innerText =
//             "₹" +
//             totalAmount;


//         console.log(
//             "Total amount:",
//             totalAmount
//         );

//     }

//     catch (error) {

//         console.error(
//             "Payment loading error:",
//             error
//         );

//         alert(
//             "Unable to connect to server."
//         );

//     }

// }
// async function loadReservation() {

//     try {

//         const token =
//             localStorage.getItem("access_token") ||
//             localStorage.getItem("token");

//         if (!reservationId) {

//             console.error("Reservation ID missing from URL");

//             alert("Reservation ID is missing.");

//             return;
//         }

//         console.log("Loading reservation:", reservationId);

//         const response = await fetch(
//             `${API_URL}/reservation/${reservationId}`,
//             {
//                 method: "GET",

//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         if (!response.ok) {

//             const errorText = await response.text();

//             console.error(
//                 "Reservation API Error:",
//                 response.status,
//                 errorText
//             );

//             return;
//         }

//         const data = await response.json();

//         console.log("Reservation API Response:");
//         console.log(data);

       

//         const actualReservationId =
//             data.id ??
//             data.reservation_id ??
//             reservationId;

//         document.getElementById("reservationId").value =
//             actualReservationId;


        

//         const parkingName =
//             data.parking_name ??
//             data.parking?.name ??
//             data.parking?.parking_name ??
//             "N/A";

//         document.getElementById("parkingName").value =
//             parkingName;


        
//         document.getElementById("vehicleNumber").value =
//             data.vehicle_number ?? "N/A";


        

//         document.getElementById("vehicleType").value =
//             data.vehicle_type ?? "N/A";


        

//         const entryTime =
//             data.entry_time ??
//             data.entry_date ??
//             null;


        
//         const exitTime =
//             data.exit_time ??
//             data.exit_date ??
//             null;


//         console.log("Entry Time:", entryTime);
//         console.log("Exit Time:", exitTime);


        

//         if (entryTime) {

//             document.getElementById("entryTime").value =
//                 formatIndianDateTime(entryTime);

//         }

//         if (exitTime) {

//             document.getElementById("exitTime").value =
//                 formatIndianDateTime(exitTime);

//         }


        

//         const durationMinutes =
//             calculateDurationMinutes(entryTime, exitTime);

//         document.getElementById("duration").value =
//             formatDuration(durationMinutes);


        

//         const parkingPrice =
//             data.parking_price_per_hour ??
//             data.price_per_hour ??
//             data.parking?.price_per_hour ??
//             data.parking?.price ??
//             data.parking?.hourly_rate ??
//             0;

//         console.log("Parking Price:", parkingPrice);

//         document.getElementById("parkingPrice").textContent =
//             `₹${Number(parkingPrice).toFixed(2)}`;


        

//         let totalAmount =
//             Number(data.total_amount ?? 0);

//         if (!totalAmount) {

//             totalAmount =
//                 calculateParkingCharge(
//                     Number(parkingPrice),
//                     durationMinutes
//                 );

//         }

//         document.getElementById("parkingCharges").textContent =
//             `₹${totalAmount.toFixed(2)}`;


        

//         document.getElementById("totalAmount").textContent =
//             `₹${totalAmount.toFixed(2)}`;


//     } catch (error) {

//         console.error(
//             "loadReservation error:",
//             error
//         );

//     }
// }


// // function formatDateTime(
// //     date
// // ) {

// //     if (
// //         !date ||
// //         isNaN(date.getTime())
// //     ) {

// //         return "-";

// //     }


// //     return date.toLocaleString(
// //         "en-IN",
// //         {

// //             day: "2-digit",

// //             month: "short",

// //             year: "numeric",

// //             hour: "2-digit",

// //             minute: "2-digit",

// //             hour12: true

// //         }
// //     );

// // }
// function formatDateTime(dateString) {

//     if (!dateString) {
//         return "N/A";
//     }

//     let value = String(dateString).trim();

//     // If backend sends a naive UTC datetime like:
//     // 2026-08-25T12:30:00
//     //
//     // add Z so JavaScript treats it as UTC.

//     if (
//         !value.endsWith("Z") &&
//         !value.includes("+") &&
//         !/[+-]\d{2}:\d{2}$/.test(value)
//     ) {
//         value += "Z";
//     }

//     const date = new Date(value);

//     if (isNaN(date.getTime())) {

//         console.error(
//             "Invalid date:",
//             dateString
//         );

//         return "N/A";
//     }

//     return date.toLocaleString("en-IN", {

//         timeZone: "Asia/Kolkata",

//         day: "2-digit",

//         month: "short",

//         year: "numeric",

//         hour: "2-digit",

//         minute: "2-digit",

//         hour12: true

//     });

// }



// function calculateDuration(entryTime, exitTime) {

//     if (!entryTime || !exitTime) {
//         return 0;
//     }

//     let entryValue = String(entryTime).trim();
//     let exitValue = String(exitTime).trim();

//     if (
//         !entryValue.endsWith("Z") &&
//         !entryValue.includes("+") &&
//         !/[+-]\d{2}:\d{2}$/.test(entryValue)
//     ) {
//         entryValue += "Z";
//     }

//     if (
//         !exitValue.endsWith("Z") &&
//         !exitValue.includes("+") &&
//         !/[+-]\d{2}:\d{2}$/.test(exitValue)
//     ) {
//         exitValue += "Z";
//     }

//     const entry = new Date(entryValue);
//     const exit = new Date(exitValue);

//     if (
//         isNaN(entry.getTime()) ||
//         isNaN(exit.getTime())
//     ) {
//         return 0;
//     }

//     const difference =
//         exit.getTime() - entry.getTime();

//     const minutes =
//         Math.ceil(difference / (1000 * 60));

//     return Math.max(0, minutes);

// }

// =====================================================
// LOAD RESERVATION
// =====================================================

async function loadReservation() {

    try {

        const token =
            sessionStorage.getItem("access_token") ||
            sessionStorage.getItem("token");

        if (!reservationId) {

            console.error("Reservation ID missing");

            alert("Reservation ID is missing.");

            return;
        }

        if (!token) {

            alert("Please login first.");

            window.location.href = "login.html";

            return;
        }

        console.log(
            "Loading reservation:",
            reservationId
        );

        const response = await fetch(
            `${API_URL}/reservation/${reservationId}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        // =================================================
        // CHECK RESPONSE
        // =================================================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Reservation API Error:",
                response.status,
                errorText
            );

            alert(
                "Unable to load reservation."
            );

            return;
        }


        // =================================================
        // GET JSON
        // =================================================

        const data =
            await response.json();

        console.log(
            "========== RESERVATION DATA =========="
        );

        console.log(data);

        console.log(
            "======================================"
        );


        // =================================================
        // RESERVATION ID
        // =================================================

        const actualReservationId =
            data.id ??
            data.reservation_id ??
            reservationId;


        const reservationElement =
            document.getElementById(
                "reservationId"
            );

        if (reservationElement) {

            reservationElement.value =
                actualReservationId;
        }


        // =================================================
        // PARKING NAME
        // =================================================

        const parkingName =
            data.parking_name ??
            data.parking?.name ??
            data.parking?.parking_name ??
            "N/A";


        const parkingElement =
            document.getElementById(
                "parkingName"
            );

        if (parkingElement) {

            parkingElement.value =
                parkingName;
        }


        // =================================================
        // VEHICLE NUMBER
        // =================================================

        const vehicleNumberElement =
            document.getElementById(
                "vehicleNumber"
            );

        if (vehicleNumberElement) {

            vehicleNumberElement.value =
                data.vehicle_number ?? "N/A";
        }


        // =================================================
        // VEHICLE TYPE
        // =================================================

        const vehicleTypeElement =
            document.getElementById(
                "vehicleType"
            );

        if (vehicleTypeElement) {

            vehicleTypeElement.value =
                data.vehicle_type ?? "N/A";
        }


        // =================================================
        // ENTRY TIME
        // =================================================

        const entryTime =
            data.entry_time ??
            data.entry_date ??
            null;


        // =================================================
        // EXIT TIME
        // =================================================

        const exitTime =
            data.exit_time ??
            data.exit_date ??
            null;


        console.log(
            "RAW ENTRY TIME:",
            entryTime
        );

        console.log(
            "RAW EXIT TIME:",
            exitTime
        );


        // =================================================
        // DISPLAY ENTRY TIME
        // =================================================

        const entryElement =
            document.getElementById(
                "entryTime"
            );


        if (entryElement) {

            entryElement.value =
                formatDateTime(entryTime);

        }


        // =================================================
        // DISPLAY EXIT TIME
        // =================================================

        const exitElement =
            document.getElementById(
                "exitTime"
            );


        if (exitElement) {

            exitElement.value =
                formatDateTime(exitTime);

        }


        // =================================================
        // DURATION
        // =================================================

        const durationMinutes =
            calculateDurationMinutes(
                entryTime,
                exitTime
            );


        console.log(
            "Duration Minutes:",
            durationMinutes
        );


        const durationText =
            formatDuration(
                durationMinutes
            );


        const durationElement =
            document.getElementById(
                "duration"
            );


        if (durationElement) {

            durationElement.value =
                durationText;

        }


        // =================================================
        // PARKING PRICE
        // =================================================

        const parkingPrice = Number(
            data.parking_price_per_hour ??
            data.price_per_hour ??
            data.parking?.price_per_hour ??
            data.parking?.price ??
            data.parking?.hourly_rate ??
            0
        );


        console.log(
            "Parking Price:",
            parkingPrice
        );


        const parkingPriceElement =
            document.getElementById(
                "parkingPrice"
            );


        if (parkingPriceElement) {

            parkingPriceElement.textContent =
                `₹${parkingPrice.toFixed(2)}`;

        }


        // =================================================
        // TOTAL AMOUNT
        // =================================================

        let totalAmount =
            Number(
                data.total_amount ?? 0
            );


        console.log(
            "Backend Total Amount:",
            totalAmount
        );


        // =================================================
        // CALCULATE IF BACKEND AMOUNT IS 0
        // =================================================

        if (
            totalAmount <= 0 &&
            parkingPrice > 0 &&
            durationMinutes > 0
        ) {

            totalAmount =
                calculateParkingCharge(
                    parkingPrice,
                    durationMinutes
                );

        }


        console.log(
            "Final Total Amount:",
            totalAmount
        );


        // =================================================
        // PARKING CHARGES
        // =================================================

        const parkingChargesElement =
            document.getElementById(
                "parkingCharges"
            );


        if (parkingChargesElement) {

            parkingChargesElement.textContent =
                `₹${totalAmount.toFixed(2)}`;

        }


        // =================================================
        // TOTAL AMOUNT
        // =================================================

        const totalAmountElement =
            document.getElementById(
                "totalAmount"
            );


        if (totalAmountElement) {

            totalAmountElement.textContent =
                `₹${totalAmount.toFixed(2)}`;

        }


        console.log(
            "========== RESERVATION LOADED =========="
        );

    }

    catch (error) {

        console.error(
            "loadReservation error:",
            error
        );

    }

}


// =====================================================
// FORMAT DATE/TIME
// =====================================================

function formatDateTime(dateString) {

    if (!dateString) {

        return "N/A";
    }


    let value =
        String(dateString).trim();


    // Backend normally sends UTC like:
    // 2026-08-25T12:30:00
    //
    // Treat it as UTC.

    if (
        !value.endsWith("Z") &&
        !value.includes("+") &&
        !/[+-]\d{2}:\d{2}$/.test(value)
    ) {

        value += "Z";
    }


    const date =
        new Date(value);


    if (
        isNaN(date.getTime())
    ) {

        console.error(
            "Invalid date:",
            dateString
        );

        return "N/A";
    }


    return date.toLocaleString(
        "en-IN",
        {

            timeZone: "Asia/Kolkata",

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

            hour12: true
        }
    );

}


// =====================================================
// CALCULATE DURATION IN MINUTES
// =====================================================

function calculateDurationMinutes(
    entryTime,
    exitTime
) {

    if (
        !entryTime ||
        !exitTime
    ) {

        return 0;
    }


    let entryValue =
        String(entryTime).trim();


    let exitValue =
        String(exitTime).trim();


    // Treat naive backend datetime as UTC

    if (
        !entryValue.endsWith("Z") &&
        !entryValue.includes("+") &&
        !/[+-]\d{2}:\d{2}$/.test(entryValue)
    ) {

        entryValue += "Z";
    }


    if (
        !exitValue.endsWith("Z") &&
        !exitValue.includes("+") &&
        !/[+-]\d{2}:\d{2}$/.test(exitValue)
    ) {

        exitValue += "Z";
    }


    const entry =
        new Date(entryValue);


    const exit =
        new Date(exitValue);


    if (
        isNaN(entry.getTime()) ||
        isNaN(exit.getTime())
    ) {

        console.error(
            "Invalid entry/exit time:",
            entryTime,
            exitTime
        );

        return 0;
    }


    const difference =
        exit.getTime() -
        entry.getTime();


    if (difference <= 0) {

        return 0;
    }


    return Math.ceil(
        difference /
        (1000 * 60)
    );

}


// =====================================================
// FORMAT DURATION
// =====================================================

function formatDuration(
    minutes
) {

    if (
        !minutes ||
        minutes <= 0
    ) {

        return "0 Minutes";
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    let result = "";


    if (hours > 0) {

        result +=
            hours +
            (
                hours === 1
                    ? " Hour"
                    : " Hours"
            );
    }


    if (remainingMinutes > 0) {

        if (result !== "") {

            result += " ";
        }


        result +=
            remainingMinutes +
            " Minutes";
    }


    return result;

}


// =====================================================
// CALCULATE PARKING CHARGE
// =====================================================

function calculateParkingCharge(
    pricePerHour,
    durationMinutes
) {

    if (
        pricePerHour <= 0 ||
        durationMinutes <= 0
    ) {

        return 0;
    }


    // Round UP to next hour.
    //
    // Example:
    // 30 minutes = 1 hour
    // 60 minutes = 1 hour
    // 90 minutes = 2 hours

    const billingHours =
        Math.ceil(
            durationMinutes / 60
        );


    const amount =
        pricePerHour *
        billingHours;


    return amount;

}
loadReservation();

// ------------------------------------------



// =====================================================
// START PAYMENT
// =====================================================

async function startPayment() {

    console.log("🔥 PAY BUTTON CLICKED");

    console.log(
        "Razorpay available:",
        typeof Razorpay
    );

    console.log(
        "Reservation ID:",
        urlParams.get("reservation_id")
    );

    console.log(
        "Token:",
        localStorage.getItem("access_token")
    );

    // -----------------------------------------------
    // 1. Check Terms
    // -----------------------------------------------

    const terms =
        document.getElementById(
            "termsCheckbox"
        );


    if (!terms || !terms.checked) {

        alert(
            "Please agree to the Terms & Conditions."
        );

        return;
    }


    // -----------------------------------------------
    // 2. Get reservation ID
    // -----------------------------------------------

    // const reservationId =
    //     localStorage.getItem(
    //         "reservation_id"
    //     );

     const reservationId =
        urlParams.get("reservation_id");


    // -----------------------------------------------
    // 3. Get JWT
    // -----------------------------------------------

    const token =
        sessionStorage.getItem(
            "access_token"
        );


    console.log(
        "Payment Reservation ID:",
        reservationId
    );


    if (!reservationId) {

        alert(
            "Reservation ID not found."
        );

        return;
    }


    if (!token) {

        alert(
            "Please login again."
        );

        window.location.href =
            "login.html";

        return;
    }


    // -----------------------------------------------
    // 4. Disable button
    // -----------------------------------------------

    const payButton =
        document.getElementById(
            "payButton"
        );


    if (payButton) {

        payButton.disabled = true;

        payButton.innerText =
            "Creating Payment...";
    }


    try {

        // -----------------------------------------------
        // 5. Create Razorpay Order
        // -----------------------------------------------

        const response =
            await fetch(

                `${API_URL}/payment/create-order?reservation_id=${reservationId}`,

                {
                    method: "POST",

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
            "Create Order Response:",
            data
        );


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to create payment order."
            );

            resetPayButton();

            return;
        }


        // -----------------------------------------------
        // 6. Validate Razorpay order
        // -----------------------------------------------

        if (
            !data.razorpay_order_id ||
            !data.razorpay_key_id ||
            !data.amount_paise
        ) {

            console.error(
                "Invalid Razorpay response:",
                data
            );

            alert(
                "Invalid payment order received."
            );

            resetPayButton();

            return;
        }


        // -----------------------------------------------
        // 7. Open Razorpay
        // -----------------------------------------------

        openRazorpay(
            data
        );

    }
    catch (error) {

        console.error(
            "Payment error:",
            error
        );

        alert(
            "Something went wrong while creating payment."
        );

        resetPayButton();
    }
}


// =====================================================
// OPEN RAZORPAY
// =====================================================

function openRazorpay(
    orderData
) {

    console.log(
        "Opening Razorpay:",
        orderData
    );


    if (
        typeof Razorpay ===
        "undefined"
    ) {

        alert(
            "Razorpay Checkout is not loaded."
        );

        resetPayButton();

        return;
    }


    const options = {

        // ------------------------------------------
        // Razorpay Key
        // ------------------------------------------

        key:
            orderData.razorpay_key_id,


        // ------------------------------------------
        // Amount in paise
        // ------------------------------------------

        amount:
            orderData.amount_paise,


        // ------------------------------------------
        // Currency
        // ------------------------------------------

        currency:
            orderData.currency,


        // ------------------------------------------
        // Business name
        // ------------------------------------------

        name:
            "Smart Parking",


        // ------------------------------------------
        // Description
        // ------------------------------------------

        description:
            `Parking Reservation #${orderData.reservation_id}`,


        // ------------------------------------------
        // IMPORTANT: Razorpay Order ID
        // ------------------------------------------

        order_id:
            orderData.razorpay_order_id,


        // ------------------------------------------
        // Payment success
        // ------------------------------------------

        handler:
            async function(
                razorpayResponse
            ) {

                console.log(
                    "Razorpay Success:",
                    razorpayResponse
                );


                await verifyPayment(
                    razorpayResponse,
                    orderData.reservation_id
                );
            },


        // ------------------------------------------
        // Modal close
        // ------------------------------------------

        modal: {

            ondismiss:
                function() {

                    console.log(
                        "Razorpay checkout closed"
                    );

                    resetPayButton();
                }
        }

    };


    // -----------------------------------------------
    // Create Razorpay instance
    // -----------------------------------------------

    const razorpay =
        new Razorpay(
            options
        );


    // -----------------------------------------------
    // Payment failed
    // -----------------------------------------------

    // razorpay.on(
    //     "payment.failed",

    //     function(
    //        response
    //     ) {

    //         console.error(
    //             "Payment Failed:",
    //             response
    //         );


    //         alert(
    //             "Payment failed. Please try again."
    //         );


    //         resetPayButton();
    //     }
    // );

     razorpay.on(
    "payment.failed",
    function(response) {

        console.error(
            "========== RAZORPAY PAYMENT FAILED =========="
        );

        console.error(
            "Full Response:",
            response
        );

        if (response && response.error) {

            console.error(
                "Error Code:",
                response.error.code
            );

            console.error(
                "Description:",
                response.error.description
            );

            console.error(
                "Source:",
                response.error.source
            );

            console.error(
                "Step:",
                response.error.step
            );

            console.error(
                "Reason:",
                response.error.reason
            );

            console.error(
                "Field:",
                response.error.field
            );

        }

        console.error(
            "=============================================="
        );

        alert(
            "Payment failed: " +
            (
                response?.error?.description ||
                "Please try again."
            )
        );

        resetPayButton();
    }
);



    // -----------------------------------------------
    // Open Checkout
    // -----------------------------------------------

    razorpay.open();
}


// =====================================================
// VERIFY PAYMENT
// =====================================================

async function verifyPayment(
    razorpayResponse,
    reservationId
) {

    const token =
        sessionStorage.getItem(
            "access_token"
        );


    if (!token) {

        alert(
            "Login session expired."
        );

        return;
    }


    try {

        console.log(
            "Verifying payment..."
        );


        const response =
            await fetch(
                `${API_URL}/payment/verify`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            reservation_id:
                                Number(
                                    reservationId
                                ),

                            razorpay_order_id:
                                razorpayResponse
                                    .razorpay_order_id,

                            razorpay_payment_id:
                                razorpayResponse
                                    .razorpay_payment_id,

                            razorpay_signature:
                                razorpayResponse
                                    .razorpay_signature

                        })
                }
            );


        const data =
            await response.json();


        console.log(
            "Verify Payment Response:",
            data
        );


        if (!response.ok) {

            alert(
                data.detail ||
                "Payment verification failed."
            );

            resetPayButton();

            return;
        }


        // ------------------------------------------
        // Payment successful
        // ------------------------------------------

        alert(
            "Payment successful!"
        );


        console.log(
            "Payment ID:",
            data.payment_id
        );


        console.log(
            "Transaction ID:",
            data.transaction_id
        );


        console.log(
            "Payment Status:",
            data.payment_status
        );


        // Save for success page
        sessionStorage.setItem(
            "payment_id",
            data.payment_id
        );


        sessionStorage.setItem(
            "transaction_id",
            data.transaction_id
        );


        sessionStorage.setItem(
            "payment_status",
            data.payment_status
        );


        sessionStorage.setItem(
            "payment_amount",
            data.amount
        );


        // ------------------------------------------
        // Redirect
        // ------------------------------------------

        window.location.href =
            "paysuccess.html";

    }
    catch (error) {

        console.error(
            "Verification error:",
            error
        );


        alert(
            "Payment verification failed."
        );


        resetPayButton();
    }
}


// =====================================================
// RESET PAY BUTTON
// =====================================================

function resetPayButton() {

    const payButton =
        document.getElementById(
            "payButton"
        );


    if (payButton) {

        payButton.disabled = false;

        payButton.innerHTML =
            '<i class="bi bi-credit-card"></i> Pay with Razorpay';
    }
}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadReservation();

    }
);