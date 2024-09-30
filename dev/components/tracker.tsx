import { createEffect, on } from 'solid-js'
import { createTracker } from '../../src'

const FOO = {
  bar: 1,
}

export default function TestReactive() {
  const [obj, setObj] = createTracker(FOO, 'bar')
  createEffect(on(obj, () => {
    console.log('[createTracker] track source object Foo.bar:', FOO.bar)
  }, { defer: true }))
  return (
    <>
      <div>Foo.bar: {obj()}</div>
      <button onClick={() => setObj(data => data * 2)}>click and see console</button>
    </>
  )
}
