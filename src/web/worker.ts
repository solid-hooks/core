import { tryOnCleanup } from '@solid-primitives/utils'
import type { AnyFunction } from '@subframe7536/type-utils'
import { type Accessor, DEV, createSignal } from 'solid-js'

// https://vueuse.org/core/useWebWorker/
function jobRunner(userFunc: AnyFunction) {
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

function depsParser(deps: string[], func: AnyFunction[]): string {
  if (deps.length === 0 && func.length === 0) {
    return ''
  }

  const depsString = deps.length === 0 ? '' : 'importScripts(' + deps.map(dep => `'${dep}'`).toString() + ')'
  const funcString = func
    .filter(dep => typeof dep === 'function')
    .map((fn) => {
      const str = fn.toString()
      return str.trim().startsWith('function') ? str : 'const ' + fn.name + ' = ' + str
    })
    .join(';')

  return depsString + funcString
}
function createWorkerBlobUrl(fn: AnyFunction, deps: string[], func: AnyFunction[]): string {
  const blobCode = depsParser(deps, func) + ';onmessage=(' + jobRunner + ')(' + fn + ')'
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
  /**
   * milliseconds before killing the worker
   *
   * @default undefined
   */
  timeout?: number
  /**
   * external dependencies array running the worker
   */
  deps?: string[]
  /**
   * local funtions will be use in the worker
   */
  func?: AnyFunction[]
}

export type UseWebWorkerReturn<T extends AnyFunction> = [
  /**
   * function to run in worker
   */
  run: (...args: Parameters<T>) => Promise<ReturnType<T>>,
  /**
   * status of worker, possible values: {@link WebWorkerStatus}
   */
  status: Accessor<WebWorkerStatus>,
  /**
   * manually terminate the worker
   */
  terminate: Accessor<void>,
]

/**
 * run a function in a web worker, support local functions or external dependencies
 * @param fn function to run in worker
 * @param options options
 * @example
 * ```tsx
 * import { createMemo, createSignal } from 'solid-js'
 * import { useWebWorkerFn } from '@solid-hooks/core/web'
 *
 * const randomNumber = () => Math.trunc(Math.random() * 5_000_00)
 *
 * function heavyTask() {
 *   const numbers: number[] = Array(5_000_000).fill(undefined).map(randomNumber)
 *   numbers.sort()
 *   return numbers.slice(0, 5)
 * }
 *
 * export default function TestWorker() {
 *   const [fn, { status, terminate }] = useWebWorkerFn(heavyTask, { func: [randomNumber] })
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
export function useWebWorkerFn<T extends AnyFunction>(fn: T, options: UseWebWorkerOptions = {}): UseWebWorkerReturn<T> {
  const {
    deps = [],
    func = [],
    timeout,
  } = options

  const [status, setWorkerStatus] = createSignal<WebWorkerStatus>('PENDING')
  let worker: Worker & { _url?: string } | undefined
  let promise: {
    reject?: (result: ReturnType<T> | ErrorEvent) => void
    resolve?: (result: ReturnType<T>) => void
  } = {}
  let timeoutId: any

  const terminate = (status: WebWorkerStatus = 'PENDING'): void => {
    if (worker?._url) {
      worker.terminate()
      URL.revokeObjectURL(worker._url)
      promise = {}
      worker = undefined
      globalThis.clearTimeout(timeoutId)
      setWorkerStatus(status)
    }
  }

  terminate()

  tryOnCleanup(terminate)

  const generateWorker = (): any => {
    const blobUrl = createWorkerBlobUrl(fn, deps, func)
    const newWorker: Worker & { _url?: string } = new Worker(blobUrl)
    newWorker._url = blobUrl

    newWorker.onmessage = (e: MessageEvent) => {
      const [status, result] = e.data as [WebWorkerStatus, ReturnType<T>]

      switch (status) {
        case 'SUCCESS':
          promise.resolve?.(result)
          terminate(status)
          break
        default:
          promise.reject?.(result)
          terminate('ERROR')
          break
      }
    }

    newWorker.onerror = (e: ErrorEvent) => {
      e.preventDefault()
      promise.reject?.(e)
      terminate('ERROR')
    }

    if (timeout) {
      timeoutId = globalThis.setTimeout(() => terminate('TIMEOUT_EXPIRED'), timeout)
    }
    return newWorker
  }

  const workerFn = (...fnArgs: Parameters<T>): any => {
    if (status() === 'RUNNING') {
      if (DEV) {
        console.error(
          '[useWebWorkerFn] You can only run one instance of the worker at a time.',
        )
      }
      return Promise.reject(new Error('another workerFn must not be called while running'))
    }

    worker = generateWorker()
    return new Promise<ReturnType<T>>((resolve, reject) => {
      promise = { resolve, reject }
      worker?.postMessage([[...fnArgs]])

      setWorkerStatus('RUNNING')
    })
  }

  return [workerFn as T, status, terminate] as const
}
