<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
            <div>
                <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">History</h1>
                <p class="text-[13.5px] text-[#a09f99] mt-0.5">Time-series records per node</p>
            </div>
            <div class="flex items-center gap-2">
                <button
                    @click="exportData('csv')"
                    :disabled="!records.length"
                    class="flex items-center gap-1.5 text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-3 py-2 hover:border-[#c8c6be] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 1v8M4 6l3 3 3-3"/><path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10"/>
                    </svg>
                    CSV
                </button>
                <button
                    @click="exportData('json')"
                    :disabled="!records.length"
                    class="flex items-center gap-1.5 text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-3 py-2 hover:border-[#c8c6be] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 1v8M4 6l3 3 3-3"/><path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10"/>
                    </svg>
                    JSON
                </button>
            </div>
        </div>

        <!-- Controls row -->
        <div class="flex items-end gap-3 mb-6 flex-wrap">

            <!-- Node selector -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">Node</label>
                <select
                    v-model="selectedNodeId"
                    class="text-[13px] text-[#1c1c1a] bg-white border border-[#e4e2db] rounded-lg px-3 py-2 outline-none hover:border-[#c8c6be] focus:border-[#1a7f72] transition-colors cursor-pointer min-w-[180px]"
                >
                    <option value="" disabled>Select a node…</option>
                    <option v-for="n in nodes" :key="n.id" :value="n.id">
                        {{ n.name }} ({{ n.id }})
                    </option>
                </select>
            </div>

            <!-- Preset range -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">Range</label>
                <div class="flex gap-1">
                    <button
                        v-for="r in ranges" :key="r.label"
                        @click="selectRange(r)"
                        :class="[
                            'text-[12.5px] font-500 px-3 py-2 rounded-lg border transition-colors',
                            activeRange === r.label
                                ? 'bg-[#1a7f72] text-white border-[#1a7f72]'
                                : 'bg-white text-[#6b6a65] border-[#e4e2db] hover:border-[#c8c6be]'
                        ]"
                    >{{ r.label }}</button>
                </div>
            </div>

            <!-- Custom date range -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">Custom</label>
                <div class="flex items-center gap-2">
                    <input
                        v-model="customFrom"
                        type="datetime-local"
                        step="60"
                        class="text-[12px] text-[#1c1c1a] bg-white border border-[#e4e2db] rounded-lg px-3 py-2 outline-none focus:border-[#1a7f72] transition-colors cursor-pointer"
                    />
                    <span class="text-[12px] text-[#a09f99]">-></span>
                    <input
                        v-model="customTo"
                        type="datetime-local"
                        step="60"
                        class="text-[12px] text-[#1c1c1a] bg-white border border-[#e4e2db] rounded-lg px-3 py-2 outline-none focus:border-[#1a7f72] transition-colors cursor-pointer"
                    />
                </div>
            </div>

            <!-- Dataset toggles -->
            <div class="flex flex-col gap-1.5 ml-auto">
                <label class="text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">Datasets</label>
                <div class="flex gap-1.5">
                    <button
                        v-for="d in datasets" :key="d.key"
                        @click="d.visible = !d.visible"
                        :class="[
                            'flex items-center gap-1.5 text-[12px] font-500 px-3 py-2 rounded-lg border transition-all',
                            d.visible ? 'bg-white border-[#e4e2db] text-[#1c1c1a]' : 'bg-white border-[#e4e2db] text-[#a09f99]'
                        ]"
                    >
                        <span
                            class="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            :style="d.visible ? { background: d.color } : { background: '#f0efe9' }"
                        >
                            <svg v-if="d.visible" class="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1.5 5l2.5 2.5 4.5-4"/>
                            </svg>
                        </span>
                        {{ d.label }}
                    </button>
                </div>
            </div>
        </div>

        <!-- No node selected -->
        <div
            v-if="!selectedNodeId"
            class="bg-white rounded-xl border border-[#e4e2db] py-20 flex flex-col items-center justify-center text-center"
        >
            <svg class="w-8 h-8 text-[#c8c6be] mb-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
                <circle cx="8" cy="8" r="6.5"/>
                <path d="M8 5v3.5l2 2"/>
            </svg>
            <p class="text-[13.5px] font-500 text-[#1c1c1a]">Select a node to view its history</p>
            <p class="text-[12.5px] text-[#a09f99] mt-1">Choose a node and time range above</p>
        </div>

        <template v-else>

            <!-- Chart card -->
            <div class="bg-white rounded-xl border border-[#e4e2db] p-5 mb-4">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-[14px] font-600 text-[#1c1c1a]">{{ selectedNode?.name }}</p>
                        <p class="text-[12px] text-[#a09f99] mt-0.5 font-mono">
                            {{ selectedNodeId }} &middot; {{ records.length }} records
                        </p>
                    </div>
                    <div v-if="recordsLoading" class="flex items-center gap-1.5 text-[12px] text-[#a09f99]">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#a09f99] animate-pulse"></span>
                        Loading…
                    </div>
                </div>
                <div class="h-64">
                    <MultiChart v-if="!recordsLoading && records.length" :records="filteredRecords" :datasets="datasets" />
                    <div v-else-if="recordsLoading" class="h-full animate-pulse bg-[#f5f4f1] rounded-lg" />
                    <div v-else class="h-full flex items-center justify-center text-[13px] text-[#a09f99]">
                        No records found in this range
                    </div>
                </div>
            </div>

            <!-- Summary stats -->
            <div class="grid grid-cols-4 gap-3 mb-4">
                <div
                    v-for="s in summaryStats" :key="s.label"
                    class="bg-white rounded-xl border border-[#e4e2db] px-4 py-3"
                >
                    <p class="text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">{{ s.label }}</p>
                    <p class="text-[20px] font-600 text-[#1c1c1a] leading-none mt-1">
                        {{ s.value }}<span class="text-[12px] font-400 text-[#a09f99] ml-0.5">{{ s.unit }}</span>
                    </p>
                </div>
            </div>

            <!-- Records table -->
            <div class="bg-white rounded-xl border border-[#e4e2db] overflow-hidden">
                <div class="flex items-center justify-between px-5 py-3 border-b border-[#f0efe9]">
                    <p class="text-[13px] font-600 text-[#1c1c1a]">Records</p>
                    <span class="text-[12px] text-[#a09f99]">
                        {{ paginatedRecords.length }} of {{ records.length }}
                    </span>
                </div>

                <!-- Header -->
                <div class="flex items-center gap-4 px-5 py-2 border-b border-[#f0efe9] text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">
                    <span class="flex-1">Timestamp</span>
                    <span class="w-24">Temp</span>
                    <span class="w-24">Battery</span>
                    <span class="w-24">RSSI</span>
                </div>

                <!-- Loading -->
                <div v-if="recordsLoading">
                    <div v-for="i in 6" :key="i" class="h-11 border-b border-[#f5f4f1] animate-pulse last:border-0" />
                </div>

                <!-- Rows -->
                <div
                    v-for="r in paginatedRecords"
                    :key="r.id"
                    class="flex items-center gap-4 px-5 py-2.5 border-b border-[#f5f4f1] last:border-0 hover:bg-[#f5f4f1] transition-colors"
                >
                    <span class="flex-1 font-mono text-[12px] text-[#6b6a65]">
                        {{ r.timestamp?.toLocaleString() ?? '—' }}
                    </span>
                    <span class="w-24 font-mono text-[13px]" :class="tempRowColor(r.temp)">
                        {{ r.temp !== null ? r.temp.toFixed(1) + ' °C' : '—' }}
                    </span>
                    <span class="w-24 font-mono text-[13px] text-[#6b6a65]">
                        {{ r.battery !== null ? r.battery + ' %' : '—' }}
                    </span>
                    <span class="w-24 font-mono text-[13px] text-[#a09f99]">
                        {{ r.rssi !== null ? r.rssi + ' dBm' : '—' }}
                    </span>
                </div>

                <p v-if="!recordsLoading && !records.length" class="text-center text-[13px] text-[#a09f99] py-8">
                    No records found in this range.
                </p>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-[#f0efe9]">
                    <button
                        @click="page--"
                        :disabled="page === 1"
                        class="text-[12.5px] font-500 text-[#6b6a65] px-3 py-1.5 rounded-lg border border-[#e4e2db] hover:border-[#c8c6be] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >← Prev</button>
                    <span class="text-[12px] text-[#a09f99]">Page {{ page }} of {{ totalPages }}</span>
                    <button
                        @click="page++"
                        :disabled="page === totalPages"
                        class="text-[12.5px] font-500 text-[#6b6a65] px-3 py-1.5 rounded-lg border border-[#e4e2db] hover:border-[#c8c6be] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >Next →</button>
                </div>
            </div>

        </template>

        <p v-if="error" class="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Firestore error: {{ error }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MultiChart from '@/components/MultiChart.vue'
import { useNodes } from '@/composables/useNodes'
import { useNodeRecords } from '@/composables/useNodeRecords'

const { nodes } = useNodes()

// Controls
const selectedNodeId = ref('')
const activeRange    = ref('24H')
const hoursBack      = ref(24)
const customFromDate = ref(null)
const customToDate   = ref(null)
const page           = ref(1)
const PAGE_SIZE      = 20

const today = new Date().toISOString().slice(0, 10)
const customFrom = ref(`${today}T00:00`)
const customTo   = ref(`${today}T23:59`)

const ranges = [
    { label: '1H',  hours: 1   },
    { label: '6H',  hours: 6   },
    { label: '24H', hours: 24  },
    { label: '7D',  hours: 168 },
]

const datasets = ref([
    { key: 'temp',    label: 'Temperature', color: '#1a7f72', visible: true  },
    { key: 'battery', label: 'Battery',     color: '#3b82f6', visible: false },
    { key: 'rssi',    label: 'RSSI',        color: '#f59e0b', visible: false },
])

function selectRange(r) {
    activeRange.value    = r.label
    hoursBack.value      = r.hours
    customFromDate.value = null  // clears custom range -> composable switches back to live
    customToDate.value   = null
    page.value           = 1
}

// Reset pagination when node changes
watch(selectedNodeId, () => page.value = 1)

// Composable — must be after selectedNodeId and hoursBack are defined
const { records, loading: recordsLoading, error } = useNodeRecords(
    selectedNodeId,
    hoursBack,
    customFromDate,
    customToDate
)

const filteredRecords = computed(() => records.value)

function applyCustomRange() {
    if (!customFrom.value || !customTo.value) return
    activeRange.value    = 'custom'
    customFromDate.value = new Date(customFrom.value)
    customToDate.value   = new Date(customTo.value)
    page.value           = 1
}

watch([customFrom, customTo], ([from, to]) => {
    if (from && to) applyCustomRange()
})

// Derived
const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value))

