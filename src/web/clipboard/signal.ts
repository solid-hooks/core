import { type Accessor, createSignal } from 'solid-js'
import { type Many, asArray } from '@solid-primitives/utils'

export type ClipboardItemSignal<T> = [accessor: Accessor<ClipboardItem>, set: (data: Many<T>) => ClipboardItem]

function generate(part: Many<any>, mime: string): ClipboardItem {
  return new ClipboardItem({ [mime]: new Blob(asArray(part), { type: mime }) })
}

export function createClipboardItemSignal<T extends BlobPart>(part: Many<T>, mime: string): ClipboardItemSignal<T> {
  const [item, setItem] = createSignal(generate(part, mime))
  return [item, data => setItem(generate(data, mime))]
}
