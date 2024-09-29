import { createSignal, type FlowProps, For } from 'solid-js'
import { useExternal, useTitle } from '../src/web'
import TestArray from './components/array'
import TestColorModeAndClipboard from './components/color-mode'
import { TestContextProvider } from './components/context-provider'
import TestDirective from './components/directive'
import TestElement from './components/element'
import TestEmit from './components/emit'
import TestNetworkWithCssVar from './components/network'
import TestReactive from './components/reactive'
import TestWatch from './components/watch'
import TestWorker from './components/worker'

function Card(props: FlowProps<{ title: string }>) {
  return (
    <div style={{ border: '1px solid black', padding: '10px' }}>
      <h2>Test <code>{props.title}</code> :</h2>
      {props.children}
    </div>
  )
}

export default function App() {
  useExternal('script', 'console.log(`[useExternal] test load script`)')
  const [title, setTitle] = createSignal('test title')
  useTitle(title)
  setTimeout(() => {
    setTitle('change title')
  }, 1000)
  const comps = {
    'createContextProvider': <TestContextProvider />,
    'createEmitSignal': <TestEmit />,
    'watch': <TestWatch />,
    'createReactive': <TestReactive />,
    'createDirective': <TestDirective />,
    'useWebWorkerFn': <TestWorker />,
    'useColorMode, useCopy and usePaste': <TestColorModeAndClipboard />,
    'networkWithCssVar': <TestNetworkWithCssVar />,
    'element': <TestElement />,
    'array': <TestArray />,
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
