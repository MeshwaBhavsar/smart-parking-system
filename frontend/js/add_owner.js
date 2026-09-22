async function createOwner(event) {

    event.preventDefault();


    const ownerData = {

        full_name:
            document.getElementById("full_name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        phone:
            document.getElementById("phone").value.trim(),

        password:
            document.getElementById("password").value

    };


    try {

        const token =
            localStorage.getItem("access_token");


        if (!token) {

            alert("Please login as Admin first.");

            window.location.href =
                "../login.html";

            return;
        }


        const response = await fetch(
            "https://smart-parking-system-tz4z.onrender.com/admin/owners",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token

                },

                body:
                    JSON.stringify(ownerData)

            }
        );


        const data =
            await response.json();


        console.log(
            "Create Owner Response:",
            data
        );


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to create owner"
            );

            return;
        }


        alert(
            "Owner created successfully!"
        );


        document
            .getElementById("ownerForm")
            .reset();


    } catch (error) {

        console.error(
            "Create Owner Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}