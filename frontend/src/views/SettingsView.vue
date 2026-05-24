<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Settings</h1>
            <p class="text-[13.5px] text-[#a09f99] mt-0.5">Configure alert thresholds for all nodes</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-white rounded-xl border border-[#e4e2db] p-8 animate-pulse h-64" />

        <template v-else>
            <form @submit.prevent="handleSave" class="grid grid-cols-2 gap-4">

                <!-- Temperature -->
                <div class="bg-white rounded-xl border border-[#e4e2db] p-5">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <svg fill="currentColor" class="w-4 h-4 text-orange-400" viewBox="0 0 16 16">
                                <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415"/>
                                <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-[13.5px] font-600 text-[#1c1c1a]">Temperature</p>
                            <p class="text-[12px] text-[#a09f99]">Alert when any node is outside this range</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <ThresholdInput
                            v-model="form.tempMin"
                            label="Minimum"
                            unit="°C"
                            :min="-50"
                            :max="form.tempMax - 1"
                            hint="Below this -> alert"
                        />
                        <ThresholdInput
                            v-model="form.tempMax"
                            label="Maximum"
                            unit="°C"
                            :min="form.tempMin + 1"
                            :max="100"
                            hint="Above this -> alert"
                        />
                    </div>

                    <!-- Visual range bar -->
                    <div class="mt-4">
                        <div class="flex justify-between text-[10.5px] text-[#a09f99] font-mono mb-1">
                            <span>-50°C</span><span>100°C</span>
                        </div>
                        <div class="relative h-2 bg-[#f0efe9] rounded-full overflow-hidden">
                            <div
                                class="absolute h-full bg-[#92d7ce] rounded-full"
                                :style="{ left: rangeLeft + '%', width: rangeWidth + '%' }"
                            ></div>
                        </div>
                        <p class="text-[11px] text-[#a09f99] mt-1.5 text-center">
                            Safe zone: <span class="font-mono text-[#1c1c1a] font-500">{{ form.tempMin }}°C – {{ form.tempMax }}°C</span>
                        </p>
                    </div>
                </div>

                <!-- Battery -->
                <div class="bg-white rounded-xl border border-[#e4e2db] p-5">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-blue-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="1" y="4" width="12" height="8" rx="1.5"/>
                                <path d="M13 7h2v2h-2" fill="currentColor" stroke="none"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-[13.5px] font-600 text-[#1c1c1a]">Battery</p>
                            <p class="text-[12px] text-[#a09f99]">Alert when battery drops below this level</p>
                        </div>
                    </div>

                    <ThresholdInput
                        v-model="form.batteryMin"
                        label="Minimum battery"
                        unit="%"
                        :min="1"
                        :max="99"
                        hint="Below this -> warning"
                        class="max-w-xs"
                    />

                    <div class="mt-4 max-w-xs">
                        <div class="h-2 bg-[#f0efe9] rounded-full overflow-hidden">
                            <div
                                class="h-full rounded-full transition-all"
                                :class="form.batteryMin <= 15 ? 'bg-red-400' : form.batteryMin <= 30 ? 'bg-amber-400' : 'bg-[#1a7f72]'"
                                :style="{ width: form.batteryMin + '%' }"
                            ></div>
                        </div>
                        <p class="text-[11px] text-[#a09f99] mt-1.5">
                            Alert at <span class="font-mono text-[#1c1c1a] font-500">{{ form.batteryMin }}%</span> and below
                        </p>
                    </div>
                </div>

                <!-- RSSI -->
                <div class="bg-white rounded-xl border border-[#e4e2db] p-5">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-purple-500">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-[13.5px] font-600 text-[#1c1c1a]">Signal strength (RSSI)</p>
                            <p class="text-[12px] text-[#a09f99]">Alert when signal drops below this value</p>
                        </div>
                    </div>

                    <ThresholdInput
                        v-model="form.rssiMin"
                        label="Minimum RSSI"
                        unit="dBm"
                        :min="-140"
                        :max="-1"
                        hint="More negative = weaker signal"
                        class="max-w-xs"
                    />

                    <div class="mt-3 flex gap-3 flex-wrap">
                        <span
                            v-for="ref_ in rssiRefs" :key="ref_.label"
                            class="text-[11px] px-2 py-1 rounded-md border"
                            :class="form.rssiMin >= ref_.min ? 'border-[#e4e2db] text-[#6b6a65] bg-[#f5f4f1]' : 'border-[#e4e2db] text-[#a09f99]'"
                        >
                            {{ ref_.label }}: ≥ {{ ref_.min }} dBm
                        </span>
                    </div>
                </div>

                <!-- Offline timeout -->
                <div class="bg-white rounded-xl border border-[#e4e2db] p-5">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-[#f5f4f1] flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-[#a09f99]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-[13.5px] font-600 text-[#1c1c1a]">Offline timeout</p>
                            <p class="text-[12px] text-[#a09f99]">Mark a node offline if no data received for this long</p>
                        </div>
                    </div>

                    <ThresholdInput
                        v-model="form.offlineMin"
                        label="Timeout"
                        unit="min"
                        :min="1"
                        :max="1440"
                        hint="Recommended: 2× your update interval"
                        class="max-w-xs"
                    />
                </div>

                <!-- Save bar -->
                <div class="col-span-2 flex items-center justify-between bg-white border border-[#e4e2db] rounded-xl px-5 py-3.5">
                    <div>
                        <p v-if="saved" class="text-[13px] text-[#1a7f72] font-500 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 7l3.5 3.5L12 3"/>
                            </svg>
                            Saved to Firestore
                        </p>
                        <p v-else-if="error" class="text-[13px] text-red-500">{{ error }}</p>
                        <p v-else class="text-[12.5px] text-[#a09f99]">Changes apply to all nodes immediately</p>
                    </div>
                    <div class="flex gap-2">
                        <button
                            type="button"
                            @click="resetToDefaults"
                            class="text-[13px] font-500 text-[#6b6a65] px-3.5 py-2 rounded-lg border border-[#e4e2db] hover:border-[#c8c6be] transition-colors"
                        >
                            Reset defaults
                        </button>
                        <button
                            type="submit"
                            :disabled="saving"
                            class="text-[13px] font-500 text-white bg-[#1a7f72] px-4 py-2 rounded-lg hover:bg-[#15695e] disabled:opacity-50 transition-colors"
                        >
                            {{ saving ? 'Saving…' : 'Save changes' }}
                        </button>
                    </div>
                </div>

            </form>
        </template>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ThresholdInput from '@/components/ThresholdInput.vue'
import { useThresholds } from '@/composables/useThresholds'

const { thresholds, loading, saving, error, save } = useThresholds()

const DEFAULTS = { tempMax: 35, tempMin: 0, batteryMin: 20, rssiMin: -110, offlineMin: 30 }

// Local form copy — don't mutate Firestore ref directly
const form = ref({ ...DEFAULTS })

// Sync form when Firestore data loads
watch(thresholds, (val) => { form.value = { ...val } }, { immediate: true })

const saved = ref(false)

async function handleSave() {
    await save(form.value)
    if (!error.value) {
        saved.value = true
        setTimeout(() => saved.value = false, 3000)
    }
}

function resetToDefaults() {
    form.value = { ...DEFAULTS }
}

// Temperature range bar helpers (maps -50->100 to 0->100%)
const rangeLeft  = computed(() => ((form.value.tempMin + 50) / 150) * 100)
const rangeWidth = computed(() => ((form.value.tempMax - form.value.tempMin) / 150) * 100)

const rssiRefs = [
    { label: 'Excellent', min: -70  },
    { label: 'Good',      min: -85  },
    { label: 'Fair',      min: -100 },
    { label: 'Poor',      min: -110 },
]
</script>