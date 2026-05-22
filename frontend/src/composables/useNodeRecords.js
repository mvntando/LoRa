import { ref, watch, onUnmounted } from 'vue'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

/**
 * Reactive live listener for a single node's `records` subcollection.
 *
 * @param {Ref<string>} nodeId    - reactive node doc ID, e.g. ref('N-001')
 * @param {Ref<number>} hoursBack - hours to look back,   e.g. ref(24)
 *
 * Returns chart-ready arrays (labels, temps, batteries, rssis) derived
 * from the records in a single watch pass — no redundant loops.
 */
export function useNodeRecords(nodeId, hoursBack = ref(24)) {
    const records   = ref([])
    const loading   = ref(true)
    const error     = ref(null)

    const labels    = ref([])
    const temps     = ref([])
    const batteries = ref([])
    const rssis     = ref([])

    let unsub = () => {}

    function subscribe() {
        unsub()
        if (!nodeId.value) return

        const since = new Date()
        since.setHours(since.getHours() - hoursBack.value)

        const q = query(
            collection(db, 'nodes', nodeId.value, 'records'),
            where('timestamp', '>=', Timestamp.fromDate(since)),
            orderBy('timestamp', 'asc')
        )

        loading.value = true

        unsub = onSnapshot(q,
            (snap) => {
                const mapped = snap.docs.map(doc => {
                    const d = doc.data()
                    return {
                        id:        doc.id,
                        temp:      d.temp      ?? null,
                        battery:   d.battery   ?? null,
                        rssi:      d.rssi      ?? null,
                        timestamp: d.timestamp?.toDate?.() ?? null,
                    }
                })

                records.value   = mapped
                labels.value    = mapped.map(r =>
                    r.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '')
                temps.value     = mapped.map(r => r.temp)
                batteries.value = mapped.map(r => r.battery)
                rssis.value     = mapped.map(r => r.rssi)
                loading.value   = false
            },
            (err) => {
                console.error('[useNodeRecords]', err)
                error.value   = err.message
                loading.value = false
            }
        )
    }

    watch([nodeId, hoursBack], subscribe, { immediate: true })
    onUnmounted(() => unsub())

    return { records, loading, error, labels, temps, batteries, rssis }
}