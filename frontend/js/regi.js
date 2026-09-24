
async function register(event) {

    event.preventDefault();

    const hasAcceptedTerms =
        document.getElementById("agree").checked;

    if (!hasAcceptedTerms) {

        alert("Please accept the Terms & Conditions before registering.");

        return;
    }

    const password =
        document.getElementById("password").value;

    const isStrongPassword =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9\s]/.test(password);

    if (!isStrongPassword) {

        alert(
            "Weak Password\n\n" +
            "Please use at least 8 characters with uppercase, lowercase, number, and special character."
        );

        return;
    }

    const user = {
        full_name: document.getElementById("full_name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: password
    };

    try {

        const response = await fetch("https://smart-parking-system-tz4z.onrender.com/register", {
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
