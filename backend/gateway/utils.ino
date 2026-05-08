#include "config.h"

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <esp_crt_bundle.h>

// Type definitions (must match node)
#define TYPE_TEMP    0x67
#define TYPE_BATTERY 0x75

// --- WiFi ---
void wifiInit() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("[WiFi] Connecting");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.print("[WiFi] Connected, IP: ");
    Serial.println(WiFi.localIP());
}

bool wifiCheck() {
    if (WiFi.status() == WL_CONNECTED) return true;
    Serial.println("[WiFi] Reconnecting...");
    WiFi.disconnect();
    WiFi.mode(WIFI_OFF);
    delay(100);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int tries = 0;
    while (WiFi.status() != WL_CONNECTED && tries < 20) {
        delay(500);
        tries++;
    }
    bool connected = WiFi.status() == WL_CONNECTED;
    if (!connected) Serial.println("[WiFi] Reconnect failed");
    return connected;
}

// --- Decode ---
bool decodePacket(uint8_t *buf, uint8_t len, int rssi, SensorData &data) {
    if (len < 4) {
        Serial.println("[Utils] Packet too short");
        return false;
    }

    // Reset
    data = {};
    data.nodeId = buf[0];
    data.rssi   = rssi;

    uint8_t i = 1;
    while (i < len) {
        if (i + 1 >= len) break;

        uint8_t channel = buf[i++]; // reserved for future use
        uint8_t type    = buf[i++];

        switch (type) {
            case TYPE_TEMP: {
                if (i + 1 >= len) return false;
                uint16_t raw = ((uint16_t)buf[i] << 8) | buf[i + 1];
                i += 2;
                data.temperature = raw / 10.0;
                data.hasTemp     = true;
                break;
            }
            case TYPE_BATTERY: {
                if (i >= len) return false;
                data.battery    = buf[i++];
                data.hasBattery = true;
                break;
            }
            default: {
                Serial.print("[Utils] Unknown type: 0x");
                Serial.println(type, HEX);
                return false;
            }
        }
    }
    return true;
}

// --- Json ---
String buildJson(const SensorData &data) {
    JsonDocument doc;

    char nodeHex[3];
    snprintf(nodeHex, sizeof(nodeHex), "%02X", data.nodeId);

    doc["node"] = nodeHex;
    doc["rssi"] = data.rssi;

    if (data.hasTemp)    doc["temperature"] = serialized(String(data.temperature, 1));
    if (data.hasBattery) doc["battery"]     = data.battery;

    String output;
    serializeJson(doc, output);
    return output;
}

// --- Firestore ---
String getNodeId(uint8_t nodeId) {
    char buf[6];
    snprintf(buf, sizeof(buf), "N-%03d", nodeId);
    return String(buf);
}

String firestoreBase(const String &nodeId) {
    return "https://firestore.googleapis.com/v1/projects/"
        + String(FIREBASE_PROJECT_ID)
        + "/databases/(default)/documents/nodes/"
        + nodeId;
}

void addRecord(const SensorData &data) {
    if (!wifiCheck()) {
        Serial.println("[Firestore] No WiFi, skipping addRecord");
        return;
    }

    {
        WiFiClientSecure client;
        client.setInsecure();
        
        String nodeId = getNodeId(data.nodeId);

        // generate a unique doc ID from millis
        String docId   = String(millis());
        String docPath = "projects/" + String(FIREBASE_PROJECT_ID)
            + "/databases/(default)/documents/nodes/"
            + nodeId + "/records/" + docId;

        String url = "https://firestore.googleapis.com/v1/projects/"
            + String(FIREBASE_PROJECT_ID)
            + "/databases/(default)/documents:commit?key="
            + String(FIREBASE_API_KEY);

        JsonDocument doc;
        JsonArray writes  = doc["writes"].to<JsonArray>();

        // write 1: field values
        JsonObject write1 = writes.add<JsonObject>();
        JsonObject update = write1["update"].to<JsonObject>();
        update["name"]    = docPath;
        JsonObject fields = update["fields"].to<JsonObject>();
        if (data.hasTemp)    fields["temp"]["doubleValue"]     = data.temperature;
        if (data.hasBattery) fields["battery"]["integerValue"] = String(data.battery);
        fields["rssi"]["integerValue"]                         = String(data.rssi);

        // write 2: serverTimestamp transform
        JsonObject write2         = writes.add<JsonObject>();
        JsonObject transform      = write2["transform"].to<JsonObject>();
        transform["document"]     = docPath;
        JsonObject fieldTransform = transform["fieldTransforms"].add<JsonObject>();
        fieldTransform["fieldPath"]        = "timestamp";
        fieldTransform["setToServerValue"] = "REQUEST_TIME";

        String body;
        serializeJson(doc, body);

        HTTPClient http;
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        int code = http.POST(body);
        Serial.println("[Firestore] addRecord: " + String(code));
        if (code < 0) {
            Serial.println("[HTTP] Error: " + String(http.errorToString(code)));
        }
        http.end();
    }
}

void updateNode(const SensorData &data) {
    if (!wifiCheck()) {
        Serial.println("[Firestore] No WiFi, skipping updateNode");
        return;
    }

    {
        WiFiClientSecure client;
        client.setInsecure();

        String nodeId  = getNodeId(data.nodeId);
        String docPath = "projects/" + String(FIREBASE_PROJECT_ID)
            + "/databases/(default)/documents/nodes/"
            + nodeId;

        String url = "https://firestore.googleapis.com/v1/projects/"
            + String(FIREBASE_PROJECT_ID)
            + "/databases/(default)/documents:commit?key="
            + String(FIREBASE_API_KEY);

        JsonDocument doc;
        JsonArray writes = doc["writes"].to<JsonArray>();

        // write 1: field values + updateMask
        JsonObject write1 = writes.add<JsonObject>();
        JsonObject update = write1["update"].to<JsonObject>();
        update["name"]    = docPath;
        JsonObject fields = update["fields"].to<JsonObject>();
        if (data.hasTemp)    fields["lastTemp"]["doubleValue"]     = data.temperature;
        if (data.hasBattery) fields["lastBattery"]["integerValue"] = String(data.battery);
        fields["lastRssi"]["integerValue"]                         = String(data.rssi);

        JsonArray mask = write1["updateMask"]["fieldPaths"].to<JsonArray>();
        if (data.hasTemp)    mask.add("lastTemp");
        if (data.hasBattery) mask.add("lastBattery");
        mask.add("lastRssi");

        // write 2: serverTimestamp transform
        JsonObject write2         = writes.add<JsonObject>();
        JsonObject transform      = write2["transform"].to<JsonObject>();
        transform["document"]     = docPath;
        JsonObject fieldTransform = transform["fieldTransforms"].add<JsonObject>();
        fieldTransform["fieldPath"]        = "lastSeen";
        fieldTransform["setToServerValue"] = "REQUEST_TIME";

        String body;
        serializeJson(doc, body);

        HTTPClient http;
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        int code = http.POST(body);
        Serial.println("[Firestore] updateNode: " + String(code));
        if (code < 0) {
            Serial.println("[HTTP] Error: " + String(http.errorToString(code)));
        }
        http.end();
    }
}
