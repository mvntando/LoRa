<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
            <div>
                <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Alerts</h1>
                <p class="text-[13.5px] text-[#a09f99] mt-0.5">Live threshold violations across all nodes</p>
            </div>
            <button
                @click="exportCsv"
                class="flex items-center gap-2 text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-3.5 py-2 hover:border-[#c8c6be] hover:text-[#1c1c1a] transition-all"
            >
                <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 1v8M4 6l3 3 3-3M1 10v1.5A1.5 1.5 0 0 0 2.5 13h9a1.5 1.5 0 0 0 1.5-1.5V10"/>
                </svg>
                CSV
            </button>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Critical" :value="criticalCount" :valueClass="criticalCount ? 'text-red-500' : 'text-[#1c1c1a]'" iconBg="bg-transparent"></StatCard>
            <StatCard label="Warning" :value="warningCount" :valueClass="warningCount ? 'text-amber-500' : 'text-[#1c1c1a]'" iconBg="bg-transparent"></StatCard>
            <StatCard label="Total Active" :value="alerts.length" iconBg="bg-transparent"></StatCard>
        </div>


        <!-- Toolbar -->
        <div class="flex items-center gap-2 mb-6 flex-wrap">
            <button
                v-for="f in filterOptions" :key="f.value"
                @click="filter = f.value"
                :class="[
                    'flex items-center gap-1.5 text-[12px] font-500 px-3 py-1.5 rounded-full border transition-colors',
                    filter === f.value
                        ? 'bg-[#e8f5f3] text-[#1a7f72] border-[#1a7f72]'
                        : 'bg-white text-[#6b6a65] border-[#e4e2db] hover:border-[#c8c6be]'
                ]"
            >
                <span v-if="f.dot" :class="['w-1.5 h-1.5 rounded-full transition-colors', filter === f.value ? 'bg-white' : f.dot]"></span>
                {{ f.label }}
                <span
                    :class="[
                        'text-[12px] font-600 px-1 py-0.5 rounded-full leading-none opacity-60 transition-colors',
                        filter === f.value ? 'text-[#1a7f72]' : 'text-[#6b6a65]'
                    ]"
                >{{ f.count }}</span>
            </button>

            <div class="ml-auto relative">
                <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c8c6be]"
                    viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/>
                </svg>
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search node, type…"
                    class="text-[13px] pl-9 pr-3 py-2 rounded-lg border border-[#e4e2db] bg-white text-[#1c1c1a] placeholder-[#b8b6ae] focus:outline-none focus:border-[#1a7f72] transition-colors w-48"
                />
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-[#e4e2db] overflow-hidden">

            <!-- Header -->
            <div
                class="grid gap-3 px-4 py-2.5 border-b border-[#f0efe9] text-[11px] font-500 text-[#a09f99] uppercase tracking-wider"
                style="grid-template-columns: 8px 110px 1fr 80px 90px 80px"
            >
                <span></span>
                <span>Node</span>
                <span>Message</span>
                <span>Type</span>
                <span>Value</span>
                <span>Time</span>
            </div>

            <!-- Alert rows -->
            <template v-if="filtered.length">
                <div
                    v-for="alert in filtered"
                    :key="alert.id"
                    class="grid gap-3 px-4 py-3 items-center border-b border-[#f0efe9] last:border-0 hover:bg-[#fafaf8] transition-colors cursor-pointer"
                    style="grid-template-columns: 8px 110px 1fr 80px 90px 80px"
                    @click="$router.push(`/nodes/${alert.nodeId}`)"
                >
                    <span :class="['w-2 h-2 rounded-full flex-shrink-0', alert.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400']"></span>

                    <div class="min-w-0">
                        <p class="text-[13px] font-500 text-[#1c1c1a] truncate">{{ alert.node }}</p>
                        <p class="text-[11px] font-mono text-[#a09f99]">{{ alert.nodeId }}</p>
                    </div>

                    <span class="text-[13px] text-[#1c1c1a] truncate">{{ alert.message }}</span>

                    <span :class="['text-[11px] font-500 px-2 py-0.5 rounded-full w-fit', typeBadge(alert.type)]">
                        {{ alert.type }}
                    </span>

                    <span class="font-mono text-[12.5px] text-[#6b6a65]">{{ alert.value ?? '—' }}</span>

                    <span class="text-[12px] text-[#a09f99]">{{ alert.time }}</span>
                </div>
            </template>

            <!-- Empty state -->
            <div v-else class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-10 h-10 rounded-xl text-[#1a7f72] bg-[#e8f5f3] flex items-center justify-center mb-3">
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <p class="text-[14px] font-500 text-[#1c1c1a]">All clear</p>
                <p class="text-[13px] text-[#a09f99] mt-0.5">No alerts match the current filter.</p>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { useNodeStore } from '@/stores/nodeStore'
import { storeToRefs } from 'pinia'
import { useAlerts } from '@/composables/useAlerts'

const store = useNodeStore()
const { nodes } = storeToRefs(store)
const { alerts, filtered, criticalCount, warningCount, filter, search } = useAlerts(nodes)

const filterOptions = computed(() => [
    { value: 'all',      label: 'All',      dot: null,           count: alerts.value.length },
    { value: 'critical', label: 'Critical', dot: 'bg-red-400',   count: criticalCount.value },
    { value: 'warning',  label: 'Warning',  dot: 'bg-amber-400', count: warningCount.value  },
])

const TYPE_BADGE = {
    temp:    'bg-orange-50 text-orange-600',
    rssi:    'bg-blue-50 text-blue-600',
    battery: 'bg-yellow-50 text-yellow-600',
    offline: 'bg-red-50 text-red-600',
}
function typeBadge(type) {
    return TYPE_BADGE[type] ?? 'bg-[#f5f4f1] text-[#6b6a65]'
}

function exportCsv() {
    const rows = [
        ['Node', 'Node ID', 'Type', 'Severity', 'Message', 'Value', 'Time'],
        ...alerts.value.map(a => [a.node, a.nodeId, a.type, a.severity, a.message, a.value ?? '', a.time]),
    ]
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'alerts.csv'; a.click()
    URL.revokeObjectURL(url)
}
</script>