import { type FlowProps, For, createSignal } from 'solid-js'
import { useResourceTag, useTitle } from '../src/web'
import { TestContextProvider } from './components/context-provider'
import TestDirective from './components/directive'
import TestEmit from './components/emit'
import TestReactive from './components/reactive'
import TestWatch from './components/watch'
import TestWithEffect from './components/with-effect'
import TestWorker from './components/worker'
import TestColorMode from './components/color-mode'
import TestNetworkWithCssVar from './components/network'
import TestElement from './components/element'

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
  const [title, setTitle] = createSignal('test title')
  useTitle(title)
  setTimeout(() => {
    setTitle('change title')
  }, 1000)
  const comps = {
    createContextProvider: <TestContextProvider />,
    createEmitSignal: <TestEmit />,
    watch: <TestWatch />,
    createReactive: <TestReactive />,
    withEffect: <TestWithEffect />,
    createDirective: <TestDirective />,
    useWebWorkerFn: <TestWorker />,
    useColorMode: <TestColorMode />,
    networkWithCssVar: <TestNetworkWithCssVar />,
    element: <TestElement />,
  }
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
      <For each={Object.entries(comps)}>
        {item => <Card title={item[0]}>{item[1]}</Card>}
      </For>

    </div>
  )
}
