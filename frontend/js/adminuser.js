// // async function loadUsers() {

// //     try {

// //         const response = await fetch("http://127.0.0.1:8000/users/");

// //         if (!response.ok) {
// //             throw new Error("Failed to fetch users");
// //         }

// //         const users = await response.json();

// //         const table = document.getElementById("userTable");

// //         table.innerHTML = "";

// //         users.forEach((user) => {

// //             table.innerHTML += `
// //                 <tr>

// //                     <td>${user.id}</td>

// //                     <td>${user.full_name}</td>

// //                     <td>${user.email}</td>

// //                     <td>${user.phone}</td>

// //                     <td>

// //                         <button class="btn btn-info btn-sm">
// //                             <i class="bi bi-eye-fill"></i>
// //                         </button>

// //                         <button class="btn btn-warning btn-sm">
// //                             <i class="bi bi-pencil-fill"></i>
// //                         </button>

// //                         <button class="btn btn-danger btn-sm">
// //                             <i class="bi bi-trash-fill"></i>
// //                         </button>

// //                     </td>

// //                 </tr>
// //             `;

// //         });

// //     }

// //     catch(error){

// //         console.log(error);

// //     }

// // }

// // loadUsers();

// let selectedUserId = null;
// let deleteModal;
// // const table = document.getElementById("userTable");

// window.onload = function () {

//     deleteModal = new bootstrap.Modal(
//         document.getElementById("deleteModal")
//     );

//     loadUsers();

// };

// async function loadUsers() {

//     const table = document.getElementById("userTable");
//     try {

//         const response = await fetch("http://127.0.0.1:8000/users");

//         const users = await response.json();

//         table.innerHTML = "";

//         users.forEach(user => {

//             table.innerHTML += `

//             <tr>

//                 <td>${user.id}</td>

//                 <td>${user.full_name}</td>

//                 <td>${user.email}</td>

//                 <td>${user.phone}</td>
//                 <td>${user.role}</td>

//                 <td>

//                     <button class="btn btn-sm btn-info" onclick="viewUser(${user.id})">
//                         <i class="bi bi-eye-fill"></i>
//                     </button>

//                     <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
//                         <i class="bi bi-pencil-fill"></i>
//                     </button>

//                     <button
//     class="btn btn-sm btn-danger"
//     onclick="openDeleteModal(${user.id}, '${user.full_name}', '${user.email}')">

//     <i class="bi bi-trash-fill"></i>

// </button>
                

//                 </td>

//             </tr>

//             `;

//         });

//     }

//     catch(error){

//         console.log(error);

//     }

// }




// loadUsers();


// // =================================search user=========================
// // async function searchUser() {
 
// //     alert("button click")
// //     const id = document.getElementById("searchId").value.trim();

// //     if (id === "") {
// //         alert("Please enter User ID");
// //         return;
// //     }

// //     try {

// //         const response = await fetch(`http://127.0.0.1:8000/users/search/${id}`);

// //         if (!response.ok) {
// //             document.getElementById("userTable").innerHTML =
// //             `<tr>
// //                 <td colspan="5" class="text-center text-danger">
// //                     User Not Found
// //                 </td>
// //             </tr>`;
// //             return;
// //         }

// //         const user = await response.json();

// //         document.getElementById("userTable").innerHTML = `
// //             <tr>
// //                 <td>${user.id}</td>
// //                 <td>${user.name}</td>
// //                 <td>${user.email}</td>
// //                 <td>${user.phone}</td>
// //                 <td>
// //                     <button class="btn btn-info">View</button>
// //                     <button class="btn btn-warning">Edit</button>
// //                     <button class="btn btn-danger">Delete</button>
// //                 </td>
// //             </tr>
// //         `;

// //     } catch (error) {
// //         console.log(error);
// //     }
// // }
// async function searchUser() {
//     const id = document.getElementById("searchId").value;

//     console.log("Searching ID:", id);

//     try {
//         const response = await fetch(`http://127.0.0.1:8000/users/search/${id}`);

