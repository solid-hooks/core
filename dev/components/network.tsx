import { createSignal, onMount } from 'solid-js'
import { useCssVar, useNetwork } from '../../src/web'

export default function TestNetworkWithCssVar() {
  let codeRef: HTMLElement | undefined
  const [bg, setBg] = createSignal('red')
  const info = useNetwork()
  console.log('info:', info())

  useCssVar('bg', bg)
  onMount(() => {
    useCssVar('bg-color', bg, codeRef)
  })

  return (
    <>
      <code ref={codeRef} style={{ color: 'var(--bg-color)' }}>{JSON.stringify(info())}</code>
      <button onClick={() => setBg(bg => bg === 'red' ? 'green' : 'red')}>change code color</button>
    </>
  )
}
