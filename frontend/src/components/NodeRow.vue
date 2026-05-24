<template>
    <div class="flex items-center gap-4 py-3 px-4 hover:bg-[#f5f4f1] rounded-lg transition-colors duration-100 group cursor-pointer">
        <!-- Status dot -->
        <span :class="['w-2 h-2 rounded-full flex-shrink-0', statusColor]"></span>

        <!-- Node ID -->
        <span class="font-mono text-[12.5px] text-[#6b6a65] w-20 flex-shrink-0">{{ node.id }}</span>

        <!-- Name -->
        <span class="text-[13.5px] font-500 text-[#1c1c1a] flex-1 truncate">{{ node.name }}</span>

        <!-- Location - when extras -->
        <span v-if="showExtras" class="text-[12px] text-[#a09f99] w-24 flex-shrink-0 truncate">{{ node.location }}</span>

        <!-- Temp -->
        <div class="flex items-baseline gap-0.5 w-20 flex-shrink-0">
            <span class="font-mono text-[14px] font-500 text-[#1c1c1a]">{{ node.lastTemp !== null ? node.lastTemp.toFixed(1) : '—' }}</span>
            <span class="text-[11px] text-[#a09f99]">°C</span>
        </div>

        <!-- Battery - when extras -->
        <div v-if="showExtras" class="flex items-center gap-1.5 w-28 flex-shrink-0">
            <div class="w-16 h-1.5 rounded-full bg-[#e4e2db] overflow-hidden">
                <div
                    :style="{ width: (node.lastBattery ?? 0) + '%' }"
                    :class="['h-full rounded-full transition-all', batteryColor]"
                ></div>
            </div>
            <span class="font-mono text-[11.5px] text-[#6b6a65] text-left">{{ node.lastBattery ?? '—' }}%</span>
        </div>

        <!-- RSSI - when extras -->
        <span v-if="showExtras" class="font-mono text-[12px] text-[#a09f99] w-20 flex-shrink-0">
            {{ node.lastRssi !== null ? node.lastRssi + ' dBm' : '—' }}
        </span>

        <!-- Mini spark placeholder -->
        <div v-if="showSpark" class="w-16 h-6 flex-shrink-0">
            <svg viewBox="0 0 64 24" fill="none" class="w-full h-full">
                <polyline
                    :points="sparkPoints"
                    fill="none"
                    stroke="#1a7f72"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </div>

        <!-- Last seen -->
        <span class="text-[12px] text-[#a09f99] w-20 text-right flex-shrink-0">{{ lastSeenLabel }}</span>

        <!-- Arrow -->
        <svg class="w-3.5 h-3.5 text-[#c8c6be] group-hover:text-[#6b6a65] transition-colors flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"/>
        </svg>
    </div>
</template>

<script setup>
import { computed, ref, onUnmounted, watch } from 'vue'
import { timeAgo, nodeStatus } from '@/utils/time'

const props = defineProps({
    node:    { type: Object,  required: true },
    records: { type: Array,   default: () => [] },
    showExtras: { type: Boolean, default: false },
    showSpark:  { type: Boolean, default: false },
})

const statusColor = computed(() => ({
    online:  'bg-[#22c55e]',
    warning: 'bg-[#f59e0b]',
    offline: 'bg-[#e4e2db]',
}[nodeStatus(props.node.lastSeen)]))

const batteryColor = computed(() => {
    const b = props.node.lastBattery
    if (b === null || b >= 50) return 'bg-[#1a7f72]'
    if (b >= 20)               return 'bg-amber-400'
    return 'bg-red-400'
})

const tick = ref(0)
const timer = setInterval(() => tick.value++, 30_000)
onUnmounted(() => clearInterval(timer))

const lastSeenLabel = computed(() => {
    void tick.value
    return timeAgo(props.node.lastSeen)
})

const sparkPoints = ref('')

const unwatch = watch(() => props.records, (records) => {
    if (records.length < 2) return
    const temps = records
        .slice(-9)
        .map(r => r.temp)
        .filter(t => t !== null)
    if (temps.length < 2) return
    const min = Math.min(...temps)
    const max = Math.max(...temps)
    const range = max - min || 1
    sparkPoints.value = temps
        .map((t, i) => {
            const x = (i / (temps.length - 1)) * 64
            const y = 24 - ((t - min) / range) * 20
            return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    unwatch()
})

</script>