//         console.log("Response Status:", response.status);

//         const user = await response.json();

//         console.log("User Data:", user);

//         document.getElementById("userTable").innerHTML = `
//             <tr>
//                 <td>${user.id}</td>
//                 <td>${user.full_name}</td>
//                 <td>${user.email}</td>
//                 <td>${user.phone}</td>
//             </tr>
//         `;

//     } catch (error) {
//         console.log(error);
//     }
// }


// // ---------------delete the user----------------------


// function openDeleteModal(id, name, email) {

//     selectedUserId = id;

//     document.getElementById("deleteUserName").innerHTML = name;

//     document.getElementById("deleteUserEmail").innerHTML = email;

//     deleteModal.show();

// }

// async function confirmDelete() {

//     try {

//         const response = await fetch(
//             `http://127.0.0.1:8000/users/${selectedUserId}`,
//             {
//                 method: "DELETE"
//             }
//         );

//         if (!response.ok) {

//             throw new Error("Delete failed");

//         }

//         const result = await response.json();

//         alert(result.message);

//         deleteModal.hide();

//         loadUsers();

//     }

//     catch (error) {

//         console.log(error);

//         alert("Unable to delete user.");

//     }

// }

// // -------------------------view function---------------
// async function viewUser(userId) {

//     try {

//         const response = await fetch(
//             `http://127.0.0.1:8000/users/${userId}`
//         );

//         if (!response.ok) {

//             throw new Error(
//                 "Unable to fetch user"
//             );

//         }

//         const user = await response.json();

//         document.getElementById(
//             "viewUserId"
//         ).textContent = user.id;

//         document.getElementById(
//             "viewUserName"
//         ).textContent = user.full_name;

//         document.getElementById(
//             "viewUserEmail"
//         ).textContent = user.email;

//         document.getElementById(
//             "viewUserPhone"
//         ).textContent = user.phone ?? "N/A";

//         document.getElementById(
//             "viewUserRole"
//         ).textContent = user.role ?? "user";


//         const modal =
//             new bootstrap.Modal(
//                 document.getElementById(
//                     "viewUserModal"
//                 )
//             );

//         modal.show();

//     } catch (error) {

//         console.error(error);

//         alert("Unable to load user details.");

//     }

// }

// // ------------------edit--------------------------
// async function editUser(userId) {

//     try {

//         const response = await fetch(
//             `http://127.0.0.1:8000/users/${userId}`
//         );

//         if (!response.ok) {

//             throw new Error(
//                 "Unable to fetch user"
//             );

//         }

//         const user = await response.json();


//         document.getElementById(
//             "editUserId"
//         ).value = user.id;


//         document.getElementById(
//             "editUserName"
//         ).value = user.full_name;


//         document.getElementById(
//             "editUserEmail"
//         ).value = user.email;


//         document.getElementById(
//             "editUserPhone"
//         ).value = user.phone ?? "";


//         document.getElementById(
//             "editUserRole"
//         ).value = user.role ?? "user";


//         const modal =
//             new bootstrap.Modal(
//                 document.getElementById(
//                     "editUserModal"
//                 )
//             );

//         modal.show();

//     } catch (error) {

//         console.error(error);

//         alert("Unable to load user.");

//     }

// }
// // --------------------------
// async function updateUser() {

//     const id =
//         document.getElementById(
//             "editUserId"
//         ).value;

//     const full_name =
//         document.getElementById(
//             "editUserName"
//         ).value.trim();

//     const email =
//         document.getElementById(
//             "editUserEmail"
//         ).value.trim();

//     const phone =
//         document.getElementById(
//             "editUserPhone"
//         ).value.trim();

//     const role =
//         document.getElementById(
//             "editUserRole"
//         ).value;


//     if (!full_name || !email) {

//         alert(
//             "Name and email are required."
//         );

//         return;

//     }


//     try {

//         const response = await fetch(
//             `http://127.0.0.1:8000/users/${id}`,
//             {

//                 method: "PUT",

