const API_URL = "http://127.0.0.1:8000/parking";


// =====================================================
// GET JWT TOKEN
// =====================================================

function getToken() {

    const token =
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token");

    return token;
}


// =====================================================
// AUTH HEADERS
// =====================================================

function getAuthHeaders() {

    const token = getToken();

    if (!token) {

        alert("You are not logged in. Please login again.");

        window.location.href = "owner_login.html";

        return null;
    }

    return {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${token}`

    };
}


// =====================================================
// GET PARKING ID FROM URL
// =====================================================

const params =
    new URLSearchParams(window.location.search);

const parkingId = params.get("id");

console.log("Parking ID:", parkingId);


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (parkingId) {

            console.log(
                "Edit mode. Parking ID:",
                parkingId
            );

            await loadParkingForEdit(parkingId);

            const button =
                document.querySelector(
                    "button[type='submit']"
                );

            if (button) {

                button.innerText =
                    "Update Parking";

            }

        }

        else {

            console.log("Add mode");

        }

    }
);


// =====================================================
// LOAD EXISTING PARKING
// =====================================================

async function loadParkingForEdit(id) {

    try {

        const token = getToken();

        if (!token) {

            alert("Please login again.");

            window.location.href =
                "owner_login.html";

            return;
        }


        const response = await fetch(
            `${API_URL}/${id}`,
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


        if (!response.ok) {

            console.error(
                "Load parking error:",
                data
            );

            alert(
                data.detail ||
                "Parking not found"
            );

            return;
        }


        const parking = data;

        console.log(
            "Parking data:",
            parking
        );


        // Fill form

        document.getElementById(
            "parking_name"
        ).value =
            parking.parking_name;


        document.getElementById(
            "area"
        ).value =
            parking.area;


        document.getElementById(
            "city"
        ).value =
            parking.city;


        document.getElementById(
            "address"
        ).value =
            parking.address;


        document.getElementById(
            "latitude"
        ).value =
            parking.latitude;


        document.getElementById(
            "longitude"
        ).value =
            parking.longitude;


        document.getElementById(
            "total_slots"
        ).value =
            parking.total_slots;


        document.getElementById(
            "price"
        ).value =
            parking.price;

    }

    catch (error) {

        console.error(
            "Error loading parking:",
            error
        );

        alert(
            "Unable to load parking data"
        );

    }

}


// =====================================================
// ADD / UPDATE PARKING
// =====================================================

async function addParking(event) {

    event.preventDefault();


    // ----------------------------------------------
    // Get authentication headers
    // ----------------------------------------------

    const headers =
        getAuthHeaders();

    if (!headers) {

        return;
    }


    // ----------------------------------------------
    // Get form values
    // ----------------------------------------------

    const parking = {

        parking_name:
            document.getElementById(
                "parking_name"
            ).value.trim(),

        area:
            document.getElementById(
                "area"
            ).value.trim(),

        city:
            document.getElementById(
                "city"
            ).value.trim(),

        address:
            document.getElementById(
                "address"
            ).value.trim(),

        latitude:
            parseFloat(
                document.getElementById(
                    "latitude"
                ).value
            ),

        longitude:
            parseFloat(
                document.getElementById(
                    "longitude"
                ).value
            ),

        total_slots:
            parseInt(
                document.getElementById(
                    "total_slots"
                ).value
            ),

        price:
            parseFloat(
                document.getElementById(
                    "price"
                ).value
            )

    };


    console.log(
        "Parking data:",
        parking
    );


    try {

        let response;


        // =================================================
        // UPDATE
        // =================================================

        if (parkingId) {

            console.log(
                "Updating parking:",
                parkingId
            );


            response = await fetch(

                `${API_URL}/${parkingId}`,

                {

                    method: "PUT",

                    headers: headers,

                    body:
                        JSON.stringify(
                            parking
                        )

                }

            );

        }


        // =================================================
        // ADD
        // =================================================

        else {

            console.log(
                "Adding new parking"
            );


            response = await fetch(

                `${API_URL}/`,

                {

                    method: "POST",

                    headers: headers,

                    body:
                        JSON.stringify(
                            parking
                        )

                }

            );

        }


        // =================================================
        // RESPONSE
        // =================================================

        const data =
            await response.json();


        console.log(
            "Server response:",
            data
        );


        if (!response.ok) {

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


            alert(
                data.detail ||
                "Operation failed"
            );

            return;

        }


        // =================================================
        // SUCCESS
        // =================================================

        if (parkingId) {

            alert(
                "Parking Updated Successfully"
            );

        }

        else {

            alert(
                "Parking Added Successfully"
            );

        }


        window.location.href =
            "owner_parking.html";

    }

    catch (error) {

        console.error(
            "Server error:",
            error
        );

        alert(
            "Server Error"
        );

    }

}