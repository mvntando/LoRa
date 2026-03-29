import socket
import time
import random, math

# Gateway address
UDP_IP = "127.0.0.1"
UDP_PORT = 5005

# Node identity
NODE_ID = "node2"

# Create socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

counter = 0

while True:
    # Simulated sensor value
    value = round(random.uniform(1, 10))

    # Packet format: node_id | counter | key:value (multiple)
    message = f"{NODE_ID}|{counter}|t:{value + 1.5 + random.uniform(-1.5,1.5):.2f}|h:{55 + random.uniform(-4,4) + (counter*0.04):.2f}|p:{995 + random.uniform(-15,15):.2f}|b:{value - 2}"

    # Send packet
    sock.sendto(message.encode(), (UDP_IP, UDP_PORT))

    print(f"Sent: {message}")

    counter += 1
    time.sleep(15)  # send after some delay