//                 headers: {
//                     "Content-Type":
//                         "application/json"
//                 },

//                 body: JSON.stringify({

//                     full_name: full_name,

//                     email: email,

//                     phone: phone,

//                     role: role

//                 })

//             }
//         );


//         const result =
//             await response.json();


//         if (!response.ok) {

//             throw new Error(
//                 result.detail ||
//                 "Update failed"
//             );

//         }


//         alert(
//             "User updated successfully!"
//         );


//         const modalElement =
//             document.getElementById(
//                 "editUserModal"
//             );

//         const modal =
//             bootstrap.Modal.getInstance(
//                 modalElement
//             );

//         modal.hide();


//         loadUsers();


//     } catch (error) {

//         console.error(
//             "Update error:",
//             error
//         );

//         alert(error.message);

//     }

// }
// // --------web socket----------------
// function connectUserWebSocket() {

//     userSocket = new WebSocket(
//         "ws://127.0.0.1:8000/ws/users"
//     );


//     userSocket.onopen = function () {

//         console.log(
//             "User WebSocket connected"
//         );

//     };


//     userSocket.onmessage = function (event) {

//         try {

//             const data =
//                 JSON.parse(event.data);

//             console.log(
//                 "User WebSocket:",
//                 data
//             );


//             if (
//                 data.event ===
//                 "user_created"
//             ) {

//                 loadUsers();

//             }


//             if (
//                 data.event ===
//                 "user_updated"
//             ) {

//                 loadUsers();

//             }


//             if (
//                 data.event ===
//                 "user_deleted"
//             ) {

//                 loadUsers();

//             }

//         } catch (error) {

//             console.error(
//                 "WebSocket message error:",
//                 error
//             );

//         }

//     };


//     userSocket.onerror = function (error) {

//         console.error(
//             "User WebSocket error:",
//             error
//         );

//     };


//     userSocket.onclose = function () {

//         console.log(
//             "User WebSocket disconnected"
//         );


//         setTimeout(
//             connectUserWebSocket,
//             3000
//         );

//     };

// }

// document.addEventListener(
//     "click",
//     function (event) {

//         const viewButton =
//             event.target.closest(
//                 ".view-user-btn"
//             );

//         if (!viewButton) {
//             return;
//         }

//         const userId =
//             viewButton.dataset.userId;

//         console.log(
//             "VIEW BUTTON CLICKED"
//         );

//         console.log(
//             "User ID:",
//             userId
//         );

//         viewUser(userId);

//     }
// );
// document.addEventListener(
//     "click",
//     function (event) {

//         const editButton =
//             event.target.closest(
//                 ".edit-user-btn"
//             );

//         if (!editButton) {
//             return;
//         }

//         const userId =
//             editButton.dataset.userId;

//         console.log(
//             "EDIT BUTTON CLICKED"
//         );

//         console.log(
//             "User ID:",
//             userId
//         );

//         editUser(userId);

//     }
// );

const API_URL = "https://smart-parking-system-tz4z.onrender.com";

let selectedUserId = null;

let deleteModal = null;
let viewModal = null;
let editModal = null;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("ADMIN USER JS LOADED");

    // Load users

    loadUsers();


    // Bootstrap modals

    deleteModal = new bootstrap.Modal(
        document.getElementById("deleteModal")
    );

    viewModal = new bootstrap.Modal(
        document.getElementById("viewUserModal")
    );

    editModal = new bootstrap.Modal(
        document.getElementById("editUserModal")
    );

});


// ======================================================
// LOAD ALL USERS
// ======================================================

