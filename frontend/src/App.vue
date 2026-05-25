<template>
    <div class="flex h-screen overflow-hidden bg-[#f5f4f1]">
        <AppSidebar />
        <main class="flex-1 overflow-y-auto p-8">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'

import { useNodeStore } from '@/stores/nodeStore'

const store = useNodeStore()
store.init()  // Firestore Node listener for the whole app
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body { height: 100%; }

body {
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e4e2db; border-radius: 99px; }
</style>