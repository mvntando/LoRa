<template>
    <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-[22px] font-600 text-[#1c1c1a] tracking-tight">Documentation</h1>
            <p class="text-[13.5px] text-[#a09f99] mt-0.5">LoRaNet Dashboard — quick reference</p>
        </div>

        <!-- TOC -->
        <nav class="bg-white border border-[#e4e2db] rounded-xl px-5 py-4 mb-8">
            <p class="text-[10.5px] font-600 text-[#a09f99] uppercase tracking-widest mb-3">On this page</p>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <a
                    v-for="section in sections"
                    :key="section.id"
                    :href="'#' + section.id"
                    class="flex items-center gap-2 text-[13px] text-[#6b6a65] hover:text-[#1a7f72] transition-colors group"
                >
                    <span class="w-1 h-1 rounded-full bg-[#c8c6be] group-hover:bg-[#1a7f72] transition-colors flex-shrink-0"></span>
                    {{ section.title }}
                </a>
            </div>
        </nav>

        <!-- Sections -->
        <div class="space-y-2">

            <!-- 1. Dashboard -->
            <DocSection :id="sections[0].id" :title="sections[0].title">
                <p class="doc-body">
                    The dashboard streams your entire LoRa network in real-time from Firestore using
                    <Code>onSnapshot</Code> listeners — no manual refresh needed. A single Pinia store
                    (<Code>nodeStore</Code>) holds the listener, so all views share one connection.
                </p>
                <DocTable class="mt-4" :rows="dashboardRows" />
            </DocSection>

            <!-- 2. Alerts -->
            <DocSection :id="sections[1].id" :title="sections[1].title">
                <p class="doc-body">
                    Alerts are generated automatically inside the store by watching
                    <Code>nodes</Code> and <Code>thresholds</Code> together. When either changes,
                    the alert list rebuilds. No separate Firestore collection is needed.
                </p>
                <DocTable class="mt-4" :rows="alertRows" />
                <Callout type="info" class="mt-4">
                    Alert severity is either <strong>critical</strong> or <strong>warning</strong>.
                    The sidebar badge shows the total count. The Alerts page lets you filter by severity,
                    node, or search by message.
                </Callout>
            </DocSection>

            <!-- 3. Thresholds -->
            <DocSection :id="sections[2].id" :title="sections[2].title">
                <p class="doc-body">
                    Thresholds are stored in Firestore at <Code>settings/thresholds</Code> and loaded
                    once on startup via <Code>useThresholds()</Code> inside the store. Defaults are
                    applied immediately so the dashboard works before Firestore responds.
                </p>
                <DocTable class="mt-4" :rows="thresholdRows" />
                <Callout type="warning" class="mt-4">
                    Changes saved in Settings take effect immediately — the store's
                    <Code>watch([nodes, thresholds])</Code> re-runs alert generation as soon as
                    the new thresholds land.
                </Callout>
            </DocSection>

            <!-- 4. Node setup -->
            <DocSection :id="sections[3].id" :title="sections[3].title">
                <p class="doc-body">
                    Each physical LoRa node publishes readings to your backend at a regular interval
                    (30 s – 5 min recommended). The backend writes to Firestore — the dashboard is
                    read-only from the node's perspective.
                </p>
                <p class="text-[13px] font-600 text-[#1c1c1a] mt-5 mb-2">Recommended publish payload</p>
                <CodeBlock :code="payloadExample" lang="json" />
                <p class="doc-body mt-4">On each publish, write to two places in Firestore:</p>
                <ol class="mt-3 space-y-2 list-none">
                    <li v-for="(step, i) in writeSteps" :key="i"
                        class="flex items-start gap-3 text-[13px] text-[#3d3d3a]">
                        <span class="w-5 h-5 rounded-full bg-[#e8f5f3] text-[#1a7f72] text-[10px] font-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {{ i + 1 }}
                        </span>
                        <span v-html="step"></span>
                    </li>
                </ol>
                <Callout type="warning" class="mt-4">
                    Always write <Code>lastSeen</Code> as a Firestore <strong>Timestamp</strong>,
                    not a string. The dashboard uses <Code>.toDate()</Code> to compute relative times
                    and online status.
                </Callout>
            </DocSection>

            <!-- 5. Firestore structure -->
            <DocSection :id="sections[4].id" :title="sections[4].title">
                <p class="doc-body">
                    Two levels: a top-level <Code>nodes</Code> collection for current state,
                    and a <Code>records</Code> subcollection per node for historical charts.
                    Thresholds live in a separate <Code>settings</Code> collection.
                </p>

                <p class="text-[13px] font-600 text-[#1c1c1a] mt-5 mb-2">
                    <Code>nodes/{nodeId}</Code> — current state
                </p>
                <DocTable :rows="nodeDocRows" />

                <p class="text-[13px] font-600 text-[#1c1c1a] mt-6 mb-2">
                    <Code>nodes/{nodeId}/records/{recordId}</Code> — historical record
                </p>
                <DocTable :rows="recordDocRows" />

                <p class="text-[13px] font-600 text-[#1c1c1a] mt-6 mb-2">
                    <Code>settings/thresholds</Code> — alert + display thresholds
                </p>
                <DocTable :rows="thresholdDocRows" />

                <Callout type="info" class="mt-4">
                    Records are queried with <Code>where('timestamp', '>=', since)</Code> +
                    <Code>orderBy('timestamp', 'asc')</Code>. Firestore requires a composite index
                    on this pair — it will give you a direct creation link on the first query.
                </Callout>
            </DocSection>

            <!-- 6. Node status logic -->
            <DocSection :id="sections[5].id" :title="sections[5].title">
                <p class="doc-body">
                    Node status is computed client-side from <Code>lastSeen</Code> using
                    <Code>nodeStatus(date, offlineMin)</Code> from <Code>utils/time.js</Code>.
                    Status is binary — online or offline. The <Code>offlineMin</Code> value
                    comes from thresholds so it respects your settings, with a safe default
                    of 30 minutes before thresholds load.
                </p>
                <DocTable class="mt-4" :rows="statusRows" />
                <Callout type="info" class="mt-4">
                    <Code>NodeRow</Code> recalculates the label every 30 seconds via a
                    <Code>setInterval</Code> tick ref, so "2m ago" stays accurate without
                    a page reload.
                </Callout>
            </DocSection>

        </div>

        <div class="mt-12 pb-8 text-center text-[12px] text-[#c8c6be]">
            LoRaNet Dashboard · Vue 3 + Pinia + Firebase
        </div>

    </div>
</template>

<script setup>
import { h, resolveComponent } from 'vue'

// Inline sub-components

const Code = {
    setup(_, { slots }) {
        return () => h('code', {}, slots.default?.())
    }
}

const DocSection = {
    props: ['id', 'title'],
    setup(props, { slots }) {
        return () => h('section', { id: props.id, class: 'bg-white rounded-xl border border-[#e4e2db] px-6 py-6' }, [
            h('div', { class: 'flex items-center gap-3 mb-4 pb-4 border-b border-[#f0efe9]' }, [
                h('h2', { class: 'text-[15px] font-600 text-[#1c1c1a] tracking-tight' }, props.title),
            ]),
            slots.default?.(),
        ])
    }
}

const Callout = {
    props: ['type'],
    setup(props, { slots }) {
        const styles = {
            info:    { wrap: 'bg-[#e8f5f3] border-[#b2ddd8]', text: 'text-[#1a7f72]', icon: 'ℹ' },
            warning: { wrap: 'bg-amber-50 border-amber-200',   text: 'text-amber-700', icon: '⚠' },
        }
        const s = styles[props.type]
        return () => h('div', { class: `rounded-lg border px-4 py-3 flex gap-2.5 ${s.wrap}` }, [
            h('span', { class: `text-[13px] flex-shrink-0 mt-0.5 ${s.text}` }, s.icon),
            h('p',    { class: `text-[12.5px] leading-relaxed ${s.text}` }, slots.default?.()),
        ])
    }
}

const CodeBlock = {
    props: ['code', 'lang'],
    setup(props) {
        return () => h('div', { class: 'rounded-lg border border-[#e4e2db] overflow-hidden' }, [
            h('div', { class: 'flex items-center justify-between bg-[#f0efe9] border-b border-[#e4e2db] px-4 py-1.5' }, [
                h('span', { class: 'text-[10.5px] font-mono font-500 text-[#a09f99] uppercase tracking-wider' }, props.lang ?? 'code'),
            ]),
            h('pre', { class: 'bg-[#f5f4f1] px-4 py-3.5 text-[12px] text-[#1c1c1a] font-mono overflow-x-auto leading-relaxed' }, props.code),
        ])
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
                    h('th', { class: 'text-left px-4 py-2.5 font-500 text-[#a09f99] uppercase tracking-wider text-[10.5px]' }, 'Notes'),
                ])),
                h('tbody', {}, props.rows.map((row, i) =>
                    h('tr', {
                        key: i,
                        class: i < props.rows.length - 1 ? 'border-b border-[#f0efe9]' : ''
                    }, [
                        h('td', { class: 'px-4 py-2.5 font-mono text-[#1a7f72]' }, row[0]),
                        h('td', { class: 'px-4 py-2.5 text-[#a09f99]' }, row[1]),
                        h('td', { class: 'px-4 py-2.5 text-[#3d3d3a]' }, row[2]),
                    ])
                ))
            ])
        ])
    }
}

