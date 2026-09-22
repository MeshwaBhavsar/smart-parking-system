// // ==================================================
// // ANALYTICS API
// // ==================================================

// const ANALYTICS_API =
//     "http://127.0.0.1:8000";


// let occupancyChart = null;


// // ==================================================
// // LOAD OVERALL OCCUPANCY
// // ==================================================

// async function loadOccupancyAnalytics() {

//     try {

//         const response = await fetch(

//             `${ANALYTICS_API}/analytics/occupancy-summary`

//         );


//         if (!response.ok) {

//             throw new Error(

//                 `HTTP Error: ${response.status}`

//             );

//         }


//         const data =
//             await response.json();


//         console.log(

//             "Occupancy Summary:",

//             data

//         );


//         // Average occupancy

//         const averageOccupancy =
//             document.getElementById(
//                 "averageOccupancy"
//             );


//         if (averageOccupancy) {

//             averageOccupancy.innerText =

//                 `${data.average_occupancy}%`;

//         }



//         // Historical available slots

//         const historicalAvailable =
//             document.getElementById(
//                 "analyticsAvailableSlots"
//             );


//         if (historicalAvailable) {

//             historicalAvailable.innerText =

//                 Number(
//                     data.available_slots
//                 ).toLocaleString();

//         }

//     }

//     catch (error) {

//         console.error(

//             "Error loading occupancy analytics:",

//             error

//         );

//     }

// }



// // ==================================================
// // LOAD MOST + LEAST OCCUPIED ZONES
// // ==================================================

// async function loadZoneSummary() {

//     try {

//         const response = await fetch(

//             `${ANALYTICS_API}/analytics/zone-summary`

//         );


//         if (!response.ok) {

//             throw new Error(

//                 `HTTP Error: ${response.status}`

//             );

//         }


//         const data =
//             await response.json();


//         console.log(

//             "Zone Summary:",

//             data

//         );


//         // Most occupied zone

//         const mostZone =
//             document.getElementById(
//                 "mostOccupiedZone"
//             );


//         const mostPercentage =
//             document.getElementById(
//                 "mostOccupiedPercentage"
//             );


//         if (
//             mostZone &&
//             data.most_occupied
//         ) {

//             mostZone.innerText =

//                 data.most_occupied.zone;

//         }


//         if (
//             mostPercentage &&
//             data.most_occupied
//         ) {

//             mostPercentage.innerText =

//                 `${data.most_occupied.occupancy}% occupancy`;

//         }



//         // Least occupied zone

//         const leastZone =
//             document.getElementById(
//                 "leastOccupiedZone"
//             );


//         const leastPercentage =
//             document.getElementById(
//                 "leastOccupiedPercentage"
//             );


//         if (
//             leastZone &&
//             data.least_occupied
//         ) {

//             leastZone.innerText =

//                 data.least_occupied.zone;

//         }


//         if (
//             leastPercentage &&
//             data.least_occupied
//         ) {

//             leastPercentage.innerText =

//                 `${data.least_occupied.occupancy}% occupancy`;

//         }

//     }

//     catch (error) {

//         console.error(

//             "Error loading zone summary:",

//             error

//         );

//     }

// }



// // ==================================================
// // LOAD ZONE OCCUPANCY CHART
// // ==================================================

// async function loadOccupancyChart() {

//     try {

//         const response = await fetch(

//             `${ANALYTICS_API}/analytics/zone-occupancy`

//         );


//         if (!response.ok) {

//             throw new Error(

//                 `HTTP Error: ${response.status}`

//             );

//         }


//         const data =
//             await response.json();


//         console.log(

//             "Zone Occupancy:",

//             data

//         );


//         // Zone names

//         const zones =
//             data.map(

//                 item => item.zone

//             );


//         // Occupancy values

//         const occupancyValues =
//             data.map(

//                 item => item.avg_occupancy

//             );


//         const canvas =
//             document.getElementById(
//                 "occupancyChart"
//             );


//         if (!canvas) {

//             console.error(

//                 "occupancyChart element not found"

//             );

//             return;

//         }


//         const ctx =
//             canvas.getContext("2d");


//         // Destroy existing chart

//         if (occupancyChart) {

//             occupancyChart.destroy();

//         }


//         // Create chart

