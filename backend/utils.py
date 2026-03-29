import os
import csv

# Log directory
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def parse_packet(data):
    parts = data.split("|")

    # Must have at least node_id and counter
    if len(parts) < 2:
        return None

    node_id = parts[0]

    try:
        counter = int(parts[1])
    except ValueError:
        return None

    sensor_data = {}

    # Parse key:value pairs
    for item in parts[2:]:
        if ":" not in item:
            continue  # skip invalid field

        key, value = item.split(":", 1)

        try:
            sensor_data[key] = float(value)
        except ValueError:
            continue  # skip bad values

    return node_id, counter, sensor_data


def log_data(timestamp, node_id, counter, sensors, rssi, snr):
    date_str = timestamp.split(" ")[0]  # YYYY-MM-DD
    filename = os.path.join(LOG_DIR, f"{date_str}.csv")

    file_exists = os.path.isfile(filename)

    with open(filename, "a", newline="") as f:
        writer = csv.writer(f)

        # Write header only if file is new
        if not file_exists:
            writer.writerow(["timestamp", "node", "counter", "sensors", "rssi", "snr"])

        # Convert sensor dict to string
        sensor_str = ";".join([f"{k}:{v}" for k, v in sensors.items()])

        writer.writerow([timestamp, node_id, counter, sensor_str, rssi, snr])
