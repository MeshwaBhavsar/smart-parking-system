const API_URL = "https://smart-parking-system-tz4z.onrender.com";

async function resetPassword() {

    const email = sessionStorage.getItem("reset_email");

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

    const isStrongPassword =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^A-Za-z0-9\s]/.test(newPassword);

    if (!isStrongPassword) {

        alert(
            "Weak Password\n\n" +
            "Please use at least 8 characters with uppercase, lowercase, number, and special character."
        );

        return;

    }

    if (newPassword !== confirmPassword) {

        alert(
            "Passwords Don't Match\n\n" +
            "Please make sure both passwords are the same."
        );

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

            alert(
                "Password Changed Successfully! 🎉\n\n" +
                "Your password has been changed successfully. You can now login with your new password."
            );

            const finishPasswordReset = () => {
                sessionStorage.removeItem("reset_email");
                window.location.href = "login.html";
            };

            const alertRoot = document.getElementById("sp-alert-root");

            if (!alertRoot) {
                finishPasswordReset();
                return;
            }

            const popupObserver = new MutationObserver(() => {
                if (alertRoot.hidden) {
                    popupObserver.disconnect();
                    finishPasswordReset();
                }
            });

            popupObserver.observe(alertRoot, {
                attributes: true,
                attributeFilter: ["hidden"]
            });

        } else {

            alert(data.detail || "Password update failed.");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}
