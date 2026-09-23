
// const urlParams = new URLSearchParams(
//     window.location.search
// );

// const parkingId = urlParams.get("parking_id");
// const slotId = urlParams.get("slot_id");

// console.log("Parking ID:", parkingId);
// console.log("Slot ID:", slotId);



// async function loadParking() {

//     try {

//         const response = await fetch(
//             `http://127.0.0.1:8000/parking/${parkingId}`
//         );

//         if (!response.ok) {
//             throw new Error(
//                 `Parking API Error: ${response.status}`
//             );
//         }

//         const parking = await response.json();

//         console.log("Parking:", parking);

//         document.getElementById("parkingName").value =
//             parking.parking_name;

//         document.getElementById("parkingArea").value =
//             parking.area;

//         document.getElementById("parkingAddress").value =
//             parking.address;

//         document.getElementById("price").value =
//             "₹" + parking.price + " / Hour";

//     } catch (error) {

//         console.error(
//             "Error loading parking:",
//             error
//         );

//     }
// }


// // =====================================================
// // LOAD SLOT DETAILS
// // =====================================================

// async function loadSlot() {

//     try {

//         const response = await fetch(
//             `http://127.0.0.1:8000/parking/${parkingId}/slots`
//         );

//         if (!response.ok) {
//             throw new Error(
//                 `Slot API Error: ${response.status}`
//             );
//         }

//         const slots = await response.json();

//         console.log("Slots:", slots);

//         const slot = slots.find(
//             s => s.id == slotId
//         );

//         if (slot) {

//             document.getElementById(
//                 "slotNumber"
//             ).value = slot.slot_number;

//         } else {

//             console.error(
//                 "Slot not found"
//             );

//         }

//     } catch (error) {

//         console.error(
//             "Error loading slot:",
//             error
//         );

//     }
// }


// // =====================================================
// // BOOKING DATE
// // =====================================================

// const now = new Date();

// document.getElementById(
//     "bookingDate"
// ).value = now.toLocaleDateString();


// // =====================================================
// // NEXT BUTTON
// // CREATE RESERVATION
// // =====================================================

// async function nextPage() {

//     console.log("================================");
//     console.log("NEXT BUTTON CLICKED");
//     console.log("================================");


//     // -------------------------------------------------
//     // Get vehicle number
//     // -------------------------------------------------

//     const vehicleNumber =
//         document.getElementById(
//             "vehicle"
//         ).value.trim();


//     if (vehicleNumber === "") {

//         alert(
//             "Enter Vehicle Number"
//         );

//         return;
//     }


//     // -------------------------------------------------
//     // Get vehicle type
//     // -------------------------------------------------

//     const selectedVehicle =
//         document.querySelector(
//             'input[name="vehicle"]:checked'
//         );


//     if (!selectedVehicle) {

//         alert(
//             "Please select vehicle type"
//         );

//         return;
//     }


//     const vehicleType =
//         selectedVehicle.value;


//     console.log(
//         "Parking ID:",
//         parkingId
//     );

//     console.log(
//         "Slot ID:",
//         slotId
//     );

//     console.log(
//         "Vehicle Number:",
//         vehicleNumber
//     );

//     console.log(
//         "Vehicle Type:",
//         vehicleType
//     );


//     // -------------------------------------------------
//     // Validate parking and slot
//     // -------------------------------------------------

//     if (!parkingId || !slotId) {

//         alert(
//             "Parking or Slot ID is missing."
//         );

//         console.error(
//             "Missing parkingId or slotId"
//         );

//         return;
//     }


//     try {

//         // -------------------------------------------------
//         // CREATE RESERVATION
//         // -------------------------------------------------

//         console.log(
//             "Sending reservation request..."
//         );


//         const response = await fetch(
//             "http://127.0.0.1:8000/reservation",
//             {

//                 method: "POST",

//                 headers: {
//                     "Content-Type":
//                         "application/json"
//                 },

//                 body: JSON.stringify({

//                     parking_id:
//                         Number(parkingId),

//                     slot_id:
//                         Number(slotId),

//                     vehicle_number:
//                         vehicleNumber,

//                     vehicle_type:
//                         vehicleType

//                 })

//             }
//         );


//         // -------------------------------------------------
//         // Read API response ONCE
//         // -------------------------------------------------

