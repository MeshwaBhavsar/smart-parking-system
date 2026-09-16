// const API_URL =
//     "http://127.0.0.1:8000/parking";


// // =====================================================
// // GET TOKEN
// // =====================================================

// function getToken() {

//     return (
//         localStorage.getItem("access_token") ||
//         localStorage.getItem("token")
//     );

// }


// // =====================================================
// // AUTH HEADERS
// // =====================================================

// function getAuthHeaders() {

//     const token = getToken();

//     if (!token) {

//         alert(
//             "Please login again."
//         );

//         window.location.href =
//             "login.html";

//         return null;
//     }

//     return {

//         "Authorization":
//             `Bearer ${token}`

//     };

// }


// // =====================================================
// // PAGE LOAD
// // =====================================================

// window.addEventListener(
//     "DOMContentLoaded",
//     function () {

//         loadParking();

//     }
// );


// // =====================================================
// // LOAD PARKING
// // =====================================================

// async function loadParking() {

//     try {

//         const headers =
//             getAuthHeaders();

//         if (!headers) {

//             return;

//         }


//         const response = await fetch(

//             API_URL + "/",

//             {

//                 method: "GET",

//                 headers: headers

//             }

//         );


//         const data =
//             await response.json();


//         console.log(
//             "Parking API response:",
//             data
//         );


//         if (!response.ok) {

//             if (response.status === 401) {

//                 alert(
//                     "Session expired. Please login again."
//                 );

//                 localStorage.removeItem(
//                     "access_token"
//                 );

//                 localStorage.removeItem(
//                     "token"
//                 );

//                 window.location.href =
//                     "login.html";

//                 return;
//             }


//             throw new Error(
//                 data.detail ||
//                 "Failed to fetch parking"
//             );

//         }


//         displayParking(data);

//     }

//     catch (error) {

//         console.error(
//             "Load parking error:",
//             error
//         );

//         alert(
//             "Unable to load parking data."
//         );

//     }

// }


// // =====================================================
// // DISPLAY PARKING
// // =====================================================

// function displayParking(
//     parkingList
// ) {

//     const table =
//         document.getElementById(
//             "parkingTableBody"
//         );


//     if (!table) {

//         console.error(
//             "parkingTableBody not found"
//         );

//         return;
//     }


//     table.innerHTML = "";


//     if (
//         !parkingList ||
//         parkingList.length === 0
//     ) {

//         table.innerHTML = `

//             <tr>

//                 <td
//                     colspan="9"
//                     class="text-center"
//                 >

//                     No Parking Found

//                 </td>

//             </tr>

//         `;

//         return;
//     }


//     parkingList.forEach(
//         parking => {

//             table.innerHTML += `

//                 <tr>

//                     <td>
//                         ${parking.id}
//                     </td>

//                     <td>
//                         ${parking.parking_name}
//                     </td>

//                     <td>
//                         ${parking.area}
//                     </td>

//                     <td>
//                         ${parking.city}
//                     </td>

//                     <td>
//                         ${parking.address}
//                     </td>

//                     <td>
//                         ${parking.total_slots}
//                     </td>

//                     <td>
//                         ${parking.total_slots}
//                     </td>

//                     <td>
//                         0
//                     </td>

//                     <td>

//                         <button
//                             class="btn btn-success btn-sm"
//                             onclick="manageSlots(${parking.id})"
//                         >

//                             <i class="bi bi-p-circle"></i>

//                             Manage Slot

//                         </button>


//                         <button
//                             class="btn btn-primary btn-sm"
//                             onclick="editParking(${parking.id})"
//                         >

//                             <i class="bi bi-pencil-fill"></i>

//                         </button>


//                         <button
//                             class="btn btn-danger btn-sm"
//                             onclick="deleteParking(${parking.id})"
//                         >

//                             <i class="bi bi-trash-fill"></i>

//                         </button>

//                     </td>

//                 </tr>

//             `;

//         }
//     );

// }


// // =====================================================
// // MANAGE SLOT
// // =====================================================

// function manageSlots(
//     parkingId
// ) {

//     window.location.href =
//         `owner_slot.html?parking_id=${parkingId}`;

// }


// // =====================================================
// // EDIT PARKING
// // =====================================================

// function editParking(
//     id
// ) {

//     window.location.href =
//         `owner_add_parking.html?id=${id}`;

// }


// // =====================================================
// // DELETE PARKING
// // =====================================================

// async function deleteParking(
//     id
// ) {

