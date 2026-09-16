import pandas as pd


CSV_FILE = "app/data/smart_parking_usage_occupancy_analytics.csv"


def load_occupancy_data():

    # Read CSV
    df = pd.read_csv(CSV_FILE)

    # -------------------------------------------------
    # DATA CLEANING
    # -------------------------------------------------

    # Remove rows where total slots are 0
    df = df[df["total_slots"] > 0]

    # Remove negative occupied slots
    df = df[df["occupied_slots"] >= 0]

    # Important:
    # occupied slots cannot be greater than total slots
    df = df[
        df["occupied_slots"] <= df["total_slots"]
    ]

    # -------------------------------------------------
    # CREATE NEW COLUMNS
    # -------------------------------------------------

    # Calculate occupancy percentage
    df["occupancy_rate"] = (
        df["occupied_slots"]
        / df["total_slots"]
        * 100
    )

    # Calculate available slots
    df["available_slots"] = (
        df["total_slots"]
        - df["occupied_slots"]
    )

    return df


def get_occupancy_summary():

    df = load_occupancy_data()

    average_occupancy = round(
        df["occupancy_rate"].mean(),
        2
    )

    total_slots = int(
        df["total_slots"].sum()
    )

    occupied_slots = int(
        df["occupied_slots"].sum()
    )

    available_slots = int(
        df["available_slots"].sum()
    )

    return {

        "average_occupancy": average_occupancy,

        "total_slots": total_slots,

        "occupied_slots": occupied_slots,

        "available_slots": available_slots
    }

def get_zone_occupancy():

    df = load_occupancy_data()

    zone_data = (
        df.groupby("zone")
        .agg(
            avg_occupancy=(
                "occupancy_rate",
                "mean"
            ),

            avg_available_slots=(
                "available_slots",
                "mean"
            )
        )
        .reset_index()
    )

    zone_data["avg_occupancy"] = (
        zone_data["avg_occupancy"]
        .round(2)
    )

    zone_data["avg_available_slots"] = (
        zone_data["avg_available_slots"]
        .round(2)
    )

    return zone_data.to_dict(
        orient="records"
    )

def get_zone_summary():

    df = load_occupancy_data()

    zone_data = (
        df.groupby("zone")["occupancy_rate"]
        .mean()
        .reset_index()
    )

    most_occupied = zone_data.loc[
        zone_data["occupancy_rate"].idxmax()
    ]

    least_occupied = zone_data.loc[
        zone_data["occupancy_rate"].idxmin()
    ]

    return {

        "most_occupied_zone": {
            "zone": most_occupied["zone"],
            "occupancy": round(
                most_occupied["occupancy_rate"],
                2
            )
        },

        "least_occupied_zone": {
            "zone": least_occupied["zone"],
            "occupancy": round(
                least_occupied["occupancy_rate"],
                2
            )
        }
    }