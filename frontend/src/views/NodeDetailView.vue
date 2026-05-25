<template>
    <div class="max-w-6xl mx-auto">

        <!-- Back -->
        <button
            @click="$router.back()"
            class="flex items-center gap-1 text-[13px] text-[#6b6a65] hover:text-[#1c1c1a] mb-2 transition-colors"
        >
            <svg class="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 7H3M6.5 3.5L3 7l3.5 3.5"/>
            </svg>
            Back
        </button>

        <!-- Loading -->
        <template v-if="loading">
            <div class="h-10 w-48 bg-white rounded-lg border border-[#e4e2db] animate-pulse mb-6" />
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div v-for="i in 4" :key="i" class="h-20 bg-white rounded-xl border border-[#e4e2db] animate-pulse" />
            </div>
        </template>

        <template v-else-if="node">

            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">{{ node.name }}</h1>
                    <p class="text-[13px] text-[#a09f99] mt-0.5 font-mono">{{ nodeId }} · {{ node.location }}</p>
                </div>
                <span :class="['text-[12px] font-500 px-3 py-1 rounded-full', statusBadge]">
                    {{ status }}
                </span>
            </div>

            <!-- Stat cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Temperature" :value="node.lastTemp !== null ? node.lastTemp : '—'" :valueClass="tempColor" unit="°C" iconBg="bg-transparent" />
                <StatCard label="Battery" :value="node.lastBattery ?? '—'" unit="%" iconBg="bg-transparent">
                    <template #extra>
                        <div class="mt-2 h-1 rounded-full bg-[#e4e2db] overflow-hidden">
                            <div
                                :style="{ width: (node.lastBattery ?? 0) + '%' }"
                                :class="['h-full rounded-full transition-all', batteryColor]"
                            />
                        </div>
                    </template>
                </StatCard>
                <StatCard label="RSSI" :value="node.lastRssi ?? '—'" :valueClass="rssiColor" unit="dBm" iconBg="bg-transparent" />
                <StatCard label="Last seen" :value="lastSeenLabel" :valueClass="lastSeenColor" iconBg="bg-transparent" />
            </div>

            <!-- Active alerts for this node -->
            <div v-if="nodeAlerts.length" class="flex flex-col gap-2 mb-6">
                <div
                    v-for="alert in nodeAlerts" :key="alert.id"
                    :class="[
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-[12.5px]',
                        alert.severity === 'critical'
                            ? 'bg-red-50 border-red-100'
                            : 'bg-amber-50 border-amber-100'
                    ]"
                >
                    <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', alert.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400']"></span>
                    <span :class="['font-600 text-[11.5px] uppercase tracking-wide flex-shrink-0', alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500']">
                        {{ alert.severity }}
                    </span>
                    <span class="text-[#1c1c1a]">{{ alert.message }}</span>
                    <span v-if="alert.value" class="font-mono text-[#6b6a65] ml-1">{{ alert.value }}</span>
                    <span class="ml-auto font-mono text-[11px] text-[#a09f99] flex-shrink-0">{{ alert.time }}</span>
                </div>
            </div>

            <!-- Temperature chart -->
            <TempChart :records="records" :node="node.name" />

        </template>

        <!-- Not found -->
        <div v-else class="text-center py-16">
            <p class="text-[14px] font-500 text-[#1c1c1a]">Node not found</p>
            <p class="text-[13px] text-[#a09f99] mt-1 font-mono">{{ nodeId }}</p>
        </div>

    </div>
</template>

<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import TempChart from '@/components/TempChart.vue'
import { useNodeStore } from '@/stores/nodeStore'
import { storeToRefs } from 'pinia'
import { useNodeRecords } from '@/composables/useNodeRecords'
import { useAlerts } from '@/composables/useAlerts'
import { nodeStatus, timeAgo } from '@/utils/time'

const route  = useRoute()
const nodeId = ref(route.params.id)

const store = useNodeStore()
const { nodes, loading } = storeToRefs(store)
const { records } = useNodeRecords(nodeId)
const { alerts } = useAlerts()

const nodeAlerts = computed(() => alerts.value.filter(a => a.nodeId === nodeId.value))

const node = computed(() => nodes.value.find(n => n.id === nodeId.value) ?? null)

const status = computed(() => nodeStatus(node.value?.lastSeen))

const statusBadge = computed(() => ({
    online:  'bg-[#e8f5f3] text-[#1a7f72]',
    offline: 'bg-[#f5f4f1] text-[#a09f99]',
}[status.value]))

const tempColor = computed(() => {
    const t = node.value?.lastTemp
    if (t === null || t === undefined) return 'text-[#1c1c1a]'
    if (t >= 40) return 'text-red-500'
    if (t >= 30) return 'text-amber-500'
    return 'text-[#1c1c1a]'
})

const batteryColor = computed(() => {
    const b = node.value?.lastBattery
    if (b === null || b === undefined || b >= 50) return 'bg-[#1a7f72]'
    if (b >= 20) return 'bg-amber-400'
    return 'bg-red-400'
})

const rssiColor = computed(() => {
    const r = node.value?.lastRssi
    if (r === null || r === undefined) return 'text-[#1c1c1a]'
    if (r <= -110) return 'text-red-500'
    if (r <= -100) return 'text-amber-500'
    return 'text-[#1c1c1a]'
})

const tick  = ref(0)
const timer = setInterval(() => tick.value++, 30_000)
onUnmounted(() => clearInterval(timer))

const lastSeenLabel = computed(() => {
    void tick.value
    return timeAgo(node.value?.lastSeen)
})

const lastSeenColor = computed(() => ({
    online:  'text-[#1a7f72]',
    offline: 'text-red-500',
}[status.value] ?? 'text-[#1c1c1a]'))
</script>