<template>
    <aside class="flex flex-col w-[220px] min-w-[220px] h-screen bg-white border-r border-[#e4e2db] px-3 py-5 z-10">

        <!-- Logo -->
        <div class="flex items-center gap-2.5 px-3 mb-8">
            <div class="w-7 h-7 rounded-lg bg-[#1a7f72] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="2.5" fill="white"/>
                    <circle cx="7" cy="7" r="5.5" stroke="white" stroke-width="1.2" fill="none" opacity="0.5"/>
                    <circle cx="7" cy="7" r="8" stroke="white" stroke-width="0.8" fill="none" opacity="0.25" stroke-dasharray="2 2"/>
                </svg>
            </div>
            <div>
                <p class="text-[13px] font-600 text-[#1c1c1a] leading-tight tracking-tight">LoRa<span class="text-[#1a7f72]">Net</span></p>
                <p class="text-[10px] text-[#a09f99] font-400 leading-tight">Node Dashboard</p>
            </div>
        </div>

        <!-- Nav -->
        <nav class="flex flex-col gap-0.5 flex-1">
            <p class="text-[10px] font-500 text-[#a09f99] uppercase tracking-widest px-3 mb-1">Main</p>

            <router-link
                v-for="item in mainNav"
                :key="item.to"
                :to="item.to"
                custom
                v-slot="{ isActive, navigate }"
            >
                <button
                    @click="navigate"
                    :class="[
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-400 transition-all duration-150 group',
                        isActive
                            ? 'bg-[#e8f5f3] text-[#1a7f72] font-500'
                            : 'text-[#6b6a65] hover:bg-[#f5f4f1] hover:text-[#1c1c1a]'
                    ]"
                >
                    <span :class="['w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-[#1a7f72]' : 'text-[#a09f99] group-hover:text-[#6b6a65]']">
                        <component :is="item.icon" />
                    </span>
                    {{ item.label }}
                    <span
                        v-if="item.badge"
                        class="ml-auto text-[10px] font-500 bg-[#1a7f72] text-white rounded-full px-1.5 py-0.5 leading-none"
                    >
                        {{ item.badge }}
                    </span>
                </button>
            </router-link>

            <p class="text-[10px] font-500 text-[#a09f99] uppercase tracking-widest px-3 mt-4 mb-1">System</p>

            <router-link
                v-for="item in systemNav"
                :key="item.to"
                :to="item.to"
                custom
                v-slot="{ isActive, navigate }"
            >
                <button
                    @click="navigate"
                    :class="[
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-400 transition-all duration-150 group',
                        isActive
                            ? 'bg-[#e8f5f3] text-[#1a7f72] font-500'
                            : 'text-[#6b6a65] hover:bg-[#f5f4f1] hover:text-[#1c1c1a]'
                    ]"
                >
                    <span :class="['w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-[#1a7f72]' : 'text-[#a09f99] group-hover:text-[#6b6a65]']">
                        <component :is="item.icon" />
                    </span>
                    {{ item.label }}
                </button>
            </router-link>
        </nav>

        <!-- Network status pill -->
        <div class="mt-4 mx-1 rounded-lg bg-[#f5f4f1] border border-[#e4e2db] px-3 py-2.5">
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] text-[#6b6a65] font-500">Network</span>
                <span class="flex items-center gap-1 text-[11px] text-[#22c55e] font-500">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                    Live
                </span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-[#a09f99]">
                <span>Nodes online</span>
                <span class="font-mono font-500 text-[#1c1c1a]">2 / 2</span>
            </div>
            <div class="mt-2 h-1 rounded-full bg-[#e4e2db] overflow-hidden">
                <div class="h-full w-4/5 rounded-full bg-[#1a7f72] transition-all"></div>
            </div>
        </div>

    </aside>
</template>

<script setup>
import { h } from 'vue'

// Inline SVG icon components (no external dep needed)
const IconDashboard = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '1', y: '1', width: '6', height: '6', rx: '1.5' }),
    h('rect', { x: '9', y: '1', width: '6', height: '6', rx: '1.5' }),
    h('rect', { x: '1', y: '9', width: '6', height: '6', rx: '1.5' }),
    h('rect', { x: '9', y: '9', width: '6', height: '6', rx: '1.5' }),
])

const IconNodes = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round' }, [
    h('circle', { cx: '8', cy: '8', r: '2' }),
    h('circle', { cx: '2.5', cy: '4', r: '1.5' }),
    h('circle', { cx: '13.5', cy: '4', r: '1.5' }),
    h('circle', { cx: '2.5', cy: '12', r: '1.5' }),
    h('circle', { cx: '13.5', cy: '12', r: '1.5' }),
    h('line', { x1: '4', y1: '4.5', x2: '6.2', y2: '6.8' }),
    h('line', { x1: '12', y1: '4.5', x2: '9.8', y2: '6.8' }),
    h('line', { x1: '4', y1: '11.5', x2: '6.2', y2: '9.2' }),
    h('line', { x1: '12', y1: '11.5', x2: '9.8', y2: '9.2' }),
])

const IconHistory = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M1.5 8a6.5 6.5 0 1 0 1.5-4.1' }),
    h('path', { d: 'M1.5 2v3.5H5' }),
    h('path', { d: 'M8 5v3.5l2.5 1.5' }),
])

const IconAlerts = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M8 1.5L1 13.5h14L8 1.5z' }),
    h('line', { x1: '8', y1: '6', x2: '8', y2: '9.5' }),
    h('circle', { cx: '8', cy: '11.5', r: '0.5', fill: 'currentColor', stroke: 'none' }),
])

const IconMap = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polygon', { points: '1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15' }),
    h('line', { x1: '6', y1: '1', x2: '6', y2: '13' }),
    h('line', { x1: '10', y1: '3', x2: '10', y2: '15' }),
])

const IconSettings = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round' }, [
    h('circle', { cx: '8', cy: '8', r: '2.5' }),
    h('path', { d: 'M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06' }),
])

const IconDocs = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '2', y: '1', width: '10', height: '13', rx: '1.5' }),
    h('path', { d: 'M5 5h4M5 7.5h4M5 10h2.5' }),
    h('path', { d: 'M10 1v3.5H14l-4-3.5z' }),
])

const mainNav = [
    { to: '/',         label: 'Dashboard', icon: IconDashboard },
    { to: '/nodes',    label: 'Nodes',     icon: IconNodes,   badge: '2' },
    { to: '/history',  label: 'History',   icon: IconHistory },
    { to: '/alerts',   label: 'Alerts',    icon: IconAlerts,  badge: '2' },
    { to: '/map',      label: 'Map View',  icon: IconMap },
]

const systemNav = [
    { to: '/settings', label: 'Settings', icon: IconSettings },
    { to: '/docs',     label: 'Docs',     icon: IconDocs },
]
</script>