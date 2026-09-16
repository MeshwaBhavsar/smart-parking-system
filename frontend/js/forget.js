const API_URL = "http://127.0.0.1:8000";

async function checkEmail() {

    const email = document.getElementById("email").value.trim();

    if (email === "") {
        alert("Please enter your email.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        });

        const data = await response.json();

        if (response.ok) {

            sessionStorage.setItem("reset_email", email);

            alert("Email found.");

            window.location.href = "resetpassword.html";

        } else {

            alert(data.detail || "Email not found.");

        }

    } catch (error) {

        console.error(error);
        alert("Unable to connect to server.");

    }

}