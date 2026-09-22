const table = document.getElementById("contactTable");

async function loadMessages() {

    try {

        const response = await fetch("http://smart-parking-system-tz4z.onrender.com/contact/");

        if (!response.ok) {

            throw new Error("Failed to load messages");

        }

        const messages = await response.json();

        table.innerHTML = "";

        messages.forEach(message => {

            table.innerHTML += `

            <tr>

                <td>${message.id}</td>

                <td>${message.full_name}</td>

                <td>${message.email}</td>

                <td>${message.subject}</td>

                <td>${message.message}</td>

            </tr>

            `;

        });

    }

    catch(error){

        console.log(error);

        table.innerHTML = `

        <tr>

            <td colspan="5" class="text-center text-danger">

                No Contact Messages Found

            </td>

        </tr>

        `;

    }

}

loadMessages();