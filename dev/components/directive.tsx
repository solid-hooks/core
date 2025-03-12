import type { RefSignal } from '../../src/ref'

import { createRenderEffect } from 'solid-js'

import { createDirective, watch } from '../../src'
import { createRef } from '../../src/ref'

const model = createDirective((ref: Element, atom: RefSignal<string>) => {
  createRenderEffect(() => ((ref as HTMLInputElement).value = atom()))
  ref.addEventListener('input', e => atom((e.target as HTMLInputElement | null)?.value ?? ''))
})

export default function TestDirective() {
  const text = createRef('synchronized value')
  const inputRef = createRef<HTMLInputElement>()
  watch(text, (t) => {
    inputRef()!.value = t
  }, { defer: false })
  return (
    <>
      <input type="text" ref={model(text)} />
      <div>{text()}</div>
      <input type="text" ref={inputRef} disabled />
    </>
  )
}
