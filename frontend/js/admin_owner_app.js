const API_URL =
    "http://127.0.0.1:8000/owner-applications";


// ========================================
// Load Owner Applications
// ========================================

async function loadOwnerApplications() {

    try {

        const response = await fetch(
            API_URL + "/"
        );


        const data =
            await response.json();


        console.log(
            "Owner Applications:",
            data
        );


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to load owner applications"
            );

            return;
        }


        displayOwnerApplications(data);


    } catch (error) {

        console.error(
            "Error loading owner applications:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// ========================================
// Display Applications
// ========================================

function displayOwnerApplications(
    applications
) {

    const tbody =
        document.getElementById(
            "ownerApplicationsTableBody"
        );


    tbody.innerHTML = "";


    // No applications

    if (
        !applications ||
        applications.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    class="text-center text-muted">

                    No owner applications found.

                </td>

            </tr>

        `;

        return;
    }


    // Display applications

    applications.forEach(
        application => {

            const row =
                document.createElement("tr");


            // Status badge

            let statusBadge = "";


            if (
                application.status ===
                "pending"
            ) {

                statusBadge = `
                    <span class="badge bg-warning text-dark">
                        Pending
                    </span>
                `;

            }

            else if (
                application.status ===
                "approved"
            ) {

                statusBadge = `
                    <span class="badge bg-success">
                        Approved
                    </span>
                `;

            }

            else if (
                application.status ===
                "rejected"
            ) {

                statusBadge = `
                    <span class="badge bg-danger">
                        Rejected
                    </span>
                `;

            }

            else {

                statusBadge = `
                    <span class="badge bg-secondary">
                        ${application.status}
                    </span>
                `;
            }


            // Action buttons

            let actionButtons = "";


            if (
                application.status ===
                "pending"
            ) {

                actionButtons = `

                    <button
                        class="btn btn-success btn-sm me-1"
                        onclick="approveOwner(
                            ${application.id}
                        )">

                        Approve

                    </button>


                    <button
                        class="btn btn-danger btn-sm"
                        onclick="rejectApplication(
                            ${application.id}
                        )">

                        Reject

                    </button>

                            <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteOwnerApplication(
                        ${application.id}
                    )">

                    Delete

                </button>


                `;

            }

            else if (
                application.status ===
                "approved"
            ) {

                actionButtons = `
                    <span class="text-success">
                        Owner Created
                    </span>
                `;

            }

            else {

                actionButtons = "-";

            }


            row.innerHTML = `

                <td>
                    ${application.id}
                </td>

                <td>
                    ${application.owner_name}
                </td>

                <td>
                    ${application.business_name}
                </td>

                <td>
                    ${application.email}
                </td>

                <td>
                    ${application.phone}
                </td>

                <td>
                    ${application.parking_name}
                </td>

                <td>
                    ${application.city}
                </td>

                <td>
                    ${application.state}
                </td>

                <td>
                    ${application.total_slots}
                </td>

                <td>
                    ${statusBadge}
                </td>

                <td>
                    ${actionButtons}
                </td>

            `;


            tbody.appendChild(row);

        }
    );
}



// -------------delete owner------------------
// ========================================
// DELETE OWNER APPLICATION
// ========================================

async function deleteOwnerApplication(
    applicationId
) {

    console.log(
        "Delete owner application:",
        applicationId
    );


    // ----------------------------------------
    // Confirmation
    // ----------------------------------------

    const confirmed = confirm(
        "Are you sure you want to delete this owner application?"
    );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(

            `${API_URL}/${applicationId}`,

            {
                method: "DELETE"
            }

        );


        console.log(
            "Delete API status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Delete response:",
            data
        );


        // ----------------------------------------
        // Error
        // ----------------------------------------

        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete owner application"
            );

            return;
        }


        // ----------------------------------------
        // Success
        // ----------------------------------------

        alert(
            "Owner application deleted successfully!"
        );


        // ----------------------------------------
        // Reload table
        // ----------------------------------------

        loadOwnerApplications();


    }
    catch (error) {

        console.error(
            "DELETE OWNER APPLICATION ERROR:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}



// ========================================
// Reject Owner
// ========================================

async function rejectApplication(applicationId) {

    console.log(
        "Reject application:",
        applicationId
    );

    const confirmReject = confirm(
        "Are you sure you want to reject this application?"
    );

    if (!confirmReject) {
        return;
    }


    try {

        const response = await fetch(
            `http://127.0.0.1:8000/owner-applications/${applicationId}/reject`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );


        console.log(
            "Reject API status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Reject response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to reject application"
            );

        }


        alert(
            "Application rejected successfully"
        );


        // Reload applications
        loadOwnerApplications()


    } catch (error) {

        console.error(
            "REJECT APPLICATION ERROR:",
            error
        );

        alert(
            "Unable to reject application: " +
            error.message
        );

    }

}

// ========================================
// Load when page opens
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadOwnerApplications();

    }
);

async function approveOwner(applicationId) {

    const confirmed = confirm(
        "Are you sure you want to approve this owner?"
    );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(

            `http://127.0.0.1:8000/owner-applications/${applicationId}/approve`,

            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }

        );


        const data =
            await response.json();


        console.log(
            "Approve response:",
            data
        );


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to approve owner."
            );

            return;
        }


        alert(
            "Owner approved successfully!"
        );


        // Reload admin applications

        loadOwnerApplications();


    }
    catch (error) {

        console.error(
            "Approve error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}