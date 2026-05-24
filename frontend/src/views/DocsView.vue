<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="mb-10">
            <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Documentation</h1>
            <p class="text-[13.5px] text-[#a09f99] mt-0.5">LoRaNet Dashboard - quick reference</p>
        </div>

        <!-- TOC -->
        <nav class="bg-white border border-[#e4e2db] rounded-xl px-5 py-4 mb-8">
            <p class="text-[11px] font-500 text-[#a09f99] uppercase tracking-widest mb-3">On this page</p>
            <div class="flex flex-col gap-1.5">
                <a
                    v-for="section in sections"
                    :key="section.id"
                    :href="'#' + section.id"
                    class="flex items-center gap-2 text-[13px] text-[#6b6a65] hover:text-[#1a7f72] transition-colors group"
                >
                    <span class="w-1 h-1 rounded-full bg-[#e4e2db] group-hover:bg-[#1a7f72] transition-colors"></span>
                    {{ section.title }}
                </a>
            </div>
        </nav>

        <!-- Sections -->
        <div class="space-y-10">

            <!-- Dashboard -->
            <section :id="sections[0].id">
                <SectionHeader :number="1" title="Dashboard Overview" />
                <p class="doc-body">
                    The dashboard gives you a live view of your entire LoRa network. All data is streamed
                    in real-time from Firestore using <code>onSnapshot</code> listeners - no manual refresh needed.
                </p>

                <DocTable :rows="dashboardRows" />

                <Callout type="info">
                    Node status is derived from <code>lastSeen</code>: online if seen within 5 min,
                    warning within 30 min, offline otherwise. This is recalculated client-side every 30 seconds.
                </Callout>
            </section>

            <!-- Node setup -->
            <section :id="sections[1].id">
                <SectionHeader :number="2" title="Node Setup & Firmware" />
                <p class="doc-body">
                    Each physical LoRa node should publish readings to your backend at a regular interval
                    (30 s – 5 min recommended). The backend is responsible for writing to Firestore.
                </p>

                <p class="text-[13px] font-500 text-[#1c1c1a] mt-5 mb-2">Recommended publish payload</p>
                <CodeBlock :code="payloadExample" />

                <p class="doc-body mt-4">
                    On each publish, your backend should update two places in Firestore:
                </p>
                <ol class="mt-3 space-y-1.5 list-none">
                    <li v-for="(step, i) in writeSteps" :key="i" class="flex items-start gap-3 text-[13px] text-[#6b6a65]">
                        <span class="w-5 h-5 rounded-full bg-[#e8f5f3] text-[#1a7f72] text-[10px] font-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {{ i + 1 }}
                        </span>
                        <span v-html="step"></span>
                    </li>
                </ol>

                <Callout type="warning" class="mt-4">
                    Always write <code>lastSeen</code> as a Firestore <strong>Timestamp</strong>, not a plain string.
                    The dashboard uses <code>.toDate()</code> to compute relative times.
                </Callout>
            </section>

            <!-- Firestore structure -->
            <section :id="sections[2].id">
                <SectionHeader :number="3" title="Firestore Data Structure" />
                <p class="doc-body">
                    The dashboard reads from two levels: a top-level <code>nodes</code> collection
                    for current state, and a <code>records</code> subcollection per node for historical charts.
                </p>

                <p class="text-[13px] font-500 text-[#1c1c1a] mt-5 mb-2">
                    <code>nodes/{nodeId}</code> - current state document
                </p>
                <DocTable :rows="nodeDocRows" />

                <p class="text-[13px] font-500 text-[#1c1c1a] mt-6 mb-2">
                    <code>nodes/{nodeId}/records/{recordId}</code> - historical record
                </p>
                <DocTable :rows="recordDocRows" />

                <Callout type="info" class="mt-4">
                    Records are queried with <code>where('timestamp', '>=', since)</code> + <code>orderBy('timestamp', 'asc')</code>.
                    Firestore requires a composite index on this field pair - it will prompt you with a direct link
                    on the first query if it doesn't exist yet.
                </Callout>
            </section>

        </div>

        <div class="mt-12 pb-8 text-center text-[12px] text-[#c8c6be]">
            LoRaNet Dashboard · Built with Vue 3 + Firebase
        </div>

    </div>
</template>

<script setup>
import { h } from 'vue'

// ── Inline sub-components (keeps this file self-contained) ──────────────────

const SectionHeader = {
    props: ['number', 'title'],
    setup(props) {
        return () => h('div', { class: 'flex items-center gap-3 mb-4' }, [
            h('span', {
                class: 'w-6 h-6 rounded-lg bg-[#1a7f72] text-white text-[11px] font-600 flex items-center justify-center flex-shrink-0'
            }, props.number),
            h('h2', { class: 'text-[16px] font-600 text-[#1c1c1a] tracking-tight' }, props.title),
        ])
    }
}

