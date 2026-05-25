<template>
    <div
        class="flex items-center gap-4 py-3 px-4 hover:bg-[#f5f4f1] transition-colors duration-100 group cursor-pointer border-b border-[#f0efe9] last:border-b-0"
    >
        <!-- status -->
        <span v-if="has('status')" :class="['w-2 h-2 rounded-full flex-shrink-0', statusDotColor]"></span>

        <!-- id -->
        <span v-if="has('id')" class="font-mono text-[12px] text-[#6b6a65] w-20 flex-shrink-0 truncate">{{ node.id }}</span>

        <!-- name -->
        <span v-if="has('name')" class="text-[13.5px] font-500 text-[#1c1c1a] flex-1 truncate">{{ node.name }}</span>

        <!-- location -->
        <span v-if="has('location')" class="text-[12px] text-[#a09f99] w-24 flex-shrink-0 truncate">{{ node.location }}</span>

        <!-- temp -->
        <div v-if="has('temp')" class="flex items-baseline gap-0.5 w-20 flex-shrink-0">
            <span class="font-mono text-[13.5px] font-500" :class="tempColor">
                {{ node.lastTemp !== null ? node.lastTemp.toFixed(1) : '—' }}
            </span>
            <span class="text-[11px] text-[#a09f99]">°C</span>
        </div>

        <!-- battery -->
        <div v-if="has('battery')" class="flex items-center gap-1.5 w-28 flex-shrink-0">
            <div class="w-16 h-1.5 rounded-full bg-[#e4e2db] overflow-hidden">
                <div
                    :style="{ width: (node.lastBattery ?? 0) + '%' }"
                    :class="['h-full rounded-full transition-all', batteryBarColor]"
                ></div>
            </div>
            <span class="font-mono text-[11.5px] text-[#6b6a65]">{{ node.lastBattery ?? '—' }}%</span>
        </div>

        <!-- rssi -->
        <span v-if="has('rssi')" class="font-mono text-[12px] text-[#a09f99] w-20 flex-shrink-0">
            {{ node.lastRssi !== null ? node.lastRssi + ' dBm' : '—' }}
        </span>

        <!-- spark -->
        <div v-if="has('spark')" class="w-16 h-6 flex-shrink-0">
            <svg viewBox="0 0 64 24" fill="none" class="w-full h-full">
                <polyline
                    v-if="sparkPoints"
                    :points="sparkPoints"
                    fill="none"
                    stroke="#1a7f72"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </div>

        <!-- coordinates -->
        <span v-if="has('coordinates')" class="font-mono text-[11px] text-[#a09f99] w-32 flex-shrink-0">
            {{ node.lat && node.lng ? `${node.lat.toFixed(4)}, ${node.lng.toFixed(4)}` : 'No location' }}
        </span>

        <!-- lastSeen -->
        <span v-if="has('lastSeen')" class="text-[12px] text-[#a09f99] w-20 text-right flex-shrink-0">
            {{ lastSeenLabel }}
        </span>

        <!-- arrow -->
        <svg v-if="has('arrow')" class="w-3.5 h-3.5 text-[#c8c6be] group-hover:text-[#6b6a65] transition-colors flex-shrink-0"
            viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"/>
        </svg>
    </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { timeAgo, nodeStatus } from '@/utils/time'

const props = defineProps({
    node:    { type: Object, required: true },
    columns: { type: Array,  default: () => ['status', 'id', 'name', 'temp', 'lastSeen', 'arrow'] },
    // pass last N records (already fetched by parent) only when 'spark' is in columns
    records: { type: Array,  default: () => [] },
})

const has = (col) => props.columns.includes(col)

// Status
const status = computed(() => nodeStatus(props.node.lastSeen))

const statusDotColor = computed(() => ({
    online:  'bg-[#22c55e]',
    offline: 'bg-[#e4e2db]',
}[status.value]))

// Temp color thresholds
const tempColor = computed(() => {
    const t = props.node.lastTemp
    if (t === null) return 'text-[#a09f99]'
    if (t >= 35)    return 'text-red-500'
    if (t >= 28)    return 'text-amber-500'
    return 'text-[#1c1c1a]'
})

// Battery bar color
const batteryBarColor = computed(() => {
    const b = props.node.lastBattery
    if (b === null || b >= 50) return 'bg-[#1a7f72]'
    if (b >= 20)               return 'bg-amber-400'
    return 'bg-red-400'
})

// Sparkline (built from records prop, last 9 points)
const sparkPoints = ref('')

watch(() => props.records, (records) => {
    if (!has('spark') || records.length < 2) return
    const temps = records.slice(-9).map(r => r.temp).filter(t => t !== null)
    if (temps.length < 2) return
    const min   = Math.min(...temps)
    const max   = Math.max(...temps)
    const range = max - min || 1
    sparkPoints.value = temps
        .map((t, i) => {
            const x = (i / (temps.length - 1)) * 64
            const y = 24 - ((t - min) / range) * 20
            return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
}, { once: true })

// Last seen — self-ticking every 30s
const tick  = ref(0)
const timer = setInterval(() => tick.value++, 30_000)
onUnmounted(() => clearInterval(timer))

const lastSeenLabel = computed(() => {
    void tick.value
    return timeAgo(props.node.lastSeen)
})
</script>