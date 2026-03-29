<template>
    <div class="flex items-center gap-4 py-3 px-4 hover:bg-[#f5f4f1] rounded-lg transition-colors duration-100 group cursor-pointer">
        <!-- Status dot -->
        <span :class="['w-2 h-2 rounded-full flex-shrink-0', statusColor]"></span>

        <!-- Node ID -->
        <span class="font-mono text-[12.5px] text-[#6b6a65] w-20 flex-shrink-0">{{ node.id }}</span>

        <!-- Name -->
        <span class="text-[13.5px] font-500 text-[#1c1c1a] flex-1 truncate">{{ node.name }}</span>

        <!-- Temp -->
        <div class="flex items-baseline gap-0.5 w-20 flex-shrink-0">
            <span class="font-mono text-[14px] font-500 text-[#1c1c1a]">{{ node.temp }}</span>
            <span class="text-[11px] text-[#a09f99]">°C</span>
        </div>

        <!-- Mini spark placeholder -->
        <div class="w-16 h-6 flex-shrink-0">
            <svg viewBox="0 0 64 24" fill="none" class="w-full h-full">
                <polyline
                    :points="node.spark"
                    fill="none"
                    stroke="#1a7f72"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </div>

        <!-- Last seen -->
        <span class="text-[12px] text-[#a09f99] w-20 text-right flex-shrink-0">{{ node.lastSeen }}</span>

        <!-- Arrow -->
        <svg class="w-3.5 h-3.5 text-[#c8c6be] group-hover:text-[#6b6a65] transition-colors flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"/>
        </svg>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    node: { type: Object, required: true }
})

const statusColor = computed(() => ({
    online:  'bg-[#22c55e]',
    warning: 'bg-[#f59e0b]',
    offline: 'bg-[#e4e2db]',
}[props.node.status] || 'bg-[#e4e2db]'))
</script>