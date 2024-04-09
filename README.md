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

### `createObjectURL`

convert `blob` / `File` / `MediaSource` / `ArrayBuffer` / `ArrayBufferView` / `string` to signal URL, auto revoke on cleanup

```ts
import { createObjectURL } from '@solid-hooks/core'

const [source, setMediaSource, cleanupSource] = createObjectURL(new MediaSource())
const [url, setURL, cleanupURL] = createObjectURL(new Uint8Array(8), { type: 'image/png' })
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

like `defineEmit` in `Vue`, emit event from child component, auto handle optional prop

```tsx
import { createSignal } from 'solid-js'
import { useEmits } from '@solid-hooks/core'

// must start with `$`
type Emits = {
  $var: (num: number) => void
  $update: (d1: string, d2?: string, d3?: string) => void
  $optional?: (data: { test: number }) => void
}

type BaseProps = { num: number }

function Child(props: Emits & BaseProps) {
  const { emit, createEmitSignal } = useEmits<Emits>(props)

  // auto emit after value changing, like `defineModel` in Vue
  const [variable, setVariable] = createEmitSignal('var', 1)
  const handleClick = () => {
    setVariable(v => v + 1)

    // manully emit
    emit('update', `emit from child: ${props.num}`, 'second')
    emit('optional', { test: 1 })
  }
  return (
    <div>
      child: {props.num}
      <button onClick={handleClick}>+</button>
    </div>
  )
}
function Father() {
  const [count] = createSignal('init')
  return (
    <Child
      num={count()}
      $update={console.log}
      $var={e => console.log('useEmits:', e)}
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

object style useContext and Provider

if default value is not defined and use context outside provider, throw `Error` when DEV

reference from [@solid-primitives/context](https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider)

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

### `useWorkerFn`

run function in worker

reference from [vueuse](https://vueuse.org/core/useWebWorkerFn/)

```tsx
import { createMemo, createSignal } from 'solid-js'
import { useWebWorkerFn } from '@solid-hooks/core/web'

function heavyTask() {
  const randomNumber = () => Math.trunc(Math.random() * 5_000_00)
  const numbers: number[] = Array(5_000_000).fill(undefined).map(randomNumber)
  numbers.sort()
  return numbers.slice(0, 5)
}

export default function TestWorker() {
  const [fn, status, terminate] = useWebWorkerFn(heavyTask)
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

use [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener)

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

## License

MIT