// Data

const sections = [
    { id: 'dashboard',  title: 'Dashboard Overview' },
    { id: 'alerts',     title: 'Alerts' },
    { id: 'thresholds', title: 'Thresholds & Settings' },
    { id: 'firmware',   title: 'Node Setup & Firmware' },
    { id: 'firestore',  title: 'Firestore Data Structure' },
    { id: 'status',     title: 'Node Status Logic' },
]

const dashboardRows = [
    ['Dashboard',    'Page', 'Live stat cards + node table with status, temp, battery, RSSI'],
    ['Nodes',        'Page', 'Full node list — click any row to open its detail page'],
    ['Node detail',  'Page', 'Per-node charts (temp, battery, RSSI) with 1H / 6H / 24H / 7D range'],
    ['Alerts',       'Page', 'Filterable alert log generated from thresholds — no separate collection'],
    ['Map',          'Page', 'Geographic node layout'],
    ['History',      'Page', 'Cross-node historical data'],
    ['Settings',     'Page', 'Edit thresholds — changes persist to Firestore and apply immediately'],
]

const alertRows = [
    ['offline',     'critical', 'Node has not been seen within offlineMin minutes'],
    ['tempMax',     'critical', 'lastTemp >= tempMax threshold'],
    ['tempMin',     'warning',  'lastTemp <= tempMin threshold'],
    ['rssiMin',     'warning',  'lastRssi <= rssiMin threshold'],
    ['batteryMin',  'warning',  'lastBattery <= batteryMin threshold'],
]

