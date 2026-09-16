
async function register(event) {

    event.preventDefault();

    const user = {
        full_name: document.getElementById("full_name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value
    };

    try {

        const response = await fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });
        console.log("Status:", response.status);
        console.log("Response OK:", response.ok);

        const data = await response.json();


    if (response.ok) {

    console.log("1");

    alert("Registration Successful");

    //  location.assign("login.html");
    window.location.href = "login.html";
    // window.location.replace("http://127.0.0.1:5500/frontend/login.html");

  

}

 else {

    alert(data.detail || "Registration Failed");

}

    } catch (error) {

        console.log(error);

    }

}