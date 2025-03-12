import { catchError } from 'solid-js'

import { createContextProvider, createRef } from '../../src'

export const [TestProvider, useTestContext] = createContextProvider((param: { initial: number }) => {
  const count = createRef(param.initial)
  const increment = () => count(c => c + 1)

  return {
    count,
    increment,
  }
})

function Child() {
  const { count, increment } = useTestContext()
  return (
    <>
      <button class="btn" onClick={increment}>
        {count()}
      </button>
    </>
  )
}

export function TestContextProvider() {
  catchError(() => {
    console.log('[useContextProvider] call useTestContext() outside provider:', useTestContext())
  }, () => { })
  return (
    <TestProvider initial={0}>
      <Child />
    </TestProvider>
  )
}
