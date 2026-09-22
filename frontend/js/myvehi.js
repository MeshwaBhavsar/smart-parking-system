const API_URL =
    "https://smart-parking-system-tz4z.onrender.com";


const token =
    sessionStorage.getItem(
        "access_token"
    );


if (!token) {

    window.location.href =
        "login.html";

}

async function loadVehicles() {

    try {

        const response =
            await fetch(
                `${API_URL}/vehicles/my-vehicles`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "My Vehicles:",
            data
        );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!response.ok) {

            console.error(data);

            return;

        }


        displayVehicles(data);

    }

    catch (error) {

        console.error(
            "Vehicle error:",
            error
        );

    }

}

function displayVehicles(
    vehicles
) {

    const container =
        document.getElementById(
            "vehicleContainer"
        );


    const count =
        document.getElementById(
            "vehicleCount"
        );


    count.innerText =
        vehicles.length;


    if (vehicles.length === 0) {

        container.innerHTML = `

            <div class="text-center py-5">

                <div style="font-size:60px;">
                    🚗
                </div>

                <h4>
                    No Vehicles Added
                </h4>

                <p class="text-muted">

                    Add your vehicle to make
                    parking reservations easier.

                </p>

                <button
                    class="btn btn-primary"
                    onclick="openAddVehicle()"
                >

                    + Add Vehicle

                </button>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    vehicles.forEach(
        function(vehicle) {

            const date =
                vehicle.created_at
                    ? new Date(
                        vehicle.created_at
                    ).toLocaleDateString(
                        "en-IN"
                    )
                    : "N/A";


            container.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="vehicle-card">

                        <div class="vehicle-icon">
                            🚗
                        </div>


                        <h4>

                            ${escapeHTML(
                                vehicle.vehicle_number
                            )}

                        </h4>


                        <p>

                            <strong>
                                Vehicle Type:
                            </strong>

                            ${escapeHTML(
                                vehicle.vehicle_type
                            )}

                        </p>


                        <p>

                            <strong>
                                Added Date:
                            </strong>

                            ${date}

                        </p>


                        <div class="vehicle-actions">

                            <button
                                class="btn btn-warning btn-sm"
                                onclick="editVehicle(
                                    ${vehicle.id}
                                )"
                            >

                                ✏ Edit

                            </button>


                            <button
                                class="btn btn-danger btn-sm"
                                onclick="deleteVehicle(
                                    ${vehicle.id}
                                )"
                            >

                                🗑 Delete

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}
function openAddVehicle() {

    document.getElementById(
        "modalTitle"
    ).innerText =
        "Add Vehicle";


    document.getElementById(
        "vehicleId"
    ).value = "";


    document.getElementById(
        "vehicleNumber"
    ).value = "";


    document.getElementById(
        "vehicleType"
    ).value = "";


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "vehicleModal"
            )
        );


    modal.show();

}
async function saveVehicle() {

    const vehicleId =
        document.getElementById("vehicleId").value;

    const vehicleNumber =
        document.getElementById("vehicleNumber")
            .value
            .trim()
            .toUpperCase();

    const vehicleType =
        document.getElementById("vehicleType").value;


    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!vehicleNumber) {

        alert("Please enter vehicle number");

        return;
    }


    if (!vehicleType) {

        alert("Please select vehicle type");

        return;
    }


    const body = {

        vehicle_number: vehicleNumber,

        vehicle_type: vehicleType

    };


    let url;

    let method;


    // -----------------------------
    // ADD
    // -----------------------------

    if (!vehicleId) {

        url =
            `${API_URL}/vehicles/`;

        method =
            "POST";

    }

    // -----------------------------
    // UPDATE
    // -----------------------------

    else {

        url =
            `${API_URL}/vehicles/${vehicleId}`;

        method =
            "PUT";

    }


    try {

        const response =
            await fetch(
                url,
                {

                    method: method,

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(body)

                }
            );


        const data =
            await response.json();


        console.log(
            "Save vehicle response:",
            data
        );


        // -----------------------------
        // TOKEN EXPIRED
        // -----------------------------

        if (response.status === 401) {

            alert("Session expired. Please login again.");

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";

            return;
        }


        // -----------------------------
        // FORBIDDEN
        // -----------------------------

        if (response.status === 403) {

            alert(
                data.detail ||
                "You are not authorized to add a vehicle."
            );

            return;
        }


        // -----------------------------
        // OTHER ERROR
        // -----------------------------

        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to save vehicle"
            );

            return;
        }


        // -----------------------------
        // SUCCESS
        // -----------------------------

        alert(
            vehicleId
                ? "Vehicle updated successfully"
                : "Vehicle added successfully"
        );


        // Close Bootstrap modal

        const modalElement =
            document.getElementById(
                "vehicleModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }


        // Reload vehicles

        await loadVehicles();

    }

    catch (error) {

        console.error(
            "Save vehicle error:",
            error
        );

        alert(
            "Server error. Please try again."
        );

    }

}
async function editVehicle(
    vehicleId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/vehicles/my-vehicles`,
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const vehicles =
            await response.json();


        const vehicle =
            vehicles.find(
                v => v.id === vehicleId
            );


        if (!vehicle) {

            alert(
                "Vehicle not found"
            );

            return;

        }


        document.getElementById(
            "modalTitle"
        ).innerText =
            "Edit Vehicle";


        document.getElementById(
            "vehicleId"
        ).value =
            vehicle.id;


        document.getElementById(
            "vehicleNumber"
        ).value =
            vehicle.vehicle_number;


        document.getElementById(
            "vehicleType"
        ).value =
            vehicle.vehicle_type;


        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "vehicleModal"
                )
            );


        modal.show();

    }

    catch (error) {

        console.error(error);

    }

}

async function deleteVehicle(
    vehicleId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this vehicle?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/vehicles/${vehicleId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to delete vehicle"
            );

            return;

        }


        alert(
            "Vehicle deleted successfully"
        );


        loadVehicles();

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );

    }

}
function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}
let socket = null;


function connectWebSocket() {

    console.log(
        "Connecting Vehicle WebSocket..."
    );


    socket =
        new WebSocket(
            "ws://smart-parking-system-tz4z.onrender.com/ws"
        );


    socket.onopen =
        function() {

            console.log(
                "✅ Vehicle WebSocket connected"
            );

        };


    socket.onmessage =
        function(event) {

            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "Vehicle WebSocket:",
                    data
                );


                if (
                    data.event ===
                    "vehicle_added"
                ) {

                    loadVehicles();

                }


                if (
                    data.event ===
                    "vehicle_updated"
                ) {

                    loadVehicles();

                }


                if (
                    data.event ===
                    "vehicle_deleted"
                ) {

                    loadVehicles();

                }

            }

            catch(error) {

                console.error(
                    "WebSocket error:",
                    error
                );

            }

        };


    socket.onerror =
        function(error) {

            console.error(
                "WebSocket error:",
                error
            );

        };


    socket.onclose =
        function() {

            console.log(
                "Vehicle WebSocket disconnected"
            );


            setTimeout(
                connectWebSocket,
                3000
            );

        };

}
loadVehicles();

connectWebSocket();