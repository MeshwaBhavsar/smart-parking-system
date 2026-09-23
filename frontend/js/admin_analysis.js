const ANALYTICS_API = "https://smart-parking-system-tz4z.onrender.com";
const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

let occupancyChart = null;
let peakHourChart = null;
let peakDaysChart = null;


function getAdminToken() {
    return sessionStorage.getItem("access_token");
}


function analyticsHeaders() {
    const token = getAdminToken();

    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}


async function fetchAnalytics(path, requiresAuthentication = false) {
    if (requiresAuthentication && !getAdminToken()) {
        throw new Error("Admin access token is missing");
    }

    const response = await fetch(`${ANALYTICS_API}${path}`, {
        headers: analyticsHeaders()
    });

    if (!response.ok) {
        throw new Error(`${path} returned HTTP ${response.status}`);
    }

    return response.json();
}


function setAnalyticsText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function formatPercentage(value) {
    const percentage = Number(value);
    return Number.isFinite(percentage) ? percentage.toFixed(2) : "-";
}


function formatHourForCard(hour) {
    const numericHour = Number(hour);
    const normalizedHour = ((numericHour % 24) + 24) % 24;
    const displayHour = normalizedHour % 12 || 12;
    const suffix = normalizedHour >= 12 ? "PM" : "AM";

    return `${String(displayHour).padStart(2, "0")}:00 ${suffix}`;
}


function formatHourLabel(hour) {
    return `${String(Number(hour)).padStart(2, "0")}:00`;
}


async function loadOccupancyAnalytics() {
    try {
        const data = await fetchAnalytics("/analytics/occupancy-summary");

        setAnalyticsText(
            "averageOccupancy",
            `${formatPercentage(data.average_occupancy)}%`
        );
        setAnalyticsText(
            "analyticsAvailableSlots",
            Number(data.available_slots || 0).toLocaleString()
        );
    } catch (error) {
        console.error("Unable to load occupancy summary:", error);
        setAnalyticsText("averageOccupancy", "-");
        setAnalyticsText("analyticsAvailableSlots", "-");
    }
}


async function loadZoneSummary() {
    try {
        const data = await fetchAnalytics("/analytics/zone-summary");
        const mostOccupied = data.most_occupied_zone;
        const leastOccupied = data.least_occupied_zone;

        setAnalyticsText(
            "mostOccupiedZone",
            mostOccupied?.zone || "-"
        );
        setAnalyticsText(
            "mostOccupiedPercentage",
            mostOccupied
                ? `${formatPercentage(mostOccupied.occupancy)}% occupancy`
                : "-"
        );
        setAnalyticsText(
            "leastOccupiedZone",
            leastOccupied?.zone || "-"
        );
        setAnalyticsText(
            "leastOccupiedPercentage",
            leastOccupied
                ? `${formatPercentage(leastOccupied.occupancy)}% occupancy`
                : "-"
        );
    } catch (error) {
        console.error("Unable to load zone summary:", error);
        setAnalyticsText("mostOccupiedZone", "-");
        setAnalyticsText("mostOccupiedPercentage", "-");
        setAnalyticsText("leastOccupiedZone", "-");
        setAnalyticsText("leastOccupiedPercentage", "-");
    }
}


async function loadOccupancyChart() {
    try {
        const data = await fetchAnalytics("/analytics/zone-occupancy");
        const zoneData = Array.isArray(data) ? data : [];

        console.group("Parking Occupancy Analytics — weighted zone results");
        console.table(zoneData.map(item => ({
            Zone: item.zone,
            Records: Number(item.records) || 0,
            "Total Capacity": Number(item.total_slots) || 0,
            "Occupied Slots": Number(item.occupied_slots) || 0,
            "Available Slots": Number(item.available_slots) || 0,
            "Occupancy %": Number(
                item.occupancy_percentage ?? item.avg_occupancy
            ) || 0
        })));
        console.groupEnd();

        createOccupancyChart(zoneData);
    } catch (error) {
        console.error("Unable to load zone occupancy chart:", error);
        createOccupancyChart([]);
    }
}


