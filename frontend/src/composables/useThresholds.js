import { ref, onUnmounted } from 'vue'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const DEFAULTS = {
    tempMax:     35,    // °C — alert if lastTemp exceeds this
    tempMin:     0,     // °C — alert if lastTemp drops below this
    batteryMin:  20,    // %  — alert if lastBattery drops below this
    rssiMin:     -110,  // dBm — alert if lastRssi drops below this
    offlineMin:  30,    // minutes before a node is considered offline
}

/**
 * Reactive Firestore-backed thresholds.
 * Reads from `settings/thresholds`, writes back on save().
 */
export function useThresholds() {
    const thresholds = ref({ ...DEFAULTS })
    const loading    = ref(true)
    const saving     = ref(false)
    const error      = ref(null)

    const ref_ = doc(db, 'settings', 'thresholds')

    const unsub = onSnapshot(ref_,
        (snap) => {
            if (snap.exists()) {
                thresholds.value = { ...DEFAULTS, ...snap.data() }
            }
            // If doc doesn't exist yet we just use DEFAULTS — save() will create it
            loading.value = false
        },
        (err) => {
            console.error('[useThresholds]', err)
            error.value   = err.message
            loading.value = false
        }
    )

    onUnmounted(unsub)

    async function save(values) {
        saving.value = true
        error.value  = null
        try {
            await setDoc(ref_, values, { merge: true })
            thresholds.value = { ...thresholds.value, ...values }
        } catch (err) {
            console.error('[useThresholds save]', err)
            error.value = err.message
        } finally {
            saving.value = false
        }
    }

    return { thresholds, loading, saving, error, save }
}