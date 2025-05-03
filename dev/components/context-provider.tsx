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

function Child(props: { data?: number, countFromProps: number }) {
  const [pick] = useProps(props, ['data', 'countFromProps'], { data: -1 })
  const { count, increment } = useTestContext()
  return (
    <>
      <button class="btn" onClick={increment}>
        context: {count()}
      </button>
      <div>
        useProps: {pick().data + ''}
      </div>
      <div>
        other value from useProps: {pick().countFromProps + ''}
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
      <button onClick={() => data(val => val + 1)}>click to test props</button>
      <Child data={data() % 2 === 0 ? data() : undefined} countFromProps={useTestContext().count()} />
    </TestProvider>
  )
}
