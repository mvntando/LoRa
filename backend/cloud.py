import requests

# ThingSpeak config 
THINGSPEAK_API_KEY = "CU6XWNWQPB6M4BDG"
THINGSPEAK_URL = "https://api.thingspeak.com/update"

# Map Node IDs to ThingSpeak fields
NODE_FIELD_MAP = {
    "node1": {"t": "field1", "h": "field2", "p": "field3", "b": "field4"},
    "node2": {"t": "field5", "h": "field6", "p": "field7", "b": "field8"}
}

def send_to_thingspeak(node_id, sensors):
    if not sensors or node_id not in NODE_FIELD_MAP:
        return False

    payload = {"api_key": THINGSPEAK_API_KEY}
    mapping = NODE_FIELD_MAP[node_id]

    for key, value in sensors.items():
        if key in mapping:
            payload[mapping[key]] = value

    try:
        r = requests.get(THINGSPEAK_URL, params=payload, timeout=5)
        if r.status_code != 200:
            print(f"ThingSpeak send failed: {r.status_code}")
    except Exception as e:
        print(f"ThingSpeak send failed: {e}")


def send_both_nodes(node1_sensors, node2_sensors):
    payload = {"api_key": THINGSPEAK_API_KEY}

    NODE_FIELD_MAP = {
        "node1": {"t": "field1", "h": "field2", "p": "field3", "b": "field4"},
        "node2": {"t": "field5", "h": "field6", "p": "field7", "b": "field8"}
    }

    # Node 1 data
    for key, value in node1_sensors.items():
        if key in NODE_FIELD_MAP["node1"]:
            payload[NODE_FIELD_MAP["node1"][key]] = value

    # Node 2 data
    for key, value in node2_sensors.items():
        if key in NODE_FIELD_MAP["node2"]:
            payload[NODE_FIELD_MAP["node2"][key]] = value

    try:
        r = requests.get(THINGSPEAK_URL, params=payload, timeout=5)
        if r.status_code != 200:
            print(f"ThingSpeak send failed: {r.status_code}")
    except Exception as e:
        print(f"ThingSpeak send failed: {e}")
