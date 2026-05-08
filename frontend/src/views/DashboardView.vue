<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
            <div>
                <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Dashboard</h1>
                <p class="text-[13.5px] text-[#a09f99] mt-0.5">{{ today }} — Real-time LoRa network overview</p>
            </div>
            <button class="flex items-center gap-2 text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-3.5 py-2 hover:border-[#c8c6be] hover:text-[#1c1c1a] transition-all">
                <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.05 3.05l1.41 1.41M9.54 9.54l1.41 1.41M3.05 10.95l1.41-1.41M9.54 4.46l1.41-1.41"/>
                    <circle cx="7" cy="7" r="2.5"/>
                </svg>
                Live
                <span class="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
            </button>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard label="Nodes Online" value="2" unit="/ 3" :trend="0" iconBg="bg-[#e8f5f3]">
                <template #icon>
                    <svg class="w-4 h-4 text-[#1a7f72]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <circle cx="8" cy="8" r="2"/><circle cx="2.5" cy="4" r="1.5"/><circle cx="13.5" cy="4" r="1.5"/>
                        <circle cx="2.5" cy="12" r="1.5"/><circle cx="13.5" cy="12" r="1.5"/>
                        <line x1="4" y1="4.5" x2="6.2" y2="6.8"/><line x1="12" y1="4.5" x2="9.8" y2="6.8"/>
                        <line x1="4" y1="11.5" x2="6.2" y2="9.2"/><line x1="12" y1="11.5" x2="9.8" y2="9.2"/>
                    </svg>
                </template>
            </StatCard>

            <StatCard label="Avg Temperature" value="23.4" unit="°C" :trend="1.2" iconBg="bg-orange-50">
                <template #icon>
                    <svg fill="currentColor" class="w-4 h-4 text-orange-400" viewBox="0 0 16 16">
                        <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415"/>
                        <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1"/>
                    </svg>
                </template>
            </StatCard>

            <StatCard label="Packets Today" value="4,882" :trend="5.3" iconBg="bg-blue-50">
                <template #icon>
                    <svg class="w-4 h-4 text-blue-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <path d="M1 11l4-4 3 3 3-4 4 3"/><path d="M1 5h14"/>
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
                        <span class="text-[11px] bg-red-50 text-red-500 font-500 px-2 py-0.5 rounded-full">2 critical</span>
                        <span class="text-[11px] bg-amber-50 text-amber-500 font-500 px-2 py-0.5 rounded-full">1 warning</span>
                    </div>
                </template>
            </StatCard>
        </div>

        <!-- Chart + Alerts row -->
        <div class="grid grid-cols-3 gap-4 mb-6">

            <!-- Temperature chart placeholder -->
            <div class="col-span-2 bg-white rounded-xl border border-[#e4e2db] p-5">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h2 class="text-[14px] font-600 text-[#1c1c1a]">Temperature Overview</h2>
                        <p class="text-[12px] text-[#a09f99] mt-0.5">Last 24 hours · All nodes</p>
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
                <div class="relative h-48 flex items-end gap-px px-1">
                    <div
                        v-for="(bar, i) in chartBars" :key="i"
                        :style="{ height: bar.h + '%' }"
                        :class="['flex-1 rounded-t-sm transition-all duration-300', bar.highlight ? 'bg-[#1a7f72]' : 'bg-[#e8f5f3]']"
                    ></div>
                    <!-- Y-axis labels -->
                    <div class="absolute inset-y-0 -left-1 flex flex-col justify-between text-[10px] text-[#c8c6be] font-mono pr-2">
                        <span>35°</span><span>28°</span><span>21°</span><span>14°</span>
                    </div>
                </div>
                <div class="flex justify-between mt-2 text-[10.5px] text-[#c8c6be] font-mono px-1">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span>
                </div>
            </div>

            <!-- Recent alerts -->
            <div class="bg-white rounded-xl border border-[#e4e2db] p-5 flex flex-col min-h-0">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-[14px] font-600 text-[#1c1c1a]">Alerts</h2>
                    <router-link to="/alerts" class="text-[11px] text-[#1a7f72] font-500 hover:underline">View all</router-link>
                </div>
                <div class="flex flex-col gap-2 overflow-hidden">
                    <div
                        v-for="(alert, i) in alerts.slice(0, 3)" :key="alert.id"
                        :class="['rounded-lg px-3 py-2.5 border text-[12.5px] transition-all', alert.type === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100']"
                    >
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', alert.type === 'critical' ? 'bg-red-400' : 'bg-amber-400']"></span>
                            <span :class="['font-600 text-[11.5px] uppercase tracking-wide', alert.type === 'critical' ? 'text-red-500' : 'text-amber-500']">{{ alert.type }}</span>
                            <span class="ml-auto font-mono text-[10.5px] text-[#a09f99]">{{ alert.time }}</span>
                        </div>
                        <p class="text-[#1c1c1a] font-400 leading-snug">{{ alert.message }}</p>
                        <p class="text-[11px] text-[#a09f99] mt-0.5 font-mono">{{ alert.node }}</p>
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
            <NodeRow v-for="node in nodes" :key="node.id" :node="node" />
        </div>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import NodeRow from '@/components/NodeRow.vue'

const today = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))

