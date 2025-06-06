import type { Accessor } from 'solid-js'

import { createSignal } from 'solid-js'

import { useEventListener, useWindowListener } from './event-listener'

type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'

type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g'

export interface NetworkState {
  /**
   * The time at which the connection was changed
   */
  since?: Date
  /**
   * Whether the device is online
   */
  online?: boolean
  /**
   * The estimated effective round-trip time of the current connection
   */
  rtt?: number
  /**
   * Type of connection a device is using to communicate with the network
   */
  type?: NetworkType
  /**
   * True if the user has set a reduced data usage option on the user agent
   */
  saveData?: boolean
  /**
   * The estimated effective bandwidth (Mb/s)
   */
  downlink?: number
  /**
   * Maximum downlink speed (Mb/s)
   */
  downlinkMax?: number
  /**
   * The effective type of the connection
   */
  effectiveType?: EffectiveType
}

function getConnection(): any {
  // @ts-expect-error exist api
  return navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection
}

function getState(): NetworkState {
  const c = getConnection()
  if (!c) {
    return {}
  }
  return {
    rtt: c.rtt,
    type: c.type,
    saveData: c.saveData,
    downlink: c.downlink,
    downlinkMax: c.downlinkMax,
    effectiveType: c.effectiveType,
  }
}

export function useNetwork(onChanges?: (state: NetworkState) => void): Accessor<NetworkState> {
  const [state, setState] = createSignal({
    since: undefined,
    online: navigator?.onLine,
    ...getState(),
  })

  useWindowListener(
    'online',
    () => onChanges?.(setState(prev => ({ ...prev, online: true, since: new Date() }))),
  )
  useWindowListener(
    'offline',
    () => onChanges?.(setState(prev => ({ ...prev, online: false, since: new Date() }))),
  )
  const conn = getConnection()
  if (conn) {
    useEventListener(
      conn,
      'change',
      () => onChanges?.(setState(prev => ({ ...prev, ...getState() }))),
    )
  }

  return state
}

/**
 * signal of whether the device is online
 */
export function useOnline(onChanges?: (isOnline: boolean) => void): Accessor<boolean> {
  const [state, setState] = createSignal(true)

  useWindowListener('online', () => onChanges?.(setState(true)))
  useWindowListener('offline', () => onChanges?.(setState(false)))

  return state
}
