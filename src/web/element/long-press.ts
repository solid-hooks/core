import type { EventListenerOptions } from '@solid-primitives/event-listener'
import { access, type MaybeAccessor, noop, type Position } from '@solid-primitives/utils'
import { type Accessor, createSignal } from 'solid-js'
import { useEventListenerStack } from '../event-listener'

export type UseLongPressOptions = {
  /**
   * Time in ms till `longpress` gets called
   *
   * @default 500
   */
  delay?: number
  /**
   * Allowance of moving distance in pixels,
   * The action will get canceled When moving too far from the pointerdown position.
   * @default 10
   */
  distanceThreshold?: number | false
  /**
   * listener options
   */
  modifiers?: EventListenerOptions
  /**
   * callback when the ref element is pressed.
   */
  onPressed?: (ev: PointerEvent) => void
  /**
   * callback when the ref element is released.
   * @param duration how long the element was pressed in ms
   * @param distance distance from the pointerdown position
   * @param isLongPress whether the action was a long press or not
   */
  onPressEnd?: (duration: number, distance: number, isLongPress: boolean) => void
}

/**
 * check if element is long pressed
 * @param ref element
 * @param options listen options
 */
export function useLongPress(
  ref: MaybeAccessor<HTMLElement | undefined>,
  options: UseLongPressOptions = {},
): [isLongPressed: Accessor<boolean>, cleanup: VoidFunction] {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let posStart: Position | undefined
  let startTimestamp: number | undefined

  const [isLongPressed, setIsLongPressed] = createSignal(false)
  const {
    delay = 500,
    distanceThreshold = 10,
    onPressed = noop,
    onPressEnd,
    modifiers,
  } = options

  const clear = (): void => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    posStart = undefined
    startTimestamp = undefined
    setIsLongPressed(false)
  }

  const onRelease = (ev: PointerEvent): void => {
    const [_startTimestamp, _posStart, _hasLongPressed] = [startTimestamp, posStart, isLongPressed]
    clear()

    if (!onPressEnd || !_posStart || !_startTimestamp) {
      return
    }

    const dx = ev.x - _posStart.x
    const dy = ev.y - _posStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    onPressEnd(ev.timeStamp - _startTimestamp, distance, isLongPressed())
  }

  const onDown = (ev: PointerEvent): void => {
    clear()

    posStart = {
      x: ev.x,
      y: ev.y,
    }
    startTimestamp = ev.timeStamp
    timeout = setTimeout(() => {
      setIsLongPressed(true)
      onPressed(ev)
    }, delay)
  }

  const onMove = (ev: PointerEvent): void => {
    if (!posStart || distanceThreshold === false) {
      return
    }

    const dx = ev.x - posStart.x
    const dy = ev.y - posStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance >= distanceThreshold) {
      clear()
    }
  }

  const [listen, cleanup] = useEventListenerStack(() => access(ref))
  listen('pointerdown', onDown, modifiers)
  listen('pointermove', onMove, modifiers)
  listen(['pointerup', 'pointerleave'], onRelease, modifiers)

  return [isLongPressed, cleanup]
}
