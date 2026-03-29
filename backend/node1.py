import socket
import time
import random, math

# Gateway address
UDP_IP = "127.0.0.1"
UDP_PORT = 5005

# Node identity
NODE_ID = "node1"

# Create socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

counter = 0

while True:
    # Simulated sensor value
    value = round(random.uniform(1, 10))

    # Packet format: node_id | counter | key:value (multiple)
    message = f"{NODE_ID}|{counter}|t:{value + random.uniform(-2,2):.2f}|h:{50 + random.uniform(-3,3) + (counter*0.05):.2f}|p:{1000 + random.uniform(-20,20):.2f}|b:{value}"

    # Send packet
    sock.sendto(message.encode(), (UDP_IP, UDP_PORT))

    print(f"Sent: {message}")

    counter += 1
    time.sleep(15)  # send after some delay
