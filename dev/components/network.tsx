import { onMount } from 'solid-js'
import { createRef } from '../../src'
import { useCssVar, useNetwork } from '../../src/web'

export default function TestNetworkWithCssVar() {
  let codeRef: HTMLElement | undefined
  const background = createRef('red')
  const info = useNetwork()
  console.log('[useNetwork] info:', info())

  useCssVar('bg', background)
  onMount(() => {
    useCssVar('bg-color', background, codeRef)
  })

  return (
    <>
      <code ref={codeRef} style={{ color: 'var(--bg-color)' }}>{JSON.stringify(info())}</code>
      <button onClick={() => background(bg => bg === 'red' ? 'green' : 'red')}>change code color</button>
    </>
  )
}
