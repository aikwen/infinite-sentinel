<script setup lang="ts">
import {
  nextTick,
  ref,
} from 'vue'

import {
  InfiniteSentinel,
} from '../../src'

import {
  getMockItems,
} from '../mock/mockApi'

import type {
  PlaygroundState,
} from '../usePlayground'

interface SentinelExpose {
  check: () => void
}

const props = defineProps<{
  state: PlaygroundState
}>()

const scrollRef =
  ref<HTMLElement | null>(null)

const sentinelRef =
  ref<SentinelExpose | null>(null)

/*
 * 每一次 @load 都会进入这里。
 *
 * loadEventCount 统计的是 Sentinel 实际 emit
 * 了多少次，而 requestCount 只统计真正开始的请求。
 *
 * 因此如果请求期间 Sentinel 再次 emit，
 * 可以通过两者的差异观察 loading 防并发是否有效。
 */
const handleLoad = () => {
  props.state.loadEventCount.value += 1

  props.state.addLog(
    `load event #${props.state.loadEventCount.value} received`,
  )

  void loadMore()
}

/*
 * 业务层加载函数。
 *
 * InfiniteSentinel 不负责：
 *
 * - loading
 * - hasMore
 * - offset
 * - limit
 * - API request
 *
 * 所有这些都由调用组件自己维护。
 */
const loadMore = async () => {
  /*
   * Sentinel 只是通知机制。
   *
   * 即使它在网络请求期间再次 emit，
   * 业务函数自身也必须能够拒绝并发请求。
   */
  if (props.state.loading.value) {
    props.state.addLog(
      'load ignored: request already in progress',
    )

    return
  }

  if (!props.state.hasMore.value) {
    props.state.addLog(
      'load ignored: no more items',
    )

    return
  }

  if (!props.state.enabled.value) {
    props.state.addLog(
      'load ignored: sentinel disabled',
    )

    return
  }

  const offset =
    props.state.items.value.length

  const limit =
    props.state.pageSize.value

  props.state.loading.value = true
  props.state.requestCount.value += 1

  const requestId =
    props.state.requestCount.value

  props.state.addLog(
    `request #${requestId} started — offset=${offset}, limit=${limit}`,
  )

  try {
    const result =
      await getMockItems({
        offset,
        limit,
        total:
          props.state.totalItems.value,
      })

    props.state.items.value.push(
      ...result.items,
    )

    props.state.addLog(
      `request #${requestId} completed — ${result.items.length} items, ${result.duration}ms`,
    )

    /*
     * 当后端返回数量不足一页时，
     * 业务层可以确定已经没有更多数据。
     *
     * Sentinel 不知道 hasMore 的存在。
     */
    if (result.items.length < limit) {
      props.state.hasMore.value = false

      props.state.addLog(
        'hasMore = false',
      )
    }

    /*
     * Vue 对响应式数组的修改不会要求调用方
     * 自己同步操作 DOM。
     *
     * await nextTick() 保证新增 item 已经完成 DOM 更新，
     * sentinel 此时的位置才代表追加数据后的真实布局。
     */
    await nextTick()

    props.state.addLog(
      'DOM updated',
    )
  } catch (error) {
    props.state.addLog(
      `request #${requestId} failed`,
    )

    console.error(error)
  } finally {
    props.state.loading.value = false
  }

  /*
   * 请求结束后 Sentinel 可能从头到尾都没有离开
   * IntersectionObserver 的观察区域。
   *
   * 这种情况下不会产生新的 threshold crossing，
   * 所以 Observer 不一定再次 callback。
   *
   * 主动调用 check() 要求 Sentinel
   * 重新评估当前 intersection 状态。
   *
   * 如果它仍然可见，就再次 emit load，
   * 从而实现「列表未填满时继续加载下一页」。
   */
  if (
    props.state.hasMore.value
    && props.state.enabled.value
  ) {
    props.state.addLog(
      'sentinel.check()',
    )

    sentinelRef.value?.check()
  }
}

/*
 * DebugPanel 可以手动执行一次 check，
 * 用于观察主动检查的行为。
 */
const check = () => {
  props.state.addLog(
    'manual sentinel.check()',
  )

  sentinelRef.value?.check()
}

defineExpose({
  check,
})
</script>

<template>
  <section class="demo">
    <header class="demo-header">
      <div>
        <h2>Scroll Container</h2>

        <p>
          root = internal scroll container
        </p>
      </div>

      <div class="demo-state">
        {{ props.state.items.value.length }}
        /
        {{ props.state.totalItems.value }}
      </div>
    </header>

    <div
      ref="scrollRef"
      class="scroll-container"
    >
      <article
        v-for="item in props.state.items.value"
        :key="item.id"
        class="item"
      >
        <span class="item-id">
          {{ item.id }}
        </span>

        <span>
          {{ item.name }}
        </span>
      </article>

      <InfiniteSentinel
        ref="sentinelRef"
        :root="scrollRef"
        :enabled="props.state.enabled.value"
        :root-margin="
          props.state.rootMargin.value
        "
        :threshold="
          props.state.threshold.value
        "
        @load="handleLoad"
      />

      <div
        v-if="props.state.loading.value"
        class="message"
      >
        Loading...
      </div>

      <div
        v-else-if="
          !props.state.hasMore.value
        "
        class="message"
      >
        No more items
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  box-sizing: border-box;
}

.demo-header {
  display: flex;
  width: min(640px, 100%);
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
}

.demo-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-header p {
  margin: 4px 0 0;
  color: #737373;
  font-size: 12px;
}

.demo-state {
  color: #737373;
  font-size: 12px;
}

.scroll-container {
  width: min(640px, 100%);
  height: 560px;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #d4d4d4;
  border-radius: 12px;
  background: #fff;
}

.item {
  display: flex;
  height: 72px;
  align-items: center;
  gap: 14px;
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 0 18px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fafafa;
}

.item-id {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #eeeeee;
  color: #737373;
  font-size: 11px;
}

.message {
  padding: 18px 0;
  text-align: center;
  color: #737373;
  font-size: 12px;
}
</style>