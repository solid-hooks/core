import { createSignal } from 'solid-js'
import { withEffect } from '../../src/with-effect'

export function TestWithEffect() {
  // eslint-disable-next-line solid/reactivity
  const [count, setCount] = withEffect(createSignal(1), value => console.log('[withEffect] value:', value))
  return (
    <>
      <h1>Test <code>withEffect</code> :</h1>
      <button onClick={() => setCount(c => c + 1)}>click and see console</button>
      <div>count: {count()}</div>
    </>
  )
}