const ranges = ['1H', '6H', '24H', '7D']
const activeRange = ref('24H')

// Mock chart bars
const chartBars = Array.from({ length: 48 }, (_, i) => ({
    h: 30 + Math.sin(i / 4) * 20 + Math.random() * 15,
    highlight: i === 47,
}))

const alerts = [
    { id: 1, type: 'critical', message: 'Temperature exceeded 40°C threshold', node: 'NODE-002', time: '5m ago' },
    { id: 2, type: 'warning',  message: 'Signal RSSI below -110 dBm', node: 'NODE-002', time: '18m ago' },
    { id: 3, type: 'critical', message: 'Node is offline', node: 'NODE-003', time: '25m ago' },
]

const nodes = [
    { id: 'N-001', name: 'Server Room',          temp: 23.1, status: 'online',  lastSeen: 'Just now', spark: '0,18 10,14 20,16 32,10 44,13 54,8  64,12' },
    { id: 'N-002', name: 'Battery Array',        temp: 19.8, status: 'warning', lastSeen: '1m ago',   spark: '0,14 10,16 20,12 32,18 44,14 54,16 64,13' },
    { id: 'N-003', name: 'Solar Array',          temp: 0,    status: 'offline', lastSeen: '2h ago',   spark: '0,12 10,12 20,12 32,12 44,12 54,12 64,12' },
    // { id: 'N-001', name: 'Greenhouse Alpha',  temp: 23.1, status: 'online',  lastSeen: 'Just now', spark: '0,18 10,14 20,16 32,10 44,13 54,8  64,12' },
    // { id: 'N-002', name: 'Warehouse East',    temp: 19.8, status: 'online',  lastSeen: '1m ago',   spark: '0,14 10,16 20,12 32,18 44,14 54,16 64,13' },
    // { id: 'N-003', name: 'Rooftop Sensor',    temp: 40.2, status: 'warning', lastSeen: '2m ago',   spark: '0,20 10,18 20,15 32,12 44,8  54,4  64,2'  },
    // { id: 'N-004', name: 'Server Room',       temp: 22.5, status: 'online',  lastSeen: '1m ago',   spark: '0,12 10,13 20,12 32,14 44,12 54,13 64,12' },
    // { id: 'N-005', name: 'Cold Storage',      temp: 4.1,  status: 'online',  lastSeen: '3m ago',   spark: '0,10 10,11 20,10 32,11 44,10 54,10 64,11' },
    // { id: 'N-006', name: 'Parking Lot B',     temp: 17.3, status: 'online',  lastSeen: '4m ago',   spark: '0,15 10,14 20,16 32,15 44,16 54,14 64,15' },
    // { id: 'N-007', name: 'Gateway Node',      temp: 28.9, status: 'warning', lastSeen: '18m ago',  spark: '0,10 10,12 20,14 32,16 44,17 54,18 64,20' },
    // { id: 'N-008', name: 'Field Station',     temp: 21.0, status: 'online',  lastSeen: '2m ago',   spark: '0,14 10,15 20,13 32,14 44,15 54,13 64,14' },
    // { id: 'N-009', name: 'Pump House',        temp: 25.4, status: 'online',  lastSeen: '5m ago',   spark: '0,13 10,14 20,15 32,13 44,14 54,15 64,13' },
    // { id: 'N-010', name: 'Solar Array',       temp: 0,    status: 'offline', lastSeen: '2h ago',   spark: '0,12 10,12 20,12 32,12 44,12 54,12 64,12' },
]
</script>

<style scoped>
.opacity-mask {
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}
</style>