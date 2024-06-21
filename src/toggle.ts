import { createEffect, createSignal } from 'solid-js'

/**
 * create toggle signal
 * @param initialValue initial value
 * @param onChange on change callback
 * @example
 * ```ts
 * import { createToggle } from '@solid-hooks/core'
 *
 * const [state, toggle] = createToggle(
 *   false,
 *   value => console.log(value)
 * )
 * toggle()
 * toggle(true)
 * toggle(false)
 * ```
 */
export function createToggle(initialValue: boolean = false, onChange?: (value: boolean) => void) {
  const [val, set] = createSignal(initialValue)
  onChange && createEffect(() => onChange(val()))
  return [val, (value?: boolean) => set(value ?? !val())] as const
}
