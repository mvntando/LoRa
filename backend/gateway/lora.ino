#include "config.h"

#define NSS_PIN   5
#define RST_PIN   14
#define DIO0_PIN  2
#define FREQUENCY 434E6

bool loraInit() {
    LoRa.setPins(NSS_PIN, RST_PIN, DIO0_PIN);
    if (!LoRa.begin(FREQUENCY)) {
        Serial.println("[LoRa] Init failed");
        return false;
    }
    LoRa.setSpreadingFactor(7);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    Serial.println("[LoRa] Init OK");
    return true;
}

int loraReceive(uint8_t *buf, uint8_t maxLen) {
    int packetSize = LoRa.parsePacket();
    if (packetSize == 0) return 0;

    uint8_t len = 0;
    while (LoRa.available() && len < maxLen) {
        buf[len++] = LoRa.read();
    }
    return len;
}