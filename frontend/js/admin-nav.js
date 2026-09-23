(function () {
    "use strict";

    function setupAdminNavigation() {
        const sidebar = document.querySelector(".sidebar");
        const menuButton = document.querySelector(".menu-btn");

        if (!sidebar || !menuButton || menuButton.dataset.adminNavBound === "true") {
            return;
        }

        const mobileNavigation = window.matchMedia("(max-width: 991px)");
        const backdrop = document.createElement("div");

        backdrop.className = "admin-sidebar-backdrop";
        backdrop.setAttribute("aria-hidden", "true");
        sidebar.insertAdjacentElement("afterend", backdrop);

        sidebar.id = sidebar.id || "adminSidebar";
        menuButton.type = "button";
        menuButton.dataset.adminNavBound = "true";
        menuButton.setAttribute("aria-controls", sidebar.id);
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open admin navigation");

        function setSidebarOpen(isOpen, returnFocus) {
            const shouldOpen = Boolean(isOpen && mobileNavigation.matches);

            sidebar.classList.toggle("show", shouldOpen);
            backdrop.classList.toggle("show", shouldOpen);
            document.body.classList.toggle("admin-sidebar-open", shouldOpen);
            menuButton.setAttribute("aria-expanded", String(shouldOpen));
            menuButton.setAttribute(
                "aria-label",
                shouldOpen ? "Close admin navigation" : "Open admin navigation"
            );

            if (!shouldOpen && returnFocus) {
                menuButton.focus();
            }
        }

        menuButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            setSidebarOpen(!sidebar.classList.contains("show"));
        });

        backdrop.addEventListener("click", function () {
            setSidebarOpen(false, true);
        });

        sidebar.addEventListener("click", function (event) {
            if (mobileNavigation.matches && event.target.closest("a")) {
                setSidebarOpen(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && sidebar.classList.contains("show")) {
                setSidebarOpen(false, true);
            }
        });

        function resetNavigation() {
            setSidebarOpen(false);
        }

        if (typeof mobileNavigation.addEventListener === "function") {
            mobileNavigation.addEventListener("change", resetNavigation);
        } else {
            mobileNavigation.addListener(resetNavigation);
        }

        setSidebarOpen(false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupAdminNavigation);
    } else {
        setupAdminNavigation();
    }
})();
