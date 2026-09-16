const params = new URLSearchParams(window.location.search);

const parkingId = params.get("parking_id");

window.onload = function(){

    loadParking();

    loadSlots();

}
async function loadParking(){

    const response = await fetch(

        `http://127.0.0.1:8000/parking/${parkingId}`

    );

    const parking = await response.json();

    document.getElementById("parkingName").innerHTML = parking.parking_name;

    document.getElementById("parkingLocation").innerHTML =

    parking.area + ", " + parking.city;

    document.getElementById("totalSlots").innerHTML =

    parking.total_slots;

}
async function loadSlots(){

    const response = await fetch(

        `http://127.0.0.1:8000/parking/${parkingId}/slots`

    );

    const slots = await response.json();

    console.log(slots);

    displaySlots(slots);

}
function displaySlots(slots){

    const container = document.getElementById("slotContainer");

    container.innerHTML="";

    let available=0;

    let occupied=0;

    let reserved=0;

    slots.forEach(slot=>{

        let color="green";

        if(slot.status=="Occupied"){

            color="red";

            occupied++;

        }

        else if(slot.status=="Reserved"){

            color="orange";

            reserved++;

        }

        else{

            available++;

        }

        container.innerHTML+=`

        <div

        class="slot"

        style="background:${color}">

        ${slot.slot_number}

        </div>

        `;

    });

    document.getElementById("availableCount").innerHTML=available;

    document.getElementById("occupiedCount").innerHTML=occupied;

    document.getElementById("reservedCount").innerHTML=reserved;

}