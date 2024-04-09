import { tryOnCleanup } from '@solid-primitives/utils'
import type { AnyFunction } from '@subframe7536/type-utils'
import { DEV, createSignal } from 'solid-js'

// https://vueuse.org/core/useWebWorker/
function jobRunner(userFunc: Function) {
  return (e: MessageEvent) => {
    const userFuncArgs = e.data[0]

    // eslint-disable-next-line prefer-spread
    return Promise.resolve(userFunc.apply(undefined, userFuncArgs))
      .then((result) => {
        postMessage(['SUCCESS', result])
      })
      .catch((error) => {
        postMessage(['ERROR', error])
      })
  }
}
function depsParser(deps: string[]) {
  if (deps.length === 0) {
    return ''
  }

  const depsString = deps.map(dep => `'${dep}'`).toString()
  return `importScripts(${depsString})`
}
function createWorkerBlobUrl(fn: Function, deps: string[]) {
  const blobCode = `${depsParser(deps)};onmessage=(${jobRunner})(${fn})`
  const blob = new Blob([blobCode], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  return url
}
export type WebWorkerStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'RUNNING'
  | 'ERROR'
  | 'TIMEOUT_EXPIRED'

export type UseWebWorkerOptions = {
  /*
   * custom `window` instance, e.g. working with iframes or in testing environments.
   */
  customWindow?: Window
  /**
   * milliseconds before killing the worker
   *
   * @default undefined
   */
  timeout?: number
  /**
   * external dependencies array running the worker
   */
  dependencies?: string[]
}

/**
 * run a function in a web worker
 * @param fn function to run in worker
 * @param options options
 * @example
 * ```tsx
 * import { createMemo, createSignal } from 'solid-js'
 * import { useWebWorkerFn } from '@solid-hooks/core/web'
 *
 * function heavyTask() {
 *   const randomNumber = () => Math.trunc(Math.random() * 5_000_00)
 *   const numbers: number[] = Array(5_000_000).fill(undefined).map(randomNumber)
 *   numbers.sort()
 *   return numbers.slice(0, 5)
 * }
 *
 * export default function TestWorker() {
 *   const [fn, status, terminate] = useWebWorkerFn(heavyTask)
 *   const isRunning = createMemo(() => status() === 'RUNNING')
 *   return (
 *     <>
 *       <div>Status: {status()}</div>
 *       <button onClick={() => isRunning() ? terminate() : fn().then(setData)}>
 *         {isRunning() ? 'terminate' : 'sort in worker'}
 *       </button>
 *     </>
 *   )
 * }
 * ```
 */
export function useWebWorkerFn<T extends AnyFunction>(fn: T, options: UseWebWorkerOptions = {}) {
  const {
    customWindow = window,
    dependencies = [],
    timeout,
  } = options

  const [workerStatus, setWorkerStatus] = createSignal<WebWorkerStatus>('PENDING')
  let worker: Worker & { _url?: string } | undefined
  let promise: {
    reject?: (result: ReturnType<T> | ErrorEvent) => void
    resolve?: (result: ReturnType<T>) => void
  } = {}
  let timeoutId: number | undefined

  const workerTerminate = (status: WebWorkerStatus = 'PENDING') => {
    if (worker?._url && customWindow) {
      worker.terminate()
      URL.revokeObjectURL(worker._url)
      promise = {}
      worker = undefined
      customWindow.clearTimeout(timeoutId)
      setWorkerStatus(status)
    }
  }

  workerTerminate()

  tryOnCleanup(workerTerminate)

  const generateWorker = () => {
    const blobUrl = createWorkerBlobUrl(fn, dependencies)
    const newWorker: Worker & { _url?: string } = new Worker(blobUrl)
    newWorker._url = blobUrl

    newWorker.onmessage = (e: MessageEvent) => {
      const [status, result] = e.data as [WebWorkerStatus, ReturnType<T>]

      switch (status) {
        case 'SUCCESS':
          promise.resolve?.(result)
          workerTerminate(status)
          break
        default:
          promise.reject?.(result)
          workerTerminate('ERROR')
          break
      }
    }

    newWorker.onerror = (e: ErrorEvent) => {
      e.preventDefault()
      promise.reject?.(e)
      workerTerminate('ERROR')
    }

    if (timeout) {
      timeoutId = customWindow.setTimeout(() => workerTerminate('TIMEOUT_EXPIRED'), timeout)
    }
    return newWorker
  }

  const workerFn = (...fnArgs: Parameters<T>) => {
    if (workerStatus() === 'RUNNING') {
      DEV && console.error(
        '[useWebWorkerFn] You can only run one instance of the worker at a time.',
      )
      return Promise.reject(new Error('another workerFn must not be called while running'))
    }

    worker = generateWorker()
    return new Promise<ReturnType<T>>((resolve, reject) => {
      promise = { resolve, reject }
      worker?.postMessage([[...fnArgs]])

      setWorkerStatus('RUNNING')
    })
  }

  return [
    workerFn,
    workerStatus,
    workerTerminate,
  ] as const
}
