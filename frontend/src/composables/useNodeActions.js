import { ref } from 'vue'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export function useNodeActions() {
    const saving    = ref(false)
    const saveError = ref(null)

    async function addNode({ id, name, location }) {
        if (!id || !name) return false
        saving.value    = true
        saveError.value = null
        try {
            const ref = doc(db, 'nodes', id)
            const existing = await getDoc(ref)
            if (existing.exists()) {
                saveError.value = `Node ${id} already exists.`
                return false
            }
            await setDoc(ref, {
                name,
                location:    location || '—',
                lastTemp:    null,
                lastBattery: null,
                lastRssi:    null,
                lastSeen:    null,
            })
            return true
        } catch (e) {
            saveError.value = e.message
            return false
        } finally {
            saving.value = false
        }
    }

    return { saving, saveError, addNode }
}