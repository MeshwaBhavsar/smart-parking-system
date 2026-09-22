// // ============================================================
// // ADMIN PARKING JS
// // ============================================================

// const API_BASE_URL =
//     "http://127.0.0.1:8000";

// let allParkings = [];


// // ============================================================
// // GET TOKEN
// // ============================================================

// function getToken() {

//     return localStorage.getItem(
//         "access_token"
//     );
// }


// // ============================================================
// // LOAD ALL PARKINGS
// // ============================================================

// async function loadAdminParkings() {

//     const token = getToken();

//     if (!token) {

//         console.error(
//             "Admin token not found"
//         );

//         window.location.href =
//             "adminlogin.html";

//         return;
//     }


//     try {

//         const response = await fetch(
//             `${API_BASE_URL}/admin_parking/`,
//             {
//                 method: "GET",

//                 headers: {
//                     "Authorization":
//                         `Bearer ${token}`,

//                     "Content-Type":
//                         "application/json"
//                 }
//             }
//         );


//         if (!response.ok) {

//             console.error(
//                 "Parking API error:",
//                 response.status
//             );

//             const error =
//                 await response.text();

//             console.error(error);

//             return;
//         }


//         const parkings =
//             await response.json();


//         console.log(
//             "Admin parking data:",
//             parkings
//         );


//         allParkings = parkings;


//         displayParkings(
//             allParkings
//         );


//     } catch (error) {

//         console.error(
//             "Error loading admin parking:",
//             error
//         );
//     }
// }



// // ============================================================
// // DISPLAY PARKINGS
// // ============================================================

// function displayParkings(
//     parkings
// ) {

//     const tbody =
//         document.getElementById(
//             "parkingTableBody"
//         );


//     if (!tbody) {

//         console.error(
//             "parkingTableBody not found"
//         );

//         return;
//     }


//     tbody.innerHTML = "";


//     if (
//         !parkings ||
//         parkings.length === 0
//     ) {

//         tbody.innerHTML = `

//             <tr>

//                 <td
//                     colspan="9"
//                     class="text-center text-muted"
//                 >

//                     No parking found

//                 </td>

//             </tr>

//         `;

//         return;
//     }


//     parkings.forEach(
//         parking => {

//             const row =
//                 document.createElement(
//                     "tr"
//                 );


//             row.id =
//                 `parking-row-${parking.id}`;


//             row.innerHTML = `

//                 <td>
//                     ${parking.id}
//                 </td>

//                 <td>
//                     <strong>
//                         ${parking.parking_name || "-"}
//                     </strong>
//                 </td>

//                 <td>
//                     ${parking.area || "-"}
//                 </td>

//                 <td>
//                     ${parking.city || "-"}
//                 </td>

//                 <td>
//                     ${parking.address || "-"}
//                 </td>

//                 <td
//                     id="total-${parking.id}"
//                 >
//                     ${parking.total_slots ?? 0}
//                 </td>

//                 <td
//                     id="available-${parking.id}"
//                     class="text-success fw-bold"
//                 >
//                     ${parking.available_slots ?? 0}
//                 </td>

//                 <td
//                     id="occupied-${parking.id}"
//                     class="text-danger fw-bold"
//                 >
//                     ${parking.occupied_slots ?? 0}
//                 </td>

//                 <td>

//                     <button
//                         class="btn btn-sm btn-primary"
//                         onclick="manageSlots(${parking.id})"
//                     >

//                         <i class="bi bi-p-circle"></i>

//                         Manage Slot

//                     </button>

//                 </td>

//             `;


//             tbody.appendChild(row);

//         }
//     );
// }



// // ============================================================
// // MANAGE SLOT
// // ============================================================

// function manageSlots(
//     parkingId
// ) {

//     console.log(
//         "Opening slots for parking:",
//         parkingId
//     );


//     window.location.href =
//         `adminslot.html?parking_id=${parkingId}`;
// }



