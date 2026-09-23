from pathlib import Path

import pandas as pd


CSV_FILE = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "smart_parking_usage_occupancy_analytics.csv"
)

REQUIRED_OCCUPANCY_COLUMNS = {
    "zone",
    "date_time",
    "total_slots",
    "occupied_slots",
}


def process_occupancy_dataset():
    """Return a cleaned copy of the historical occupancy dataset.

    The source CSV is read-only. All normalization and calculated columns are
    applied to an in-memory copy used only by the occupancy analytics routes.
    """
    raw_data = pd.read_csv(CSV_FILE)
    missing_columns = REQUIRED_OCCUPANCY_COLUMNS.difference(raw_data.columns)

    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Occupancy dataset is missing columns: {missing}")

    cleaned_data = raw_data.copy(deep=True)

    # Remove empty and duplicate source records before normalizing values.
    cleaned_data = cleaned_data.dropna(how="all").drop_duplicates()

    cleaned_data["zone"] = (
        cleaned_data["zone"]
        .astype("string")
        .str.strip()
        .str.replace(r"\s+", " ", regex=True)
        .str.title()
    )
    cleaned_data["zone"] = cleaned_data["zone"].replace("", pd.NA)

    cleaned_data["date_time"] = pd.to_datetime(
        cleaned_data["date_time"],
        errors="coerce",
        dayfirst=True,
    )

    numeric_columns = ["total_slots", "occupied_slots"]
    if "available_slots" in cleaned_data.columns:
        numeric_columns.append("available_slots")

    for column in numeric_columns:
        cleaned_data[column] = pd.to_numeric(
            cleaned_data[column],
            errors="coerce",
        )

    # These fields are required to produce a valid historical observation.
    cleaned_data = cleaned_data.dropna(
        subset=[
            "zone",
            "date_time",
            "total_slots",
            "occupied_slots",
        ]
    )

    cleaned_data = cleaned_data[
        (cleaned_data["total_slots"] > 0)
        & (cleaned_data["occupied_slots"] >= 0)
        & (
            cleaned_data["occupied_slots"]
            <= cleaned_data["total_slots"]
        )
    ].copy()

    # Availability is derived from the validated slot counts so it cannot be
    # stale or disagree with the occupancy percentage.
    cleaned_data["available_slots"] = (
        cleaned_data["total_slots"]
        - cleaned_data["occupied_slots"]
    )
    cleaned_data["occupancy_percentage"] = (
        cleaned_data["occupied_slots"]
        / cleaned_data["total_slots"]
        * 100
    )

    cleaned_data = cleaned_data[
        cleaned_data["occupancy_percentage"].between(0, 100)
    ].drop_duplicates()

    return cleaned_data.reset_index(drop=True)


def load_occupancy_data():
    """Backward-compatible name used by the existing analytics functions."""
    return process_occupancy_dataset()


def calculate_zone_occupancy(cleaned_data):
    if cleaned_data.empty:
        return pd.DataFrame(
            columns=[
                "zone",
                "records",
                "total_slots",
                "occupied_slots",
                "available_slots",
                "occupancy_percentage",
                "avg_occupancy",
                "avg_available_slots",
            ]
        )

    zone_data = (
        cleaned_data.groupby("zone", as_index=False)
        .agg(
            records=("zone", "size"),
            total_slots=("total_slots", "sum"),
            occupied_slots=("occupied_slots", "sum"),
            available_slots=("available_slots", "sum"),
            avg_available_slots=("available_slots", "mean"),
        )
    )

    # Capacity-weighted occupancy: SUM(occupied) / SUM(total). This avoids
    # giving a small parking record the same influence as a large one.
    zone_data["occupancy_percentage"] = (
        zone_data["occupied_slots"]
        / zone_data["total_slots"]
        * 100
    )

    # Keep the existing response field as a compatibility alias while using
    # the corrected weighted value everywhere.
    zone_data["avg_occupancy"] = zone_data["occupancy_percentage"]
    zone_data[[
        "occupancy_percentage",
        "avg_occupancy",
        "avg_available_slots",
    ]] = zone_data[[
        "occupancy_percentage",
        "avg_occupancy",
        "avg_available_slots",
    ]].round(2)

    zone_data = zone_data.sort_values(
        "occupancy_percentage",
        ascending=False,
    ).reset_index(drop=True)

    return zone_data


def get_occupancy_summary():
    cleaned_data = load_occupancy_data()

    if cleaned_data.empty:
        return {
            "average_occupancy": 0,
            "total_slots": 0,
            "occupied_slots": 0,
            "available_slots": 0,
        }

    return {
        "average_occupancy": round(
            float(
                cleaned_data["occupied_slots"].sum()
                / cleaned_data["total_slots"].sum()
                * 100
            ),
            2,
        ),
        "total_slots": int(cleaned_data["total_slots"].sum()),
        "occupied_slots": int(cleaned_data["occupied_slots"].sum()),
        "available_slots": int(cleaned_data["available_slots"].sum()),
    }


def get_zone_occupancy():
    zone_data = calculate_zone_occupancy(load_occupancy_data())
    return zone_data.to_dict(orient="records")


def get_zone_summary():
    zone_data = calculate_zone_occupancy(load_occupancy_data())

    if zone_data.empty:
        return {
            "most_occupied_zone": None,
            "least_occupied_zone": None,
        }

    most_occupied = zone_data.loc[
        zone_data["occupancy_percentage"].idxmax()
    ]
    least_occupied = zone_data.loc[
        zone_data["occupancy_percentage"].idxmin()
    ]

    return {
        "most_occupied_zone": {
            "zone": most_occupied["zone"],
            "occupancy": round(
                float(most_occupied["occupancy_percentage"]),
                2,
            ),
        },
        "least_occupied_zone": {
            "zone": least_occupied["zone"],
            "occupancy": round(
                float(least_occupied["occupancy_percentage"]),
                2,
            ),
        },
    }
