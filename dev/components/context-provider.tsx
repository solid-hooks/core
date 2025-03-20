import { catchError } from 'solid-js'

import { createContextProvider, createRef, useProps } from '../../src'

export const [TestProvider, useTestContext] = createContextProvider((param: { initial: number }) => {
  const count = createRef(param.initial)
  const increment = () => count(c => c + 1)

  return {
    count,
    increment,
  }
})

function Child(props: { data: number }) {
  const [pick] = useProps(props, ['data'])
  const { count, increment } = useTestContext()
  return (
    <>
      <button class="btn" onClick={increment}>
        context: {count()}
      </button>
      <div>
        props: {pick().data + ''}
      </div>
    </>
  )
}

export function TestContextProvider() {
  const data = createRef(1)
  catchError(() => {
    console.log('[useContextProvider] call useTestContext() outside provider:', useTestContext())
  }, () => { })
  return (
    <TestProvider initial={0}>
      <button onClick={() => data(val => val * 2)}>click to test props</button>
      <Child data={data()} />
    </TestProvider>
  )
}
