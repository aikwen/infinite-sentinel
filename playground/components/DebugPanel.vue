<script setup lang="ts">
import type {
  PlaygroundState,
} from '../usePlayground'

const props = defineProps<{
  state: PlaygroundState
}>()

const emit = defineEmits<{
  check: []
}>()
</script>

<template>
  <aside class="debug-panel">
    <header class="panel-header">
      <div>
        <h1>Infinite Sentinel</h1>
        <p>Debug Playground</p>
      </div>
    </header>

    <section class="section">
      <h2>Runtime</h2>

      <div class="status-grid">
        <div class="status-item">
          <span>Items</span>
          <strong>
            {{ props.state.items.value.length }}
          </strong>
        </div>

        <div class="status-item">
          <span>Loading</span>
          <strong>
            {{ props.state.loading.value }}
          </strong>
        </div>

        <div class="status-item">
          <span>Has More</span>
          <strong>
            {{ props.state.hasMore.value }}
          </strong>
        </div>

        <div class="status-item">
          <span>Can Load</span>
          <strong>
            {{ props.state.canLoad.value }}
          </strong>
        </div>

        <div class="status-item">
          <span>Load Events</span>
          <strong>
            {{ props.state.loadEventCount.value }}
          </strong>
        </div>

        <div class="status-item">
          <span>Requests</span>
          <strong>
            {{ props.state.requestCount.value }}
          </strong>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Sentinel</h2>

      <label class="switch-row">
        <span>Enabled</span>

        <input
          v-model="props.state.enabled.value"
          type="checkbox"
        >
      </label>

      <label class="field">
        <span>Root Margin</span>

        <input
          v-model="props.state.rootMargin.value"
          type="text"
        >
      </label>

      <label class="field">
        <span>Threshold</span>

        <input
          v-model.number="
            props.state.threshold.value
          "
          type="number"
          min="0"
          max="1"
          step="0.1"
        >
      </label>
    </section>

    <section class="section">
      <h2>Mock API</h2>

      <label class="field">
        <span>Page Size</span>

        <input
          v-model.number="
            props.state.pageSize.value
          "
          type="number"
          min="1"
          max="50"
        >
      </label>

      <label class="field">
        <span>Total Items</span>

        <input
          v-model.number="
            props.state.totalItems.value
          "
          type="number"
          min="0"
          max="500"
        >
      </label>
    </section>

    <section class="section">
      <h2>Actions</h2>

      <div class="actions">
        <button
          type="button"
          @click="emit('check')"
        >
          Check Sentinel
        </button>

        <button
          type="button"
          @click="
            props.state.clearItems()
          "
        >
          Clear Items
        </button>

        <button
          type="button"
          @click="
            props.state.clearLogs()
          "
        >
          Clear Logs
        </button>

        <button
          type="button"
          @click="props.state.reset()"
        >
          Reset
        </button>
      </div>
    </section>

    <section class="section logs-section">
      <div class="logs-header">
        <h2>Logs</h2>

        <span>
          {{ props.state.logs.value.length }}
        </span>
      </div>

      <div class="logs">
        <div
          v-if="
            props.state.logs.value.length === 0
          "
          class="empty-log"
        >
          No logs yet.
        </div>

        <div
          v-for="
            log in props.state.logs.value
          "
          :key="log.id"
          class="log-row"
        >
          <span class="log-time">
            {{ log.time }}
          </span>

          <span class="log-message">
            {{ log.message }}
          </span>
        </div>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.debug-panel {
  display: flex;
  flex-direction: column;
  width: 360px;
  min-width: 360px;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.panel-header p {
  margin: 4px 0 0;
  color: #737373;
  font-size: 13px;
}

.section {
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section h2 {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
}

.status-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
}

.status-item span {
  color: #737373;
  font-size: 11px;
}

.status-item strong {
  font-size: 14px;
  font-weight: 600;
}

.field,
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 10px;
  font-size: 13px;
}

.field:first-of-type {
  margin-top: 0;
}

.field input {
  width: 165px;
  box-sizing: border-box;
  padding: 6px 8px;
  border: 1px solid #d4d4d4;
  border-radius: 6px;
  background: #fff;
  font: inherit;
}

.switch-row input {
  width: 16px;
  height: 16px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.actions button {
  padding: 8px 10px;
  border: 1px solid #d4d4d4;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.actions button:hover {
  background: #f5f5f5;
}

.logs-section {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.logs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logs-header h2 {
  margin-bottom: 12px;
}

.logs-header span {
  margin-bottom: 12px;
  color: #a3a3a3;
  font-size: 11px;
}

.logs {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  font-family:
    "Cascadia Code",
    "JetBrains Mono",
    monospace;
  font-size: 11px;
}

.log-row {
  display: flex;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #eeeeee;
}

.log-time {
  flex-shrink: 0;
  color: #a3a3a3;
}

.log-message {
  min-width: 0;
  overflow-wrap: anywhere;
}

.empty-log {
  color: #a3a3a3;
}
</style>