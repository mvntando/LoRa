// src/composables/useAllRecords.js

import { ref, onUnmounted } from 'vue'
import { collectionGroup, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function useAllRecords(hoursBack = 24) {
    const allRecords = ref([])
    const loading    = ref(true)

    const since = new Date()
    since.setHours(since.getHours() - hoursBack)

    const q = query(
        collectionGroup(db, 'records'),
        where('timestamp', '>=', Timestamp.fromDate(since)),
        orderBy('timestamp', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
        allRecords.value = snap.docs.map(doc => ({
            nodeId:    doc.ref.parent.parent.id,
            temp:      doc.data().temp      ?? null,
            battery:   doc.data().battery   ?? null,
            rssi:      doc.data().rssi      ?? null,
            timestamp: doc.data().timestamp?.toDate?.() ?? null,
        }))
        loading.value = false
    })

    onUnmounted(unsub)

    return { allRecords, loading }
}