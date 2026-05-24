<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
            <div>
                <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Nodes</h1>
                <p class="text-[13.5px] text-[#a09f99] mt-0.5">
                    {{ nodes.length }} nodes registered &middot; {{ onlineCount }} online
                </p>
            </div>
            <div class="flex items-center gap-2">
                <button 
                    @click="exportCSV"
                    class="flex items-center gap-1.5 text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-3 py-2 hover:border-[#c8c6be] transition-colors">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 1v8M4 6l3 3 3-3"/><path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10"/>
                    </svg>
                    Export
                </button>
                <button 
                    @click="showModal = true"
                    class="flex items-center gap-1.5 text-[13px] font-500 text-white bg-[#1a7f72] rounded-lg px-3 py-2 hover:bg-[#15665c] transition-colors">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                        <path d="M7 2v10M2 7h10"/>
                    </svg>
                    Add node
                </button>
            </div>
        </div>

        <!-- Stat strip -->
        <div class="grid grid-cols-4 gap-3 mb-8">
            <StatCard label="Nodes Online" :value="onlineCount" :unit="`/ ${nodes.length}`" iconBg="bg-transparent"></StatCard>
            <StatCard label="Avg Temperature" :value="avgTemp" unit="°C" iconBg="bg-transparent"></StatCard>
            <StatCard label="Avg Battery" :value="avgBattery" unit="%" iconBg="bg-transparent"></StatCard>
            <StatCard label="Active Alerts" :value="alerts.length" :valueClass="alerts.length ? 'text-red-500' : 'text-[#1c1c1a]'" iconBg="bg-transparent"></StatCard>
        </div>

        <!-- Search + filters -->
        <div class="flex items-center gap-2 mb-6">
            <!-- Search -->
            <div class="flex items-center gap-2 bg-white border border-[#e4e2db] rounded-lg px-3 py-2 flex-1 max-w-s focus-within:border-[#1a7f72] transition-colors">
                <svg class="w-5 h-5 text-[#c8c6be] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="5.5" cy="5.5" r="4"/><path d="M9 9l3 3"/>
                </svg>
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search by name, ID, location…"
                    class="text-[13px] text-[#1c1c1a] placeholder:text-[#b8b6ae] bg-transparent outline-none w-full"
                />
                <button v-if="search" @click="search = ''" class="text-[#c8c6be] hover:text-[#6b6a65]">
                    <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <path d="M1 1l10 10M11 1L1 11"/>
                    </svg>
                </button>
            </div>

            <!-- Status filter chips -->
            <div class="flex-1 flex justify-center gap-1.5">
                <button
                    v-for="f in filters" :key="f.value"
                    @click="activeFilter = f.value"
                    :class="[
                        'text-[12px] font-500 px-3 py-1.5 rounded-full border transition-colors',
                        activeFilter === f.value
                            ? 'bg-[#e8f5f3] border-[#1a7f72] text-[#1a7f72]'
                            : 'bg-white border-[#e4e2db] text-[#6b6a65] hover:border-[#c8c6be]'
                    ]"
                >
                    {{ f.label }}
                    <span v-if="f.count !== undefined" class="ml-1 opacity-60">{{ f.count }}</span>
                </button>
            </div>

            <!-- Sort -->
            <div class="ml-auto flex items-center gap-1.5 text-[12px] text-[#a09f99]">
                <span>Sort:</span>
                <select
                    v-model="sortBy"
                    class="text-[12px] text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-2 py-1.5 outline-none hover:border-[#c8c6be] cursor-pointer"
                >
                    <option value="lastSeen">Last seen</option>
                    <option value="name">Name</option>
                    <option value="lastTemp">Temperature</option>
                    <option value="lastBattery">Battery</option>
                </select>
            </div>
        </div>

        <!-- Loading -->
        <template v-if="loading">
            <div class="bg-white rounded-xl border border-[#e4e2db] overflow-hidden">
                <div v-for="i in 5" :key="i" class="h-14 border-b border-[#f5f4f1] animate-pulse last:border-0" />
            </div>
        </template>

        <!-- Empty state -->
        <div
            v-else-if="!filteredNodes.length"
            class="bg-white rounded-xl border border-[#e4e2db] py-16 flex flex-col items-center justify-center text-center"
        >
            <svg class="w-8 h-8 text-[#c8c6be] mb-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
                <circle cx="8" cy="8" r="6.5"/><path d="M5.5 8h5M8 5.5v5"/>
            </svg>
            <p class="text-[13.5px] font-500 text-[#1c1c1a]">No nodes match your filter</p>
            <p class="text-[12.5px] text-[#a09f99] mt-1">Try a different status filter or clear the search.</p>
            <button @click="search = ''; activeFilter = 'all'" class="mt-4 text-[12.5px] text-[#1a7f72] font-500 hover:underline">
                Clear filters
            </button>
        </div>

        <!-- Node list -->
        <div v-else class="bg-white rounded-xl border border-[#e4e2db] overflow-hidden">
            <!-- Table header -->
            <div class="flex items-center gap-4 px-4 py-2.5 border-b border-[#f0efe9] text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">
                <span class="w-2"></span>
                <span class="w-20">ID</span>
                <span class="flex-1">Name</span>
                <span class="w-24">Location</span>  <!-- extra -->
                <span class="w-20">Temp</span>
                <span class="w-28">Battery</span>   <!-- extra -->
                <span class="w-20">RSSI</span>      <!-- extra -->
                <span class="w-20 text-right">Last seen</span>
                <span class="w-3.5"></span>
            </div>

            <NodeRow
                v-for="node in filteredNodes"
                :key="node.id"
                :node="node"
                :columns="['status', 'id', 'name', 'location', 'temp', 'battery', 'rssi', 'lastSeen', 'arrow']"
                @click="$router.push(`/nodes/${node.id}`)"
            />
            </div>

        <p v-if="error" class="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Firestore error: {{ error }}
        </p>

        <!-- Add node modal -->
        <Teleport to="body">
            <div v-if="showModal" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50" @click.self="closeModal">
                <div class="bg-white rounded-xl border border-[#e4e2db] w-full max-w-md mx-4 p-6 shadow-sm">

                    <!-- Modal header -->
                    <div class="flex items-center justify-between mb-5">
                        <div>
                            <h2 class="text-[15px] font-600 text-[#1c1c1a]">Pre-register node</h2>
                            <p class="text-[12px] text-[#a09f99] mt-0.5">Node will activate when it first sends data</p>
                        </div>
                        <button @click="closeModal" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f4f1] transition-colors">
                            <svg class="w-3.5 h-3.5 text-[#6b6a65]" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                                <path d="M1 1l12 12M13 1L1 13"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Form -->
                    <div class="flex flex-col gap-3">
                        <div>
                            <label class="text-[12px] font-500 text-[#6b6a65] mb-1.5 block">Node ID <span class="text-red-400">*</span></label>
                            <input
                                v-model="form.id"
                                type="text"
                                placeholder="e.g. N-011"
                                class="w-full text-[13px] bg-[#f5f4f1] border border-transparent rounded-lg px-3 py-2.5 outline-none focus:border-[#1a7f72] focus:bg-white transition-colors placeholder:text-[#c8c6be]"
                            />
                        </div>
                        <div>
                            <label class="text-[12px] font-500 text-[#6b6a65] mb-1.5 block">Name <span class="text-red-400">*</span></label>
                            <input
                                v-model="form.name"
                                type="text"
                                placeholder="e.g. Greenhouse Beta"
                                class="w-full text-[13px] bg-[#f5f4f1] border border-transparent rounded-lg px-3 py-2.5 outline-none focus:border-[#1a7f72] focus:bg-white transition-colors placeholder:text-[#c8c6be]"
                            />
                        </div>
                        <div>
                            <label class="text-[12px] font-500 text-[#6b6a65] mb-1.5 block">Location</label>
                            <input
                                v-model="form.location"
                                type="text"
                                placeholder="e.g. Lab, Rooftop, Field…"
                                class="w-full text-[13px] bg-[#f5f4f1] border border-transparent rounded-lg px-3 py-2.5 outline-none focus:border-[#1a7f72] focus:bg-white transition-colors placeholder:text-[#c8c6be]"
                            />
                        </div>
                    </div>

                    <p v-if="saveError" class="mt-3 text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {{ saveError }}
                    </p>

                    <!-- Actions -->
                    <div class="flex justify-end gap-2 mt-5">
                        <button @click="closeModal" class="text-[13px] font-500 text-[#6b6a65] bg-white border border-[#e4e2db] rounded-lg px-4 py-2 hover:border-[#c8c6be] transition-colors">
                            Cancel
                        </button>
                        <button
                            @click="saveNode"
                            :disabled="!form.id || !form.name || saving"
                            class="text-[13px] font-500 text-white bg-[#1a7f72] rounded-lg px-4 py-2 hover:bg-[#15665c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {{ saving ? 'Saving…' : 'Add node' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatCard from '@/components/StatCard.vue'