const Callout = {
    props: ['type'],
    slots: ['default'],
    setup(props, { slots }) {
        const styles = {
            info:    'bg-[#e8f5f3] border-[#b2ddd8] text-[#1a7f72]',
            warning: 'bg-amber-50 border-amber-200 text-amber-700',
        }
        return () => h('div', {
            class: `mt-4 rounded-lg border px-4 py-3 text-[12.5px] leading-relaxed ${styles[props.type]}`
        }, slots.default?.())
    }
}

const CodeBlock = {
    props: ['code'],
    setup(props) {
        return () => h('pre', {
            class: 'bg-[#f5f4f1] border border-[#e4e2db] rounded-lg px-4 py-3.5 text-[12px] text-[#1c1c1a] font-mono overflow-x-auto leading-relaxed'
        }, props.code)
    }
}

const DocTable = {
    props: ['rows'],
    setup(props) {
        return () => h('div', { class: 'rounded-xl border border-[#e4e2db] overflow-hidden' }, [
            h('table', { class: 'w-full text-[12.5px]' }, [
                h('thead', {}, h('tr', { class: 'bg-[#f5f4f1] border-b border-[#e4e2db]' }, [
                    h('th', { class: 'text-left px-4 py-2.5 font-500 text-[#a09f99] uppercase tracking-wider text-[10.5px] w-1/3' }, 'Field'),
                    h('th', { class: 'text-left px-4 py-2.5 font-500 text-[#a09f99] uppercase tracking-wider text-[10.5px] w-1/4' }, 'Type'),
                    h('th', { class: 'text-left px-4 py-2.5 font-500 text-[#a09f99] uppercase tracking-wider text-[10.5px]' }, 'Description'),
                ])),
                h('tbody', {}, props.rows.map((row, i) =>
                    h('tr', {
                        key: i,
                        class: i < props.rows.length - 1 ? 'border-b border-[#f0efe9]' : ''
                    }, [
                        h('td', { class: 'px-4 py-2.5 font-mono text-[#1a7f72]' }, row[0]),
                        h('td', { class: 'px-4 py-2.5 text-[#a09f99]' }, row[1]),
                        h('td', { class: 'px-4 py-2.5 text-[#6b6a65]' }, row[2]),
                    ])
                ))
            ])
        ])
    }
}

// ── Data ────────────────────────────────────────────────────────────────────

const sections = [
    { id: 'dashboard', title: 'Dashboard Overview' },
    { id: 'firmware',  title: 'Node Setup & Firmware' },
    { id: 'firestore', title: 'Firestore Data Structure' },
]

const dashboardRows = [
    ['Dashboard',  'Page', 'Live stat cards + full node table with status, temp, battery, RSSI'],
    ['Nodes',      'Page', 'Full node list - click any row to open its detail page'],
    ['Node detail','Page', 'Per-node charts (temp, battery, RSSI) with 1H / 6H / 24H / 7D range picker'],
    ['History',    'Page', 'Cross-node historical data and export (coming soon)'],
    ['Alerts',     'Page', 'Active and resolved alerts log (coming soon)'],
    ['Map',        'Page', 'Geographic node layout via Leaflet.js (coming soon)'],
]

const payloadExample =
`{
  "nodeId":    "N-001",
  "temp":      22.8,
  "battery":   95,
  "rssi":      -29,
  "timestamp": <unix ms or ISO string>
}`

const writeSteps = [
    'Update <code class="bg-[#f0efe9] px-1 rounded text-[#1a7f72]">nodes/{nodeId}</code> with <code class="bg-[#f0efe9] px-1 rounded text-[#1a7f72]">lastTemp</code>, <code class="bg-[#f0efe9] px-1 rounded text-[#1a7f72]">lastBattery</code>, <code class="bg-[#f0efe9] px-1 rounded text-[#1a7f72]">lastRssi</code>, and <code class="bg-[#f0efe9] px-1 rounded text-[#1a7f72]">lastSeen</code> using <strong>set with merge</strong>.',
    'Add a new document to <code class="bg-[#f0efe9] px-1 rounded text-[#1a7f72]">nodes/{nodeId}/records</code> with the full reading snapshot.',
]

const nodeDocRows = [
    ['name',        'string',    'Human-readable label shown in the dashboard'],
    ['location',    'string',    'Physical location tag, e.g. "Lab" or "Rooftop"'],
    ['lastTemp',    'double',    'Most recent temperature reading in °C'],
    ['lastBattery', 'int64',     'Most recent battery level (0–100 %)'],
    ['lastRssi',    'int64',     'Most recent signal strength in dBm (negative)'],
    ['lastSeen',    'timestamp', 'Firestore Timestamp of the last received packet'],
]

const recordDocRows = [
    ['temp',      'double',    'Temperature reading in °C'],
    ['battery',   'int64',     'Battery level at time of reading (0–100 %)'],
    ['rssi',      'int64',     'Signal strength in dBm at time of reading'],
    ['timestamp', 'timestamp', 'Firestore Timestamp - used for range queries and chart x-axis'],
]
</script>

<style scoped>
.doc-body {
    font-size: 13.5px;
    color: #6b6a65;
    line-height: 1.625;
}
code {
    background-color: #f0efe9;
    color: #1a7f72;
    font-size: 12px;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>