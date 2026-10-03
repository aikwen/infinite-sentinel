<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

interface Props {
  enabled?: boolean
  root?: HTMLElement | null
  rootMargin?: string
  threshold?: number
}

const props = withDefaults(
  defineProps<Props>(),
  {
    enabled: true,
    root: null,
    rootMargin: '0px 0px 200px 0px',
    threshold: 0,
  },
)

const emit = defineEmits<{
  load: []
}>()

/*
 * Sentinel 对应的真实 DOM。
 *
 * 组件不会向外暴露 DOM，只通过 expose 的 check()
 * 提供主动重新评估能力。
 */
const sentinelRef =
  ref<HTMLElement | null>(null)

/*
 * IntersectionObserver 不参与模板渲染，
 * 因此不需要使用 ref。
 */
let observer: IntersectionObserver | null =
  null

/*
 * 处理 IntersectionObserver 的通知。
 *
 * observer 参数必须仍然是当前组件正在使用的实例。
 * root / rootMargin / threshold 改变时组件会重建 observer，
 * 旧 observer 已排队的 callback 仍可能晚于 disconnect 到达。
 *
 * 因此只检查 entry.target 不够，还必须验证 callback 来源。
 */
const handleIntersection = (
  entries: IntersectionObserverEntry[],
  sourceObserver: IntersectionObserver,
) => {
  if (
    sourceObserver !== observer
    || !props.enabled
  ) {
    return
  }

  const sentinel = sentinelRef.value

  if (!sentinel) {
    return
  }

  const intersecting = entries.some(
    entry =>
      entry.target === sentinel
      && entry.isIntersecting,
  )

  if (intersecting) {
    emit('load')
  }
}

/*
 * 释放当前 observer。
 *
 * takeRecords() 会取出并清空尚未交付的 observation records，
 * 避免已经失效的 observer 在重建后继续交付旧通知。
 */
const disconnectObserver = () => {
  if (!observer) {
    return
  }

  observer.takeRecords()
  observer.disconnect()
  observer = null
}

/*
 * 根据当前 props 创建新的 observer。
 *
 * root、rootMargin、threshold 任一变化时都会调用这里，
 * 保证原生 IntersectionObserver 的配置和组件 props 一致。
 *
 * SSR、测试环境或不支持 IntersectionObserver 的运行环境中，
 * 组件静默保持不可用，不实现额外几何 fallback。
 */
const createObserver = () => {
  disconnectObserver()

  if (
    typeof IntersectionObserver
      === 'undefined'
  ) {
    return
  }

  const sentinel = sentinelRef.value

  if (!sentinel) {
    return
  }

  observer = new IntersectionObserver(
    handleIntersection,
    {
      root: props.root,
      rootMargin: props.rootMargin,
      threshold: props.threshold,
    },
  )

  observer.observe(sentinel)
}

/*
 * 主动要求 IntersectionObserver
 * 重新评估 sentinel 当前的交叉状态。
 *
 * check() 不同步返回 visible / invisible。
 * 它只是重新注册 target；
 * 浏览器会在之后的 IntersectionObserver
 * callback 中交付重新评估结果。
 *
 * 如果 sentinel 当前处于观察区域，
 * 且 enabled=true，
 * 最终仍然通过统一的 load 事件通知父组件。
 */
const check = () => {
  if (
    !props.enabled
    || !observer
  ) {
    return
  }

  const sentinel = sentinelRef.value

  if (!sentinel) {
    return
  }

  /*
   * 清除当前已经排队、但尚未交付的 records，
   * 避免旧状态和这次主动重新评估混在一起。
   */
  observer.takeRecords()

  observer.unobserve(sentinel)
  observer.observe(sentinel)
}

/*
 * Observer 配置发生变化时需要完整重建。
 *
 * 使用显式 source 数组主要为了让依赖关系更清楚：
 * 这三个 prop 都属于 IntersectionObserver 构造参数。
 */
watch(
  [
    () => props.root,
    () => props.rootMargin,
    () => props.threshold,
  ],
  () => {
    createObserver()
  },
)

/*
 * enabled 只表示“当前是否允许产生 load 通知”。
 *
 * observer 在 disabled 期间仍然保持工作。
 *
 * 如果 sentinel 在 enabled=false 时已经进入观察区域，
 * IntersectionObserver 会记录新的交叉状态，但组件不会 emit。
 * 之后重新 enabled 时，如果几何关系没有变化，
 * 浏览器不会产生新的 threshold crossing。
 *
 * 因此 false -> true 时主动 check()，
 * 让 observer 重新评估当前状态。
 *
 * true -> false 时清空已经排队的 records，
 * 避免 disabled 前产生的通知在重新 enabled 后晚到。
 */
watch(
  () => props.enabled,
  (enabled, previousEnabled) => {
    if (!enabled) {
      observer?.takeRecords()
      return
    }

    if (previousEnabled === false) {
      check()
    }
  },
)

onMounted(() => {
  createObserver()
})

onBeforeUnmount(() => {
  disconnectObserver()
})

defineExpose({
  check,
})
</script>

<template>
  <div
    ref="sentinelRef"
    class="infinite-sentinel"
    aria-hidden="true"
  />
</template>

<style scoped>
.infinite-sentinel {
  width: 100%;
  height: 1px;
}
</style>