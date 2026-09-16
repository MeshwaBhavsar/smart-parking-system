async function submitOwnerApplication(event) {

    event.preventDefault();

    // -----------------------------
    // Get password
    // -----------------------------

    const password =
        document.getElementById("password").value.trim();

    const confirmPassword =
        document.getElementById("confirm_password").value.trim();


    // -----------------------------
    // Validate password
    // -----------------------------

    if (password.length < 8) {

        alert("Please enter password.");

        return;
    }


    if (password !== confirmPassword) {

        alert("Password and Confirm Password do not match.");

        return;
    }


    // -----------------------------
    // Create application object
    // -----------------------------

    const application = {

        owner_name:
            document.getElementById("owner_name")
                .value.trim(),

        business_name:
            document.getElementById("business_name")
                .value.trim(),

        email:
            document.getElementById("email")
                .value.trim(),

        password:
            password,

        phone:
            document.getElementById("phone")
                .value.trim(),

        parking_name:
            document.getElementById("parking_name")
                .value.trim(),

        address:
            document.getElementById("address")
                .value.trim(),

        city:
            document.getElementById("city")
                .value.trim(),

        state:
            document.getElementById("state")
                .value.trim(),

        pincode:
            document.getElementById("pincode")
                .value.trim(),

        total_slots:
            Number(
                document.getElementById("total_slots")
                    .value
            )
    };


    console.log(
        "Sending Owner Application:",
        application
    );


    // -----------------------------
    // Send data to FastAPI
    // -----------------------------

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/owner-applications/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(application)
            }
        );


        // -----------------------------
        // Read API response
        // -----------------------------

        const data = await response.json();


        console.log(
            "Owner Application Response:",
            data
        );


        // -----------------------------
        // Handle error
        // -----------------------------

        if (!response.ok) {

            alert(
                data.detail ||
                "Application submission failed."
            );

            return;
        }


        // -----------------------------
        // Success
        // -----------------------------

        alert(
            "Application submitted successfully! " +
            "Admin will review your application."
        );


        // Reset form

        document
            .getElementById("ownerApplicationForm")
            .reset();


    } catch (error) {

        console.error(
            "Owner Application Error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}