//         const result =
//             await response.json();


//         console.log(
//             "Reservation API Response:",
//             result
//         );


//         // -------------------------------------------------
//         // Check API error
//         // -------------------------------------------------

//         if (!response.ok) {

//             console.error(
//                 "Reservation failed:",
//                 result
//             );

//             alert(
//                 result.detail ||
//                 "Reservation failed"
//             );

//             return;
//         }


//         // -------------------------------------------------
//         // GET RESERVATION ID
//         // -------------------------------------------------

//         const reservationId =
//             result.reservation_id;


//         console.log(
//             "Reservation ID received:",
//             reservationId
//         );


//         // -------------------------------------------------
//         // Check reservation ID
//         // -------------------------------------------------

//         if (!reservationId) {

//             console.error(
//                 "Reservation ID missing!",
//                 result
//             );

//             alert(
//                 "Reservation created but Reservation ID was not returned."
//             );

//             return;
//         }


//         // -------------------------------------------------
//         // SAVE RESERVATION ID
//         // -------------------------------------------------

//         localStorage.setItem(
//             "reservation_id",
//             String(reservationId)
//         );


//         console.log(
//             "Reservation ID saved:",
//             localStorage.getItem(
//                 "reservation_id"
//             )
//         );


//         // -------------------------------------------------
//         // REDIRECT TO QR PAGE
//         // -------------------------------------------------

//         console.log(
//             "Redirecting to QR page..."
//         );


//         window.location.href =
//             `Qr.html?reservation_id=${reservationId}`;

//     }


//     catch (error) {

//         console.error(
//             "Reservation Error:",
//             error
//         );

//         alert(
//             "Server Error. Check console."
//         );

//     }

// }


// // =====================================================
// // CANCEL BUTTON
// // =====================================================

// function goDashboard() {

//     if (
//         confirm(
//             "Are you sure you want to cancel the reservation?"
//         )
//     ) {

//         window.location.href =
//             "dashboard.html";
//     }

// }


// // =====================================================
// // LOAD DATA WHEN PAGE OPENS
// // =====================================================

// loadParking();
// loadSlot();

// =====================================================
// GET PARKING ID AND SLOT ID FROM URL
// =====================================================

const urlParams = new URLSearchParams(
    window.location.search
);

const parkingId = urlParams.get("parking_id");
const slotId = urlParams.get("slot_id");

console.log("Parking ID:", parkingId);
console.log("Slot ID:", slotId);


// =====================================================
// CHECK IDS
// =====================================================

if (!parkingId || !slotId) {

    console.error("Parking ID or Slot ID missing");

    alert("Parking or Slot information is missing.");

}


// =====================================================
// LOAD PARKING DETAILS
// =====================================================

async function loadParking() {

    try {

        const response = await fetch(
            `https://smart-parking-system-tz4z.onrender.com/parking/${parkingId}`
        );

        if (!response.ok) {

            throw new Error(
                `Parking API Error: ${response.status}`
            );

        }

        const parking = await response.json();

        console.log("Parking:", parking);


        // Parking name
        document.getElementById(
            "parkingName"
        ).value = parking.parking_name;


        // Area
        document.getElementById(
            "parkingArea"
        ).value = parking.area;


        // Address
        document.getElementById(
            "parkingAddress"
        ).value = parking.address;


        // Price
        document.getElementById(
            "price"
        ).value =
            "₹" + parking.price + " / Hour";


    } catch (error) {

        console.error(
            "Error loading parking:",
            error
        );

    }

}


// =====================================================
// LOAD SLOT DETAILS
// =====================================================

async function loadSlot() {

    try {

        const response = await fetch(
            `https://smart-parking-system-tz4z.onrender.com/parking/${parkingId}/slots`
        );


        if (!response.ok) {

            throw new Error(
                `Slot API Error: ${response.status}`
            );

        }


        const slots = await response.json();

        console.log("All Slots:", slots);


        // Find selected slot
        const slot = slots.find(
            s => Number(s.id) === Number(slotId)
        );


        if (slot) {

            document.getElementById(
                "slotNumber"
            ).value = slot.slot_number;


            console.log(
                "Selected Slot:",
                slot.slot_number
            );


            // Important:
            // Don't allow booking if already reserved
            if (slot.status !== "Available") {

                alert(
                    `This slot is currently ${slot.status}`
                );

                document.getElementById(
                    "nextBtn"
                ).disabled = true;

            }

        } else {

            console.error(
                "Slot not found"
            );

            alert("Selected slot not found.");

        }


    } catch (error) {

        console.error(
            "Error loading slot:",
            error
        );

    }

}


