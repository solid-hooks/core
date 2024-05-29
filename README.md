<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@solid-hooks/hooks&background=tiles&project=%20" alt="@solid-hooks/hooks">
</p>

# @solid-hooks/core

useful hooks for solid.js

## Install

```shell
npm i @solid-hooks/core
```
```shell
yarn add @solid-hooks/core
```
```shell
pnpm add @solid-hooks/core
```

## Usage

### `createReactive`

make plain object props reactive

```ts
import { createReactive } from '@solid-hooks/core'

const audio = new Audio()
const [time, setCurrentTime] = createReactive(audio, 'currentTime')
```

### `createDirective`

another way to create directive

```tsx
import { createDirective } from '@solid-hooks/core'
import { type Accessor, type Setter, createRenderEffect, createSignal } from 'solid-js'

const model = createDirective((ref: Element, getter: Accessor<string>, setter: Setter<string>) => {
  createRenderEffect(() => ((ref as HTMLInputElement).value = getter()))
  ref.addEventListener('input', e => setter((e.target as HTMLInputElement | null)?.value ?? ''))
})

function TextInput() {
  const [text, setText] = createSignal('')
  return (
    <>
      <input type="text" ref={model(text, setText)} />
      <div>{text()}</div>
    </>
  )
}
```

reference from [voby](https://github.com/vobyjs/voby?tab=readme-ov-file#createdirective)

### `watch`

filterable and pausable `createEffect(on())` like, defer by default

```ts
import { throttle } from '@solid-primitives/scheduled'
import { watch } from '@solid-hooks/core'

const [count, setCount] = createSignal(0)
const { pause, resume, isWatching, callTimes, ignoreUpdate } = watch(
  count,
  (value, oldValue, callTimes) => {
    console.log(value, oldValue, callTimes)
    const cleanup = () => {}
    return cleanup
  },
  {
    eventFilter: fn => throttle(fn, 100),
    count: 5,
    defer: false /* true by default */
  }
)
```

#### `watchOnce`

watch once, using `createReaction`

```ts
import { watchOnce } from '@solid-hooks/core'

const [count, setCount] = createSignal(0)
watchOnce(count, (value))
```

#### `watchInstant`

like `watch`, use `createComputed`

#### `watchRendered`

like `watch`, use `createRendered`

### `useEmits`

like `defineEmits` in `Vue`, emit event from child component

```tsx
import { type defineEmits, useEmits } from '@solid-hooks/core'

type Emits = defineEmits<{
  // sync
  var: number
  update: [d1: string, d2?: string, d3?: string]
  // sync or async
  fn: (test: string) => void
}>
function Child(prop: Emits & { num: number }) {
  const emit = useEmits(prop)
  const handleClick = () => {
    emit('var', { id: 1 })
    emit('update', `emit from child: ${prop.num}`, 'second param')
    emit('fn', ['a', 'b'])
  }
  return (
    <div>
      <div>
        child prop: {prop.num}
      </div>
      <button onClick={handleClick}>click and see console</button>
    </div>
  )
}

export default function Father() {
  return (
    <Child
      num={1}
      $var={e => console.log('[emit] $var:', e)}
      $update={(d, d1) => console.log(`[emit] $update:`, d, d1)}
      $fn={test => console.log('[emit] $fn:', test)}
    />
  )
}
```

### `createApp`

like `createApp()` in `Vue`

```ts
import { createApp } from '@solid-hooks/core'
import App from './App'

createApp(App)
  .use(RouterProvider, { props })
  .use(I18nProvider)
  .use(GlobalStoreProvider)
  .mount('#app')
```

is equal to:

```tsx
render(
  <RouterProvider props={props}>
    <I18nProvider>
      <GlobalStoreProvider>
        <App />
      </GlobalStoreProvider>
    </I18nProvider>
  </RouterProvider>,
  document.querySelector('#app')
)
```

reference from [solid-utils](https://github.com/amoutonbrady/solid-utils#createapp)

### `createContextProvider`

reference from [@solid-primitives/context](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider)

if default value is not defined and use context outside provider, throw `Error` when DEV

```tsx
import { createSignal } from 'solid-js'
import { createContextProvider } from '@solid-hooks/core'

export const [TestProvider, useTestContext] = createContextProvider((param: { initial: number }) => {
  const [count, setCount] = createSignal(param.initial)
  const increment = () => setCount(count() + 1)

  return {
    count,
    increment,
  }
})

function Child() {
  const { count, increment } = useTestContext()
  return (
    <>
      <button class="btn" onClick={increment}>
        {count()}
      </button>
    </>
  )
}

export function TestContextProvider() {
  console.log('call useTestContext() outside provider:', useTestContext())
  return (
    <>
      <h1>Test <code>createContextProvider</code> :</h1>
      <TestProvider initial={0}>
        <Child />
      </TestProvider>
    </>
  )
}
```

### `useCallback`

create callbacks with `runWithOwner`, auto get current owner

reference from [@solid-primitives/rootless](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createcallback)

```ts
import { useCallback } from '@solid-hooks/core'

const handleClick = useCallback(() => {
  console.log('after 100 ms!')
})
setTimeOut(handleClick, 100)
```

### `withEffect`

add callback for setter

```tsx
import { createSignal } from 'solid-js'
import { withEffect } from '@solid-hooks/core'

export function TestWithEffect() {
  // eslint-disable-next-line solid/reactivity
  const [count, setCount] = withEffect(createSignal(1), value => console.log('[withEffect] value:', value))
  return (
    <>
      <h1>Test <code>withEffect</code> :</h1>
      <button onClick={() => setCount(c => c + 1)}>click and see console</button>
      <div>count: {count()}</div>
    </>
  )
}
```

## `@solid-hooks/core/web`

### `createObjectURL`

convert `blob` / `File` / `MediaSource` / `ArrayBuffer` / `ArrayBufferView` / `string` to signal URL, auto revoke on cleanup

```ts
import { createObjectURL } from '@solid-hooks/core/web'

const [source, setMediaSource, cleanupSource] = createObjectURL(new MediaSource())
const [url, setURL, cleanupURL] = createObjectURL(new Uint8Array(8), { type: 'image/png' })
```

### `useWorkerFn`

run function in worker, support local functions or external dependencies

reference from [vueuse](https://vueuse.org/core/useWebWorkerFn/)

```tsx
import { createMemo, createSignal } from 'solid-js'
import { useWebWorkerFn } from '@solid-hooks/core/web'

const randomNumber = () => Math.trunc(Math.random() * 5_000_00)

function heavyTask() {
  const numbers: number[] = Array(5_000_000).fill(undefined).map(randomNumber)
  numbers.sort()
  return numbers.slice(0, 5)
}

export default function TestWorker() {
  const [fn, { status, terminate }] = useWebWorkerFn(heavyTask, { func: [randomNumber] })
  const isRunning = createMemo(() => status() === 'RUNNING')
  return (
    <>
      <div>Status: {status()}</div>
      <button onClick={() => isRunning() ? terminate() : fn().then(setData)}>
        {isRunning() ? 'terminate' : 'sort in worker'}
      </button>
    </>
  )
}
```

### `useResourceTag`

load external CSS/JS

```ts
import { useResourceTag } from '@solid-hooks/core/web'

const script = 'console.log(`test load script`)'
const [scriptElement, cleanupScript] = useResourceTag('script', script, {/* options */})
const [styleElement, cleanupStyle] = useResourceTag('style', style, {/* options */})
```

### `useEventListener` / `useEventListenerStack` / `useDocumentListener` / `useWindowListener`

auto cleanup event listener

reference from [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener)

### `useDark`

auto color mode with attribute toggle, disable transition by default

```tsx
import { useDark } from '@solid-hooks/core/web'

export default function TestDark() {
  const [isDark, mode, setMode] = useDark()
  return (
    <>
      <div>{isDark() ? 'dark' : 'light'} theme</div>
      <div>{mode()}</div>
      <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>click</button>
    </>
  )
}
```

### `useNetwork` / `useOnline`

signals of network status, with `onChanges` callback

```ts
type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'

type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g'

export type NetworkState = {
  /**
   * the time at which the connection was changed
   */
  since?: Date
  /**
   * whether the device is online
   */
  online?: boolean
  /**
   * the estimated effective round-trip time of the current connection
   */
  rtt?: number
  /**
   * type of connection a device is using to communicate with the network
   */
  type?: NetworkType
  /**
   * true if the user has set a reduced data usage option on the user agent
   */
  saveData?: boolean
  /**
   * the estimated effective bandwidth (Mb/s)
   */
  downlink?: number
  /**
   * maximum downlink speed (Mb/s)
   */
  downlinkMax?: number
  /**
   * the effective type of the connection
   */
  effectiveType?: EffectiveType
}
```

### `useIdleCallback`

executes a callback using the `requestIdleCallback` API, fallback to `setTimeout`.

auto cleanup, return cleanup function.

see https://developer.mozilla.org/zh-CN/docs/Web/API/Background_Tasks_API

### `useCssVar`

bind css variable to signal

```ts
import { useCssVar } from '@solid-hooks/core/web'

const [color, setColor] = createSignal('red')
useCssVar('bg', color)
```

## License

MIT
