

async function login(event) {

    event.preventDefault();
    const hasAcceptedTerms =
        document.getElementById("remember").checked;

    // if (!hasAcceptedTerms) {

    //     alert(
    //         "Wait a minute! 😄\n\n" +
    //         "Before creating your account, please accept the Terms & Conditions. " +
    //         "Even the parking system needs your permission! 🚗"
    //     );

    //     return;
    // }

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const isStrongPassword =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9\s]/.test(password);

    if (!isStrongPassword) {

        alert(
            "Weak Password\n\n" +
            "Please use at least 8 characters with uppercase, lowercase, number, and special character."
        );

        return;
    }
    

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    try {

        const response = await fetch(
            "https://smart-parking-system-tz4z.onrender.com/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );

        const data = await response.json();

        console.log("Login Response:", data);

        if (!response.ok) {

            alert(
                data.detail || "Login Failed"
            );

            return;
        }

        // Save JWT
        sessionStorage.setItem(
            "access_token",
            data.access_token
        );

        // Save user information
        sessionStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        // Get role
        const role =
            data.user.role.toUpperCase();

        console.log("User Role:", role);

        // Role-based redirect
        if (role === "ADMIN") {

            window.location.href =
                "admindashboard.html";

        } else if (role === "OWNER") {

            window.location.href =
                "owner_welcome.html";

        } else if (role === "CUSTOMER") {

            window.location.href =
                "dashboard.html";

        } else {

            alert("Invalid user role");

        }

    } catch (error) {

        console.error("Login Error:", error);

        alert(
            "Unable to connect to server"
        );
    }
}


// async function login(event) {

//     event.preventDefault();

//     const email =
//         document.getElementById("email").value.trim();

//     const password =
//         document.getElementById("password").value;

//     try {

//         const response = await fetch(
//             "http://127.0.0.1:8000/login",
//             {
//                 method: "POST",

//                 headers: {
//                     "Content-Type": "application/json"
//                 },

//                 body: JSON.stringify({
//                     email: email,
//                     password: password
//                 })
//             }
//         );

//         const data = await response.json();

//         console.log("Login response:", data);

//         if (!response.ok) {
//             alert(data.detail || "Invalid email or password");
//             return;
//         }

//         // Clear previous user's session
//         localStorage.clear();

//         // Save new user's session
//         localStorage.setItem(
//             "access_token",
//             data.access_token
//         );

//         localStorage.setItem(
//             "user_id",
//             data.user_id
//         );

//         localStorage.setItem(
//             "role",
//             data.role
//         );

//         console.log("Logged in User ID:", data.user_id);
//         console.log("Logged in Role:", data.role);

//         // Redirect
//         const role = String(data.role).toUpperCase();

//         if (role === "CUSTOMER") {

//             window.location.href = "dashboard.html";

//         } else if (role === "OWNER") {

//             window.location.href = "owner_dashboard.html";

//         } else if (role === "ADMIN") {

//             window.location.href = "admin_dashboard.html";

//         } else {

//             alert("Invalid role");

//             localStorage.clear();
//         }

//     } catch (error) {

//         console.error("Login error:", error);

//         alert("Cannot connect to server");
//     }
// }


// function logout() {

//     localStorage.clear();

//     window.location.href = "login.html";
// }

function logout() {

    console.log("Logging out...");

    // Remove authentication/session data
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Remove temporary parking/booking data
    sessionStorage.removeItem("parking_id");
    sessionStorage.removeItem("selected_slot_id");
    sessionStorage.removeItem("reservation_id");

    // Redirect to login page
    window.location.href = "login.html";
}

// Admin-only navigation assets are loaded here because the legacy admin pages
// share this script but do not share a common HTML layout.
(function loadAdminNavigationAssets() {
    const pageName = window.location.pathname.split("/").pop().toLowerCase();

    if (!pageName.startsWith("admin") || pageName === "admindashboard.html") {
        return;
    }

    if (!document.querySelector('link[href="admincss/admin-nav.css"]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "admincss/admin-nav.css";
        document.head.appendChild(stylesheet);
    }

    if (!document.querySelector('script[src="js/admin-nav.js"]')) {
        const script = document.createElement("script");
        script.src = "js/admin-nav.js";
        document.body.appendChild(script);
    }
})();
