from app import models


def get_parking_slot_counts(
    db,
    parking_id: int
):

    slots = (
        db.query(models.ParkingSlot)
        .filter(
            models.ParkingSlot.parking_id == parking_id
        )
        .all()
    )

    total_slots = len(slots)

    available_slots = sum(
        1
        for slot in slots
        if slot.status == "Available"
    )

    reserved_slots = sum(
        1
        for slot in slots
        if slot.status == "Reserved"
    )

    occupied_slots = sum(
        1
        for slot in slots
        if slot.status == "Occupied"
    )

    maintenance_slots = sum(
        1
        for slot in slots
        if slot.status == "Maintenance"
    )

    return {
        "parking_id": parking_id,
        "total_slots": total_slots,
        "available_slots": available_slots,
        "reserved_slots": reserved_slots,
        "occupied_slots": occupied_slots,
        "maintenance_slots": maintenance_slots
    }