import { computed } from 'vue'
import { useNodes } from '@/composables/useNodes'
import { useAllRecords } from '@/composables/useAllRecords'
import { nodeStatus, timeAgo } from '@/utils/time'

const TEMP_CRITICAL   = 40
const RSSI_WARNING    = -110
const BATTERY_WARNING = 20

function avgOf(arr, key) {
    const valid = arr.filter(n => n[key] !== null)
    if (!valid.length) return null
    return valid.reduce((s, n) => s + n[key], 0) / valid.length
}

function hourSlice(records, hoursAgo, hoursEnd = 0) {
    const now = Date.now()
    const from = now - hoursAgo * 3_600_000
    const to   = now - hoursEnd * 3_600_000
    return records.filter(r => r.timestamp.getTime() >= from && r.timestamp.getTime() < to)
}

function trendPercent(current, previous) {
    if (!previous) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
}

export function useDashboard() {
    const { nodes, loading: nodesLoading } = useNodes()
    const { allRecords, loading: recordsLoading } = useAllRecords(24)

    const loading = computed(() => nodesLoading.value || recordsLoading.value)

    // --- nodes online ---
    const onlineCount = computed(() =>
        nodes.value.filter(n => nodeStatus(n.lastSeen) === 'online').length
    )
    const onlineTrend = computed(() => {
        const prev = new Set(hourSlice(allRecords.value, 2, 1).map(r => r.nodeId)).size
        return trendPercent(onlineCount.value, prev)
    })

    // --- temperature ---
    const avgTemp = computed(() => {
        const v = avgOf(nodes.value, 'lastTemp')
        return v !== null ? v.toFixed(1) : '—'
    })
    const avgTempTrend = computed(() => {
        const last = hourSlice(allRecords.value, 1)
        const prev = hourSlice(allRecords.value, 2, 1)
        if (!last.length || !prev.length) return 0
        return trendPercent(
            avgOf(last, 'temp'),
            avgOf(prev, 'temp')
        )
    })

    // --- battery ---
    const avgBattery = computed(() => {
        const v = avgOf(nodes.value, 'lastBattery')
        return v !== null ? Math.round(v) : '—'
    })
    const avgBatteryTrend = computed(() => {
        const last = hourSlice(allRecords.value.filter(r => r.battery !== null), 1)
        const prev = hourSlice(allRecords.value.filter(r => r.battery !== null), 2, 1)
        if (!last.length || !prev.length) return 0
        return trendPercent(avgOf(last, 'battery'), avgOf(prev, 'battery'))
    })

    // --- alerts ---
    const alerts = computed(() => nodes.value.flatMap(node => {
        const status = nodeStatus(node.lastSeen)
        const time   = timeAgo(node.lastSeen)
        const result = []

        if (status === 'offline')
            result.push({ type: 'critical', message: 'Node is offline', node: node.name, time })
        if (node.lastTemp >= TEMP_CRITICAL)
            result.push({ type: 'critical', message: `Temp exceeded ${TEMP_CRITICAL}°C`, node: node.name, time })
        if (node.lastRssi <= RSSI_WARNING)
            result.push({ type: 'warning', message: `RSSI below ${RSSI_WARNING} dBm`, node: node.name, time })
        if (node.lastBattery <= BATTERY_WARNING)
            result.push({ type: 'warning', message: 'Battery low', node: node.name, time })

        return result
    }))

    const criticalCount = computed(() => alerts.value.filter(a => a.type === 'critical').length)
    const warningCount  = computed(() => alerts.value.filter(a => a.type === 'warning').length)

    return {
        nodes, allRecords, loading,
        onlineCount, onlineTrend,
        avgTemp, avgTempTrend,
        avgBattery, avgBatteryTrend,
        alerts, criticalCount, warningCount,
    }
}