// =====================================================
// BOOKING DATE
// =====================================================

const now = new Date();

const bookingDate =
    document.getElementById("bookingDate");

if (bookingDate) {

    bookingDate.value =
        now.toLocaleDateString();

}


// =====================================================
// CREATE RESERVATION
// =====================================================

// async function nextPage() {

//     console.log(
//         "================================"
//     );

//     console.log(
//         "NEXT BUTTON CLICKED"
//     );

//     console.log(
//         "================================"
//     );


//     // =================================================
//     // GET VEHICLE NUMBER
//     // =================================================

//     const vehicleNumber =
//         document
//             .getElementById("vehicle")
//             .value
//             .trim();


//     if (vehicleNumber === "") {

//         alert(
//             "Enter Vehicle Number"
//         );

//         return;

//     }


//     // =================================================
//     // GET VEHICLE TYPE
//     // =================================================

//     const selectedVehicle =
//         document.querySelector(
//             'input[name="vehicle"]:checked'
//         );


//     if (!selectedVehicle) {

//         alert(
//             "Please select vehicle type"
//         );

//         return;

//     }


//     const vehicleType =
//         selectedVehicle.value;


//     // =================================================
//     // CHECK PARKING / SLOT
//     // =================================================

//     if (!parkingId || !slotId) {

//         alert(
//             "Parking or Slot ID is missing."
//         );

//         console.error(
//             "Missing parkingId or slotId"
//         );

//         return;

//     }


//     // =================================================
//     // GET LOGIN TOKEN
//     // =================================================

//     const token =
//         localStorage.getItem("token");


//     if (!token) {

//         alert(
//             "Please login first."
//         );

//         window.location.href =
//             "login.html";

//         return;

//     }


//     console.log(
//         "Parking ID:",
//         parkingId
//     );

//     console.log(
//         "Slot ID:",
//         slotId
//     );

//     console.log(
//         "Vehicle Number:",
//         vehicleNumber
//     );

//     console.log(
//         "Vehicle Type:",
//         vehicleType
//     );


//     try {

        

//         const nextButton =
//             document.getElementById("nextBtn");

//         if (nextButton) {

//             nextButton.disabled = true;

//             nextButton.innerText =
//                 "Processing...";

//         }


//         // =================================================
//         // CREATE RESERVATION API
//         // =================================================

//         console.log(
//             "Sending reservation request..."
//         );


//         const response =
//             await fetch(
//                 "http://127.0.0.1:8000/reservation/",
//                 {

//                     method: "POST",

//                     headers: {

//                         "Content-Type":
//                             "application/json",

//                         "Authorization":
//                             `Bearer ${token}`

//                     },

//                     body: JSON.stringify({

//                         parking_id:
//                             Number(parkingId),

//                         slot_id:
//                             Number(slotId),

//                         vehicle_number:
//                             vehicleNumber,

//                         vehicle_type:
//                             vehicleType

//                     })

//                 }
//             );


//         // =================================================
//         // READ RESPONSE ONLY ONCE
//         // =================================================

//         const result =
//             await response.json();


//         console.log(
//             "Reservation API Response:",
//             result
//         );


//         // =================================================
//         // API ERROR
//         // =================================================

//         if (!response.ok) {

//             console.error(
//                 "Reservation failed:",
//                 result
//             );


//             alert(
//                 result.detail ||
//                 "Reservation failed"
//             );


//             if (nextButton) {

//                 nextButton.disabled = false;

//                 nextButton.innerText =
//                     "Next";

//             }

//             return;

//         }


//         // =================================================
//         // RESERVATION SUCCESS
//         // =================================================

//         const reservationId =
//             result.reservation_id;


//         console.log(
//             "Reservation ID:",
//             reservationId
//         );


//         if (!reservationId) {

//             console.error(
//                 "Reservation ID missing:",
//                 result
//             );


