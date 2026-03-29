<template>
    <div class="bg-white rounded-xl border border-[#e4e2db] p-5 flex flex-col gap-3 hover:border-[#c8c6be] transition-colors duration-150">
        <div class="flex items-start justify-between">
            <div>
                <p class="text-[11.5px] font-500 text-[#a09f99] uppercase tracking-wider">{{ label }}</p>
                <p class="mt-1 text-2xl font-600 text-[#1c1c1a] leading-none tracking-tight">
                    {{ value }}
                    <span v-if="unit" class="text-sm font-400 text-[#a09f99] ml-0.5">{{ unit }}</span>
                </p>
            </div>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', iconBg]">
                <slot name="icon" />
            </div>
        </div>
        <div v-if="trend !== undefined" class="flex items-center gap-1.5 text-[12px]">
            <span :class="trend >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'">
                {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
            </span>
            <span class="text-[#a09f99]">vs last hour</span>
        </div>
        <div v-if="$slots.extra">
            <slot name="extra" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    label:   { type: String, required: true },
    value:   { type: [String, Number], required: true },
    unit:    { type: String, default: '' },
    trend:   { type: Number, default: undefined },
    iconBg:  { type: String, default: 'bg-[#e8f5f3]' },
})
</script>