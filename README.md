# LoRaNet Dashboard

A real-time web dashboard for monitoring LoRa sensor nodes. Built with Vue 3, Pinia, and Firebase.

Displays live temperature, battery, and signal readings from each node. Generates alerts automatically when readings cross configurable thresholds. Includes per-node historical charts with selectable time ranges.

**Live app:** [lo-ranet.vercel.app](https://lo-ranet.vercel.app)

## System Overview

```
[ESP32 Node] --LoRa (hex payload)--> [ESP32 Gateway] --REST API--> [Firestore] --> [Dashboard]
```

**Node** (`backend/node`) — ESP32 that reads sensors and transmits a hex-encoded payload over LoRa at a set interval.

**Gateway** (`backend/gateway`) — ESP32 that receives LoRa packets, decodes the hex payload, and forwards the readings to Firestore via the Firebase REST API over WiFi.

**Dashboard** (`frontend/`) — Vue 3 web app that streams data from Firestore in real-time using `onSnapshot` listeners.

## Stack

- Vue 3 + Vite
- Pinia (state management)
- Firebase Firestore (real-time data, via REST API on the gateway side)
- Chart.js via vue-chartjs
- Tailwind CSS

## Setup

```bash
cp .env.example .env.local
# fill in Firebase project values

npm install
npm run dev
```

## Firestore Structure

```
nodes/{nodeId}
  name, location, lastTemp, lastBattery, lastRssi, lastSeen

nodes/{nodeId}/records/{recordId}
  temp, battery, rssi, timestamp

settings/thresholds
  tempMax, tempMin, rssiMin, batteryMin, offlineMin
```