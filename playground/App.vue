<script setup lang="ts">
import {
  ref,
} from 'vue'

import DebugPanel from './components/DebugPanel.vue'
import SentinelDemo from './components/SentinelDemo.vue'

import {
  usePlayground,
} from './usePlayground'

interface SentinelDemoExpose {
  check: () => void
}

const state = usePlayground()

const demoRef =
  ref<SentinelDemoExpose | null>(null)

const checkSentinel = () => {
  demoRef.value?.check()
}
</script>

<template>
  <main class="playground">
    <DebugPanel
      :state="state"
      @check="checkSentinel"
    />

    <SentinelDemo
      ref="demoRef"
      :state="state"
    />
  </main>
</template>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  overflow: hidden;
  color: #171717;
  background: #f5f5f5;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input {
  font-family: inherit;
}

.playground {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>