//         occupancyChart =
//             new Chart(

//                 ctx,

//                 {

//                     type: "bar",


//                     data: {

//                         labels: zones,


//                         datasets: [

//                             {

//                                 label:
//                                     "Average Occupancy %",

//                                 data:
//                                     occupancyValues,

//                                 borderWidth:
//                                     1,

//                                 borderRadius:
//                                     8

//                             }

//                         ]

//                     },


//                     options: {

//                         responsive: true,

//                         maintainAspectRatio: false,


//                         plugins: {

//                             legend: {

//                                 display: true,

//                                 position: "top"

//                             },


//                             tooltip: {

//                                 callbacks: {

//                                     label:
//                                         function(context) {

//                                             return (
//                                                 " Occupancy: " +
//                                                 context.raw +
//                                                 "%"
//                                             );

//                                         }

//                                 }

//                             }

//                         },


//                         scales: {

//                             y: {

//                                 beginAtZero: true,

//                                 max: 100,


//                                 ticks: {

//                                     callback:
//                                         function(value) {

//                                             return value + "%";

//                                         }

//                                 },


//                                 title: {

//                                     display: true,

//                                     text:
//                                         "Occupancy Percentage"

//                                 }

//                             },


//                             x: {

//                                 title: {

//                                     display: true,

//                                     text:
//                                         "Parking Zone"

//                                 }

//                             }

//                         }

//                     }

//                 }

//             );

//     }

//     catch (error) {

//         console.error(

//             "Error loading occupancy chart:",

//             error

//         );

//     }

// }



// // ==================================================
// // SIDEBAR MOBILE TOGGLE
// // ==================================================

// function setupSidebar() {

//     const menuButton =
//         document.getElementById(
//             "menuBtn"
//         );


//     const sidebar =
//         document.querySelector(
//             ".sidebar"
//         );


//     if (
//         menuButton &&
//         sidebar
//     ) {

//         menuButton.addEventListener(

//             "click",

//             function() {

//                 sidebar.classList.toggle(
//                     "show"
//                 );

//             }

//         );

//     }

// }




// document.addEventListener(

//     "DOMContentLoaded",

//     function() {


//         setupSidebar();


//         loadOccupancyAnalytics();


//         loadZoneSummary();


//         loadOccupancyChart();


//     }

// );



// async function loadPeakHourAnalysis() {

//     try {

//         const response =
//             await fetch(

//                 `${ANALYTICS_API}/admin/peak-hours`,

//                 {

//                     headers:
//                         analyticsHeaders()

//                 }

//             );


//         if (!response.ok) {

//             const error =
//                 await response.text();


//             console.error(
//                 "Peak Hour API Error:",
//                 response.status,
//                 error
//             );

//             return;

//         }


//         const data =
//             await response.json();


//         console.log(
//             "Peak Hour Data:",
//             data
//         );


//         updatePeakHourCards(
//             data
//         );


//         createPeakHourChart(
//             data
//         );


//     }

//     catch (error) {

//         console.error(
//             "Peak Hour Error:",
//             error
//         );

//     }

// }




// function updatePeakHourCards(data) {

//     if (
//         !Array.isArray(data) ||
//         data.length === 0
//     ) {

//         setAnalyticsText(
//             "peakEntryHour",
//             "-"
//         );


//         setAnalyticsText(
//             "peakExitHour",
//             "-"
//         );


//         setAnalyticsText(
//             "totalTraffic",
//             0
//         );


//         return;

//     }

//     const peakEntry =
//         data.reduce(

//             function (
//                 max,
//                 current
//             ) {

//                 return (
//                     Number(
//                         current.entry_count
//                     )
//                     >
//                     Number(
//                         max.entry_count
//                     )
//                 )

//                 ? current

//                 : max;

//             }

//         );

//     const peakExit =
//         data.reduce(

//             function (
//                 max,
//                 current
//             ) {

//                 return (
//                     Number(
//                         current.exit_count
//                     )
//                     >
//                     Number(
//                         max.exit_count
//                     )
//                 )

//                 ? current

//                 : max;

//             }

//         );

//     const totalEntries =
//         data.reduce(

//             function (
//                 total,
//                 item
//             ) {

//                 return (

//                     total +

