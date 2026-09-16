document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("adminEmail").value;

        const password =
            document.getElementById("adminPassword").value;


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/admin/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(data.detail || "Login failed");

                return;
            }


            // Save admin information
            sessionStorage.setItem(
                "admin_id",
                data.admin_id
            );

            sessionStorage.setItem(
                "admin_name",
                data.admin_name
            );


            alert("Login successful");


            // Open dashboard
            window.location.href =
                "admindashboard.html";


        } catch (error) {

            console.error(error);

            alert(
                "Unable to connect to server"
            );

        }

    });