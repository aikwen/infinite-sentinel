export interface MockItem {
  id: number
  name: string
}

export interface GetItemsParams {
  offset: number
  limit: number
  total: number
}

export interface GetItemsResult {
  items: MockItem[]
  duration: number
}

/*
 * 模拟真实 HTTP 请求的网络延迟。
 *
 * 每次请求随机等待 500 ~ 2000ms，
 * 主要用于验证：
 *
 * 1. Sentinel 在请求期间可能再次触发 load。
 * 2. 调用方是否正确通过 loading 防止并发请求。
 * 3. 请求结束后主动 check() 是否能够继续填充列表。
 */
const sleepRandom = async () => {
  const duration =
    500 + Math.floor(Math.random() * 1501)

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })

  return duration
}

/*
 * 模拟 offset + limit 分页 API。
 *
 * total 表示后端当前总共有多少条数据。
 * 当 offset 接近 total 时，返回的数据可能少于 limit；
 * 当 offset >= total 时返回空数组。
 *
 * Sentinel 本身并不知道这些分页概念，
 * 这里只是为了让 playground 更接近真实业务场景。
 */
export const getMockItems = async ({
  offset,
  limit,
  total,
}: GetItemsParams): Promise<GetItemsResult> => {
  const duration = await sleepRandom()

  const start = Math.min(offset, total)
  const end = Math.min(
    start + limit,
    total,
  )

  const items = Array.from(
    {
      length: end - start,
    },
    (_, index) => {
      const id = start + index + 1

      return {
        id,
        name: `Item ${id}`,
      }
    },
  )

  return {
    items,
    duration,
  }
}