//                     Number(
//                         item.entry_count ??
//                         0
//                     )

//                 );

//             },

//             0

//         );


//     const totalExits =
//         data.reduce(

//             function (
//                 total,
//                 item
//             ) {

//                 return (

//                     total +

//                     Number(
//                         item.exit_count ??
//                         0
//                     )

//                 );

//             },

//             0

//         );



    

//     setAnalyticsText(

//         "peakEntryHour",

//         formatHour(
//             peakEntry.hour
//         )

//     );


//     setAnalyticsText(

//         "peakEntryCount",

//         `${peakEntry.entry_count}
//          vehicles entered`

//     );


//     setAnalyticsText(

//         "peakExitHour",

//         formatHour(
//             peakExit.hour
//         )

//     );


//     setAnalyticsText(

//         "peakExitCount",

//         `${peakExit.exit_count}
//          vehicles exited`

//     );


//     setAnalyticsText(

//         "totalTraffic",

//         totalEntries +
//         totalExits

//     );

// }




// function createPeakHourChart(data) {

//     const canvas =
//         document.getElementById(
//             "peakHourChart"
//         );


//     if (!canvas) {

//         return;

//     }


//     const labels =
//         data.map(

//             item =>
//                 formatHour(
//                     item.hour
//                 )

//         );


//     const entryCounts =
//         data.map(

//             item =>
//                 Number(
//                     item.entry_count ??
//                     0
//                 )

//         );


//     const exitCounts =
//         data.map(

//             item =>
//                 Number(
//                     item.exit_count ??
//                     0
//                 )

//         );


//     if (peakHourChart) {

//         peakHourChart.destroy();

//     }


//     peakHourChart =
//         new Chart(

//             canvas,

//             {

//                 type: "line",


//                 data: {

//                     labels:
//                         labels,


//                     datasets: [

//                         {

//                             label:
//                                 "Vehicle Entries",

//                             data:
//                                 entryCounts,

//                             borderColor:
//                                 "#16a34a",

//                             backgroundColor:
//                                 "rgba(22,163,74,0.10)",

//                             borderWidth:
//                                 3,

//                             pointRadius:
//                                 4,

//                             pointHoverRadius:
//                                 7,

//                             tension:
//                                 0.35,

//                             fill:
//                                 true

//                         },


//                         {

//                             label:
//                                 "Vehicle Exits",

//                             data:
//                                 exitCounts,

//                             borderColor:
//                                 "#dc2626",

//                             backgroundColor:
//                                 "rgba(220,38,38,0.08)",

//                             borderWidth:
//                                 3,

//                             pointRadius:
//                                 4,

//                             pointHoverRadius:
//                                 7,

//                             tension:
//                                 0.35,

//                             fill:
//                                 true

//                         }

//                     ]

//                 },


//                 options: {

//                     responsive:
//                         true,

//                     maintainAspectRatio:
//                         false,


//                     interaction: {

//                         mode:
//                             "index",

//                         intersect:
//                             false

//                     },


//                     plugins: {

//                         legend: {

//                             position:
//                                 "top"

//                         },


//                         tooltip: {

//                             callbacks: {

//                                 label:
//                                     function (
//                                         context
//                                     ) {

//                                         return (
//                                             context
//                                                 .dataset
//                                                 .label
//                                             +
//                                             ": "
//                                             +
//                                             context.raw
//                                             +
//                                             " vehicles"
//                                         );

//                                     }

//                             }

//                         }

//                     },


//                     scales: {

//                         y: {

//                             beginAtZero:
//                                 true,


//                             ticks: {

//                                 precision:
//                                     0

//                             },


//                             title: {

//                                 display:
//                                     true,

//                                 text:
//                                     "Number of Vehicles"

//                             }

//                         },


//                         x: {

//                             title: {

//                                 display:
//                                     true,

//                                 text:
//                                     "Time of Day"

//                             }

//                         }

//                     }

//                 }

//             }

//         );

// }





// async function loadBusiestDay() {

//     try {

//         const response =
//             await fetch(

//                 `${ANALYTICS_API}/admin/peak-days`,

//                 {

//                     headers:
//                         analyticsHeaders()

//                 }

//             );


//         if (!response.ok) {

//             console.error(
//                 "Peak Days API Error:",
//                 response.status
//             );

