#define NODE_ID       0x01  // unique per node

// Type definitions
#define CH_1          0x01
#define TYPE_TEMP     0x67  // 2 bytes, value / 10 = degrees C (+ve)
#define TYPE_BATTERY  0x75  // 1 byte, value = %

void setup() {
    Serial.begin(115200);
    if (!loraInit()) {
        while (true); // halt if LoRa failed
    }
}

void loop() {
    // --- Read sensors ---
    float temperature = 22.8;
    uint8_t battery   = 95;

    // --- Encode into TLV payload ---
    uint8_t payload[8];
    uint8_t i = 0;

    // Node ID: 1 byte
    payload[i++] = NODE_ID;

    // Temperature: multiply by 10, 2 bytes big-endian
    uint16_t tempRaw = (uint16_t)(temperature * 10);
    payload[i++] = CH_1;
    payload[i++] = TYPE_TEMP;
    payload[i++] = (tempRaw >> 8) & 0xFF;  // high byte
    payload[i++] = tempRaw & 0xFF;         // low byte

    // Battery: 1 byte
    payload[i++] = CH_1;
    payload[i++] = TYPE_BATTERY;
    payload[i++] = battery;

    loraSendPacket(payload, i);

    delay(30000); // send every 30 seconds
}