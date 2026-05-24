import { ref, computed, watch } from 'vue'
import { nodeStatus, timeAgo } from '@/utils/time'

export const THRESHOLDS = {
    tempCritical:    40,    // °C
    tempWarning:     30,    // °C
    rssiCritical:   -110,   // dBm
    rssiWarning:    -100,   // dBm
    batteryCritical: 15,    // %
    batteryWarning:  20,    // %
}

/**
 * Derives alerts by watching a nodes ref passed in by the caller.
 *
 * @param {import('vue').Ref<Array>} nodes - ref returned by useNodes()
 */
export function useAlerts(nodes) {
    const alerts = ref([])
    const filter = ref('all')
    const search = ref('')

    watch(nodes, (nodeList) => {
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
                if (node.lastTemp >= THRESHOLDS.tempCritical)
                    result.push({
                        id:       `${node.id}-temp`,
                        severity: 'critical',
                        type:     'temp',
                        message:  `Temp exceeded ${THRESHOLDS.tempCritical}°C`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastTemp}°C`,
                        time,
                    })
                else if (node.lastTemp >= THRESHOLDS.tempWarning)
                    result.push({
                        id:       `${node.id}-temp`,
                        severity: 'warning',
                        type:     'temp',
                        message:  `Temp above ${THRESHOLDS.tempWarning}°C`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastTemp}°C`,
                        time,
                    })
            }

            // RSSI
            if (node.lastRssi !== null) {
                if (node.lastRssi <= THRESHOLDS.rssiCritical)
                    result.push({
                        id:       `${node.id}-rssi`,
                        severity: 'critical',
                        type:     'rssi',
                        message:  `RSSI below ${THRESHOLDS.rssiCritical} dBm`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastRssi} dBm`,
                        time,
                    })
                else if (node.lastRssi <= THRESHOLDS.rssiWarning)
                    result.push({
                        id:       `${node.id}-rssi`,
                        severity: 'warning',
                        type:     'rssi',
                        message:  `RSSI below ${THRESHOLDS.rssiWarning} dBm`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastRssi} dBm`,
                        time,
                    })
            }

            // Battery
            if (node.lastBattery !== null) {
                if (node.lastBattery <= THRESHOLDS.batteryCritical)
                    result.push({
                        id:       `${node.id}-battery`,
                        severity: 'critical',
                        type:     'battery',
                        message:  `Battery critical (${THRESHOLDS.batteryCritical}%)`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastBattery}%`,
                        time,
                    })
                else if (node.lastBattery <= THRESHOLDS.batteryWarning)
                    result.push({
                        id:       `${node.id}-battery`,
                        severity: 'warning',
                        type:     'battery',
                        message:  `Battery low (${THRESHOLDS.batteryWarning}%)`,
                        node:     node.name,
                        nodeId:   node.id,
                        value:    `${node.lastBattery}%`,
                        time,
                    })
            }

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