//             return;

//         }


//         const data =
//             await response.json();


//         console.log(
//             "Peak Days:",
//             data
//         );


//         if (
//             !Array.isArray(data) ||
//             data.length === 0
//         ) {

//             setAnalyticsText(
//                 "busiestDay",
//                 "-"
//             );


//             setAnalyticsText(
//                 "busiestDayCount",
//                 "0 vehicles"
//             );


//             return;

//         }


//         const busiest =
//             data.reduce(

//                 function (
//                     max,
//                     current
//                 ) {

//                     return (
//                         Number(
//                             current.count
//                         )
//                         >
//                         Number(
//                             max.count
//                         )
//                     )

//                     ? current

//                     : max;

//                 }

//             );


//         setAnalyticsText(

//             "busiestDay",

//             busiest.day

//         );


//         setAnalyticsText(

//             "busiestDayCount",

//             `${busiest.count}
//              vehicles`

//         );


//     }

//     catch (error) {

//         console.error(
//             "Busiest Day Error:",
//             error
//         );

//     }

// }




// function setAnalyticsText(
//     id,
//     value
// ) {

//     const element =
//         document.getElementById(id);


//     if (element) {

//         element.textContent =
//             value;

//     }

// }




// document.addEventListener(
//     "DOMContentLoaded",
//     function () {

//         setupSidebar();

//         loadOccupancyAnalytics();

//         loadZoneSummary();

//         loadOccupancyChart();

//         loadPeakHourAnalysis();

//         loadBusiestDay();

//     }
// );

// ==================================================
// ANALYTICS API
// ==================================================

// const ANALYTICS_API = "http://127.0.0.1:8000";
const ANALYTICS_API = " https://smart-parking-system-tz4z.onrender.com";



// ==================================================
// CHART VARIABLES
// ==================================================

let occupancyChart = null;

let peakHourChart = null;


// ==================================================
// AUTH HEADERS
// ==================================================
function getAdminToken() {

    const token =
        sessionStorage.getItem("access_token");

    if (!token) {

        console.error(
            "access_token not found in sessionStorage"
        );

        return null;
    }

    return token;
}


function analyticsHeaders() {

    const token =
        getAdminToken();


    console.log(
        "Analytics token exists:",
        !!token
    );


    if (!token) {

        return {
            "Accept":
                "application/json",

            "Content-Type":
                "application/json"
        };
    }


    return {

        "Authorization":
            `Bearer ${token}`,

        "Accept":
            "application/json",

        "Content-Type":
            "application/json"

    };
}


// ==================================================
// FORMAT HOUR
// 0  -> 12 AM
// 8  -> 8 AM
// 13 -> 1 PM
// 18 -> 6 PM
// ==================================================

function formatHour(hour) {

    hour = Number(hour);

    const suffix =
        hour >= 12
            ? "PM"
            : "AM";

    let formattedHour =
        hour % 12;

    if (formattedHour === 0) {

        formattedHour = 12;

    }

    return `${formattedHour} ${suffix}`;
}


// ==================================================
// SAFE SET TEXT
// ==================================================

function setAnalyticsText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }
}


// ==================================================
// LOAD OVERALL OCCUPANCY
// ==================================================

async function loadOccupancyAnalytics() {

    try {

        const response = await fetch(

            `${ANALYTICS_API}/analytics/occupancy-summary`

        );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Occupancy Summary:",
            data
        );


        // Average occupancy

        const averageOccupancy =
            document.getElementById(
                "averageOccupancy"
            );


        if (averageOccupancy) {

            averageOccupancy.innerText =
                `${data.average_occupancy}%`;

        }


        // Historical available slots

        const historicalAvailable =
            document.getElementById(
                "analyticsAvailableSlots"
            );


        if (historicalAvailable) {

            historicalAvailable.innerText =
                Number(
                    data.available_slots
                ).toLocaleString();

        }

    }

    catch (error) {

        console.error(
            "Error loading occupancy analytics:",
            error
        );

    }

}


// ==================================================
// LOAD MOST + LEAST OCCUPIED ZONES
// ==================================================

