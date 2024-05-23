import { type FlowProps, createSignal, onMount } from 'solid-js'
import { useNetwork, useResourceTag } from '../src/web'
import { useCssVar } from '../src/web/cssvar'
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
  let codeRef: HTMLElement | undefined
  const [bg, setBg] = createSignal('red')
  const info = useNetwork()
  console.log('info:', info())
  useCssVar('bg', bg)
  onMount(() => {
    useCssVar('bg-color', bg, codeRef)
  })
  return (
    <div
      style={{
        'width': '80%',
        'margin': 'auto',
        'display': 'grid',
        'grid-template-columns': '1fr 1fr',
        'gap': '10px',
      }}
    >
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
      <code ref={codeRef} style={{ color: 'var(--bg-color)' }}>{JSON.stringify(info())}</code>
      <button onClick={() => setBg(bg => bg === 'red' ? 'green' : 'red')}>change code color</button>
    </div>
  )
}
