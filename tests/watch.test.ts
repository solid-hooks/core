import { describe, expect, it, vi } from 'vitest'
import { createRoot, createSignal } from 'solid-js'
import { watch } from '../src/watch'

function debounce(fn: Function, delay: number) {
  let timeoutId: string | number | NodeJS.Timeout | undefined
  return function (this: any, ...args: any[]) {
    timeoutId && clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

describe('watch', () => {
  it('basic', () => {
    const [value, setValue] = createSignal(0)
    const callback = vi.fn()

    createRoot(() => watch(value, callback))

    setValue(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1, undefined, 1)

    setValue(2)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2, 1, 2)
  })

  it('pause & resume', () => {
    const [value, setValue] = createSignal(0)
    const callback = vi.fn()

    const { pause, resume, isWatching } = createRoot(() => watch(value, callback))

    setValue(100)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(100, undefined, 1)

    pause()
    expect(isWatching()).toBe(false)
    setValue(200)
    resume()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(100, undefined, 1)

    setValue(300)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(300, 100, 2)
  })

  it('count', () => {
    const [value, setValue] = createSignal(0)
    const callback = vi.fn()

    const { callTimes } = createRoot(() => watch(value, callback, { count: 2 }))
    setValue(10)
    expect(callTimes()).toBe(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(10, undefined, 1)

    setValue(20)
    expect(callTimes()).toBe(2)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(20, 10, 2)

    setValue(30)
    expect(callTimes()).toBe(2)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(20, 10, 2)
  })

  it('defer', () => {
    const [value, setValue] = createSignal(0)
    const callback = vi.fn()

    createRoot(() => watch(value, callback, { defer: false }))
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(0, undefined, 1)

    setValue(10)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(10, 0, 2)

    setValue(20)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith(20, 10, 3)
  })

  it('eventFilter', async () => {
    const [value, setValue] = createSignal(0)
    const callback = vi.fn()

    createRoot(() => watch(value, callback, { eventFilter: fn => debounce(fn, 100) as any }))

    setValue(10)
    setValue(20)
    setValue(10)
    setValue(20)
    await new Promise(r => setTimeout(r, 100))
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(20, undefined, 1)

    setValue(30)
    setValue(40)
    setValue(30)
    setValue(40)
    await new Promise(r => setTimeout(r, 100))
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(40, 20, 2)
  })
})