async function loadZoneSummary() {

    try {

        const response = await fetch(

            `${ANALYTICS_API}/analytics/zone-summary`

        );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Zone Summary:",
            data
        );


        // Most Occupied

        const mostZone =
            document.getElementById(
                "mostOccupiedZone"
            );


        const mostPercentage =
            document.getElementById(
                "mostOccupiedPercentage"
            );


        if (
            mostZone &&
            data.most_occupied
        ) {

            mostZone.innerText =
                data.most_occupied.zone;

        }


        if (
            mostPercentage &&
            data.most_occupied
        ) {

            mostPercentage.innerText =
                `${data.most_occupied.occupancy}% occupancy`;

        }


        // Least Occupied

        const leastZone =
            document.getElementById(
                "leastOccupiedZone"
            );


        const leastPercentage =
            document.getElementById(
                "leastOccupiedPercentage"
            );


        if (
            leastZone &&
            data.least_occupied
        ) {

            leastZone.innerText =
                data.least_occupied.zone;

        }


        if (
            leastPercentage &&
            data.least_occupied
        ) {

            leastPercentage.innerText =
                `${data.least_occupied.occupancy}% occupancy`;

        }

    }

    catch (error) {

        console.error(
            "Error loading zone summary:",
            error
        );

    }

}


// ==================================================
// LOAD OCCUPANCY CHART
// ==================================================

async function loadOccupancyChart() {

    try {

        const response = await fetch(

            `${ANALYTICS_API}/analytics/zone-occupancy`

        );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Zone Occupancy:",
            data
        );


        const zones =
            data.map(
                item => item.zone
            );


        const occupancyValues =
            data.map(
                item => item.avg_occupancy
            );


        const canvas =
            document.getElementById(
                "occupancyChart"
            );


        if (!canvas) {

            console.error(
                "occupancyChart element not found"
            );

            return;

        }


        const ctx =
            canvas.getContext("2d");


        if (occupancyChart) {

            occupancyChart.destroy();

        }


        occupancyChart =
            new Chart(

                ctx,

                {

                    type: "bar",

                    data: {

                        labels: zones,

                        datasets: [

                            {

                                label:
                                    "Average Occupancy %",

                                data:
                                    occupancyValues,

                                backgroundColor:
                                    "#2563eb",

                                borderWidth:
                                    1,

                                borderRadius:
                                    8

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        plugins: {

                            legend: {

                                display: true,

                                position: "top"

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(context) {

                                            return (
                                                "Occupancy: " +
                                                context.raw +
                                                "%"
                                            );

                                        }

                                }

                            }

                        },


                        scales: {

                            y: {

                                beginAtZero: true,

                                max: 100,


                                ticks: {

                                    callback:
                                        function(value) {

                                            return value + "%";

                                        }

                                },


                                title: {

                                    display: true,

                                    text:
                                        "Occupancy Percentage"

                                }

                            },


                            x: {

                                title: {

                                    display: true,

                                    text:
                                        "Parking Zone"

                                }

                            }

                        }

                    }

                }

            );

    }

    catch (error) {

        console.error(
            "Error loading occupancy chart:",
            error
        );

    }

}

