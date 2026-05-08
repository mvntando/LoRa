/*
 * GATEWAY - Proof of Concept (School Project)
 *
 * LIMITATIONS (known, acceptable for POC):
 * - No collision handling: only one node, not needed
 * - No encryption: use LoRaWAN + TTN for production
 * - Node identified by NODE_ID byte (first byte of packet)
 * - For multiple nodes later: stagger delays per node to avoid collisions
 *
 * NEXT STEPS IF SCALING:
 * - Switch to RadioLib + LoRaWAN for proper addressing and collision avoidance
 * - Connect to The Things Network (TTN) for free cloud backend
 */

#include "config.h"

void setup() {
    Serial.begin(115200);
    wifiInit();
    if (!loraInit()) {
        while (true);
    }
    Serial.println("[GW] Listening...");
}

void loop() {
    uint8_t buf[32];
    int len = loraReceive(buf, sizeof(buf));
    if (len == 0) return;

    SensorData data;
    if (!decodePacket(buf, len, LoRa.packetRssi(), data)) {
        Serial.println("[GW] Failed to decode packet");
        return;
    }

    String json = buildJson(data);
    Serial.println("[GW] Decoded: " + json);

    addRecord(data);
    updateNode(data);
}