import { type Accessor, createSignal } from 'solid-js'
import { useEventListener, useWindowListener } from './event-listener'

export type NetworkState = {
  since?: Date
  online?: boolean
  rtt?: number
  type?: string
  saveData?: boolean
  downlink?: number
  downlinkMax?: number
  effectiveType?: string
}

function getConnection() {
  // @ts-expect-error exist api
  return navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection
}

function get(): NetworkState {
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

export function useNetwork(): Accessor<NetworkState> {
  const [state, set] = createSignal({
    since: undefined,
    online: navigator?.onLine,
    ...get(),
  })

  useWindowListener('online', () => set(prev => ({ ...prev, online: true, since: new Date() })))
  useWindowListener('offline', () => set(prev => ({ ...prev, online: false, since: new Date() })))
  useEventListener(getConnection(), 'change', () => set(prev => ({ ...prev, ...get() })))

  return state
}