const chartData = computed(() => ({
    labels: filteredRecords.value.map(r =>
        r.timestamp?.toLocaleString([], {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }) ?? ''),
    datasets: datasets.value
        .filter(d => d.visible)
        .map(d => ({
            label:            d.label,
            data:             filteredRecords.value.map(r => r[d.key]),
            borderColor:      d.color,
            backgroundColor:  d.color + '18',
            borderWidth:      1.8,
            fill:             true,
            tension:          0.4,
            pointRadius:      0,
            pointHoverRadius: 4,
        }))
}))

const chartOptions = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: 'index', intersect: false },
    plugins: {
        legend: {
            display:  true,
            position: 'top',
            labels:   { boxWidth: 10, font: { size: 11 }, color: '#6b6a65' },
        },
        tooltip: { mode: 'index', intersect: false },
    },
    scales: {
        x: {
            ticks: {
                color: '#a09f99',
                font:  { size: 10, family: "'JetBrains Mono'" },
                maxTicksLimit: 8,
                maxRotation:   0,
            },
            grid: { color: '#f0efe9' },
        },
        y: {
            ticks: { color: '#a09f99', font: { size: 10, family: "'JetBrains Mono'" } },
            grid:  { color: '#f0efe9' },
        },
    },
}

const summaryStats = computed(() => {
    const temps     = filteredRecords.value.map(r => r.temp).filter(t => t !== null)
    const batteries = filteredRecords.value.map(r => r.battery).filter(b => b !== null)
    return [
        {
            label: 'Min temp', unit: '°C',
            value: temps.length ? Math.min(...temps).toFixed(1) : '—',
        },
        {
            label: 'Max temp', unit: '°C',
            value: temps.length ? Math.max(...temps).toFixed(1) : '—',
        },
        {
            label: 'Avg temp', unit: '°C',
            value: temps.length
                ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
                : '—',
        },
        {
            label: 'Avg battery', unit: '%',
            value: batteries.length
                ? Math.round(batteries.reduce((a, b) => a + b, 0) / batteries.length)
                : '—',
        },
    ]
})

