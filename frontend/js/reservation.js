
// const parkingId = localStorage.getItem("parking_id");

// console.log(parkingId);

// // Selected slot

// let selectedSlotId = null;

// // ------------------load parking details-------------

// async function loadParkingDetails() {

//     const response = await fetch(
//         `http://127.0.0.1:8000/parking/${parkingId}`
//     );

//     const parking = await response.json();

//     document.getElementById("parkingName").innerHTML =
//         parking.parking_name;

//     document.getElementById("parkingAddress").innerHTML =
//         parking.address;

//     document.getElementById("parkingPrice").innerHTML =
//         "₹" + parking.price + " / Hour";

// }

// // -------------------load slot---------------------

// async function loadSlots() {

//     const response = await fetch(
//         `http://127.0.0.1:8000/parking/${parkingId}/slots`
//     );

//     const slotData = await response.json();

//     console.log(slotData);

//     const container = document.getElementById("slotContainer");

//     container.innerHTML = "";

//     slotData.forEach(slot => {

//         let color = "";

//         if (slot.status == "Available") {

//             color = "available";

//         }

//         else if (slot.status == "Reserved") {

//             color = "reserved";

//         }

//         else if (slot.status == "Occupied") {

//             color = "occupied";

//         }

//         else {

//             color = "maintenance";

//         }

//         container.innerHTML += `

//         <div

//             class="slot ${color}"

//             data-id="${slot.id}"

//         >

//             ${slot.slot_number}

//         </div>

//         `;

//     });

//     addClickEvents();

// }

// // -------------------select slot----------------------------
// function addClickEvents() {

//     const slots = document.querySelectorAll(".slot.available");

//     slots.forEach(slot => {

//         slot.addEventListener("click", function () {

//             document.querySelectorAll(".slot").forEach(s => {

//                 s.classList.remove("selectedSlot");

//             });

//             this.classList.add("selectedSlot");

//             document.getElementById("selectedSlot").innerHTML =
//                 this.innerText;

//             selectedSlotId = this.dataset.id;

//         });

//     });

// }

// // -------------------------------reserve button-------------------
// document.getElementById("reserveBtn").addEventListener("click", () => {

//     if (!selectedSlotId) {
//         alert("Please Select Slot");
//         return;
//     }

//     window.location.href =
//     `vihical.html?parking_id=${parkingId}&slot_id=${selectedSlotId}`;

// });

// loadParkingDetails();

// loadSlots();



const parkingId =
     sessionStorage.getItem("parking_id");

let selectedSlotId = null;



async function loadParkingDetails() {

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/parking/${parkingId}`
        );

        const parking =
            await response.json();

        document.getElementById(
            "parkingName"
        ).innerText =
            parking.parking_name;

        document.getElementById(
            "parkingAddress"
        ).innerText =
            parking.address;

        document.getElementById(
            "parkingPrice"
        ).innerText =
            `₹${parking.price} / Hour`;

    }

    catch (error) {

        console.error(
            "Parking error:",
            error
        );

    }

}


// ==========================================
// LOAD SLOTS
// ==========================================

async function loadSlots() {

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/parking/${parkingId}/slots`
        );

        const slots =
            await response.json();

        const container =
            document.getElementById(
                "slotContainer"
            );

        container.innerHTML = "";


        slots.forEach(slot => {

            const div =
                document.createElement("div");


            div.classList.add(
                "slot"
            );


            // ==============================
            // STATUS COLOR
            // ==============================

            if (
                slot.status ===
                "Available"
            ) {

                div.classList.add(
                    "available"
                );

            }

            else if (
                slot.status ===
                "Reserved"
            ) {

                div.classList.add(
                    "reserved"
                );

            }

            else if (
                slot.status ===
                "Occupied"
            ) {

                div.classList.add(
                    "occupied"
                );

            }

            else {

                div.classList.add(
                    "maintenance"
                );

            }


            div.dataset.id =
                slot.id;


            div.innerText =
                slot.slot_number;


            container.appendChild(
                div
            );

        });


        addSlotClickEvents();

    }

    catch (error) {

        console.error(
            "Slot loading error:",
            error
        );

    }

}


// ==========================================
// SELECT SLOT
// ==========================================

function addSlotClickEvents() {

    const slots =
        document.querySelectorAll(
            ".slot.available"
        );


    slots.forEach(slot => {

        slot.addEventListener(
            "click",
            function () {

                // Remove old selection

                document
                    .querySelectorAll(
                        ".slot"
                    )
                    .forEach(s => {

                        s.classList.remove(
                            "selectedSlot"
                        );

                    });


                // Select

                this.classList.add(
                    "selectedSlot"
                );


                selectedSlotId =
                    this.dataset.id;


                document.getElementById(
                    "selectedSlot"
                ).innerText =
                    this.innerText;


                console.log(
                    "Selected slot:",
                    selectedSlotId
                );

            }
        );

    });

}


// ==========================================
// RESERVE BUTTON
// ==========================================

document
    .getElementById("reserveBtn")
    .addEventListener(
        "click",
        function () {

            if (!selectedSlotId) {

                alert(
                    "Please select a parking slot"
                );

                return;

            }


            // Save selected slot

            sessionStorage.setItem(
                "selected_slot_id",
                selectedSlotId
            );


            // Open vehicle page

            window.location.href =
                `vihical.html?parking_id=${parkingId}&slot_id=${selectedSlotId}`;

        }
    );


// ==========================================
// WEBSOCKET
// ==========================================

let socket;


function connectWebSocket() {

    console.log(
        "Connecting WebSocket..."
    );


    socket = new WebSocket(
        "ws://127.0.0.1:8000/ws"
    );


    socket.onopen = function () {

        console.log(
            "✅ WebSocket connected"
        );

    };


    socket.onmessage = function(event) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "WebSocket:",
                data
            );


            // =================================
            // SLOT UPDATED
            // =================================

            if (
                data.event ===
                "slot_updated"
            ) {

                if (
                    Number(
                        data.parking_id
                    ) ===
                    Number(
                        parkingId
                    )
                ) {

                    console.log(
                        "Slot changed:",
                        data.slot_number,
                        data.status
                    );


                    loadSlots();

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


    socket.onerror = function(error) {

        console.error(
            "WebSocket error:",
            error
        );

    };


    socket.onclose = function() {

        console.log(
            "WebSocket disconnected"
        );


        setTimeout(
            connectWebSocket,
            3000
        );

    };

}


// ==========================================
// START
// ==========================================

loadParkingDetails();

loadSlots();

connectWebSocket();