<template>
    <div class="relative h-full">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Tooltip, Filler, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend)

const props = defineProps({
    records:  { type: Array, required: true },  // [{ temp, battery, rssi, timestamp: Date }]
    datasets: { type: Array, required: true },  // [{ key, label, color, visible }]
})

const chartData = computed(() => ({
    labels: props.records.map(r =>
        r.timestamp?.toLocaleString([], {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }) ?? ''
    ),
    datasets: props.datasets
        .filter(d => d.visible)
        .map(d => ({
            label:            d.label,
            data:             props.records.map(r => r[d.key]),
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
                color:         '#a09f99',
                font:          { size: 10, family: "'JetBrains Mono'" },
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
</script>