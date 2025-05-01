export type DirectiveFunction<Args extends unknown[] = []> = (ref: globalThis.Element, ...args: Args) => void

/**
 * Another way to create directive
 * @example
 * import { createDirective } from '@solid-hooks/core'
 * import { type Accessor, type Setter, createRenderEffect, createSignal } from 'solid-js'
 *
 * const model = createDirective((ref: Element, getter: Accessor<string>, setter: Setter<string>) => {
 *   createRenderEffect(() => ((ref as HTMLInputElement).value = getter()))
 *   ref.addEventListener('input', e => setter((e.target as HTMLInputElement | null)?.value ?? ''))
 * })
 *
 * function TextInput() {
 *   const [text, setText] = createSignal('')
 *   return (
 *     <>
 *       <input type="text" ref={model(text, setText)} />
 *       <div>{text()}</div>
 *     </>
 *   )
 * }
 */
export function createDirective<Args extends unknown[] = []>(fn: DirectiveFunction<Args>) {
  return (...args: Args) => (el: globalThis.Element) => fn(el, ...args)
}
