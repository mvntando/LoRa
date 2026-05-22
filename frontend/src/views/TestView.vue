<template>
    <div class="p-6 font-mono text-sm space-y-4 max-w-3xl">
        <p class="font-bold text-base">Firestore Connection Test</p>
        <p>Nodes: <span :class="statusColor">{{ status }}</span></p>

        <div v-for="n in nodes" :key="n.id" class="border rounded-lg overflow-hidden">

            <!-- Node header -->
            <div class="bg-gray-200 px-4 py-2 font-bold flex items-center justify-between">
                <span>{{ n.id }} — {{ n.name }}</span>
                <span class="text-xs font-normal text-gray-500">{{ n.location }}</span>
            </div>

            <!-- Node fields -->
            <div class="px-4 py-2 grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs border-b">
                <p><b>lastTemp:</b> {{ n.lastTemp }}</p>
                <p><b>lastBattery:</b> {{ n.lastBattery }}</p>
                <p><b>lastRssi:</b> {{ n.lastRssi }}</p>
                <p><b>lastSeen (parsed):</b> {{ n.lastSeen }}</p>
            </div>

            <!-- Records -->
            <div class="px-4 py-2">
                <p class="text-xs text-gray-400 mb-2">
                    records subcollection:
                    <span v-if="n.recordsLoading" class="text-yellow-500">loading...</span>
                    <span v-else class="text-green-600">{{ n.records.length }} docs</span>
                </p>

                <p v-if="n.recordsError" class="text-red-500 text-xs">Error: {{ n.recordsError }}</p>

                <div
                    v-for="r in n.records"
                    :key="r.id"
                    class="mb-2 p-2 bg-gray-50 border rounded text-xs grid grid-cols-2 gap-x-6 gap-y-0.5"
                >
                    <p><b>doc id:</b> {{ r.id }}</p>
                    <p><b>temp:</b> {{ r.temp }}</p>
                    <p><b>battery:</b> {{ r.battery }}</p>
                    <p><b>rssi:</b> {{ r.rssi }}</p>
                    <p class="col-span-2"><b>timestamp (parsed):</b> {{ r.timestamp }}</p>
                </div>
            </div>

        </div>

        <p v-if="error" class="text-red-500">Nodes error: {{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase'

const status      = ref('Connecting...')
const statusColor = ref('text-yellow-500')
const nodes       = ref([])
const error       = ref(null)

const unsubs = []

const unsubNodes = onSnapshot(
    collection(db, 'nodes'),
    (snap) => {
        status.value      = `Connected (${snap.docs.length} docs)`
        statusColor.value = 'text-green-600'

        nodes.value = snap.docs.map(doc => {
            const d = doc.data()
            return {
                id:             doc.id,
                name:           d.name        ?? doc.id,
                location:       d.location    ?? '—',
                lastTemp:       d.lastTemp     ?? null,
                lastBattery:    d.lastBattery  ?? null,
                lastRssi:       d.lastRssi     ?? null,
                lastSeen:       d.lastSeen?.toDate?.()?.toString() ?? '—',
                records:        [],
                recordsLoading: true,
                recordsError:   null,
            }
        })

        nodes.value.forEach(node => {
            const q = query(
                collection(db, 'nodes', node.id, 'records'),
                orderBy('timestamp', 'asc')
            )

            const unsubRecords = onSnapshot(
                q,
                (rSnap) => {
                    node.records = rSnap.docs.map(rdoc => {
                        const r = rdoc.data()
                        return {
                            id:        rdoc.id,
                            temp:      r.temp      ?? null,
                            battery:   r.battery   ?? null,
                            rssi:      r.rssi      ?? null,
                            timestamp: r.timestamp?.toDate?.()?.toString() ?? '—',
                        }
                    })
                    node.recordsLoading = false
                },
                (err) => {
                    node.recordsError   = err.message
                    node.recordsLoading = false
                    console.error(`[FirestoreTest] records for ${node.id}:`, err)
                }
            )

            unsubs.push(unsubRecords)
        })
    },
    (err) => {
        status.value      = 'Failed'
        statusColor.value = 'text-red-500'
        error.value       = err.message
        console.error('[FirestoreTest] nodes:', err)
    }
)

unsubs.push(unsubNodes)
onUnmounted(() => unsubs.forEach(fn => fn()))
</script>