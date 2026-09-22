const token = sessionStorageStorage.getItem("token");

async function changePassword() {

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const response = await fetch("https://smart-parking-system-tz4z.onrender.com/change-password", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify({

            current_password: currentPassword,
            new_password: newPassword

        })

    });

    const data = await response.json();

    if (response.ok) {

        alert(data.message);

        sessionStorage.removeItem("token");

        window.location.href = "login.html";

    } else {

        alert(data.detail);

    }

}