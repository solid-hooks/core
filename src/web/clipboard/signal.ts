import type { Accessor } from 'solid-js'

import { createSignal } from 'solid-js'

export type ClipboardItemSignal<T> = [accessor: Accessor<ClipboardItem>, set: (data: T) => ClipboardItem]

export function generateClipboardItem(blob: Blob): ClipboardItem
export function generateClipboardItem(part: BlobPart, mime: string): ClipboardItem
export function generateClipboardItem(data: Blob | BlobPart, mime?: string): ClipboardItem {
  if (mime) {
    return new ClipboardItem({ [mime]: new Blob([data], { type: mime }) })
  }
  return new ClipboardItem({ [(data as Blob).type]: data as Blob })
}

export function createClipboardItem(blob: Blob): ClipboardItemSignal<Blob>
export function createClipboardItem<T extends BlobPart>(part: T, mime: string): ClipboardItemSignal<T>
export function createClipboardItem<T extends BlobPart>(data: T, mime?: string): ClipboardItemSignal<T> | ClipboardItemSignal<Blob> {
  const [item, setItem] = createSignal(generateClipboardItem(data, mime as any))
  return [item, (data: any) => setItem(generateClipboardItem(data, mime as any))]
}