function displayPeakHourAnalysis(data) {

    console.log(
        "Displaying Peak Hour Data:",
        data
    );

    if (!Array.isArray(data) || data.length === 0) {

        console.warn(
            "No Peak Hour data available"
        );

        return;
    }


    // =========================================
    // NORMALIZE BACKEND DATA
    // =========================================

    const hourlyData = data.map(item => {

        return {

            hour:
                Number(item.hour ?? 0),

            label:
                item.label ??
                `${String(item.hour ?? 0).padStart(2, "0")}:00`,

            entries:
                Number(
                    item.entries ??
                    item.entry_count ??
                    0
                ),

            exits:
                Number(
                    item.exits ??
                    item.exit_count ??
                    0
                )
        };
    });


    console.log(
        "Normalized Peak Hour Data:",
        hourlyData
    );


    // =========================================
    // FIND PEAK ENTRY HOUR
    // =========================================

    const peakEntry = hourlyData.reduce(
        (max, item) => {

            return item.entries > max.entries
                ? item
                : max;
        },
        hourlyData[0]
    );


    // =========================================
    // FIND PEAK EXIT HOUR
    // =========================================

    const peakExit = hourlyData.reduce(
        (max, item) => {

            return item.exits > max.exits
                ? item
                : max;
        },
        hourlyData[0]
    );


    console.log(
        "Peak Entry:",
        peakEntry
    );

    console.log(
        "Peak Exit:",
        peakExit
    );


    // =========================================
    // TOTAL TRAFFIC
    // =========================================

    const totalEntries =
        hourlyData.reduce(
            (sum, item) =>
                sum + item.entries,
            0
        );

    const totalExits =
        hourlyData.reduce(
            (sum, item) =>
                sum + item.exits,
            0
        );

    const totalTraffic =
        totalEntries + totalExits;


    console.log(
        "Total Entries:",
        totalEntries
    );

    console.log(
        "Total Exits:",
        totalExits
    );

    console.log(
        "Total Traffic:",
        totalTraffic
    );


    // =========================================
    // UPDATE PEAK ENTRY CARD
    // =========================================

    const peakEntryHour =
        document.getElementById(
            "peakEntryHour"
        );

    const peakEntryCount =
        document.getElementById(
            "peakEntryCount"
        );


    if (peakEntryHour) {

        peakEntryHour.textContent =
            peakEntry.label;
    }
    else {

        console.warn(
            "HTML id peakEntryHour not found"
        );
    }


    if (peakEntryCount) {

        peakEntryCount.textContent =
            `${peakEntry.entries} vehicles entered`;
    }
    else {

        console.warn(
            "HTML id peakEntryCount not found"
        );
    }


    // =========================================
    // UPDATE PEAK EXIT CARD
    // =========================================

    const peakExitHour =
        document.getElementById(
            "peakExitHour"
        );

    const peakExitCount =
        document.getElementById(
            "peakExitCount"
        );


    if (peakExitHour) {

        peakExitHour.textContent =
            peakExit.label;
    }
    else {

        console.warn(
            "HTML id peakExitHour not found"
        );
    }


    if (peakExitCount) {

        peakExitCount.textContent =
            `${peakExit.exits} vehicles exited`;
    }
    else {

        console.warn(
            "HTML id peakExitCount not found"
        );
    }


    // =========================================
    // UPDATE TOTAL TRAFFIC
    // =========================================

    const totalTrafficElement =
        document.getElementById(
            "totalTraffic"
        );


    if (totalTrafficElement) {

        totalTrafficElement.textContent =
            totalTraffic;
    }
    else {

        console.warn(
            "HTML id totalTraffic not found"
        );
    }


    // =========================================
    // CREATE CHART
    // =========================================

    renderPeakHourChart(hourlyData);
}

function renderPeakHourChart(data) {

    const canvas =
        document.getElementById(
            "peakHourChart"
        );


    if (!canvas) {

        console.error(
            "peakHourChart canvas not found in HTML"
        );

        return;
    }


    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded"
        );

        return;
    }


    const labels =
        data.map(item =>
            item.label
        );


    const entryValues =
        data.map(item =>
            item.entries
        );


    const exitValues =
        data.map(item =>
            item.exits
        );


    console.log(
        "Chart Labels:",
        labels
    );

    console.log(
        "Entry Values:",
        entryValues
    );

    console.log(
        "Exit Values:",
        exitValues
    );


    // Destroy old chart
    if (peakHourChartInstance) {

        peakHourChartInstance.destroy();
    }


    peakHourChartInstance =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label:
                                "Entries",

                            data:
                                entryValues,

                            borderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false
                        },

                        {
                            label:
                                "Exits",

                            data:
                                exitValues,

                            borderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false
                        }
                    ]
                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false
                    },

                    plugins: {

                        legend: {

                            display:
                                true,

                            position:
                                "top"
                        }
                    },

                    scales: {

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Hour"
                            }
                        },

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0
                            },

                            title: {

                                display:
                                    true,

                                text:
                                    "Number of Vehicles"
                            }
                        }
                    }
                }
            }
        );
}


// ==================================================
// PEAK HOUR ANALYSIS
// ==================================================

let peakHourChartInstance = null;


