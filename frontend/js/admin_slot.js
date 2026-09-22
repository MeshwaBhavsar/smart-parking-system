const API_URL =
    "https://smart-parking-system-tz4z.onrender.com";


// =====================================================
// GET PARKING ID FROM URL
// =====================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const parkingId =
    urlParams.get("parking_id");


console.log(
    "Admin selected parking ID:",
    parkingId
);


// =====================================================
// LOAD PARKING SLOTS
// =====================================================

async function loadSlots() {

    console.log(
        "Loading slots for parking:",
        parkingId
    );


    if (!parkingId) {

        console.error(
            "Parking ID not found"
        );

        document.getElementById(
            "parkingName"
        ).textContent =
            "Parking ID not found";

        return;
    }


    try {

        const token =
            sessionStorage.getItem(
                "access_token"
            );


        // =============================================
        // API REQUEST
        // =============================================

        const response =
            await fetch(
                `${API_URL}/admin_parking/${parkingId}/slots`,
                {
                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    }
                }
            );


        console.log(
            "Slot API status:",
            response.status
        );


        // =============================================
        // ERROR
        // =============================================

        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => ({}));


            throw new Error(
                errorData.detail ||
                `HTTP Error ${response.status}`
            );
        }


        // =============================================
        // RESPONSE
        // =============================================

        const data =
            await response.json();


        console.log(
            "Parking slot data:",
            data
        );


        // =============================================
        // PARKING INFORMATION
        // =============================================

        if (data.parking) {

            document.getElementById(
                "parkingName"
            ).textContent =
                data.parking.parking_name;


            document.getElementById(
                "parkingLocation"
            ).textContent =
                `${data.parking.address}, ${data.parking.area}, ${data.parking.city}`;

        }


        // =============================================
        // DISPLAY SLOTS
        // =============================================

        displaySlots(
            data.slots || []
        );


    } catch (error) {

        console.error(
            "Error loading slots:",
            error
        );


        document.getElementById(
            "parkingName"
        ).textContent =
            "Error loading parking";


        document.getElementById(
            "parkingLocation"
        ).textContent =
            error.message;

    }

}


// -------------------display--------------------

function displaySlots(slots) {

    const container =
        document.getElementById(
            "slotContainer"
        );


    container.innerHTML = "";


    // =============================================
    // NO SLOTS
    // =============================================

    if (!slots.length) {

        container.innerHTML = `

            <div class="alert alert-warning">

                No parking slots found.

            </div>

        `;

        updateCounts([]);

        return;
    }


    // =============================================
    // CREATE SLOT CARDS
    // =============================================

    slots.forEach(slot => {

        const slotElement =
            document.createElement("div");


        slotElement.classList.add(
            "slot"
        );


        // =========================================
        // STATUS CLASS
        // =========================================

        if (
            slot.status === "Available"
        ) {

            slotElement.classList.add(
                "available"
            );

        }

        else if (
            slot.status === "Reserved"
        ) {

            slotElement.classList.add(
                "reserved"
            );

        }

        else if (
            slot.status === "Occupied"
        ) {

            slotElement.classList.add(
                "occupied"
            );

        }

        else if (
            slot.status === "Maintenance"
        ) {

            slotElement.classList.add(
                "maintenance"
            );

        }


        // =========================================
        // SLOT HTML
        // =========================================

        slotElement.innerHTML = `

            <div class="slot-number">

                ${slot.slot_number}

            </div>


            <div class="slot-status">

                ${slot.status}

            </div>

        `;


        container.appendChild(
            slotElement
        );

    });


    // =============================================
    // UPDATE COUNTS
    // =============================================

    updateCounts(slots);

}

// -----------------------------
function updateCounts(slots) {

    let total = slots.length;

    let available = 0;

    let occupied = 0;

    let reserved = 0;


    slots.forEach(slot => {

        if (
            slot.status === "Available"
        ) {

            available++;

        }

        else if (
            slot.status === "Occupied"
        ) {

            occupied++;

        }

        else if (
            slot.status === "Reserved"
        ) {

            reserved++;

        }

    });


    document.getElementById(
        "totalSlots"
    ).textContent =
        total;


    document.getElementById(
        "availableCount"
    ).textContent =
        available;


    document.getElementById(
        "occupiedCount"
    ).textContent =
        occupied;


    document.getElementById(
        "reservedCount"
    ).textContent =
        reserved;

}
function goBack() {

    window.location.href =
        "adminparking.html";

}
let socket = null;


function connectWebSocket() {

    console.log(
        "Connecting Admin Slot WebSocket..."
    );


    socket =
        new WebSocket(
            "ws://smart-parking-system-tz4z.onrender.com/ws/parking"
        );


    // =============================================
    // CONNECTED
    // =============================================

    socket.onopen = function() {

        console.log(
            "Admin Slot WebSocket Connected"
        );

    };


    // =============================================
    // MESSAGE
    // =============================================

    socket.onmessage = function(event) {

        console.log(
            "WebSocket event:",
            event.data
        );


        try {

            const data =
                JSON.parse(
                    event.data
                );


            // =====================================
            // SLOT UPDATED
            // =====================================

            if (
                data.event ===
                "slot_updated"
            ) {

                if (
                    String(
                        data.parking_id
                    ) ===
                    String(
                        parkingId
                    )
                ) {

                    console.log(
                        "Slot updated - refreshing..."
                    );


                    loadSlots();

                }

            }


            // =====================================
            // PARKING DELETED
            // =====================================

            if (
                data.event ===
                "parking_deleted"
            ) {

                if (
                    String(
                        data.parking_id
                    ) ===
                    String(
                        parkingId
                    )
                ) {

                    alert(
                        "This parking has been deleted."
                    );


                    goBack();

                }

            }

        }

        catch(error) {

            console.error(
                "WebSocket JSON error:",
                error
            );

        }

    };


    // =============================================
    // ERROR
    // =============================================

    socket.onerror = function(error) {

        console.error(
            "Admin Slot WebSocket Error:",
            error
        );

    };


    // =============================================
    // DISCONNECTED
    // =============================================

    socket.onclose = function() {

        console.log(
            "Admin Slot WebSocket Disconnected"
        );

    };

}
document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Admin Slot Page Loaded"
        );


        loadSlots();


        connectWebSocket();

    }
);