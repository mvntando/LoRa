import socket
import random
from datetime import datetime
import cloud
import utils

# UDP config
UDP_IP = "127.0.0.1"
UDP_PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"Gateway listening on {UDP_IP}:{UDP_PORT}...\n")

# Store last received data for each node
last_data = {}

while True:
    data, addr = sock.recvfrom(1024)
    message = data.decode().strip()
    parsed = utils.parse_packet(message)

    if not parsed:
        print(f"[INVALID PACKET] {message}")
        continue

    node_id, counter, sensors = parsed

    # Save last data for this node
    last_data[node_id] = sensors

    # Simulated gateway-side metrics
    rssi = random.randint(-120, -30)
    snr = round(random.uniform(-10, 10), 1)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    utils.log_data(timestamp, node_id, counter, sensors, rssi, snr)

    if "node1" in last_data and "node2" in last_data:
        cloud.send_both_nodes(last_data["node1"], last_data["node2"])

    elif "node1" in last_data:
        cloud.send_to_thingspeak("node1", last_data["node1"])

    # Send Node 2 if it has data
    elif "node2" in last_data:
        cloud.send_to_thingspeak("node2", last_data["node2"])

    # Print readable output
    if sensors:
        sensor_str = "|".join([f"{k}:{v}" for k, v in sensors.items()])
    else:
        sensor_str = "No data"

    print(f"[{timestamp}] {node_id} #{counter} -> {sensor_str}|RSSI:{rssi}dBm|SNR:{snr}dB")