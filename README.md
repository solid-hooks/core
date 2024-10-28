<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@solid-hooks/hooks&background=tiles&project=%20" alt="@solid-hooks/hooks">
</p>

# @solid-hooks/core

useful hooks for solid.js

> [!WARNING]
> Breaking change expected. Use at your own risk.

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

### `createRef`

read / write signal in one function

```tsx
import { createRef } from '@solid-hooks/core'
import { onMounted } from 'solid-js'

function Test() {
  const divRef = createRef<HTMLDivElement>()
  return <div ref={divRef} />
}

function Counter() {
  const counter = createRef(0)
  return <button onClick={() => counter(c => c + 1)}>{counter()}</button>
}

function useSomethingRef() {
  return createRef(useSomething())
}
```

### `createTracker`

Track plain object property, make it reactive

```ts
import { createTracker } from '@solid-hooks/core'

const audio = new Audio()
const [time, setCurrentTime] = createTracker(audio, 'currentTime')
```

Before v0.4.0 is `createReactive`

### `createArray`

create array signal

```ts
import { createArray } from '@solid-hooks/core'

const [array, setArray] = createArray(['a', 'b', 'c'])

const push = setArray(l => l.push('d'))
const pop = setArray(l => l.pop())
const reset = setArray(['a', 'b', 'c'])
```

### `createToggle`

create toggle signal

```ts
import { createToggle } from '@solid-hooks/core'

const [state, toggle] = createToggle(
  false,
  value => console.log(value)
)
toggle()
toggle(true)
toggle(false)
```

### `createDirective`

another way to create directive

```tsx
import { createDirective } from '@solid-hooks/core'
import { type Accessor, createRenderEffect, createSignal, type Setter } from 'solid-js'

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
import { watch } from '@solid-hooks/core'
import { throttle } from '@solid-primitives/scheduled'

const [count, setCount] = createSignal(0)
const { pause, resume, isWatching, callTimes, ignoreUpdate } = watch(
  count,
  (value, oldValue, callTimes) => {
    console.log(value, oldValue, callTimes)
    const cleanup = () => { }
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
watchOnce(count, console.log)
```

#### `watchImmediate`

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
import { createContextProvider } from '@solid-hooks/core'
import { createSignal } from 'solid-js'

export const [TestProvider, useTestContext] = createContextProvider((param: { initial: number }) => {
  const [count, setCount] = createSignal(param.initial)
  const increment = () => setCount(count() + 1)

  return { count, increment }
})

function Child() {
  const { count, increment } = useTestContext()
  return (
    <button onClick={increment}>
      {count()}
    </button>
  )
}

export function TestContextProvider() {
  console.log('call useTestContext() outside provider:', useTestContext())
  return (
    <TestProvider initial={0}>
      <Child />
    </TestProvider>
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

## `@solid-hooks/core/web`

### `cls`

merge classes, lightweight version of `clsx`

```ts
import { cls } from '@solid-hooks/core/web'

cls('foo', true && 'bar', false && ['bar', true && 'baz'], 1)
// => 'foo baz'
```

### `useHover`

check if element is hovered

```tsx
import { useHover } from '@solid-hooks/core/web'

function App() {
  let el
  const [hovered] = useHover(() => el)
  return <div ref={el}>{hovered() ? 'hovered' : 'not hovered'}</div>
}
```

### `useClickOutside`

check if element is clicked outside

```tsx
import { useClickOutside } from '@solid-hooks/core/web'

function App() {
  let el
  const [isClickOutside] = useClickOutside(() => el)
  return <div ref={el}>{isClickOutside() ? 'clicked outside' : 'clicked inside'}</div>
}
```

### `useLongPress`

check if element is long pressed

```tsx
import { useLongPress } from '@solid-hooks/core/web'

function App() {
  let el
  const [isLongPress] = useLongPress(() => el)
  return <div ref={el}>{isLongPress() ? 'long pressed' : 'not long pressed'}</div>
}
```

### `useTitle`

reactive document title

```tsx
import { useTitle } from '@solid-hooks/core/web'

const [title, setTitle] = useTitle()

// or with external signal
const [title, setTitle] = createSignal('')
useTitle(title)
setTitle('new title')
```

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
import { useWebWorkerFn } from '@solid-hooks/core/web'
import { createMemo, createSignal } from 'solid-js'

const randomNumber = () => Math.trunc(Math.random() * 5_000_00)

function heavyTask() {
  const numbers: number[] = Array.from({ length: 5_000_000 }).fill(undefined).map(randomNumber)
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

### `useExternal`

load external CSS/JS

```ts
import { useExternal } from '@solid-hooks/core/web'

const script = 'console.log(`test load script`)'
const [scriptElement, cleanupScript] = useExternal('script', script, {/* options */})
const [styleElement, cleanupStyle] = useExternal('style', style, {/* options */})
```

### `useEventListener` / `useEventListenerStack` / `useDocumentListener` / `useWindowListener`

auto cleanup event listener, allow nullish target

reference from [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener)

### `useColorMode`

auto color mode with attribute toggle, disable transition by default

```tsx
import { useColorMode } from '@solid-hooks/core/web'

export default function TestColorMode() {
  const [mode, setMode, isDark] = useColorMode()
  return (
    <>
      <div>{isDark() ? 'dark' : 'light'} theme</div>
      <div>{mode()}</div>
      <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>click</button>
    </>
  )
}
```

### `useNetwork`

signals of network status, with `onChanges` callback

```ts
import { useNetwork } from '@solid-hooks/core/web'

const net = useNetwork()
const isOnline = net.online
```

types:
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

### `useCopy` / `usePaste` / `createClipboardItem`

hooks that paste from clipboard

```tsx
import { createClipboardItem, useCopy, usePaste } from '@solid-hooks/web'

export default () => {
  const [data, setData] = createClipboardItem('test')
  const { isCopied, copy } = useCopy()

  const paste = usePaste({
    onPaste: (data, mime) => console.log(data, mime)
  })
  return (
    <>
      <div>is copied: {isCopied() ? 'true' : 'false'}</div>
      <button onClick={() => copy(data())}>copy</button>
      <button onClick={paste}>paste</button>
    </>
  )
}
```

## License

MIT
