import { type EventListenerOptions, makeEventListener } from '@solid-primitives/event-listener'
import type { Accessor } from 'solid-js'
import { createMemo, createRenderEffect, createSignal, on, onMount } from 'solid-js'
import { type MaybeAccessor, access } from '@solid-primitives/utils'

type Position = {
  x: number
  y: number
}

export type DraggableElement = HTMLElement | SVGElement | undefined | null

/**
 * options for {@link useDraggable}
 */
export type DragOptions = {
  /**
   * element to trigger drag event
   * @default el
   */
  handleEl?: MaybeAccessor<DraggableElement>
  /**
   * initial posistion
   * @default { x: 0, y: 0}
   */
  initialPosition?: Position
  /**
   * callback on dragging start
   *
   * return `false` to prevent dragging.
   */
  onStart?: (position: Position, event: PointerEvent) => void | false
  /**
   * callback on dragging
   */
  onMove?: (position: Position, event: PointerEvent) => void
  /**
   * callback on dragging end
   */
  onEnd?: (position: Position, event: PointerEvent) => void
  /**
   * addEventListener options
   */
  listenerOptions?: EventListenerOptions
  /**
   * ignore when multiple pointer event
   */
  ignoreMultiPointer?: boolean
  /**
   * only trigger on mouse left click when use mouse
   * @default true
   */
  leftClick?: boolean
  /**
   * axis that element can be dragged
   *
   * @default 'both'
   */
  axis?: 'x' | 'y' | 'both'
  /**
   * auto update element top and left
   */
  addStyle?: boolean
  /**
   * bind events onMount
   */
  bindOnMount?: boolean
}

type DragResult = {
  /**
   * left and top
   */
  position: Accessor<Position>
  /**
   * whether is dragging
   */
  isDragging: Accessor<boolean>
  /**
   * whether is draggable
   */
  isDraggable: Accessor<boolean>
  /**
   * disable drag
   */
  disable: VoidFunction
  /**
   * enable drag
   */
  enable: VoidFunction
  /**
   * reset posistion to initial posistion
   */
  resetPosition: VoidFunction
}

/**
 * make element draggable
 * @param el target element
 * @param options drag options
 * @description recommend to add `touch-action: none` on element
 */
export function useDraggable(
  el: MaybeAccessor<DraggableElement>,
  options: DragOptions = {},
): DragResult {
  const {
    listenerOptions,
    onEnd,
    onMove,
    onStart,
    ignoreMultiPointer,
    leftClick = true,
    initialPosition = { x: 0, y: 0 },
    handleEl = el,
    axis = 'both',
    addStyle,
    bindOnMount = true,
  } = options

  const canMoveX = /(both|x)/.test(axis)
  const canMoveY = /(both|y)/.test(axis)
  const [position, setPosition] = createSignal<Position>({ ...initialPosition })
  const [startPosition, setStartPosition] = createSignal<Position>()

  let cleanup: VoidFunction | undefined
  const [track, trigger] = createSignal(undefined, { equals: false })

  function bindEvents() {
    const cleanupStart = makeEventListener(
      access(handleEl)!,
      'pointerdown',
      (event) => {
        if ((ignoreMultiPointer && event.isPrimary)
          || startPosition()
          || (leftClick && event.button !== 0)) {
          return
        }
        const _el = access(el)!
        const rect = _el.getBoundingClientRect()
        const pos: Position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
        if (onStart?.(pos, event) === false) {
          return
        }
        _el.setPointerCapture(event.pointerId)
        setStartPosition(pos)
      },
      listenerOptions,
    )
    const cleanupMove = makeEventListener(
      window,
      'pointermove',
      (event) => {
        if (!startPosition()) {
          return
        }
        let { x, y } = position()

        if (canMoveX) {
          x = event.clientX - startPosition()!.x
        }
        if (canMoveY) {
          y = event.clientY - startPosition()!.y
        }

        const newPos = setPosition({ x, y })
        onMove?.(newPos, event)
      },
      listenerOptions,
    )
    const cleanupEnd = makeEventListener(
      window,
      'pointerup',
      (event) => {
        if (!startPosition()) {
          return
        }
        access(el)!.releasePointerCapture(event.pointerId)
        setStartPosition()
        onEnd?.(position(), event)
      },
      listenerOptions,
    )
    cleanup = () => {
      cleanupStart()
      cleanupMove()
      cleanupEnd()
    }
    trigger()
  }

  bindOnMount && onMount(() => {
    bindEvents()
  })
  addStyle && createRenderEffect(on(position, ({ x, y }) => {
    const _el = access(el)
    if (_el) {
      _el.style.left = `${x}px`
      _el.style.top = `${y}px`
    }
  }))

  return {
    position,
    isDragging: createMemo(() => startPosition() === undefined),
    isDraggable: createMemo(() => {
      track()
      return cleanup !== undefined
    }),
    enable: bindEvents,
    disable: () => {
      cleanup?.()
      cleanup = undefined
      trigger()
    },
    resetPosition: () => setPosition({ ...initialPosition }),
  }
}

export function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
