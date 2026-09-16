document.addEventListener("DOMContentLoaded", function () {

    const helloUser = document.getElementById("helloUser");

    if (!helloUser) {
        return;
    }

    const userData = sessionStorage.getItem("user");

    console.log("Stored User:", userData);

    if (!userData) {
        helloUser.innerText = "Hello, User";
        return;
    }

    try {

        const user = JSON.parse(userData);

        console.log("Logged-in User:", user);

        if (user.full_name) {

            helloUser.innerText =
                `Hello, ${user.full_name}`;

        } else if (user.name) {

            helloUser.innerText =
                `Hello, ${user.name}`;

        } else if (user.email) {

            helloUser.innerText =
                `Hello, ${user.email}`;

        } else {

            helloUser.innerText = "Hello, User";

        }

    } catch (error) {

        console.error(
            "Error loading user:",
            error
        );

        helloUser.innerText = "Hello, User";
    }

});