import { onMount } from 'solid-js'
import { useCssVar, useNetwork } from '../../src/web'
import { createRef } from '../../src'

export default function TestNetworkWithCssVar() {
  let codeRef: HTMLElement | undefined
  const background = createRef('red')
  const info = useNetwork()
  console.log('info:', info())

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
