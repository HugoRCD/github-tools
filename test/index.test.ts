import { expect, it } from 'vitest'
import { main, waitFor } from './index'

it('prints \'Hello, world!\'', (): void => {
  const string = main()
  expect(string).toStrictEqual('Hello, world!')
})

it('waits for 1000ms', async (): Promise<void> => {
  const start = Date.now()
  await waitFor(1000)
  const end = Date.now()
  expect(end - start).toBeGreaterThanOrEqual(1000)
  expect(end - start).toBeLessThan(1100)
})
