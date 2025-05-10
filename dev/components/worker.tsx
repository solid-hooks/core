import { createMemo, createSignal } from 'solid-js'

import { useIdleCallback, useWebWorkerFn } from '../../src/web'

const randomNumber = () => Math.trunc(Math.random() * 5_000_00)

function heavyTask() {
  const numbers: number[] = Array.from({ length: 5_000_000 }).fill(undefined).map(randomNumber)
  numbers.sort()
  return numbers.slice(0, 5)
}

export default function TestWorker() {
  const [runWorker, status, terminate] = useWebWorkerFn(heavyTask, { func: [randomNumber] })
  const [timeStamp, setTimeStamp] = createSignal(Date.now())
  const [data, setData] = createSignal<number[]>([])

  const isRunning = createMemo(() => status() === 'RUNNING')

  const [start] = useIdleCallback(() => {
    setTimeStamp(Date.now())
  })
  start()
  return (
    <>
      <div>timeStamp: {timeStamp()}</div>
      <div>Status: {status()}</div>
      <div>data: {data().toString()}</div>
      <button onClick={() => (setData([]), setData(heavyTask()))}>
        sort in main
      </button>
      <button
        onClick={() => (setData([]), isRunning() ? terminate() : runWorker().then(setData))}
      >
        {isRunning() ? 'terminate' : 'sort in worker'}
      </button>
    </>
  )
}
