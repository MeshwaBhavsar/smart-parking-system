const API_URL = "http://127.0.0.1:8000";

async function resetPassword() {

    const email = localStorage.getItem("reset_email");

    const newPassword = document.getElementById("new_password").value;

    const confirmPassword = document.getElementById("confirm_password").value;

    if (!email) {

        alert("Session expired.");

        window.location.href = "forgetpassword.html";

        return;

    }

    if (newPassword === "" || confirmPassword === "") {

        alert("Please fill all fields.");

        return;

    }

    if (newPassword !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    try {

        const response = await fetch(`${API_URL}/reset-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                new_password: newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {

            alert("Password updated successfully.");

            sessionStorageStorage.removeItem("reset_email");

            window.location.href = "login.html";

        } else {

            alert(data.detail || "Password update failed.");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}