import { ref, computed, watch } from 'vue'
import { nodeStatus, timeAgo } from '@/utils/time'
import { useThresholds } from '@/composables/useThresholds'

/**
 * Derives alerts by watching a nodes ref passed in by the caller.
 * Thresholds are read live from Firestore via useThresholds().
 *
 * @param {import('vue').Ref<Array>} nodes - ref returned by useNodes()
 */
export function useAlerts(nodes) {
    const alerts = ref([])
    const filter = ref('all')
    const search = ref('')

    const { thresholds } = useThresholds()

    watch([nodes, thresholds], ([nodeList, t]) => {
        alerts.value = nodeList.flatMap(node => {
            const status = nodeStatus(node.lastSeen)
            const time   = timeAgo(node.lastSeen)
            const result = []

            // Offline
            if (status === 'offline')
                result.push({
                    id:       `${node.id}-offline`,
                    severity: 'critical',
                    type:     'offline',
                    message:  'Node is offline',
                    node:     node.name,
                    nodeId:   node.id,
                    value:    null,
                    time,
                })

            // Temperature
            if (node.lastTemp !== null) {
                if (node.lastTemp >= t.tempMax)
                    result.push({
                        id:       `${node.id}-temp`,
                        severity: 'critical',
                        type:     'temp',
                        message:  `Temp exceeded ${t.tempMax}°C`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastTemp}°C`,
                        time,
                    })
                else if (node.lastTemp <= t.tempMin)
                    result.push({
                        id:       `${node.id}-temp`,
                        severity: 'warning',
                        type:     'temp',
                        message:  `Temp below ${t.tempMin}°C`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastTemp}°C`,
                        time,
                    })
            }

            // RSSI
            if (node.lastRssi !== null && node.lastRssi <= t.rssiMin)
                result.push({
                    id:       `${node.id}-rssi`,
                    severity: node.lastRssi <= t.rssiMin - 10 ? 'critical' : 'warning',
                    type:     'rssi',
                    message:  `RSSI below ${t.rssiMin} dBm`,
                    node:     node.name,
                    nodeId:   node.id,
                    value:    `${node.lastRssi} dBm`,
                    time,
                })

            // Battery
            if (node.lastBattery !== null && node.lastBattery <= t.batteryMin)
                result.push({
                    id:       `${node.id}-battery`,
                    severity: node.lastBattery <= t.batteryMin / 2 ? 'critical' : 'warning',
                    type:     'battery',
                    message:  `Battery low (≤${t.batteryMin}%)`,
                    node:     node.name,
                    nodeId:   node.id,
                    value:    `${node.lastBattery}%`,
                    time,
                })

            return result
        })
    }, { immediate: true })

    const criticalCount = computed(() => alerts.value.filter(a => a.severity === 'critical').length)
    const warningCount  = computed(() => alerts.value.filter(a => a.severity === 'warning').length)

    const filtered = computed(() => {
        let list = alerts.value

        if (filter.value === 'critical')     list = list.filter(a => a.severity === 'critical')
        else if (filter.value === 'warning') list = list.filter(a => a.severity === 'warning')

        const term = search.value.trim().toLowerCase()
        if (term) {
            list = list.filter(a =>
                a.node.toLowerCase().includes(term)    ||
                a.nodeId.toLowerCase().includes(term)  ||
                a.type.toLowerCase().includes(term)    ||
                a.message.toLowerCase().includes(term)
            )
        }

        return list
    })

    return { alerts, filtered, criticalCount, warningCount, filter, search }
}