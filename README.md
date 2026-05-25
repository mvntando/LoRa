QUICK READ:
LORANET DASHBOARD — WIRING NOTES
=================================

**Live app:** [lo-ranet.vercel.app](https://lo-ranet.vercel.app)
 
DATA FLOW
---------
Firestore → nodeStore (single onSnapshot) → components read from store
Firestore → useThresholds (single onSnapshot, lives in store) → thresholds ref
Firestore → useNodeRecords (per-node, onSnapshot, cleaned up on unmount) → charts only
 
PINIA STORE (nodeStore.js)
--------------------------
- init() called once in App.vue, guarded by `started` flag
- holds: nodes, loading, error, connected, thresholds, alerts,
         onlineCount, offlineCount, alertCount
- connected = computed(() => error.value === null) — reflects Firestore connection
- error cleared to null on each successful snapshot
- alert generation is watch([nodes, thresholds]) — reruns when either changes
- thresholds come from useThresholds() called inside the store (lives for app lifetime)
- onlineCount uses thresholds.offlineMin so it respects settings
 
ALERT GENERATION (inside store)
--------------------------------
- checks: offline, tempMax, tempMin, rssiMin, batteryMin
- offline = nodeStatus(lastSeen, offlineMin) — binary only, no warning state
- severity: critical or warning only
- alertCount = alerts.length — this is what sidebar badge shows
 
useAlerts (composable)
----------------------
- no longer generates alerts, just filters/searches store.alerts
- holds UI state: filter, search
- used only by AlertsView
 
THRESHOLDS (useThresholds.js)
------------------------------
- reads/writes Firestore doc: settings/thresholds
- DEFAULTS used until Firestore loads (same values as nodeStatus fallbacks)
- save() does a merge so partial updates are safe
- used in: nodeStore (alert gen + onlineCount), NodeRow (color thresholds)
- defaults: tempMax 40, tempMin 0, rssiMin -110, batteryMin 20, offlineMin 30
 
NODE STATUS (time.js)
---------------------
- binary: online / offline only — no warning
- signature: nodeStatus(date, offlineMin = 30)
- offlineMin default matches DEFAULTS.offlineMin — safe fallback before Firestore loads
- NodeRow and store always pass thresholds.value?.offlineMin (optional chained)
 
NODE ROW (NodeRow.vue)
----------------------
- reads thresholds directly from store (no props for thresholds)
- status dot: green = online, grey = offline
- temp color: red >= tempMax, amber >= tempMax - 10
- battery bar: red <= batteryMin, amber <= batteryMin + 10
- lastSeen label: self-ticking via setInterval every 30s (tick ref)
- columns prop controls which fields render (flexible for reuse)
 
SIDEBAR (AppSidebar.vue)
------------------------
- reads store directly (no storeToRefs needed, used inside computed)
- mainNav is a computed so badges are reactive
- Nodes badge = store.nodes.length
- Alerts badge = store.alertCount (matches alerts page exactly)
- network pill: store.onlineCount / store.nodes.length
- Live/Offline indicator = store.connected
 
FILES THAT USE STORE
--------------------
App.vue          — calls store.init()
AppSidebar.vue   — badges, network pill, connected indicator
DashboardView    — nodes, loading, error via storeToRefs; counts via store directly
AlertsView       — via useAlerts() which reads store internally
NodeRow          — thresholds for colors, nodeStatus for dot
MapView          — reads store.nodes, store.thresholds.offlineMin for status
 
FILES THAT DON'T TOUCH STORE
-----------------------------
SettingsView     — uses useThresholds() directly for read/write UI
NodeDetailView   — own onSnapshot for single node doc + useNodeRecords for charts
DocsView         — static content only
HistoryView      — nothing yet
 
ROUTER (router/index.js)
------------------------
/               → DashboardView
/nodes          → NodesView
/nodes/:id      → NodeDetailView
/history        → HistoryView
/alerts         → AlertsView
/map            → MapView
/settings       → SettingsView
/docs           → DocsView
 
ENV VARS (.env.local)
---------------------
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
END QUICK READ
 