function createOccupancyChart(zoneData) {
    const canvas = document.getElementById("occupancyChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const labels = zoneData.map(item => String(item.zone));
    const values = zoneData.map(item => Number(
        item.occupancy_percentage ?? item.avg_occupancy
    ) || 0);

    if (occupancyChart) {
        occupancyChart.destroy();
    }

    occupancyChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Occupancy %",
                data: values,
                backgroundColor: "rgba(22, 163, 74, 0.78)",
                borderColor: "#15803d",
                borderWidth: 1,
                borderRadius: 8,
                maxBarThickness: 48
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: items => `Zone: ${items[0].label}`,
                        label: context =>
                            `Occupancy: ${Number(context.raw).toFixed(2)}%`,
                        afterLabel: context => {
                            const zone = zoneData[context.dataIndex];

                            return [
                                `Records: ${Number(zone.records || 0).toLocaleString()}`,
                                `Occupied Slots: ${Number(zone.occupied_slots || 0).toLocaleString()}`,
                                `Total Capacity: ${Number(zone.total_slots || 0).toLocaleString()}`,
                                `Available Slots: ${Number(zone.available_slots || 0).toLocaleString()}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: { callback: value => `${value}%` },
                    title: {
                        display: true,
                        text: "Average Occupancy %"
                    }
                },
                x: {
                    grid: { display: false },
                    title: { display: true, text: "Parking Zone" }
                }
            }
        }
    });
}


function calculateHourlyTraffic(data) {
    const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        entries: 0,
        exits: 0
    }));

    if (!Array.isArray(data)) {
        return hourlyTraffic;
    }

    data.forEach(item => {
        const hour = Number(item.hour);

        if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
            return;
        }

        hourlyTraffic[hour].entries = Math.max(
            0,
            Number(item.entries ?? item.entry_count) || 0
        );
        hourlyTraffic[hour].exits = Math.max(
            0,
            Number(item.exits ?? item.exit_count) || 0
        );
    });

    return hourlyTraffic;
}


function calculatePeakHour(hourlyTraffic, field) {
    const total = hourlyTraffic.reduce(
        (sum, item) => sum + item[field],
        0
    );

    if (total === 0) {
        return null;
    }

    return hourlyTraffic.reduce(
        (peak, item) => item[field] > peak[field] ? item : peak,
        hourlyTraffic[0]
    );
}


async function loadPeakHourAnalysis() {
    try {
        const data = await fetchAnalytics("/admin/peak-hours", true);
        const hourlyTraffic = calculateHourlyTraffic(data);
        updatePeakHourCards(hourlyTraffic);
        createPeakHourChart(hourlyTraffic);
    } catch (error) {
        console.error("Unable to load peak-hour analytics:", error);
        setAnalyticsText("peakEntryHour", "-");
        setAnalyticsText("peakEntryCount", "Unable to load data");
        setAnalyticsText("peakExitHour", "-");
        setAnalyticsText("peakExitCount", "Unable to load data");
        setAnalyticsText("totalTraffic", "-");
        createPeakHourChart([]);
    }
}


function updatePeakHourCards(hourlyTraffic) {
    const peakEntry = calculatePeakHour(hourlyTraffic, "entries");
    const peakExit = calculatePeakHour(hourlyTraffic, "exits");
    const totalEntries = hourlyTraffic.reduce(
        (sum, item) => sum + item.entries,
        0
    );
    const totalExits = hourlyTraffic.reduce(
        (sum, item) => sum + item.exits,
        0
    );

    setAnalyticsText(
        "peakEntryHour",
        peakEntry ? formatHourForCard(peakEntry.hour) : "-"
    );
    setAnalyticsText(
        "peakEntryCount",
        `${peakEntry?.entries || 0} vehicles entered`
    );
    setAnalyticsText(
        "peakExitHour",
        peakExit ? formatHourForCard(peakExit.hour) : "-"
    );
    setAnalyticsText(
        "peakExitCount",
        `${peakExit?.exits || 0} vehicles exited`
    );
    setAnalyticsText("totalTraffic", totalEntries + totalExits);
}


function createPeakHourChart(hourlyTraffic) {
    const canvas = document.getElementById("peakHourChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    if (peakHourChart) {
        peakHourChart.destroy();
    }

    peakHourChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: hourlyTraffic.map(item => formatHourLabel(item.hour)),
            datasets: [
                {
                    label: "Entry Traffic",
                    data: hourlyTraffic.map(item => item.entries),
                    borderColor: "#16a34a",
                    backgroundColor: "rgba(22, 163, 74, 0.10)",
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: "Exit Traffic",
                    data: hourlyTraffic.map(item => item.exits),
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(220, 38, 38, 0.08)",
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: true, position: "top" },
                tooltip: {
                    callbacks: {
                        title: items => `Hour: ${items[0].label}`,
                        label: context =>
                            `${context.dataset.label}: ${context.raw} vehicles`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    title: { display: true, text: "Number of Vehicles" }
                },
                x: {
                    grid: { display: false },
                    title: { display: true, text: "Hour" }
                }
            }
        }
    });
}


function calculatePeakDays(data) {
    return WEEKDAYS.map(day => {
        const match = Array.isArray(data)
            ? data.find(item =>
                String(item.day).toLowerCase() === day.toLowerCase()
            )
            : null;

        return {
            day,
            count: Math.max(0, Number(match?.count) || 0)
        };
    });
}


function calculateBusiestDay(peakDays) {
    const totalReservations = peakDays.reduce(
        (sum, item) => sum + item.count,
        0
    );

    if (totalReservations === 0) {
        return null;
    }

    return peakDays.reduce(
        (busiest, item) => item.count > busiest.count ? item : busiest,
        peakDays[0]
    );
}


async function loadPeakDaysAnalysis() {
    try {
        const data = await fetchAnalytics("/admin/peak-days", true);
        displayPeakDays(calculatePeakDays(data));
    } catch (error) {
        console.error("Unable to load peak-days analytics:", error);
        displayPeakDays([]);
        setAnalyticsText("busiestDay", "-");
        setAnalyticsText("busiestDayCount", "Unable to load data");
    }
}


function displayPeakDays(peakDays) {
    const busiestDay = calculateBusiestDay(peakDays);

    setAnalyticsText("busiestDay", busiestDay?.day || "-");
    setAnalyticsText(
        "busiestDayCount",
        busiestDay ? `${busiestDay.count} reservations` : "No data"
    );

    const canvas = document.getElementById("peakDaysChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    if (peakDaysChart) {
        peakDaysChart.destroy();
    }

    peakDaysChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: peakDays.map(item => item.day),
            datasets: [{
                label: "Reservations",
                data: peakDays.map(item => item.count),
                backgroundColor: peakDays.map(item =>
                    busiestDay && item.day === busiestDay.day
                        ? "#16a34a"
                        : "#bbf7d0"
                ),
                borderColor: "#15803d",
                borderWidth: 1,
                borderRadius: 8,
                maxBarThickness: 42
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.raw} reservations`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            }
        }
    });
}


