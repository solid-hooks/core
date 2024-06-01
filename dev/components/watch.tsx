import { createSignal } from 'solid-js'
import { watch } from '../../src'

export default function TestWatch() {
  const [count, setCount] = createSignal(1)

  const {
    callTimes,
    ignoreUpdates,
    isWatching,
    pause,
    resume,
  } = watch(count, (currentCount, oldCount) => {
    console.log('[watch] current value:', currentCount)
    console.log('[watch] old value:', oldCount)
  })
  return (
    <>
      <div>count: {count()}</div>
      <div>callTimes: {callTimes()}</div>
      <div>isWatching: {`${isWatching()}`}</div>
      <button onClick={() => setCount(c => c + 1)}>click and see console</button>
      <button onClick={() => ignoreUpdates(() => setCount(c => c + 1))}>without trigger watch</button>
      <button onClick={pause}>pause</button>
      <button onClick={resume}>resume</button>
    </>
  )
}
