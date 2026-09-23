document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.querySelector(".sidebar");
    const menuBtn = document.querySelector(".menu-btn");

    if (
        document.body.classList.contains("user-portal-page") &&
        sidebar &&
        menuBtn &&
        !menuBtn.dataset.sidebarToggleBound
    ) {
        const mobileSidebar = window.matchMedia("(max-width: 991px)");

        menuBtn.dataset.sidebarToggleBound = "true";
        menuBtn.type = "button";
        sidebar.id = sidebar.id || "userSidebar";
        menuBtn.setAttribute("aria-controls", sidebar.id);
        menuBtn.setAttribute("aria-label", "Toggle navigation menu");

        const setSidebarOpen = function (isOpen) {
            sidebar.classList.toggle("show", isOpen);
            document.body.classList.toggle(
                "sidebar-open",
                isOpen && mobileSidebar.matches
            );
            menuBtn.setAttribute("aria-expanded", String(isOpen));
        };

        setSidebarOpen(false);

        menuBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            setSidebarOpen(!sidebar.classList.contains("show"));
        });

        document.addEventListener("click", function (event) {
            if (
                mobileSidebar.matches &&
                sidebar.classList.contains("show") &&
                !sidebar.contains(event.target)
            ) {
                setSidebarOpen(false);
            }
        });

        sidebar.addEventListener("click", function (event) {
            if (mobileSidebar.matches && event.target.closest("a")) {
                setSidebarOpen(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && sidebar.classList.contains("show")) {
                setSidebarOpen(false);
                menuBtn.focus();
            }
        });

        const resetSidebarForViewport = function () {
            if (!mobileSidebar.matches) {
                setSidebarOpen(false);
            }
        };

        if (typeof mobileSidebar.addEventListener === "function") {
            mobileSidebar.addEventListener("change", resetSidebarForViewport);
        } else {
            mobileSidebar.addListener(resetSidebarForViewport);
        }
    }

    const helloUser = document.getElementById("helloUser");

    if (!helloUser) {
        return;
    }

    const userData = sessionStorage.getItem("user");

    console.log("Stored User:", userData);

    if (!userData) {
        helloUser.innerText = "Hello, User";
        return;
    }

    try {

        const user = JSON.parse(userData);

        console.log("Logged-in User:", user);

        if (user.full_name) {

            helloUser.innerText =
                `Hello, ${user.full_name}`;

        } else if (user.name) {

            helloUser.innerText =
                `Hello, ${user.name}`;

        } else if (user.email) {

            helloUser.innerText =
                `Hello, ${user.email}`;

        } else {

            helloUser.innerText = "Hello, User";

        }

    } catch (error) {

        console.error(
            "Error loading user:",
            error
        );

        helloUser.innerText = "Hello, User";
    }

});