//     const confirmDelete =
//         confirm(
//             "Are you sure you want to delete this parking?"
//         );


//     if (!confirmDelete) {

//         return;

//     }


//     try {

//         const headers =
//             getAuthHeaders();

//         if (!headers) {

//             return;

//         }


//         console.log(
//             "Deleting parking:",
//             id
//         );


//         const response =
//             await fetch(

//                 `${API_URL}/${id}`,

//                 {

//                     method: "DELETE",

//                     headers: headers

//                 }

//             );


//         const data =
//             await response.json();


//         console.log(
//             "Delete response:",
//             data
//         );


//         // =========================================
//         // UNAUTHORIZED
//         // =========================================

//         if (
//             response.status === 401
//         ) {

//             alert(
//                 "Session expired. Please login again."
//             );


//             localStorage.removeItem(
//                 "access_token"
//             );

//             localStorage.removeItem(
//                 "token"
//             );


//             window.location.href =
//                 "login.html";


//             return;

//         }


//         // =========================================
//         // ERROR
//         // =========================================

//         if (!response.ok) {

//             alert(
//                 data.detail ||
//                 "Failed to delete parking"
//             );

//             return;

//         }


//         // =========================================
//         // SUCCESS
//         // =========================================

//         alert(
//             data.message ||
//             "Parking Deleted Successfully"
//         );


//         // Reload table

//         await loadParking();

//     }

//     catch (error) {

//         console.error(
//             "Delete error:",
//             error
//         );

//         alert(
//             "Server Error"
//         );

//     }

// }


// // =====================================================
// // SEARCH PARKING
// // =====================================================

// async function searchParking() {

//     const searchValue =
//         document
//             .getElementById(
//                 "searchParking"
//             )
//             .value
//             .trim();


//     if (
//         searchValue === ""
//     ) {

//         loadParking();

//         return;

//     }


//     let url;


//     // Search by ID

//     if (
//         !isNaN(searchValue)
//     ) {

//         url =
//             `${API_URL}/${searchValue}`;

//     }


//     // Search by Area

//     else {

//         url =
//             `${API_URL}/search/area/${encodeURIComponent(searchValue)}`;

//     }


//     try {

//         const headers =
//             getAuthHeaders();

//         if (!headers) {

//             return;

//         }


//         const response =
//             await fetch(

//                 url,

//                 {

//                     method: "GET",

//                     headers: headers

//                 }

//             );


//         const data =
//             await response.json();


//         if (!response.ok) {

//             alert(
//                 data.detail ||
//                 "Parking Not Found"
//             );

//             return;

//         }


//         let parkingList =
//             data;


//         if (
//             !Array.isArray(
//                 parkingList
//             )
//         ) {

//             parkingList =
//                 [parkingList];

//         }


//         displayParking(
//             parkingList
//         );

//     }

//     catch (error) {

//         console.error(
//             "Search error:",
//             error
//         );

//         alert(
//             "Server Error"
//         );

//     }

// }

// // -------------------------websocket connect-------------------------
// let socket = null;


// function connectWebSocket() {

//     socket = new WebSocket(
//         "ws://127.0.0.1:8000/ws"
//     );


//     socket.onopen = function () {

//         console.log(
//             "Owner WebSocket connected"
//         );

//     };


//     socket.onmessage = function (event) {

//         console.log(
//             "WebSocket message:",
//             event.data
//         );

//         const message =
//             JSON.parse(event.data);


//         if (
//             message.event
//             === "parking_updated"
//         ) {

//             updateParkingRow(
//                 message.data
//             );

//         }


//         if (
//             message.event
//             === "parking_deleted"
//         ) {

//             removeParkingRow(
//                 message.parking_id
//             );

//         }


//         if (
//             message.event
//             === "parking_added"
//         ) {

//             loadParking();

//         }

//     };


//     socket.onclose = function () {

//         console.log(
//             "WebSocket disconnected"
//         );

//         setTimeout(
//             connectWebSocket,
//             3000
//         );

//     };


//     socket.onerror = function (error) {

//         console.error(
//             "WebSocket error:",
//             error
//         );

//     };
// }


// ----------------------------------------------
const OWNER_API_URL =
    "http://127.0.0.1:8000/parking";

const PARKING_API_URL =
    "http://127.0.0.1:8000/parking";


// =====================================================
// GET TOKEN
// =====================================================

function getToken() {

    return (
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token")
    );

}