//             alert(
//                 "Reservation created but ID was not returned."
//             );


//             return;

//         }


//         // =================================================
//         // SAVE DATA IN LOCAL STORAGE
//         // =================================================

//         localStorage.setItem(
//             "reservation_id",
//             String(reservationId)
//         );


//         localStorage.setItem(
//             "parking_id",
//             String(parkingId)
//         );


//         localStorage.setItem(
//             "slot_id",
//             String(slotId)
//         );


//         localStorage.setItem(
//             "vehicle_number",
//             vehicleNumber
//         );


//         localStorage.setItem(
//             "vehicle_type",
//             vehicleType
//         );


//         // =================================================
//         // QR TOKEN
//         // =================================================

//         if (result.qr_token) {

//             localStorage.setItem(
//                 "qr_token",
//                 result.qr_token
//             );

//         }


//         console.log(
//             "Reservation saved successfully"
//         );


//         // =================================================
//         // GO TO QR PAGE
//         // =================================================

//         window.location.href =
//             `Qr.html?reservation_id=${reservationId}`;

//     }


//     catch (error) {

//         console.error(
//             "Reservation Error:",
//             error
//         );


//         alert(
//             "Server Error. Check console."
//         );


//         const nextButton =
//             document.getElementById("nextBtn");


//         if (nextButton) {

//             nextButton.disabled = false;

//             nextButton.innerText =
//                 "Next";

//         }

//     }

// }


