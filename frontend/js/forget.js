const API_URL = "https://smart-parking-system-tz4z.onrender.com";

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

        if (response.ok) {

            sessionStorage.setItem("reset_email", email);

            window.location.href = "resetpassword.html";

        } else {

            alert(
                "Email Not Found\n\n" +
                "Please enter a registered email address."
            );

        }

    } catch (error) {

        console.error(error);
        alert("Unable to connect to server.");

    }

}