// =====================================================
// AUTH HEADERS
// =====================================================

function getAuthHeaders() {

    const token = getToken();

    if (!token) {

        alert("Please login again.");

        window.location.href =
            "login.html";

        return null;
    }

    return {

        "Authorization":
            `Bearer ${token}`,

        "Content-Type":
            "application/json"
    };

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        loadParking();

    }
);


// =====================================================
// LOAD ONLY CURRENT OWNER'S PARKING
// =====================================================

async function loadParking() {

    try {

        const headers =
            getAuthHeaders();

        if (!headers) {
            return;
        }


        // IMPORTANT:
        // Backend route:
        // @router.get("/owner/")
        //
        // Router prefix:
        // /owner_parking
        //
        // Final URL:
        // /owner_parking/owner/

        const response =
            await fetch(
                `${OWNER_API_URL}/owner/`,
                {
                    method: "GET",
                    headers: headers
                }
            );


        const data =
            await response.json();


        console.log(
            "Owner Parking API response:",
            data
        );


        // =========================================
        // UNAUTHORIZED
        // =========================================

        if (response.status === 401) {

            alert(
                "Session expired. Please login again."
            );

            sessionStorage.removeItem(
                "access_token"
            );

            sessionStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

            return;
        }


        // =========================================
        // OTHER ERROR
        // =========================================

        if (!response.ok) {

            console.error(
                "Owner parking error:",
                data
            );

            alert(
                data.detail ||
                "Failed to fetch owner parking"
            );

            return;
        }


        // =========================================
        // MAKE SURE ARRAY
        // =========================================

        if (!Array.isArray(data)) {

            console.error(
                "Expected parking array:",
                data
            );

            displayParking([]);

            return;
        }


        // =========================================
        // DISPLAY
        // =========================================

        displayParking(data);

    }

    catch (error) {

        console.error(
            "Load parking error:",
            error
        );

        alert(
            "Unable to load parking data."
        );

    }

}


// =====================================================
// DISPLAY PARKING
// =====================================================

