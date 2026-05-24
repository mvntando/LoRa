import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { nodeStatus } from '@/utils/time'

/**
 * Reactive live listener for the `nodes` collection.
 * Each node doc maps to: { id, name, location, lastTemp, lastBattery, lastRssi, lastSeen }
 * `lastSeen` is converted from a Firestore Timestamp to a JS Date.
 */
export const useNodeStore = defineStore('nodes', () => {
    const nodes   = ref([])
    const loading = ref(true)
    const error   = ref(null)
    let started   = false

    function init() {
        if (started) return
        started = true

        onSnapshot(
            collection(db, 'nodes'),
            (snapshot) => {
                nodes.value = snapshot.docs.map(doc => {
                    const d = doc.data()
                    return {
                        id:          doc.id,
                        name:        d.name         ?? doc.id,
                        location:    d.location     ?? '—',
                        lastTemp:    d.lastTemp      ?? null,
                        lastBattery: d.lastBattery   ?? null,
                        lastRssi:    d.lastRssi      ?? null,
                        lastSeen:    d.lastSeen?.toDate?.() ?? null,
                        lat:         d.lat           ?? null,
                        lng:         d.lng           ?? null,
                    }
                })
                loading.value = false
            },
            (err) => {
                console.error('[nodeStore]', err)
                error.value   = err.message
                loading.value = false
            }
        )
    }

    const onlineCount  = computed(() => nodes.value.filter(n => nodeStatus(n.lastSeen) === 'online').length)
    const warningCount = computed(() => nodes.value.filter(n => nodeStatus(n.lastSeen) === 'warning').length)
    const offlineCount = computed(() => nodes.value.filter(n => nodeStatus(n.lastSeen) === 'offline').length)
    const alertCount   = computed(() => warningCount.value + offlineCount.value)

    return { nodes, loading, error, init, onlineCount, warningCount, offlineCount, alertCount }
})