async function loadUsers() {

    console.log("Loading users...");

    const table =
        document.getElementById("userTable");

    try {

        const response = await fetch(
            `${API_URL}/users/`
        );

        console.log(
            "Users API status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load users"
            );

        }

        const users =
            await response.json();

        console.log(
            "Users:",
            users
        );


        // Clear table

        table.innerHTML = "";


        // No users

        if (users.length === 0) {

            table.innerHTML = `
                <tr>

                    <td
                        colspan="6"
                        class="text-center">

                        No users found

                    </td>

                </tr>
            `;

            return;

        }


        // Create rows

        users.forEach(function (user) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${user.id}
                </td>


                <td>
                    ${user.full_name ?? ""}
                </td>


                <td>
                    ${user.email ?? ""}
                </td>


                <td>
                    ${user.phone ?? "N/A"}
                </td>


                <td>

                    <span class="badge bg-success">

                        ${user.role ?? "user"}

                    </span>

                </td>


                <td>


                    <!-- VIEW -->

                    <button
                        type="button"
                        class="btn btn-sm btn-info"
                        onclick="viewUser(${user.id})">

                        <i class="bi bi-eye-fill"></i>

                    </button>


                    <!-- EDIT -->

                    <button
                        type="button"
                        class="btn btn-sm btn-warning"
                        onclick="editUser(${user.id})">

                        <i class="bi bi-pencil-fill"></i>

                    </button>


                    <!-- DELETE -->

                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="openDeleteModal(
                            ${user.id},
                            '${escapeHtml(user.full_name)}',
                            '${escapeHtml(user.email)}'
                        )">

                        <i class="bi bi-trash-fill"></i>

                    </button>


                </td>

            `;


            table.appendChild(row);

        });


    } catch (error) {

        console.error(
            "LOAD USERS ERROR:",
            error
        );

        table.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="text-center text-danger">

                    Unable to load users

                </td>

            </tr>
        `;

    }

}


// ======================================================
// VIEW USER
// ======================================================

async function viewUser(userId) {

    console.log(
        "VIEW BUTTON CLICKED"
    );

    console.log(
        "User ID:",
        userId
    );


    try {

        const response = await fetch(
            `${API_URL}/users/${userId}`
        );


        console.log(
            "View API status:",
            response.status
        );


        const user =
            await response.json();


        console.log(
            "View user data:",
            user
        );


        if (!response.ok) {

            throw new Error(
                user.detail ||
                "Unable to load user details"
            );

        }


        // Fill modal

        document.getElementById(
            "viewUserId"
        ).textContent =
            user.id;


        document.getElementById(
            "viewUserName"
        ).textContent =
            user.full_name ?? "N/A";


        document.getElementById(
            "viewUserEmail"
        ).textContent =
            user.email ?? "N/A";


        document.getElementById(
            "viewUserPhone"
        ).textContent =
            user.phone ?? "N/A";


        document.getElementById(
            "viewUserRole"
        ).textContent =
            user.role ?? "user";


        // Show modal

        viewModal.show();


    } catch (error) {

        console.error(
            "VIEW USER ERROR:",
            error
        );

        alert(
            "Unable to load user details: " +
            error.message
        );

    }

}


// ======================================================
// EDIT USER
// ======================================================

async function editUser(userId) {

    console.log(
        "EDIT BUTTON CLICKED"
    );

    console.log(
        "User ID:",
        userId
    );


    try {

        const response = await fetch(
            `${API_URL}/users/${userId}`
        );


        console.log(
            "Edit API status:",
            response.status
        );


        const user =
            await response.json();


        console.log(
            "Edit user data:",
            user
        );


        if (!response.ok) {

            throw new Error(
                user.detail ||
                "Unable to load user"
            );

        }


        // Fill edit form

        document.getElementById(
            "editUserId"
        ).value =
            user.id;


        document.getElementById(
            "editUserName"
        ).value =
            user.full_name ?? "";


        document.getElementById(
            "editUserEmail"
        ).value =
            user.email ?? "";


        document.getElementById(
            "editUserPhone"
        ).value =
            user.phone ?? "";


        document.getElementById(
            "editUserRole"
        ).value =
            user.role ?? "user";


        // Show modal

        editModal.show();


    } catch (error) {

        console.error(
            "EDIT USER ERROR:",
            error
        );

        alert(
            "Unable to load user: " +
            error.message
        );

    }

}


// ======================================================
// UPDATE USER
// ======================================================

