const API_URL =
    "https://smart-parking-system-tz4z.onrender.com";


// =====================================================
// TOKEN
// =====================================================

const token =
    sessionStorage.getItem("access_token");


// =====================================================
// LOGIN CHECK
// =====================================================

if (!token) {

    alert("Please login first.");

    window.location.href =
        "login.html";

}


// =====================================================
// ELEMENTS
// =====================================================

const fullNameInput =
    document.getElementById("full_name");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const genderInput =
    document.getElementById("gender");

const cityInput =
    document.getElementById("city");

const addressInput =
    document.getElementById("address");

const fileInput =
    document.getElementById("profileImage");

const previewImage =
    document.getElementById("previewImage");

const changePhotoBtn =
    document.getElementById("changePhotoBtn");

const saveBtn =
    document.getElementById("saveBtn");

const navbarUserName =
    document.getElementById("navbarUserName");


// =====================================================
// CHANGE PHOTO BUTTON
// =====================================================

if (changePhotoBtn) {

    changePhotoBtn.addEventListener(
        "click",
        function () {

            fileInput.click();

        }
    );

}


// =====================================================
// SELECT PHOTO
// =====================================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files[0];


            if (!file) {

                return;

            }


            // Check image

            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select an image."
                );

                fileInput.value = "";

                return;

            }


            // Show preview

            previewImage.src =
                URL.createObjectURL(file);

        }
    );

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile() {

    console.log(
        "Loading profile..."
    );


    try {

        const response =
            await fetch(
                `${API_URL}/profile`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "Profile:",
            data
        );


        // =============================================
        // ERROR
        // =============================================

        if (!response.ok) {

            console.error(
                "Profile error:",
                data
            );


            if (
                response.status === 401
            ) {

                sessionStorage.removeItem(
                    "access_token"
                );

                alert(
                    "Session expired. Please login again."
                );

                window.location.href =
                    "login.html";

            }

            return;

        }


        // =============================================
        // AUTOMATIC INFORMATION
        // =============================================

        fullNameInput.value =
            data.full_name || "";

        emailInput.value =
            data.email || "";

        phoneInput.value =
            data.phone || "";


        // =============================================
        // PROFILE INFORMATION
        // =============================================

        genderInput.value =
            data.gender || "";

        cityInput.value =
            data.city || "";

        addressInput.value =
            data.address || "";


        // =============================================
        // NAVBAR
        // =============================================

        if (navbarUserName) {

            navbarUserName.innerText =
                `Hello, ${data.full_name || "User"}`;

        }


        // =============================================
        // PHOTO
        // =============================================

        if (data.photo) {

            previewImage.src =
                `${API_URL}/${data.photo}`;

        }
       


        console.log(
            "✅ Profile loaded"
        );

    }

    catch (error) {

        console.error(
            "Load profile error:",
            error
        );

    }

}


// =====================================================
// SAVE PROFILE
// =====================================================

async function saveProfile() {

    console.log(
        "Saving profile..."
    );


    const formData =
        new FormData();


    // =============================================
    // USER DATA
    // =============================================

    formData.append(
        "full_name",
        fullNameInput.value.trim()
    );


    formData.append(
        "phone",
        phoneInput.value.trim()
    );


    formData.append(
        "gender",
        genderInput.value
    );


    formData.append(
        "city",
        cityInput.value.trim()
    );


    formData.append(
        "address",
        addressInput.value.trim()
    );


    // =============================================
    // PHOTO
    // =============================================

    if (
        fileInput &&
        fileInput.files.length > 0
    ) {

        formData.append(
            "photo",
            fileInput.files[0]
        );

    }


    try {

        saveBtn.disabled = true;

        saveBtn.innerText =
            "Saving...";


        const response =
            await fetch(
                `${API_URL}/profile`,
                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: formData

                }
            );


        const data =
            await response.json();


        console.log(
            "Save response:",
            data
        );


        // =============================================
        // SUCCESS
        // =============================================

        if (response.ok) {

            alert(
                "Profile updated successfully!"
            );


            // Reload from database

            await loadProfile();

        }

        else {

            alert(
                data.detail ||
                "Unable to update profile."
            );

        }

    }

    catch (error) {

        console.error(
            "Save profile error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

    finally {

        saveBtn.disabled = false;

        saveBtn.innerText =
            "Save Changes";

    }

}


// =====================================================
// SAVE BUTTON
// =====================================================

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        saveProfile
    );

}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "user_id"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (token) {

            loadProfile();

        }

    }
);