<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
            <div>
                <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Dashboard</h1>
                <p class="text-[13.5px] text-[#a09f99] mt-0.5">{{ today }} — Real-time LoRa network overview</p>
            </div>
            <button class="flex items-center gap-2 text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-3.5 py-2 hover:border-[#c8c6be] hover:text-[#1c1c1a] transition-all">
                Live
                <span :class="[
                    'w-1.5 h-1.5 rounded-full',
                    loading ? 'bg-[#f59e0b] animate-pulse' :
                    error   ? 'bg-[#ef4444]' :
                            'bg-[#22c55e] animate-pulse'
                ]"></span>
            </button>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard label="Nodes Online" :value="onlineCount" :unit="`/ ${nodes.length}`" :trend="onlineTrend" iconBg="bg-[#e8f5f3]">
                <template #icon>
                    <svg class="w-4 h-4 text-[#1a7f72]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <circle cx="8" cy="8" r="2"/><circle cx="2.5" cy="4" r="1.5"/><circle cx="13.5" cy="4" r="1.5"/>
                        <circle cx="2.5" cy="12" r="1.5"/><circle cx="13.5" cy="12" r="1.5"/>
                        <line x1="4" y1="4.5" x2="6.2" y2="6.8"/><line x1="12" y1="4.5" x2="9.8" y2="6.8"/>
                        <line x1="4" y1="11.5" x2="6.2" y2="9.2"/><line x1="12" y1="11.5" x2="9.8" y2="9.2"/>
                    </svg>
                </template>
            </StatCard>

            <StatCard label="Avg Temperature" :value="avgTemp" unit="°C" :trend="avgTempTrend" iconBg="bg-orange-50">
                <template #icon>
                    <svg fill="currentColor" class="w-4 h-4 text-orange-400" viewBox="0 0 16 16">
                        <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415"/>
                        <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1"/>
                    </svg>
                </template>
            </StatCard>

            <StatCard label="Avg Battery" :value="avgBattery" unit="%" :trend="avgBatteryTrend" iconBg="bg-blue-50">
                <template #icon>
                    <svg class="w-4 h-4 text-blue-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="12" height="8" rx="1.5"/>
                        <path d="M13 7h2v2h-2" fill="currentColor" stroke="none"/>
                    </svg>
                </template>
            </StatCard>

            <StatCard label="Active Alerts" :value="alerts.length" iconBg="bg-red-50">
                <template #icon>
                    <svg class="w-4 h-4 text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 1.5L1 13.5h14L8 1.5z"/>
                        <line x1="8" y1="6" x2="8" y2="9.5"/>
                        <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none"/>
                    </svg>
                </template>
                <template #extra>
                    <div class="flex gap-2">
                        <span v-if="criticalCount" class="text-[11px] bg-red-50 text-red-500 font-500 px-2 py-0.5 rounded-full">{{ criticalCount }} critical</span>
                        <span v-if="warningCount" class="text-[11px] bg-amber-50 text-amber-500 font-500 px-2 py-0.5 rounded-full">{{ warningCount }} warning</span>
                        <span v-if="!alerts.length" class="text-[11px] text-[#a09f99]">All clear</span>
                    </div>
                </template>
            </StatCard>
        </div>

        <!-- Chart + Alerts row -->
        <div class="grid grid-cols-3 gap-4 mb-6">

            <!-- Temperature chart -->
            <TempChart :records = "allRecords" />

            <!-- Recent alerts -->
            <div class="bg-white rounded-xl border border-[#e4e2db] p-5 flex flex-col min-h-0">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-[14px] font-600 text-[#1c1c1a]">Alerts</h2>
                    <router-link to="/alerts" class="text-[11px] text-[#1a7f72] font-500 hover:underline">View all</router-link>
                </div>
                <div class="flex flex-col gap-2 overflow-hidden">
                    <div
                        v-for="(alert, i) in alerts.slice(0, 3)" :key="i"
                        :class="['rounded-lg px-3 py-2.5 border text-[12.5px] transition-all', alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100']"
                    >
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', alert.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400']"></span>
                            <span :class="['font-600 text-[11.5px] uppercase tracking-wide', alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500']">{{ alert.severity }}</span>
                            <span class="ml-auto font-mono text-[10.5px] text-[#a09f99]">{{ alert.time }}</span>
                        </div>
                        <p class="text-[#1c1c1a] font-400 leading-snug">{{ alert.message }}</p>
                        <p class="text-[11px] text-[#a09f99] mt-0.5 font-mono">{{ alert.node }}</p>
                    </div>
                    <div v-if="!alerts.length" class="flex flex-col items-center justify-center py-6 text-center">
                        <span class="text-[13px] text-[#a09f99]">No active alerts</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Nodes table -->
        <div class="bg-white rounded-xl border border-[#e4e2db] p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-[14px] font-600 text-[#1c1c1a]">Node Status</h2>
                <router-link to="/nodes" class="text-[11px] text-[#1a7f72] font-500 hover:underline">Manage nodes</router-link>
            </div>
            <!-- Table header -->
            <div class="flex items-center gap-4 px-4 pb-2 border-b border-[#f0efe9] text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">
                <span class="w-2"></span>
                <span class="w-20">ID</span>
                <span class="flex-1">Name</span>
                <span class="w-20">Temp</span>
                <span class="w-16">Trend</span>
                <span class="w-20 text-right">Last seen</span>
                <span class="w-3.5"></span>
            </div>
            <NodeRow
                v-for="node in nodes"
                :key="node.id"
                :node="node"
                :records="allRecords.filter(r => r.nodeId === node.id)"
                :showSpark="true"
                @click="$router.push(`/nodes/${node.id}`)"
            />  
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboard } from '@/composables/useDashboard'
import StatCard  from '@/components/StatCard.vue'
import TempChart from '@/components/TempChart.vue'
import NodeRow   from '@/components/NodeRow.vue'

const today = computed(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

const {
    nodes, allRecords, loading, error,
    onlineCount, onlineTrend,
    avgTemp, avgTempTrend,
    avgBattery, avgBatteryTrend,
    alerts, criticalCount, warningCount,
} = useDashboard()

</script>

<style scoped>
.opacity-mask {
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}
</style>