const contactGrid = document.getElementById("contactGrid");
const contactStatus = document.getElementById("contactStatus");
const contactCount = document.getElementById("contactCount");

function createContactField(label, value, className) {
    const field = document.createElement("div");
    const fieldLabel = document.createElement("span");
    const fieldValue = document.createElement("p");

    field.className = `contact-field${className ? ` ${className}` : ""}`;
    fieldLabel.className = "contact-field-label";
    fieldLabel.textContent = label;
    fieldValue.className = "contact-field-value";
    fieldValue.textContent = value || "—";

    field.append(fieldLabel, fieldValue);
    return field;
}

function createContactCard(message) {
    const card = document.createElement("article");
    const header = document.createElement("header");
    const identity = document.createElement("div");
    const avatar = document.createElement("div");
    const name = document.createElement("h2");
    const email = document.createElement("a");
    const id = document.createElement("span");
    const body = document.createElement("div");

    card.className = "contact-message-card";
    header.className = "contact-card-header";
    identity.className = "contact-identity";
    avatar.className = "contact-avatar";
    name.className = "contact-name";
    email.className = "contact-email";
    id.className = "contact-id";
    body.className = "contact-card-body";

    avatar.innerHTML = '<i class="bi bi-person" aria-hidden="true"></i>';
    name.textContent = message.full_name || "Unknown sender";
    email.textContent = message.email || "Email unavailable";
    if (message.email) {
        email.href = `mailto:${message.email}`;
    }
    id.textContent = `#${message.id}`;

    identity.append(avatar, name, email);
    header.append(identity, id);
    body.append(
        createContactField("Subject", message.subject, "contact-subject"),
        createContactField("Message", message.message, "contact-message")
    );
    card.append(header, body);

    return card;
}

function showContactState(type, title, detail) {
    const icon = document.createElement("div");
    const heading = document.createElement("h2");
    const description = document.createElement("p");

    contactGrid.hidden = true;
    contactCount.hidden = true;
    contactStatus.hidden = false;
    contactStatus.className = `contact-state contact-state-${type}`;
    contactStatus.replaceChildren();

    icon.className = "contact-state-icon";
    icon.innerHTML = type === "error"
        ? '<i class="bi bi-exclamation-circle" aria-hidden="true"></i>'
        : '<i class="bi bi-envelope-open" aria-hidden="true"></i>';
    heading.textContent = title;
    description.textContent = detail;
    contactStatus.append(icon, heading, description);
}

async function loadMessages() {
    try {
        const response = await fetch("https://smart-parking-system-tz4z.onrender.com/contact/");

        if (!response.ok) {
            throw new Error(`Failed to load messages (${response.status})`);
        }

        const messages = await response.json();
        const contactMessages = Array.isArray(messages) ? messages : [];

        if (contactMessages.length === 0) {
            showContactState(
                "empty",
                "No contact messages found",
                "New messages submitted through the contact form will appear here."
            );
            return;
        }

        const cards = document.createDocumentFragment();
        contactMessages.forEach((message) => cards.appendChild(createContactCard(message)));

        contactGrid.replaceChildren(cards);
        contactGrid.hidden = false;
        contactStatus.hidden = true;
        contactCount.textContent = `${contactMessages.length} ${contactMessages.length === 1 ? "message" : "messages"}`;
        contactCount.hidden = false;
    } catch (error) {
        console.error("Unable to load contact messages:", error);
        showContactState(
            "error",
            "Contact messages could not be loaded",
            "Please check your connection and refresh the page."
        );
    }
}

loadMessages();