function displayParking(parkingList) {

    const table =
        document.getElementById(
            "parkingTableBody"
        );


    if (!table) {

        console.error(
            "parkingTableBody not found"
        );

        return;
    }


    table.innerHTML = "";


    // =========================================
    // NO PARKING
    // =========================================

    if (
        !parkingList ||
        parkingList.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center"
                >

                    No Parking Found

                </td>

            </tr>

        `;

        return;
    }


    // =========================================
    // DISPLAY OWNER PARKINGS
    // =========================================

    parkingList.forEach(
        parking => {

            const totalSlots =
                Number(
                    parking.total_slots || 0
                );

            const availableSlots =
                Number(
                    parking.available_slots ??
                    parking.total_slots ??
                    0
                );

            const occupiedSlots =
                Number(
                    parking.occupied_slots || 0
                );


            table.innerHTML += `

                <tr>

                    <td>
                        ${parking.id}
                    </td>

                    <td>
                        ${parking.parking_name || ""}
                    </td>

                    <td>
                        ${parking.area || ""}
                    </td>

                    <td>
                        ${parking.city || ""}
                    </td>

                    <td>
                        ${parking.address || ""}
                    </td>

                    <td>
                        ${totalSlots}
                    </td>

                    <td>
                        ${availableSlots}
                    </td>

                    <td>
                        ${occupiedSlots}
                    </td>

                    <td>

                        <!-- MANAGE SLOT -->

                        <button
                            class="btn btn-success btn-sm"
                            onclick="manageSlots(${parking.id})"
                        >

                            <i class="bi bi-p-circle"></i>

                            

                        </button>


                        <!-- EDIT -->

                        <button
                            class="btn btn-primary btn-sm"
                            onclick="editParking(${parking.id})"
                        >

                            <i class="bi bi-pencil-fill"></i>

                        </button>


                        <!-- DELETE -->

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteParking(${parking.id})"
                        >

                            <i class="bi bi-trash-fill"></i>

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// MANAGE OWNER'S SLOT
// =====================================================

function manageSlots(parkingId) {

    window.location.href =
        `owner_slot.html?parking_id=${parkingId}`;

}


// =====================================================
// EDIT OWNER'S PARKING
// =====================================================

function editParking(id) {

    window.location.href =
        `owner_add_parking.html?id=${id}`;

}


// =====================================================
// DELETE OWNER'S PARKING
// =====================================================

async function deleteParking(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this parking?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const headers =
            getAuthHeaders();

        if (!headers) {
            return;
        }


        console.log(
            "Deleting owner parking:",
            id
        );


        /*
         * IMPORTANT:
         *
         * This assumes your DELETE API is:
         *
         * DELETE /owner_parking/{parking_id}
         *
         * and your backend verifies:
         *
         * parking.owner_id == current_user.id
         */

        const response =
            await fetch(
                `${OWNER_API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: headers
                }
            );


        const data =
            await response.json();


        console.log(
            "Delete response:",
            data
        );


        // =========================================
        // UNAUTHORIZED
        // =========================================

        if (response.status === 401) {

            alert(
                "Session expired. Please login again."
            );

            sessionStorage.removeItem(
                "access_token"
            );

            sessionStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

            return;
        }


        // =========================================
        // ERROR
        // =========================================

        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete parking"
            );

            return;
        }


        // =========================================
        // SUCCESS
        // =========================================

        alert(
            data.message ||
            "Parking deleted successfully"
        );


        // Reload owner's parking only

        await loadParking();

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Server Error"
        );

    }

}


// =====================================================
// SEARCH OWNER'S PARKING
// =====================================================

async function searchParking() {

    const searchInput =
        document.getElementById(
            "searchParking"
        );


    if (!searchInput) {
        return;
    }


    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    // =========================================
    // EMPTY SEARCH
    // =========================================

    if (searchValue === "") {

        await loadParking();

        return;
    }


    try {

        const headers =
            getAuthHeaders();

        if (!headers) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * We first get ONLY the logged-in
         * owner's parking.
         *
         * Then search inside that list.
         *
         * Therefore another owner's parking
         * can never appear here.
         */

        const response =
            await fetch(
                `${OWNER_API_URL}/owner/`,
                {
                    method: "GET",
                    headers: headers
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to search parking"
            );

            return;
        }


        const parkingList =
            Array.isArray(data)
                ? data
                : [];


        // =========================================
        // SEARCH BY ID / NAME / AREA / CITY
        // =========================================

        const filtered =
            parkingList.filter(
                parking => {

                    return (

                        String(
                            parking.id
                        )
                        .toLowerCase()
                        .includes(searchValue)

                        ||

                        String(
                            parking.parking_name || ""
                        )
                        .toLowerCase()
                        .includes(searchValue)

                        ||

                        String(
                            parking.area || ""
                        )
                        .toLowerCase()
                        .includes(searchValue)

                        ||

                        String(
                            parking.city || ""
                        )
                        .toLowerCase()
                        .includes(searchValue)

                    );

                }
            );


        displayParking(filtered);

    }

    catch (error) {

        console.error(
            "Search error:",
            error
        );

        alert(
            "Server Error"
        );

    }

}


// =====================================================
// WEBSOCKET
// =====================================================

let socket = null;


function connectWebSocket() {

    console.log(
        "Connecting Owner Parking WebSocket..."
    );


    socket =
        new WebSocket(
            "ws://127.0.0.1:8000/ws"
        );


    socket.onopen =
        function () {

            console.log(
                "✅ Owner WebSocket connected"
            );

        };


    socket.onmessage =
        function (event) {

            try {

                console.log(
                    "WebSocket message:",
                    event.data
                );


                const message =
                    JSON.parse(
                        event.data
                    );


                // =========================================
                // PARKING UPDATED
                // =========================================

                if (
                    message.event ===
                    "parking_updated"
                ) {

                    loadParking();

                }


                // =========================================
                // PARKING DELETED
                // =========================================

                if (
                    message.event ===
                    "parking_deleted"
                ) {

                    loadParking();

                }


                // =========================================
                // PARKING ADDED
                // =========================================

                if (
                    message.event ===
                    "parking_added"
                ) {

                    loadParking();

                }


                // =========================================
                // SLOT UPDATED
                // =========================================

                if (
                    message.event ===
                    "slot_updated"
                ) {

                    loadParking();

                }

            }

            catch (error) {

                console.error(
                    "WebSocket JSON error:",
                    error
                );

            }

        };


    socket.onclose =
        function () {

            console.log(
                "Owner WebSocket disconnected"
            );


            setTimeout(
                connectWebSocket,
                3000
            );

        };


    socket.onerror =
        function (error) {

            console.error(
                "Owner WebSocket error:",
                error
            );

        };

}


// =====================================================
// START WEBSOCKET
// =====================================================

connectWebSocket();