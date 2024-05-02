import type { FlowProps } from 'solid-js'
import { useNetwork, useResourceTag } from '../src/web'
import { TestContextProvider } from './components/context-provider'
import TestDirective from './components/directive'
import TestEmit from './components/emit'
import TestReactive from './components/reactive'
import TestWatch from './components/watch'
import { TestWithEffect } from './components/with-effect'
import TestWorker from './components/worker'
import TestDark from './components/dark'

function Card(props: FlowProps<{ title: string }>) {
  return (
    <div style={{ border: '1px solid black', padding: '10px' }}>
      <h2>Test <code>{props.title}</code> :</h2>
      {props.children}
    </div>
  )
}

export default function App() {
  useResourceTag('script', 'console.log(`[useResourceTag] test load script`)')
  const info = useNetwork()
  console.log('info:', info())
  return (
    <div style={{ 'width': '80%', 'margin': 'auto', 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '10px' }}>
      <Card title="createContextProvider">
        <TestContextProvider />
      </Card>
      <Card title="createEmitSignal">
        <TestEmit />
      </Card>
      <Card title="watch">
        <TestWatch />
      </Card>
      <Card title="createReactive">
        <TestReactive />
      </Card>
      <Card title="withEffect">
        <TestWithEffect />
      </Card>
      <Card title="createDirective">
        <TestDirective />
      </Card>
      <Card title="useWebWorkerFn">
        <TestWorker />
      </Card>
      <Card title="useDark">
        <TestDark />
      </Card>
      <code>{JSON.stringify(info())}</code>
    </div>
  )
}
