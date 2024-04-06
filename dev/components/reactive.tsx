import { createEffect, on } from 'solid-js'
import { createReactive } from '../../src'

const FOO = {
  bar: 1,
}

export default function TestReactive() {
  const [obj, setObj] = createReactive(FOO, 'bar')
  createEffect(on(obj, () => {
    console.log('[reactive] source object Foo.bar:', FOO.bar)
  }, { defer: true }))
  return (
    <>
      <h1>Test <code>reactive</code> :</h1>
      <div>Foo.bar: {obj()}</div>
      <button onClick={() => setObj(data => data * 2)}>click and see console</button>
    </>
  )
}
