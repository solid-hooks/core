import type { Arrayable } from '@subframe7536/type-utils'

/* eslint-disable one-var */
/**
 * Concatenate classes
 * @param args classes
 */
export function cls(...args: Arrayable<string | number | boolean | null | undefined>[]): string {
  let i = 0, tmp, str = '', len = args.length
  for (; i < len; i++) {
    (tmp = args[i])
    && (tmp as string).at
    && (
      str += (str && ' ') + (
        Array.isArray(tmp)
          ? cls(...(tmp as string[]))
          : tmp
      )
    )
  }
  return str
}
