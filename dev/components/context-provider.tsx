import { catchError, createSignal } from 'solid-js'
import { createContextProvider } from '../../src'

export const [TestProvider, useTestContext] = createContextProvider((param: { initial: number }) => {
  const [count, setCount] = createSignal(param.initial)
  const increment = () => setCount(count() + 1)

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
    console.log('call useTestContext() outside provider:', useTestContext())
  }, () => { })
  return (
    <TestProvider initial={0}>
      <Child />
    </TestProvider>
  )
}
