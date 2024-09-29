/* eslint-disable one-var */
/**
 * Concatenate classes
 * @param args classes
 */
export function cls(...args: (string | number | boolean | null | undefined)[]): string {
  let i = 0, tmp, str = '', len = args.length
  for (; i < len; i++) {
    // @ts-expect-error type check

    (tmp = args[i]) && tmp.at && (str += (str && ' ') + tmp)
  }
  return str
}
