<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
            <div>
                <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Map view</h1>
                <p class="text-[13.5px] text-[#a09f99] mt-0.5">Geographic layout of all nodes</p>
            </div>
            <div class="flex items-center gap-4 text-[12px] text-[#6b6a65]">
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block"></span>Online</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span>Warning</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#b4b2a9] inline-block"></span>Offline</span>
            </div>
        </div>

        <!-- Map card -->
        <div class="relative bg-white rounded-xl border border-[#e4e2db] overflow-hidden mb-4" style="height: 440px;">

            <!-- Leaflet mount target -->
            <div id="lora-map" class="w-full h-full z-0"></div>

            <!-- Popover — top-left with spacing -->
            <Transition name="pop">
                <div
                    v-if="selected"
                    class="absolute z-[1000] bg-white border border-[#e4e2db] rounded-xl p-4 w-52 shadow-sm"
                    style="top: 14px; left: 14px;"
                >
                    <button
                        @click="selected = null"
                        class="absolute top-2.5 right-2.5 text-[#a09f99] hover:text-[#1c1c1a] transition-colors"
                        aria-label="Close"
                    >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                            <path d="M2 2l10 10M12 2L2 12"/>
                        </svg>
                    </button>

                    <p class="text-[13.5px] font-600 text-[#1c1c1a] pr-4 leading-tight">{{ selected.name }}</p>
                    <p class="font-mono text-[11px] text-[#a09f99]">{{ selected.id }}</p>
                    <p class="font-mono text-[12px] text-[#1c1c1a] mb-2">{{ selected.location }}</p>
                    <span :class="['text-[10.5px] font-500 px-2 py-0.5 rounded-full inline-block mb-2', statusBadgeClass(selected)]">
                        {{ nodeStatus(selected.lastSeen) }}
                    </span>

                    <div class="space-y-1.5 text-[12px] border-t border-[#f0efe9] pt-2.5">
                        <div class="flex justify-between">
                            <span class="text-[#a09f99]">Temperature</span>
                            <span class="font-mono font-500 text-[#1c1c1a]">{{ selected.lastTemp?.toFixed(1) ?? '—' }} °C</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-[#a09f99]">Battery</span>
                            <span class="font-mono font-500 text-[#1c1c1a]">{{ selected.lastBattery ?? '—' }} %</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-[#a09f99]">RSSI</span>
                            <span class="font-mono font-500 text-[#1c1c1a]">{{ selected.lastRssi ?? '—' }} dBm</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-[#a09f99]">Last seen</span>
                            <span class="font-mono font-500 text-[#1c1c1a]">{{ timeAgo(selected.lastSeen) }}</span>
                        </div>
                    </div>

                    <button
                        @click="$router.push(`/nodes/${selected.id}`)"
                        class="mt-3 w-full text-[12px] font-500 text-[#1a7f72] bg-[#e8f5f3] rounded-lg py-1.5 hover:bg-[#d4eeea] transition-colors"
                    >
                        View node detail
                    </button>
                </div>
            </Transition>

            <!-- Custom zoom controls — top-right -->
            <div class="absolute z-[1000] top-3.5 right-3.5 flex flex-col gap-1.5">
                <button
                    @click="zoomIn"
                    class="w-8 h-8 rounded-full bg-white border border-[#e4e2db] shadow-sm flex items-center justify-center text-[#6b6a65] hover:border-[#1a7f72] hover:text-[#1a7f72] transition-colors"
                    aria-label="Zoom in"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                        <path d="M7 2v10M2 7h10"/>
                    </svg>
                </button>
                <button
                    @click="zoomOut"
                    class="w-8 h-8 rounded-full bg-white border border-[#e4e2db] shadow-sm flex items-center justify-center text-[#6b6a65] hover:border-[#1a7f72] hover:text-[#1a7f72] transition-colors"
                    aria-label="Zoom out"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                        <path d="M2 7h10"/>
                    </svg>
                </button>
                <!-- Fit all nodes -->
                <button
                    @click="fitAll"
                    class="w-8 h-8 rounded-full bg-white border border-[#e4e2db] shadow-sm flex items-center justify-center text-[#6b6a65] hover:border-[#1a7f72] hover:text-[#1a7f72] transition-colors mt-0.5"
                    aria-label="Fit all nodes"
                    title="Fit all nodes"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 4V1h3M10 1h3v3M13 10v3h-3M4 13H1v-3"/>
                        <circle cx="7" cy="7" r="2"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Unmapped nodes notice -->
        <p v-if="unmappedNodes.length && !loading" class="text-[12.5px] text-[#a09f99] mb-4">
            <span class="font-mono">{{ unmappedNodes.map(n => n.id).join(', ') }}</span>
            {{ unmappedNodes.length === 1 ? 'has' : 'have' }} no coordinates and won't appear on the map.
        </p>

        <!-- Node list -->
        <div class="bg-white rounded-xl border border-[#e4e2db]">
            <div class="flex items-center gap-4 px-4 py-2.5 border-b border-[#f0efe9] text-[11px] font-500 text-[#a09f99] uppercase tracking-wider">
                <span class="w-2"></span>
                <span class="w-20">ID</span>
                <span class="flex-1">Name</span>
                <span class="w-24">Location</span>
                <span class="w-20">Temp</span>
                <span class="w-28">Battery</span>
                <span class="w-32">Coordinates</span>
            </div>

            <NodeRow
                v-for="node in nodes"
                :key="node.id"
                :node="node"
                :columns="['status', 'id', 'name', 'location', 'temp', 'battery', 'coordinates']"
                :class="{ 'opacity-50 !cursor-default': !node.lat || !node.lng }"
                @click="node.lat && node.lng ? panTo(node) : null"
            />

            <p v-if="!nodes.length && !loading" class="text-center text-[13px] text-[#a09f99] py-8">No nodes found.</p>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import { useNodes } from '@/composables/useNodes'
import { nodeStatus, timeAgo } from '@/utils/time'
import NodeRow from '@/components/NodeRow.vue'

const router   = useRouter()
const { nodes, loading } = useNodes()

// Store only the ID — `selected` is a computed that always reads the live node from `nodes`
const selectedId = ref(null)
const selected   = computed({
    get: () => nodes.value.find(n => n.id === selectedId.value) ?? null,
    set: (node) => { selectedId.value = node?.id ?? null },
})

let   map      = null
const markers  = {}  // keyed by node.id

const mappedNodes   = computed(() => nodes.value.filter(n => n.lat != null && n.lng != null))
const unmappedNodes = computed(() => nodes.value.filter(n => n.lat == null || n.lng == null))

// Map init
onMounted(() => {
    map = L.map('lora-map', {
        center:           [-20.1325, 28.6261],
        zoom:             15,
        zoomControl:      false,
        attributionControl: false,
    })

    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_no_buildings/{z}/{x}/{y}{r}.png'
    ).addTo(map)

    // Draw markers once nodes are loaded
    if (nodes.value.length) syncMarkers()
})

onUnmounted(() => {
    if (map) { map.off(); map.remove(); map = null }
})

// Keep markers in sync when nodes update
watch(nodes, syncMarkers, { deep: true })

const syncTimer = setInterval(syncMarkers, 30_000)
onUnmounted(() => clearInterval(syncTimer))

let initialFitDone = false

function syncMarkers() {
    if (!map) return
    mappedNodes.value.forEach(node => {
        if (markers[node.id]) {
            // Update icon color in case status changed
            markers[node.id].setIcon(buildIcon(node))
        } else {
            const marker = L.marker([node.lat, node.lng], {
                icon: buildIcon(node),
            }).addTo(map)

            marker.on('click', () => {
                selectedId.value = node.id
            })

            markers[node.id] = marker
        }
    })

    // Only fit bounds once on first load
    if (!initialFitDone && mappedNodes.value.length) {
        fitAll()
        initialFitDone = true
    }
}

// Controls
function zoomIn()  { map?.zoomIn() }
function zoomOut() { map?.zoomOut() }

function fitAll() {
    if (!map || !mappedNodes.value.length) return
    const bounds = L.latLngBounds(mappedNodes.value.map(n => [n.lat, n.lng]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 })
}

function panTo(node) {
    selectedId.value = node.id
    map?.flyTo([node.lat, node.lng], Math.max(map.getZoom(), 16))
}

// Marker icon
function buildIcon(node) {
    const color = {
        online:  '#22c55e',
        warning: '#f59e0b',
        offline: '#b4b2a9',
    }[nodeStatus(node.lastSeen)] ?? '#b4b2a9'

    const label = node.id.replace('N-', '')

    return L.divIcon({
        className: '',
        iconAnchor: [14, 44],
        html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="width:28px;height:28px;border-radius:50%;background:${color};border:2.5px solid white;
                display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;
                color:white;font-family:monospace;">${label}</div>
            <div style="width:2px;height:8px;background:${color};"></div>
            <div style="background:white;border:1px solid #e4e2db;border-radius:4px;font-size:9px;
                color:#6b6a65;padding:1px 5px;font-family:monospace;white-space:nowrap;">${node.id}</div>
        </div>`,
    })
}

// Popover helpers
function statusBadgeClass(node) {
    return {
        online:  'bg-[#e8f5f3] text-[#0f6e56]',
        warning: 'bg-amber-50 text-amber-700',
        offline: 'bg-[#f1efe8] text-[#5f5e5a]',
    }[nodeStatus(node.lastSeen)] ?? 'bg-[#f1efe8] text-[#5f5e5a]'
}
</script>

<style scoped>
.pop-enter-active, .pop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(4px); }
</style>