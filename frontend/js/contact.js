// document.getElementById("contactForm").addEventListener("submit",function(e){

//     e.preventDefault();

//     alert("Thank You! Your message has been sent successfully.");

//     this.reset();

// });
// document.getElementById("contactForm").addEventListener("submit", sendMessage);

// async function sendMessage(e){

//     e.preventDefault();

//     const data = {

//         full_name: document.getElementById("full_name").value,

//         email: document.getElementById("email").value,

//         subject: document.getElementById("subject").value,

//         message: document.getElementById("message").value

//     };

//     const response = await fetch(
//         "http://127.0.0.1:8000/contact/",
//         {

//             method:"POST",

//             headers:{
//                 "Content-Type":"application/json"
//             },

//             body:JSON.stringify(data)

//         }

//     );

//     const result = await response.json();

//     alert(result.message);

//     document.getElementById("contactForm").reset();

// }
document.getElementById("contactForm").addEventListener("submit", sendMessage);

async function sendMessage(e){

    e.preventDefault();

    const data = {

        full_name: document.getElementById("full_name").value,

        email: document.getElementById("email").value,

        subject: document.getElementById("subject").value,

        message: document.getElementById("message").value

    };

    const response = await fetch("https://smart-parking-system-tz4z.onrender.com/contact/",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(data)

    });

    const result = await response.json();

    alert(result.message);

    document.getElementById("contactForm").reset();

}