function setupSidebar() {
    const menuButton = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });
    }
}


function refreshAdminAnalytics() {
    loadOccupancyAnalytics();
    loadZoneSummary();
    loadOccupancyChart();
    loadPeakHourAnalysis();
    loadPeakDaysAnalysis();
}


let analyticsSocket = null;
let analyticsReconnectTimer = null;


function connectAnalyticsWebSocket() {
    const websocketBase = ANALYTICS_API.replace(/^http/, "ws");
    analyticsSocket = new WebSocket(`${websocketBase}/analytics/ws`);

    analyticsSocket.onmessage = event => {
        let message = event.data;

        try {
            message = JSON.parse(event.data);
        } catch (error) {
            // Plain string messages are valid websocket events.
        }

        const eventName = typeof message === "object"
            ? (message.event || message.type)
            : message;

        if ([
            "analytics_updated",
            "reservation_created",
            "parking_status_updated"
        ].includes(eventName)) {
            refreshAdminAnalytics();
        }
    };

    analyticsSocket.onclose = () => {
        analyticsReconnectTimer = window.setTimeout(
            connectAnalyticsWebSocket,
            3000
        );
    };

    analyticsSocket.onerror = () => analyticsSocket.close();
}


document.addEventListener("DOMContentLoaded", () => {
    setupSidebar();
    refreshAdminAnalytics();
    connectAnalyticsWebSocket();
});


window.addEventListener("beforeunload", () => {
    window.clearTimeout(analyticsReconnectTimer);

    if (analyticsSocket) {
        analyticsSocket.onclose = null;
        analyticsSocket.close();
    }
});
