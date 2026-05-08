#include <LoRa.h>

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

void loraSendPacket(uint8_t *payload, uint8_t len) {
    LoRa.beginPacket();
    LoRa.write(payload, len);
    LoRa.endPacket();

    Serial.print("[LoRa] Sent hex: ");
    for (int i = 0; i < len; i++) {
        if (payload[i] < 0x10) Serial.print("0");
        Serial.print(payload[i], HEX);
    }
    Serial.println();
}
