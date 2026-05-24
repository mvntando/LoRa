import { ref, onUnmounted } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

/**
 * Reactive live listener for the `nodes` collection.
 * Each node doc maps to: { id, name, location, lastTemp, lastBattery, lastRssi, lastSeen }
 * `lastSeen` is converted from a Firestore Timestamp to a JS Date.
 */
export function useNodes() {
    const nodes   = ref([])
    const loading = ref(true)
    const error   = ref(null)

    const unsub = onSnapshot(
        collection(db, 'nodes'),
        (snapshot) => {
            nodes.value = snapshot.docs.map(doc => {
                const d = doc.data()
                return {
                    id:          doc.id,
                    name:        d.name        ?? doc.id,
                    location:    d.location    ?? '—',
                    lastTemp:    d.lastTemp     ?? null,
                    lastBattery: d.lastBattery  ?? null,
                    lastRssi:    d.lastRssi     ?? null,
                    // Firestore Timestamp -> JS Date
                    lastSeen:    d.lastSeen?.toDate?.() ?? null,
                    lat:         d.lat ?? null,
                    lng:         d.lng ?? null,

                }
            })
            loading.value = false
        },
        (err) => {
            console.error('[useNodes]', err)
            error.value   = err.message
            loading.value = false
        }
    )

    // Auto-cleanup when the component using this composable is unmounted
    onUnmounted(unsub)

    return { nodes, loading, error }
}