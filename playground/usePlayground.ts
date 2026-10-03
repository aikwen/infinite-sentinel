import {
  computed,
  ref,
} from 'vue'

import type {
  MockItem,
} from './mock/mockApi'

export interface DebugLog {
  id: number
  time: string
  message: string
}

export const usePlayground = () => {
  /*
   * 业务数据。
   *
   * 这些状态刻意放在 playground，而不是 InfiniteSentinel 中。
   * Sentinel 不应该知道 items、loading、hasMore 等业务概念。
   */
  const items = ref<MockItem[]>([])
  const loading = ref(false)
  const hasMore = ref(true)

  /*
   * Mock API 参数。
   *
   * pageSize 可以在 DebugPanel 中实时修改，
   * 用于观察不同单页数量对连续填充行为的影响。
   */
  const pageSize = ref(5)
  const totalItems = ref(40)

  /*
   * Sentinel 配置。
   */
  const enabled = ref(true)

  const rootMargin =
    ref('0px 0px 200px 0px')

  const threshold = ref(0)

  /*
   * Debug counters。
   *
   * loadEventCount:
   *   InfiniteSentinel 一共 emit 过多少次 load。
   *
   * requestCount:
   *   实际进入后端请求流程多少次。
   *
   * 两个值刻意分开，因为：
   *
   * load event 可能在 loading=true 时再次发生，
   * 但业务层应该直接 return，不产生新的请求。
   */
  const loadEventCount = ref(0)
  const requestCount = ref(0)

  /*
   * Debug 日志。
   */
  const logs = ref<DebugLog[]>([])

  let logId = 0

  const addLog = (
    message: string,
  ) => {
    logId += 1

    const now = new Date()

    logs.value.push({
      id: logId,
      time: now.toLocaleTimeString(
        undefined,
        {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3,
        },
      ),
      message,
    })
  }

  /*
   * 这个 computed 只用于 DebugPanel 展示。
   *
   * 是否真正请求仍然应该由 loadMore()
   * 自己检查 loading / hasMore。
   */
  const canLoad = computed(() => {
    return (
      enabled.value
      && !loading.value
      && hasMore.value
    )
  })

  const clearLogs = () => {
    logs.value.splice(
      0,
      logs.value.length,
    )
  }

  const clearItems = () => {
    items.value.splice(
      0,
      items.value.length,
    )

    hasMore.value = true

    addLog('Items cleared')
  }

  /*
   * Reset 用于恢复一个新的分页会话。
   *
   * Sentinel 参数保留，
   * 方便修改参数后重复验证。
   */
  const reset = () => {
    items.value.splice(
      0,
      items.value.length,
    )

    loading.value = false
    hasMore.value = true

    loadEventCount.value = 0
    requestCount.value = 0

    clearLogs()

    addLog('Playground reset')
  }

  return {
    items,
    loading,
    hasMore,

    pageSize,
    totalItems,

    enabled,
    rootMargin,
    threshold,

    loadEventCount,
    requestCount,

    logs,
    canLoad,

    addLog,
    clearLogs,
    clearItems,
    reset,
  }
}

export type PlaygroundState =
  ReturnType<typeof usePlayground>