import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { nodeStatus, timeAgo } from '@/utils/time'
import { useThresholds } from '@/composables/useThresholds'

/**
 * Reactive live listener for the `nodes` collection.
 * Each node doc maps to: { id, name, location, lastTemp, lastBattery, lastRssi, lastSeen }
 * `lastSeen` is converted from a Firestore Timestamp to a JS Date.
 */
export const useNodeStore = defineStore('nodes', () => {
    const nodes   = ref([])
    const loading = ref(true)
    const error   = ref(null)
    let started   = false

    // Thresholds
    const { thresholds } = useThresholds()

    function init() {
        if (started) return
        started = true
        onSnapshot(
            collection(db, 'nodes'),
            (snapshot) => {
                nodes.value = snapshot.docs.map(doc => {
                    const d = doc.data()
                    return {
                        id:          doc.id,
                        name:        d.name         ?? doc.id,
                        location:    d.location     ?? '—',
                        lastTemp:    d.lastTemp      ?? null,
                        lastBattery: d.lastBattery   ?? null,
                        lastRssi:    d.lastRssi      ?? null,
                        lastSeen:    d.lastSeen?.toDate?.() ?? null,
                        lat:         d.lat           ?? null,
                        lng:         d.lng           ?? null,
                    }
                })
                loading.value = false
            },
            (err) => {
                console.error('[nodeStore]', err)
                error.value   = err.message
                loading.value = false
            }
        )
    }

    // --- Node status counts ---
    const onlineCount = computed(() =>
        nodes.value.filter(n =>
            nodeStatus(n.lastSeen, thresholds.value.offlineMin) === 'online'
        ).length
    )

    // --- Alert generation ---
    const alerts = ref([])

    watch([nodes, thresholds], ([nodeList, t]) => {
        alerts.value = nodeList.flatMap(node => {
            const status = nodeStatus(node.lastSeen, t.offlineMin)
            const time   = timeAgo(node.lastSeen)
            const result = []

            if (status === 'offline')
                result.push({ id: `${node.id}-offline`, severity: 'critical', type: 'offline',
                    message: 'Node is offline', node: node.name, nodeId: node.id, value: null, time })

            if (node.lastTemp !== null) {
                if (node.lastTemp >= t.tempMax)
                    result.push({ id: `${node.id}-temp`, severity: 'critical', type: 'temp',
                        message: `Temp exceeded ${t.tempMax}°C`, node: node.name, nodeId: node.id,
                        value: `${node.lastTemp}°C`, time })
                else if (node.lastTemp <= t.tempMin)
                    result.push({ id: `${node.id}-temp`, severity: 'warning', type: 'temp',
                        message: `Temp below ${t.tempMin}°C`, node: node.name, nodeId: node.id,
                        value: `${node.lastTemp}°C`, time })
            }

            if (node.lastRssi !== null && node.lastRssi <= t.rssiMin)
                result.push({ id: `${node.id}-rssi`,
                    severity: node.lastRssi <= t.rssiMin - 10 ? 'critical' : 'warning', type: 'rssi',
                    message: `RSSI below ${t.rssiMin} dBm`, node: node.name, nodeId: node.id,
                    value: `${node.lastRssi} dBm`, time })

            if (node.lastBattery !== null && node.lastBattery <= t.batteryMin)
                result.push({ id: `${node.id}-battery`,
                    severity: node.lastBattery <= t.batteryMin / 2 ? 'critical' : 'warning', type: 'battery',
                    message: `Battery low (≤${t.batteryMin}%)`, node: node.name, nodeId: node.id,
                    value: `${node.lastBattery}%`, time })

            return result
        })
    }, { immediate: true })

    const criticalCount = computed(() => alerts.value.filter(a => a.severity === 'critical').length)
    const alertCount    = computed(() => alerts.value.length)

    return {
        nodes, loading, error, init, thresholds,
        onlineCount, alerts, criticalCount, alertCount,
    }
})