async function updateUser() {

    const userId =
        document.getElementById(
            "editUserId"
        ).value;


    const fullName =
        document.getElementById(
            "editUserName"
        ).value.trim();


    const email =
        document.getElementById(
            "editUserEmail"
        ).value.trim();


    const phone =
        document.getElementById(
            "editUserPhone"
        ).value.trim();


    const role =
        document.getElementById(
            "editUserRole"
        ).value;


    console.log(
        "Updating user:",
        userId
    );


    const data = {

        full_name: fullName,

        email: email,

        phone: phone,

        role: role

    };


    console.log(
        "Update data:",
        data
    );


    try {

        const response = await fetch(
            `${API_URL}/users/${userId}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(data)

            }
        );


        console.log(
            "Update status:",
            response.status
        );


        const result =
            await response.json();


        console.log(
            "Update response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Unable to update user"
            );

        }


        alert(
            "User updated successfully"
        );


        // Close modal

        editModal.hide();


        // Reload table

        loadUsers();


    } catch (error) {

        console.error(
            "UPDATE USER ERROR:",
            error
        );

        alert(
            "Unable to update user: " +
            error.message
        );

    }

}


// ======================================================
// DELETE MODAL
// ======================================================

function openDeleteModal(
    userId,
    userName,
    userEmail
) {

    console.log(
        "DELETE USER:",
        userId
    );


    selectedUserId = userId;


    document.getElementById(
        "deleteUserName"
    ).textContent =
        userName;


    document.getElementById(
        "deleteUserEmail"
    ).textContent =
        userEmail;


    deleteModal.show();

}


// ======================================================
// CONFIRM DELETE
// ======================================================

async function confirmDelete() {

    if (!selectedUserId) {

        return;

    }


    console.log(
        "Deleting user:",
        selectedUserId
    );


    try {

        const response = await fetch(
            `${API_URL}/users/${selectedUserId}`,
            {

                method: "DELETE"

            }
        );


        console.log(
            "Delete status:",
            response.status
        );


        const result =
            await response.json();


        console.log(
            "Delete response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Unable to delete user"
            );

        }


        alert(
            "User deleted successfully"
        );


        deleteModal.hide();


        selectedUserId = null;


        loadUsers();


    } catch (error) {

        console.error(
            "DELETE USER ERROR:",
            error
        );

        alert(
            "Unable to delete user: " +
            error.message
        );

    }

}


// ======================================================
// SEARCH USER
// ======================================================

async function searchUser() {

    const value =
        document.getElementById(
            "searchId"
        ).value.trim();


    if (!value) {

        loadUsers();

        return;

    }


    console.log(
        "Searching:",
        value
    );


    try {

        const response = await fetch(
            `${API_URL}/users/search/${value}`
        );


        const user =
            await response.json();


        console.log(
            "Search result:",
            user
        );


        if (!response.ok) {

            throw new Error(
                user.detail ||
                "User not found"
            );

        }


        const table =
            document.getElementById(
                "userTable"
            );


        table.innerHTML = `

            <tr>

                <td>
                    ${user.id}
                </td>

                <td>
                    ${user.full_name}
                </td>

                <td>
                    ${user.email}
                </td>

                <td>
                    ${user.phone ?? "N/A"}
                </td>

                <td>

                    <span class="badge bg-success">

                        ${user.role ?? "user"}

                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-info"
                        onclick="viewUser(${user.id})">

                        <i class="bi bi-eye-fill"></i>

                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-warning"
                        onclick="editUser(${user.id})">

                        <i class="bi bi-pencil-fill"></i>

                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="openDeleteModal(
                            ${user.id},
                            '${escapeHtml(user.full_name)}',
                            '${escapeHtml(user.email)}'
                        )">

                        <i class="bi bi-trash-fill"></i>

                    </button>

                </td>

            </tr>

        `;


    } catch (error) {

        console.error(
            "SEARCH ERROR:",
            error
        );

        alert(
            "User not found"
        );

    }

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