// // ============================================================
// // SEARCH PARKING
// // ============================================================

// function searchParking() {

//     const input =
//         document.getElementById(
//             "searchParking"
//         );


//     const searchValue =
//         input.value
//             .trim()
//             .toLowerCase();


//     if (!searchValue) {

//         displayParkings(
//             allParkings
//         );

//         return;
//     }


//     const filtered =
//         allParkings.filter(
//             parking => {

//                 const id =
//                     String(
//                         parking.id ?? ""
//                     ).toLowerCase();


//                 const area =
//                     String(
//                         parking.area ?? ""
//                     ).toLowerCase();


//                 const parkingName =
//                     String(
//                         parking.parking_name ?? ""
//                     ).toLowerCase();


//                 const city =
//                     String(
//                         parking.city ?? ""
//                     ).toLowerCase();


//                 return (

//                     id.includes(
//                         searchValue
//                     )

//                     ||

//                     area.includes(
//                         searchValue
//                     )

//                     ||

//                     parkingName.includes(
//                         searchValue
//                     )

//                     ||

//                     city.includes(
//                         searchValue
//                     )
//                 );
//             }
//         );


//     displayParkings(
//         filtered
//     );
// }



// // ============================================================
// // ENTER KEY SEARCH
// // ============================================================

// document
//     .getElementById("searchParking")
//     ?.addEventListener(
//         "keyup",
//         function(event) {

//             if (
//                 event.key === "Enter"
//             ) {

//                 searchParking();

//             }

//         }
//     );



// // ============================================================
// // WEBSOCKET
// // ============================================================

// let socket = null;


// function connectWebSocket() {

//     socket = new WebSocket(
//         "ws://127.0.0.1:8000/admin_parking/ws"
//     );


//     socket.onopen = function() {

//         console.log(
//             "Admin WebSocket connected"
//         );


//         socket.send(
//             "admin_connected"
//         );

//     };


//     socket.onmessage =
//         function(event) {

//             try {

//                 const message =
//                     JSON.parse(
//                         event.data
//                     );


//                 console.log(
//                     "Admin WebSocket message:",
//                     message
//                 );


//                 if (
//                     message.event ===
//                     "parking_status_updated"
//                 ) {

//                     updateParkingFromSocket(
//                         message.data
//                     );

//                 }

//             } catch (error) {

//                 console.error(
//                     "WebSocket JSON error:",
//                     error
//                 );

//             }

//         };


//     socket.onerror =
//         function(error) {

//             console.error(
//                 "Admin WebSocket error:",
//                 error
//             );

//         };


//     socket.onclose =
//         function() {

//             console.log(
//                 "Admin WebSocket disconnected"
//             );


//             // Reconnect after 3 seconds

//             setTimeout(
//                 connectWebSocket,
//                 3000
//             );

//         };

// }



// // ============================================================
// // UPDATE PARKING FROM WEBSOCKET
// // ============================================================

// function updateParkingFromSocket(
//     data
// ) {

//     if (!data) {
//         return;
//     }


//     const parkingId =
//         data.parking_id ??
//         data.id;


//     if (!parkingId) {
//         return;
//     }


//     console.log(
//         "Updating parking:",
//         parkingId
//     );


//     // --------------------------------------------------------
//     // UPDATE EXISTING PARKING OBJECT
//     // --------------------------------------------------------

//     const index =
//         allParkings.findIndex(
//             parking =>
//                 Number(parking.id) ===
//                 Number(parkingId)
//         );


//     if (index !== -1) {

//         allParkings[index] = {

//             ...allParkings[index],

//             total_slots:
//                 data.total_slots,

//             available_slots:
//                 data.available_slots,

//             reserved_slots:
//                 data.reserved_slots,

//             occupied_slots:
//                 data.occupied_slots,

//             maintenance_slots:
//                 data.maintenance_slots

//         };

//     }


//     // --------------------------------------------------------
//     // UPDATE TABLE CELLS
//     // --------------------------------------------------------

