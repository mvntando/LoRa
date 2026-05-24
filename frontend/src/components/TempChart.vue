<template>
    <div class="col-span-2 bg-white rounded-xl border border-[#e4e2db] p-5">
        <div class="flex items-center justify-between mb-5">
            <div>
                <h2 class="text-[14px] font-600 text-[#1c1c1a]">Temperature Overview</h2>
                <p class="text-[12px] text-[#a09f99] mt-0.5">Last {{ activeRange }} · {{ node }} </p>
            </div>
            <div class="flex gap-1">
                <button
                    v-for="r in ranges" :key="r"
                    @click="activeRange = r"
                    :class="['text-[11.5px] font-500 px-2.5 py-1 rounded-md transition-colors', activeRange === r ? 'bg-[#e8f5f3] text-[#1a7f72]' : 'text-[#a09f99] hover:text-[#6b6a65]']"
                >{{ r }}</button>
            </div>
        </div>
        <!-- Chart area -->
        <div class="relative h-48">
            <canvas ref="canvasEl"></canvas>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
    Chart, LineController, LineElement, PointElement,
    LinearScale, CategoryScale, Filler, Tooltip
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const props = defineProps({
    records:  { type: Array, default: () => [] },  // [{ temp, timestamp: Date, nodeId }]
    node:     { type: String, default: 'All Nodes' },
})

const ranges     = ['1H', '6H', '24H', '7D']
const activeRange = ref('24H')
const canvasEl   = ref(null)
let chart        = null

// --- bucketing config per range ---
const rangeConfig = {
    '1H':  { hours: 1,   bucketMin: 5   },
    '6H':  { hours: 6,   bucketMin: 30  },
    '24H': { hours: 24,  bucketMin: 60  },
    '7D':  { hours: 168, bucketMin: 180 },
}

function buildChartData(records, range) {
    const { hours, bucketMin } = rangeConfig[range]
    const now    = Date.now()
    const cutoff = now - hours * 3_600_000

    // filter to range
    const filtered = records.filter(r => r.timestamp && r.timestamp.getTime() >= cutoff)

    if (!filtered.length) return { labels: [], data: [] }

    // bucket by floored time slot
    const buckets = {}
    for (const r of filtered) {
        if (r.temp === null) continue
        const slotMs  = Math.floor(r.timestamp.getTime() / (bucketMin * 60_000)) * (bucketMin * 60_000)
        if (!buckets[slotMs]) buckets[slotMs] = []
        buckets[slotMs].push(r.temp)
    }

    const slots  = Object.keys(buckets).map(Number).sort()
    const labels = slots.map(ms =>
        new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
    const data   = slots.map(ms => {
        const vals = buckets[ms]
        return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
    })

    return { labels, data }
}

function renderChart() {
    const { labels, data } = buildChartData(props.records, activeRange.value)

    if (chart) {
        chart.data.labels        = labels
        chart.data.datasets[0].data = data
        chart.update('active')
        return
    }

    chart = new Chart(canvasEl.value, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data,
                borderColor:     '#1a7f72',
                backgroundColor: 'rgba(26,127,114,0.08)',
                borderWidth:     1.8,
                fill:            true,
                tension:         0.4,
                pointRadius:     0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#1a7f72',
            }]
        },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode:      'index',
                    intersect: false,
                    callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)} °C` }
                },
            },
            scales: {
                x: {
                    ticks: { color: '#c8c6be', font: { size: 10, family: 'JetBrains Mono' }, maxTicksLimit: 6 },
                    grid:  { color: '#f0efe9' },
                    border: { display: false },
                },
                y: {
                    ticks: { color: '#c8c6be', font: { size: 10, family: 'JetBrains Mono' }, callback: v => v.toFixed(1) + '°' },
                    grid:  { color: '#f0efe9' },
                    border: { display: false },
                },
            },
        },
    })
}

onMounted(renderChart)
onUnmounted(() => chart?.destroy())

watch(() => props.records, renderChart, { deep: true })
watch(activeRange, renderChart)
</script>