async function loadPeakHourAnalysis() {

    const token = getAdminToken();

    if (!token) {
        console.error(
            "Cannot load Peak Hours: token missing"
        );
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/admin/peak-hours",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(
            "Peak Hour API Status:",
            response.status
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Peak Hour API Error:",
                response.status,
                errorText
            );

            return;
        }

        const data = await response.json();

        console.log(
            "Peak Hour Data:",
            data
        );

        // IMPORTANT
        displayPeakHourAnalysis(data);

    } catch (error) {

        console.error(
            "Peak Hour Error:",
            error
        );
    }
}

// ==================================================
// UPDATE PEAK HOUR CARDS
// ==================================================

function updatePeakHourCards(data) {

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        console.log(
            "No Peak Hour Data"
        );


        setAnalyticsText(
            "peakEntryHour",
            "-"
        );


        setAnalyticsText(
            "peakEntryCount",
            "0 vehicles entered"
        );


        setAnalyticsText(
            "peakExitHour",
            "-"
        );


        setAnalyticsText(
            "peakExitCount",
            "0 vehicles exited"
        );


        setAnalyticsText(
            "totalTraffic",
            0
        );


        return;

    }


    // ==========================================
    // PEAK ENTRY
    // ==========================================

    const peakEntry =
        data.reduce(

            function(max, current) {

                return (

                    Number(
                        current.entry_count
                    )

                    >

                    Number(
                        max.entry_count
                    )

                )

                    ? current

                    : max;

            }

        );


    // ==========================================
    // PEAK EXIT
    // ==========================================

    const peakExit =
        data.reduce(

            function(max, current) {

                return (

                    Number(
                        current.exit_count
                    )

                    >

                    Number(
                        max.exit_count
                    )

                )

                    ? current

                    : max;

            }

        );


    // ==========================================
    // TOTAL ENTRIES
    // ==========================================

    const totalEntries =
        data.reduce(

            function(total, item) {

                return (

                    total +

                    Number(
                        item.entry_count || 0
                    )

                );

            },

            0

        );


    // ==========================================
    // TOTAL EXITS
    // ==========================================

    const totalExits =
        data.reduce(

            function(total, item) {

                return (

                    total +

                    Number(
                        item.exit_count || 0
                    )

                );

            },

            0

        );


    // ==========================================
    // DISPLAY VALUES
    // ==========================================

    setAnalyticsText(

        "peakEntryHour",

        formatHour(
            peakEntry.hour
        )

    );


    setAnalyticsText(

        "peakEntryCount",

        `${peakEntry.entry_count} vehicles entered`

    );


    setAnalyticsText(

        "peakExitHour",

        formatHour(
            peakExit.hour
        )

    );


    setAnalyticsText(

        "peakExitCount",

        `${peakExit.exit_count} vehicles exited`

    );


    setAnalyticsText(

        "totalTraffic",

        totalEntries +
        totalExits

    );


    console.log(
        "Peak Entry:",
        peakEntry
    );


    console.log(
        "Peak Exit:",
        peakExit
    );

}


// ==================================================
// CREATE PEAK HOUR CHART
// ==================================================

