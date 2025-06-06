import type { Accessor } from 'solid-js'

import { createEffect, createSignal } from 'solid-js'

/**
 * Create toggle signal
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
export function createToggle(
  initialValue: boolean = false,
  onChange?: (value: boolean) => void,
): [Accessor<boolean>, (value?: boolean) => boolean] {
  const [val, set] = createSignal(initialValue)
  if (onChange) {
    createEffect(() => onChange(val()))
  }
  return [val, (value?: boolean) => set(value ?? !val())] as const
}
