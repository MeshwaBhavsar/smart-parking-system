(function () {
    "use strict";

    function closeActionMenus(except) {
        document.querySelectorAll(".action-menu[open]").forEach(function (menu) {
            if (menu !== except) {
                menu.removeAttribute("open");
                menu.classList.remove("menu-fixed");
            }
        });
    }

    function positionActionMenu(menu) {
        if (!menu || !menu.open) {
            return;
        }

        const trigger = menu.querySelector("summary");
        const panel = menu.querySelector(".action-menu-panel");

        if (!trigger || !panel) {
            return;
        }

        menu.classList.add("menu-fixed");

        const triggerRect = trigger.getBoundingClientRect();
        const panelWidth = Math.min(panel.offsetWidth || 190, window.innerWidth - 24);
        const panelHeight = panel.offsetHeight || 150;
        const gap = 7;
        const viewportPadding = 12;

        let left = triggerRect.right - panelWidth;
        let top = triggerRect.bottom + gap;

        left = Math.max(viewportPadding, Math.min(left, window.innerWidth - panelWidth - viewportPadding));

        if (top + panelHeight > window.innerHeight - viewportPadding) {
            top = Math.max(viewportPadding, triggerRect.top - panelHeight - gap);
        }

        menu.style.setProperty("--menu-left", left + "px");
        menu.style.setProperty("--menu-top", top + "px");
    }

    document.addEventListener("DOMContentLoaded", function () {
        const body = document.body;
        const sidebar = document.querySelector(".sidebar");
        const menuButton = document.querySelector(".menu-btn");

        if (sidebar && menuButton) {
            const backdrop = document.createElement("div");
            backdrop.className = "sidebar-backdrop";
            backdrop.setAttribute("aria-hidden", "true");
            sidebar.insertAdjacentElement("afterend", backdrop);

            menuButton.setAttribute("type", "button");
            menuButton.setAttribute("aria-label", "Open owner navigation");
            menuButton.setAttribute("aria-expanded", "false");

            const setSidebarOpen = function (open) {
                sidebar.classList.toggle("show", open);
                body.classList.toggle("sidebar-open", open);
                menuButton.setAttribute("aria-expanded", String(open));
                menuButton.setAttribute("aria-label", open ? "Close owner navigation" : "Open owner navigation");
            };

            menuButton.addEventListener("click", function () {
                setSidebarOpen(!sidebar.classList.contains("show"));
            });

            backdrop.addEventListener("click", function () {
                setSidebarOpen(false);
            });

            sidebar.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", function () {
                    if (window.innerWidth < 992) {
                        setSidebarOpen(false);
                    }
                });
            });

            window.addEventListener("resize", function () {
                if (window.innerWidth >= 992) {
                    setSidebarOpen(false);
                }
            });

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    setSidebarOpen(false);
                    closeActionMenus();
                }
            });
        }

        document.addEventListener("toggle", function (event) {
            const menu = event.target.closest && event.target.closest(".action-menu");

            if (!menu) {
                return;
            }

            if (menu.open) {
                closeActionMenus(menu);
                window.requestAnimationFrame(function () {
                    positionActionMenu(menu);
                });
            } else {
                menu.classList.remove("menu-fixed");
            }
        }, true);

        document.addEventListener("click", function (event) {
            const openMenu = event.target.closest(".action-menu");

            if (!openMenu) {
                closeActionMenus();
            }

            const actionButton = event.target.closest(".action-menu-panel button");

            if (actionButton) {
                const parentMenu = actionButton.closest(".action-menu");
                window.setTimeout(function () {
                    closeActionMenus(parentMenu);
                    if (parentMenu) {
                        parentMenu.removeAttribute("open");
                    }
                }, 0);
            }
        });

        const repositionMenus = function () {
            document.querySelectorAll(".action-menu[open]").forEach(positionActionMenu);
        };

        window.addEventListener("resize", repositionMenus);
        window.addEventListener("scroll", repositionMenus, true);
    });
}());
