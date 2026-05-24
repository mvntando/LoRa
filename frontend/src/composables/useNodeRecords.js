import { ref, watch, onUnmounted } from 'vue'
import { collection, query, where, orderBy, onSnapshot, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function useNodeRecords(nodeId, hoursBack = ref(24), fromDate = ref(null), toDate = ref(null)) {
    const records   = ref([])
    const loading   = ref(true)
    const error     = ref(null)
    const labels    = ref([])
    const temps     = ref([])
    const batteries = ref([])
    const rssis     = ref([])

    let unsub = () => {}

    function mapDocs(docs) {
        const mapped = docs.map(doc => {
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
    }

    async function subscribe() {
        unsub()          // always tear down previous listener first
        unsub = () => {} // reset so stale unsub isn't called twice

        if (!nodeId.value) return
        loading.value = true
        error.value   = null

        const isCustom = fromDate.value && toDate.value

        const since = isCustom
            ? fromDate.value
            : (() => { const d = new Date(); d.setHours(d.getHours() - hoursBack.value); return d })()

        const q = isCustom
            ? query(
                collection(db, 'nodes', nodeId.value, 'records'),
                where('timestamp', '>=', Timestamp.fromDate(since)),
                where('timestamp', '<=', Timestamp.fromDate(toDate.value)),
                orderBy('timestamp', 'asc')
            )
            : query(
                collection(db, 'nodes', nodeId.value, 'records'),
                where('timestamp', '>=', Timestamp.fromDate(since)),
                orderBy('timestamp', 'asc')
            )

        try {
            if (isCustom) {
                // Past range — one-time fetch, no live listener needed
                const snap = await getDocs(q)
                mapDocs(snap.docs)
            } else {
                // Live range — keep listener open for new records coming in
                unsub = onSnapshot(q,
                    (snap) => mapDocs(snap.docs),
                    (err)  => {
                        console.error('[useNodeRecords]', err)
                        error.value   = err.message
                        loading.value = false
                    }
                )
            }
        } catch (err) {
            console.error('[useNodeRecords]', err)
            error.value   = err.message
            loading.value = false
        }
    }

    watch([nodeId, hoursBack, fromDate, toDate], subscribe, { immediate: true })
    onUnmounted(() => unsub())

    return { records, loading, error, labels, temps, batteries, rssis }
}