function createPeakHourChart(data) {

    const canvas =
        document.getElementById(
            "peakHourChart"
        );


    if (!canvas) {

        console.error(
            "peakHourChart element not found"
        );

        return;

    }


    const ctx =
        canvas.getContext("2d");


    // Hour labels

    const labels =
        data.map(

            item =>
                formatHour(
                    item.hour
                )

        );


    // Entries

    const entryCounts =
        data.map(

            item =>
                Number(
                    item.entry_count || 0
                )

        );


    // Exits

    const exitCounts =
        data.map(

            item =>
                Number(
                    item.exit_count || 0
                )

        );


    console.log(
        "Peak Chart Labels:",
        labels
    );


    console.log(
        "Entry Counts:",
        entryCounts
    );


    console.log(
        "Exit Counts:",
        exitCounts
    );


    if (peakHourChart) {

        peakHourChart.destroy();

    }


    peakHourChart =
        new Chart(

            ctx,

            {

                type: "line",


                data: {

                    labels: labels,


                    datasets: [

                        {

                            label:
                                "Vehicle Entries",

                            data:
                                entryCounts,

                            borderColor:
                                "#16a34a",

                            backgroundColor:
                                "rgba(22,163,74,0.10)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                7,

                            tension:
                                0.35,

                            fill:
                                true

                        },


                        {

                            label:
                                "Vehicle Exits",

                            data:
                                exitCounts,

                            borderColor:
                                "#dc2626",

                            backgroundColor:
                                "rgba(220,38,38,0.08)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                7,

                            tension:
                                0.35,

                            fill:
                                true

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    plugins: {

                        legend: {

                            display: true,

                            position:
                                "top"

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (

                                            context
                                                .dataset
                                                .label

                                            +

                                            ": "

                                            +

                                            context.raw

                                            +

                                            " vehicles"

                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                true,


                            ticks: {

                                precision:
                                    0

                            },


                            title: {

                                display:
                                    true,

                                text:
                                    "Number of Vehicles"

                            }

                        },


                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Time of Day"

                            }

                        }

                    }

                }

            }

        );


    console.log(
        "Peak Hour Chart Created Successfully"
    );

}


function displayPeakDays(data) {

    console.log("Displaying Peak Days:", data);

    if (!Array.isArray(data) || data.length === 0) {
        console.log("No Peak Days data available");
        return;
    }

    // Find busiest day
    const busiestDay = data.reduce((max, item) => {
        return item.count > max.count ? item : max;
    });

    console.log("Busiest Day:", busiestDay);

    // Show text values if these elements exist
    const dayElement =
        document.getElementById("busiestDay");

    const countElement =
        document.getElementById("busiestDayCount");

    if (dayElement) {
        dayElement.textContent =
            busiestDay.day;
    }

    if (countElement) {
        countElement.textContent =
            `${busiestDay.count} reservations`;
    }
}

// ==================================================
// BUSIEST DAY
// ==================================================


async function loadBusiestDay() {

    const token = getAdminToken();

    if (!token) {

        console.error(
            "Cannot load Peak Days: token missing"
        );

        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/admin/peak-days",
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );

        console.log(
            "Peak Days API Status:",
            response.status
        );

        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Peak Days API Error:",
                response.status,
                error
            );

            return;
        }

        const data =
            await response.json();

        console.log(
            "Peak Days Data:",
            data
        );

        displayPeakDays(data);

    } catch (error) {

        console.error(
            "Peak Days Error:",
            error
        );
    }
}
// ==================================================
// SIDEBAR MOBILE TOGGLE
// ==================================================

function setupSidebar() {

    const menuButton =
        document.getElementById(
            "menuBtn"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        menuButton &&
        sidebar
    ) {

        menuButton.addEventListener(

            "click",

            function() {

                sidebar.classList.toggle(
                    "show"
                );

            }

        );

    }

}


// ==================================================
// LOAD ALL ANALYTICS
// ==================================================

document.addEventListener(

    "DOMContentLoaded",

    function() {


        console.log(
            "Admin Analytics JS Loaded"
        );


        setupSidebar();


        // Occupancy

        loadOccupancyAnalytics();

        loadZoneSummary();

        loadOccupancyChart();


        // Peak Hour

        loadPeakHourAnalysis();

        loadBusiestDay();
        connectAnalyticsWebSocket();


    }

);

// 
let analyticsSocket = null;
let analyticsReconnectTimer = null;


function connectAnalyticsWebSocket() {

    analyticsSocket =
        new WebSocket(
            "ws://127.0.0.1:8000/analytics/ws"
        );


    analyticsSocket.onopen =
        function () {

            console.log(
                "Analytics WebSocket connected"
            );
        };


    analyticsSocket.onmessage =
        function (event) {

            console.log(
                "Analytics WebSocket message:",
                event.data
            );


            let message = event.data;


            try {

                message =
                    JSON.parse(event.data);

            } catch (error) {

                // Keep message as string
            }


            const eventName =
                typeof message === "object"
                    ? message.event
                    : message;


            if (
                eventName === "analytics_updated" ||
                eventName === "reservation_created" ||
                eventName === "parking_status_updated"
            ) {

                console.log(
                    "Reloading analytics..."
                );

                refreshAdminAnalytics();
            }
        };


    analyticsSocket.onclose =
        function () {

            console.log(
                "Analytics WebSocket disconnected"
            );

            analyticsReconnectTimer =
                setTimeout(
                    connectAnalyticsWebSocket,
                    3000
                );
        };


    analyticsSocket.onerror =
        function (error) {

            console.error(
                "Analytics WebSocket error:",
                error
            );
        };
}