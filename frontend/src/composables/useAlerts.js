import { ref, computed } from 'vue'
import { useNodeStore } from '@/stores/nodeStore'
import { storeToRefs } from 'pinia'

export function useAlerts() {
    const store = useNodeStore()
    const { alerts, criticalCount } = storeToRefs(store)

    const filter = ref('all')
    const search = ref('')

    const warningCount = computed(() => alerts.value.filter(a => a.severity === 'warning').length)

    const filtered = computed(() => {
        let list = alerts.value

        if (filter.value === 'critical')     list = list.filter(a => a.severity === 'critical')
        else if (filter.value === 'warning') list = list.filter(a => a.severity === 'warning')

        const term = search.value.trim().toLowerCase()
        if (term) {
            list = list.filter(a =>
                a.node.toLowerCase().includes(term)    ||
                a.nodeId.toLowerCase().includes(term)  ||
                a.type.toLowerCase().includes(term)    ||
                a.message.toLowerCase().includes(term)
            )
        }

        return list
    })

    return { alerts, filtered, criticalCount, warningCount, filter, search }
}