const totalPages       = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / PAGE_SIZE)))
const paginatedRecords = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE
    return filteredRecords.value.slice(start, start + PAGE_SIZE)
})

function tempRowColor(t) {
    if (t === null) return 'text-[#a09f99]'
    if (t >= 35)    return 'text-red-500'
    if (t >= 28)    return 'text-amber-500'
    return 'text-[#1c1c1a]'
}

async function exportData(format) {
    const name = `${selectedNodeId.value}-${activeRange.value}-${new Date().toISOString().slice(0, 10)}`
    let content, mimeType

    if (format === 'csv') {
        const headers = ['Timestamp', 'Temp (°C)', 'Battery (%)', 'RSSI (dBm)']
        const rows    = filteredRecords.value.map(r => [
            r.timestamp?.toLocaleString() ?? '—',
            r.temp    ?? '—',
            r.battery ?? '—',
            r.rssi    ?? '—',
        ])
        content  = [headers, ...rows].map(r => r.join(',')).join('\n')
        mimeType = 'text/csv'
    } else {
        content  = JSON.stringify(
            filteredRecords.value.map(r => ({
                timestamp: r.timestamp?.toISOString() ?? null,
                temp:      r.temp,
                battery:   r.battery,
                rssi:      r.rssi,
            })),
            null, 2
        )
        mimeType = 'application/json'
    }

    const filename = `${name}.${format}`
    const blob     = new Blob([content], { type: mimeType })

    if (window.showSaveFilePicker) {
        try {
            const handle   = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: format.toUpperCase() + ' file', accept: { [mimeType]: ['.' + format] } }],
            })
            const writable = await handle.createWritable()
            await writable.write(content)
            await writable.close()
        } catch (e) {
            if (e.name !== 'AbortError') console.error(e)
        }
    } else {
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href = url; a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
}
</script>