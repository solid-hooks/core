import { useResourceTag } from '../src'
import { TestContextProvider } from './components/context-provider'
import TestDirective from './components/directive'
import TestEmit from './components/emit'
import TestReactive from './components/reactive'
import TestWatch from './components/watch'
import { TestWithEffect } from './components/with-effect'

export default function App() {
  useResourceTag('script', 'console.log(`[useResourceTag] test load script`)')
  return (
    <>
      <TestContextProvider />
      <TestEmit />
      <TestWatch />
      <TestReactive />
      <TestWithEffect />
      <TestDirective />
    </>
  )
}