//     const totalElement =
//         document.getElementById(
//             `total-${parkingId}`
//         );


//     const availableElement =
//         document.getElementById(
//             `available-${parkingId}`
//         );


//     const occupiedElement =
//         document.getElementById(
//             `occupied-${parkingId}`
//         );


//     if (totalElement) {

//         totalElement.textContent =
//             data.total_slots ?? 0;

//     }


//     if (availableElement) {

//         availableElement.textContent =
//             data.available_slots ?? 0;

//     }


//     if (occupiedElement) {

//         occupiedElement.textContent =
//             data.occupied_slots ?? 0;

//     }

// }



// // ============================================================
// // PAGE LOAD
// // ============================================================

// document.addEventListener(
//     "DOMContentLoaded",
//     function() {

//         loadAdminParkings();

//         connectWebSocket();

//     }
// );

const API_URL = "https://smart-parking-system-tz4z.onrender.com";

let allParkings = [];

let socket = null;


// =====================================================
// GET TOKEN
// =====================================================

function getToken() {

    return sessionStorage.getItem("access_token");
}


// =====================================================
// LOAD ALL PARKINGS
// =====================================================

async function loadParking() {

    try {

        const token = getToken();

        const response = await fetch(
            `${API_URL}/admin_parking/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        if (!response.ok) {

            const errorData =
                await response.json().catch(() => ({}));

            throw new Error(
                errorData.detail ||
                `HTTP Error ${response.status}`
            );
        }


        const data = await response.json();

        console.log(
            "Parking data:",
            data
        );


        allParkings = data;

        displayParking(data);


    } catch (error) {

        console.error(
            "Error loading parking:",
            error
        );

        const tbody =
            document.getElementById(
                "parkingTableBody"
            );

        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-danger">

                    Failed to load parking

                </td>
            </tr>
        `;
    }
}


// =====================================================
// DISPLAY PARKING
// =====================================================

function displayParking(parkings) {

    const tbody =
        document.getElementById(
            "parkingTableBody"
        );


    tbody.innerHTML = "";


    if (!parkings || parkings.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center">

                    No Parking Found

                </td>
            </tr>
        `;

        return;
    }


    parkings.forEach(parking => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${parking.id}
            </td>


            <td>
                ${parking.parking_name}
            </td>


            <td>
                ${parking.area}
            </td>


            <td>
                ${parking.city}
            </td>


            <td>
                ${parking.address}
            </td>


            <td>
                ${parking.total_slots}
            </td>


            <td>
                <span class="badge bg-success">
                    ${parking.available_slots}
                </span>
            </td>


            <td>
                <span class="badge bg-danger">
                    ${parking.occupied_slots}
                </span>
            </td>


            <td>

                <div class="d-flex gap-2">


                    <!-- MANAGE -->

                    <button
                        class="btn btn-success btn-sm"
                        title="Manage Parking"
                        onclick="manageParking(${parking.id})">

                        <i class="bi bi-p-circle-fill"></i>

                    </button>



                </div>

            </td>

        `;


        tbody.appendChild(row);

    });
}


// =====================================================
// MANAGE PARKING
// =====================================================

function manageParking(parkingId) {

    console.log(
        "Opening parking:",
        parkingId
    );


    window.location.href =
        `adminslot.html?parking_id=${parkingId}`;
}


// =====================================================
// SEARCH PARKING
// =====================================================

function searchParking() {

    const input =
        document.getElementById(
            "searchParking"
        );


    const searchValue =
        input.value
            .trim()
            .toLowerCase();


    if (!searchValue) {

        displayParking(allParkings);

        return;
    }


    const filtered =
        allParkings.filter(parking => {

            const id =
                String(parking.id)
                    .toLowerCase();

            const area =
                String(parking.area || "")
                    .toLowerCase();

            const parkingName =
                String(parking.parking_name || "")
                    .toLowerCase();

            const city =
                String(parking.city || "")
                    .toLowerCase();


            return (
                id.includes(searchValue) ||
                area.includes(searchValue) ||
                parkingName.includes(searchValue) ||
                city.includes(searchValue)
            );

        });


    displayParking(filtered);
}


