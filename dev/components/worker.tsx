import { createMemo, createSignal } from 'solid-js'
import { useWebWorkerFn } from '../../src'

function heavyTask() {
  const randomNumber = () => Math.trunc(Math.random() * 5_000_00)
  const numbers: number[] = Array(5_000_000).fill(undefined).map(randomNumber)
  numbers.sort()
  return numbers.slice(0, 5)
}

export default function TestWorker() {
  const [workerFn, workerStatus, workerTerminate] = useWebWorkerFn(heavyTask)
  const [timeStamp, setTimeStamp] = createSignal(Date.now())
  const [data, setData] = createSignal<number[]>([])

  const isRunning = createMemo(() => workerStatus() === 'RUNNING')

  const cb = () => {
    setTimeStamp(Date.now())
    requestAnimationFrame(cb)
  }
  requestAnimationFrame(cb)
  return (
    <>
      <div>timeStamp: {timeStamp()}</div>
      <div>Status: {workerStatus()}</div>
      <div>data: {data().toString()}</div>
      <button onClick={() => setData(heavyTask())}>
        sort in main
      </button>
      <button
        onClick={() => isRunning() ? workerTerminate() : workerFn().then(setData)}
      >
        {isRunning() ? 'terminate' : 'sort in worker'}
      </button>
    </>
  )
}