import NodeRow from '@/components/NodeRow.vue'
import { useNodes } from '@/composables/useNodes'
import { nodeStatus } from '@/utils/time'
import { useNodeActions } from '@/composables/useNodeActions'
import { useAlerts } from '@/composables/useAlerts'

const { nodes, loading, error } = useNodes()

const search      = ref('')
const activeFilter = ref('all')
const sortBy      = ref('lastSeen')

const onlineCount = computed(() => nodes.value.filter(n => nodeStatus(n.lastSeen) === 'online').length)
const { alerts } = useAlerts(nodes)

const avgTemp = computed(() => {
    const valid = nodes.value.filter(n => n.lastTemp !== null)
    if (!valid.length) return '—'
    return (valid.reduce((s, n) => s + n.lastTemp, 0) / valid.length).toFixed(1)
})

const avgBattery = computed(() => {
    const valid = nodes.value.filter(n => n.lastBattery !== null)
    if (!valid.length) return '—'
    return Math.round(valid.reduce((s, n) => s + n.lastBattery, 0) / valid.length)
})

const filters = computed(() => [
    { label: 'All',     value: 'all',     count: nodes.value.length },
    { label: 'Online',  value: 'online',  count: nodes.value.filter(n => nodeStatus(n.lastSeen) === 'online').length },
    { label: 'Warning', value: 'warning', count: nodes.value.filter(n => nodeStatus(n.lastSeen) === 'warning').length },
    { label: 'Offline', value: 'offline', count: nodes.value.filter(n => nodeStatus(n.lastSeen) === 'offline').length },
])