// =====================================================
// EDIT PARKING
// =====================================================

function editParking(parkingId) {

    console.log(
        "Edit parking:",
        parkingId
    );


    // You can connect your edit page here later.

    window.location.href =
        `admin_edit_parking.html?id=${parkingId}`;
}


// =====================================================
// DELETE PARKING
// =====================================================

async function deleteParking(parkingId) {

    console.log(
        "Deleting parking ID:",
        parkingId
    );


    const confirmDelete = confirm(
        `Are you sure you want to delete parking ID ${parkingId}?`
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const token =
            sessionStorage.getItem("access_token");


        const response = await fetch(
            `${API_URL}/admin_parking/${parkingId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );


        console.log(
            "Delete API status:",
            response.status
        );


        const data =
            await response.json()
                .catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.detail ||
                `HTTP Error ${response.status}`
            );

        }


        console.log(
            "Delete response:",
            data
        );


        alert(
            "Parking deleted successfully"
        );


        // Refresh admin parking list

        loadParking();


    } catch (error) {

        console.error(
            "Delete parking error:",
            error
        );


        alert(
            error.message
        );

    }

}

// =====================================================
// WEBSOCKET
// =====================================================

function connectWebSocket() {

    console.log(
        "Connecting Admin Parking WebSocket..."
    );


    socket =
        new WebSocket(
            "ws://smart-parking-system-tz4z.onrender.com/admin_parking/ws/parking"
        );


    // -------------------------------------------------
    // CONNECTED
    // -------------------------------------------------

    socket.onopen = function () {

        console.log(
            "Admin Parking WebSocket Connected"
        );

    };


    // -------------------------------------------------
    // MESSAGE
    // -------------------------------------------------

    socket.onmessage = function (event) {

        try {

            const data =
                JSON.parse(event.data);


            console.log(
                "WebSocket Event:",
                data
            );


            // -----------------------------------------
            // NEW PARKING
            // -----------------------------------------

            if (
                data.event ===
                "parking_added"
            ) {

                console.log(
                    "New parking added:",
                    data.parking_id
                );


                loadParking();
            }


            // -----------------------------------------
            // PARKING DELETED
            // -----------------------------------------

            else if (
                data.event ===
                "parking_deleted"
            ) {

                console.log(
                    "Parking deleted:",
                    data.parking_id
                );


                loadParking();
            }


            // -----------------------------------------
            // PARKING UPDATED
            // -----------------------------------------

            else if (
                data.event ===
                "parking_updated"
            ) {

                console.log(
                    "Parking updated:",
                    data.parking_id
                );


                loadParking();
            }


            // -----------------------------------------
            // SLOT UPDATED
            // -----------------------------------------

            else if (
                data.event ===
                "slot_updated"
            ) {

                console.log(
                    "Slot updated:",
                    data
                );


                // Recalculate Available /
                // Occupied counts

                loadParking();
            }

        } catch (error) {

            console.error(
                "WebSocket message error:",
                error
            );

        }

    };


    // -------------------------------------------------
    // ERROR
    // -------------------------------------------------

    socket.onerror = function (error) {

        console.error(
            "Admin Parking WebSocket Error:",
            error
        );

    };


    // -------------------------------------------------
    // DISCONNECTED
    // -------------------------------------------------

    socket.onclose = function () {

        console.log(
            "Admin Parking WebSocket Disconnected"
        );


        // reconnect after 3 seconds

        setTimeout(
            connectWebSocket,
            3000
        );

    };

}


// =====================================================
// SEARCH WITH ENTER KEY
// =====================================================

document
    .getElementById("searchParking")
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                searchParking();

            }

        }
    );


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Admin Parking Page Loaded"
        );


        loadParking();

        connectWebSocket();

    }
);