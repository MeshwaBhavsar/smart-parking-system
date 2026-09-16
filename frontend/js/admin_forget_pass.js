document
    .getElementById("resetPasswordForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        // Get values

        const email =
            document.getElementById("resetEmail").value.trim();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        const message =
            document.getElementById("message");


        // Clear previous message

        message.style.display = "none";



        // Check password match

        if (newPassword !== confirmPassword) {

            message.className =
                "alert alert-danger";

            message.textContent =
                "Passwords do not match.";

            message.style.display = "block";

            return;
        }



        // Check password length

        if (newPassword.length < 6) {

            message.className =
                "alert alert-danger";

            message.textContent =
                "Password must be at least 6 characters.";

            message.style.display = "block";

            return;
        }



        try {


            // Send request to FastAPI

            const response = await fetch(
                "http://127.0.0.1:8000/admin/reset-password",
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email: email,

                        new_password: newPassword

                    })

                }
            );



            // Convert response to JSON

            const data =
                await response.json();



            // Error response

            if (!response.ok) {

                message.className =
                    "alert alert-danger";

                message.textContent =
                    data.detail ||
                    "Password reset failed.";

                message.style.display =
                    "block";

                return;
            }



            // Success

            message.className =
                "alert alert-success";

            message.textContent =
                "Password changed successfully! Redirecting to login...";

            message.style.display =
                "block";



            // Redirect after 2 seconds

            setTimeout(function () {

                window.location.href =
                    "adminlogin.html";

            }, 2000);


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            message.className =
                "alert alert-danger";

            message.textContent =
                "Unable to connect to server. Please try again.";

            message.style.display =
                "block";

        }

    });