const filteredNodes = computed(() => {
    let list = [...nodes.value]

    // Status filter
    if (activeFilter.value !== 'all') {
        list = list.filter(n => nodeStatus(n.lastSeen) === activeFilter.value)
    }

    // Search
    const q = search.value.trim().toLowerCase()
    if (q) {
        list = list.filter(n =>
            n.id.toLowerCase().includes(q) ||
            n.name.toLowerCase().includes(q) ||
            n.location.toLowerCase().includes(q)
        )
    }

    // Sort
    list.sort((a, b) => {
        if (sortBy.value === 'lastSeen') {
            return (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0)
        }
        if (sortBy.value === 'lastTemp') {
            return (b.lastTemp ?? -Infinity) - (a.lastTemp ?? -Infinity)
        }
        if (sortBy.value === 'lastBattery') {
            return (b.lastBattery ?? -Infinity) - (a.lastBattery ?? -Infinity)
        }
        if (sortBy.value === 'name') {
            return a.name.localeCompare(b.name)
        }
        return 0
    })

    return list
})

const { saving, saveError, addNode } = useNodeActions()

const showModal = ref(false)
const form      = ref({ id: '', name: '', location: '' })

async function saveNode() {
    const ok = await addNode(form.value)
    if (ok) {
        showModal.value = false
        form.value = { id: '', name: '', location: '' }
    }
}

function closeModal() {
    showModal.value  = false
    saveError.value  = null
    form.value = { id: '', name: '', location: '' }
}

function exportCSV() {
    const headers = ['ID', 'Name', 'Location', 'Temp (°C)', 'Battery (%)', 'RSSI (dBm)', 'Last Seen']
    const rows = filteredNodes.value.map(n => [
        n.id,
        n.name,
        n.location,
        n.lastTemp    ?? '—',
        n.lastBattery ?? '—',
        n.lastRssi    ?? '—',
        n.lastSeen?.toLocaleString() ?? '—',
    ])
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)

    // triggers the OS native save dialog
    const a        = document.createElement('a')
    a.href         = url
    a.download     = `nodes-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

</script>