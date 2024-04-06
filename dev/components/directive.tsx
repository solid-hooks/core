import { type Accessor, type Setter, createRenderEffect, createSignal } from 'solid-js'
import { createDirective } from '../../src'

const model = createDirective((ref: Element, getter: Accessor<string>, setter: Setter<string>) => {
  createRenderEffect(() => ((ref as HTMLInputElement).value = getter()))
  ref.addEventListener('input', e => setter((e.target as HTMLInputElement | null)?.value ?? ''))
})

export default function TestDirective() {
  const [text, setText] = createSignal('synchronized value')
  return (
    <>
      <h1>Test <code>createDirective</code> :</h1>
      <input type="text" ref={model(text, setText)} />
      <div>{text()}</div>
    </>
  )
}
