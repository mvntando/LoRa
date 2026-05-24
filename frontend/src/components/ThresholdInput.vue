<template>
    <div :class="$attrs.class">
        <label class="block text-[11.5px] font-500 text-[#6b6a65] mb-1.5">{{ label }}</label>
        <div class="flex items-center gap-0 border rounded-lg overflow-hidden transition-colors"
            :class="focused ? 'border-[#1a7f72] ring-2 ring-[#1a7f72]/10' : 'border-[#e4e2db] hover:border-[#c8c6be]'"
        >
            <!-- Decrement -->
            <button
                type="button"
                @click="decrement"
                class="w-8 h-9 flex items-center justify-center text-[#a09f99] hover:text-[#1c1c1a] hover:bg-[#f5f4f1] transition-colors flex-shrink-0"
            >
                <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                    <path d="M2 6h8"/>
                </svg>
            </button>

            <!-- Input -->
            <input
                type="number"
                :value="modelValue"
                :min="min"
                :max="max"
                @input="onInput"
                @focus="focused = true"
                @blur="focused = false"
                class="flex-1 text-center text-[13.5px] font-500 text-[#1c1c1a] bg-transparent outline-none py-2 w-0 font-mono
                       [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <!-- Unit -->
            <span class="text-[11.5px] text-[#a09f99] pr-2 font-mono flex-shrink-0">{{ unit }}</span>

            <!-- Increment -->
            <button
                type="button"
                @click="increment"
                class="w-8 h-9 flex items-center justify-center text-[#a09f99] hover:text-[#1c1c1a] hover:bg-[#f5f4f1] transition-colors flex-shrink-0"
            >
                <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                    <path d="M6 2v8M2 6h8"/>
                </svg>
            </button>
        </div>
        <p v-if="hint" class="text-[11px] text-[#a09f99] mt-1">{{ hint }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    modelValue: { type: Number, required: true },
    label:      { type: String, required: true },
    unit:       { type: String, default: '' },
    hint:       { type: String, default: '' },
    min:        { type: Number, default: -Infinity },
    max:        { type: Number, default: Infinity },
})

const emit   = defineEmits(['update:modelValue'])
const focused = ref(false)

function clamp(val) {
    return Math.min(props.max, Math.max(props.min, val))
}

function onInput(e) {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) emit('update:modelValue', clamp(val))
}

function increment() { emit('update:modelValue', clamp(props.modelValue + 1)) }
function decrement() { emit('update:modelValue', clamp(props.modelValue - 1)) }
</script>