async function nextPage() {

    console.log("==============================");
    console.log("NEXT BUTTON CLICKED");
    console.log("==============================");


    // ==========================================
    // GET VEHICLE NUMBER
    // ==========================================

    const vehicleField =
        document.getElementById("vehicle");

    const rawVehicleNumber =
        vehicleField.value;

    const vehicleNumber =
        rawVehicleNumber
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");


    if (!isValidVehicleNumber(vehicleNumber)) {

        setVehicleInputState("invalid");
        showVehicleValidationModal();
        return;

    }

    setVehicleInputState("valid");


    // ==========================================
    // GET VEHICLE TYPE
    // ==========================================

    const selectedVehicle =
        document.querySelector(
            'input[name="vehicle"]:checked'
        );


    if (!selectedVehicle) {

        alert("Please select vehicle type");
        return;

    }


    const vehicleType =
        selectedVehicle.value;


    // ==========================================
    // CHECK PARKING + SLOT
    // ==========================================

    if (!parkingId || !slotId) {

        alert("Parking or Slot ID is missing.");

        return;

    }


    // ==========================================
    // GET LOGIN TOKEN
    // ==========================================

    const token =
        sessionStorage.getItem("access_token");


    console.log(
        "Token:",
        token
    );


    // ==========================================
    // TOKEN CHECK
    // ==========================================

    if (!token) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }


    // ==========================================
    // CREATE RESERVATION
    // ==========================================

    try {

        console.log("Sending reservation request...");


        const response = await fetch(
            "https://smart-parking-system-tz4z.onrender.com/reservation/",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    // IMPORTANT
                    "Authorization":
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    parking_id:
                        Number(parkingId),

                    slot_id:
                        Number(slotId),

                    vehicle_number:
                        vehicleNumber,

                    vehicle_type:
                        vehicleType

                })

            }
        );


        // ==========================================
        // READ RESPONSE ONLY ONCE
        // ==========================================

        const result =
            await response.json();


        console.log(
            "Reservation API Response:",
            result
        );


        // ==========================================
        // API ERROR
        // ==========================================

        if (!response.ok) {

            console.error(
                "Reservation failed:",
                response.status,
                result
            );


            if (response.status === 401) {

                alert(
                    "Login expired. Please login again."
                );

                sessionStorage.removeItem(
                    "access_token"
                );

                sessionStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "login.html";

                return;

            }


            alert(
                result.detail ||
                "Reservation failed"
            );

            return;

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        console.log(
            "Reservation successful:",
            result
        );


        const reservationId =
            result.reservation_id;


        if (!reservationId) {

            alert(
                "Reservation created but ID was not returned."
            );

            return;

        }


        // ==========================================
        // SAVE RESERVATION
        // ==========================================

        sessionStorage.setItem(
            "reservation_id",
            String(reservationId)
        );


        // If backend returns qr_token
        if (result.qr_token) {

            sessionStorage.setItem(
                "qr_token",
                result.qr_token
            );

        }


        // ==========================================
        // OPEN QR PAGE
        // ==========================================

        window.location.href =
            `Qr.html?reservation_id=${reservationId}`;

    }

    catch (error) {

        console.error(
            "Reservation Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// =====================================================
// CANCEL BUTTON
// =====================================================

function goDashboard() {

    if (
        confirm(
            "Are you sure you want to cancel the reservation?"
        )
    ) {

        window.location.href =
            "dashboard.html";

    }

}
// =====================================================
// VEHICLE NUMBER VALIDATION UI
// Reservation request logic remains unchanged above
// =====================================================

const vehicleInput =
    document.getElementById("vehicle");

const vehicleInputWrapper =
    document.getElementById("vehicleInputWrapper");

const vehicleHelper =
    document.getElementById("vehicleHelper");

const vehicleValidationModal =
    document.getElementById("vehicleValidationModal");

const vehicleValidationConfirm =
    document.getElementById("vehicleValidationConfirm");

let vehicleValidationCloseTimer;


function isValidVehicleNumber(value) {

    const normalizedVehicleNumber = value
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");

    return /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{1,4}$/.test(
        normalizedVehicleNumber
    );

}


function setVehicleInputState(state) {

    if (
        !vehicleInput ||
        !vehicleInputWrapper ||
        !vehicleHelper
    ) {
        return;
    }

    const isValid = state === "valid";
    const isInvalid = state === "invalid";

    vehicleInputWrapper.classList.toggle(
        "is-valid",
        isValid
    );

    vehicleInputWrapper.classList.toggle(
        "is-invalid",
        isInvalid
    );

    vehicleInput.setAttribute(
        "aria-invalid",
        String(isInvalid)
    );

    if (isValid) {

        vehicleHelper.innerHTML =
            '<i class="bi bi-check-circle"></i>' +
            "Vehicle number looks good";

    } else if (isInvalid) {

        vehicleHelper.innerHTML =
            '<i class="bi bi-exclamation-circle"></i>' +
            "Please enter a valid vehicle number 🚗";

    } else {

        vehicleHelper.innerHTML =
            '<i class="bi bi-info-circle"></i>' +
            "Example: GJ01AB1234 or GJ 01 AB 1234";

    }

}


function showVehicleValidationModal() {

    if (!vehicleValidationModal) {
        return;
    }

    window.clearTimeout(
        vehicleValidationCloseTimer
    );

    vehicleValidationModal.hidden = false;

    vehicleValidationModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "vehicle-validation-open"
    );

    window.requestAnimationFrame(
        function () {

            vehicleValidationModal.classList.add(
                "is-open"
            );

            if (vehicleValidationConfirm) {
                vehicleValidationConfirm.focus();
            }

        }
    );

}


function closeVehicleValidationModal() {

    if (!vehicleValidationModal) {
        return;
    }

    vehicleValidationModal.classList.remove(
        "is-open"
    );

    vehicleValidationModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "vehicle-validation-open"
    );

    vehicleValidationCloseTimer =
        window.setTimeout(
            function () {
                vehicleValidationModal.hidden = true;
            },
            180
        );

    if (vehicleInput) {
        vehicleInput.focus();
    }

}


if (vehicleInput) {

    vehicleInput.addEventListener(
        "input",
        function () {

            if (this.value === "") {
                setVehicleInputState("neutral");
                return;
            }

            setVehicleInputState(
                isValidVehicleNumber(this.value)
                    ? "valid"
                    : "invalid"
            );

        }
    );

}


if (vehicleValidationConfirm) {

    vehicleValidationConfirm.addEventListener(
        "click",
        closeVehicleValidationModal
    );

}


if (vehicleValidationModal) {

    vehicleValidationModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target.hasAttribute(
                    "data-close-vehicle-modal"
                )
            ) {
                closeVehicleValidationModal();
            }

        }
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            vehicleValidationModal &&
            !vehicleValidationModal.hidden
        ) {
            closeVehicleValidationModal();
        }

    }
);


// =====================================================
// LOAD DATA WHEN PAGE OPENS
// =====================================================

loadParking();

loadSlot();