const thresholdRows = [
    ['tempMax',    'number', 'Max temperature °C — triggers critical alert'],
    ['tempMin',    'number', 'Min temperature °C — triggers warning alert'],
    ['rssiMin',    'number', 'Min RSSI dBm — triggers warning alert'],
    ['batteryMin', 'number', 'Min battery % — triggers warning alert'],
    ['offlineMin', 'number', 'Minutes since lastSeen before node is considered offline'],
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
    'Update <code>nodes/{nodeId}</code> with <code>lastTemp</code>, <code>lastBattery</code>, <code>lastRssi</code>, and <code>lastSeen</code> using <strong>set with merge</strong>.',
    'Append a new document to <code>nodes/{nodeId}/records</code> with the full reading snapshot.',
]

const nodeDocRows = [
    ['name',        'string',    'Human-readable label shown in the dashboard'],
    ['location',    'string',    'Physical location tag e.g. "Lab" or "Rooftop"'],
    ['lastTemp',    'double',    'Most recent temperature reading in °C'],
    ['lastBattery', 'int64',     'Most recent battery level (0–100 %)'],
    ['lastRssi',    'int64',     'Most recent signal strength in dBm (negative)'],
    ['lastSeen',    'timestamp', 'Firestore Timestamp of the last received packet'],
    ['lat',         'double',    'Optional — latitude for map view'],
    ['lng',         'double',    'Optional — longitude for map view'],
]

const recordDocRows = [
    ['temp',      'double',    'Temperature reading in °C'],
    ['battery',   'int64',     'Battery level at time of reading (0–100 %)'],
    ['rssi',      'int64',     'Signal strength in dBm at time of reading'],
    ['timestamp', 'timestamp', 'Used for range queries and chart x-axis — must be a Timestamp'],
]

const thresholdDocRows = [
    ['tempMax',    'number', 'Default 40'],
    ['tempMin',    'number', 'Default 0'],
    ['rssiMin',    'number', 'Default -110'],
    ['batteryMin', 'number', 'Default 20'],
    ['offlineMin', 'number', 'Default 30'],
]

const statusRows = [
    ['online',  'seen within offlineMin', 'Green dot in NodeRow and map'],
    ['offline', 'not seen within offlineMin', 'Grey dot — also triggers a critical alert'],
]
</script>

<style scoped>
.doc-body {
    font-size: 13.5px;
    color: #3d3d3a;
    line-height: 1.7;
}
code {
    background-color: #f0efe9;
    color: #1a7f72;
    font-size: 11.5px;
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>