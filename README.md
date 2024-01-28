<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@solid-hooks/hooks&background=tiles&project=%20" alt="@solid-hooks/hooks">
</p>

# @solid-hooks/core

useful hooks for solid.js

## Install

```shell
npm i @solid-hooks/hooks
```
```shell
yarn add @solid-hooks/hooks
```
```shell
pnpm add @solid-hooks/hooks
```

## Usage

### `createRefSignal`

make plain object props reactive

```ts
import { createRefSignal } from '@solid-hooks/hooks'

const audio = new Audio()
const [time, setCurrentTime] = createRefSignal(audio, 'currentTime')
```

### `createObjectURL`

convert `blob` / `File` / `MediaSource` / `ArrayBuffer` / `ArrayBufferView` / `string` to signal URL, auto revoke on cleanup

```ts
import { createObjectURL } from '@solid-hooks/hooks'

const [source, setMediaSource, cleanupSource] = createObjectURL(new MediaSource())
const [url, setURL, cleanupURL] = createObjectURL(new Uint8Array(8), { type: 'image/png' })
```

### `watch`

filterable and pausable `createEffect(on())` like, defer by default

```ts
import { throttle } from '@solid-primitives/scheduled'
import { watch } from '@solid-hooks/hooks'

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
import { watchOnce } from '@solid-hooks/hooks'

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
import { useEmits } from '@solid-hooks/hooks'
import type { EmitProps } from '@solid-hooks/hooks'

type Emits = {
  var: number
  update: [d1: string, d2?: string, d3?: string]
  optional?: { test: number }
}

type BaseProps = { num: number }

function Child(props: EmitProps<Emits, BaseProps>) {
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
      child:
      {props.num}
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

### `useTick`

like `nextTick()` in `Vue` , reference from [solidjs-use](https://github.com/solidjs-use/solidjs-use/blob/main/packages/solid-to-vue/src/scheduler.ts)

### `createApp`

like `createApp()` in `Vue`

```ts
import { createApp } from '@solid-hooks/hooks'
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

```ts
import { createContextProvider } from '@solid-hooks/hooks'

const [useDateContext, DateProvider] = createContextProvider(
  'date',
  () => new Date()
)

// with default value
const [useDateContext, DateProvider] = createContextProvider(
  'date',
  (args: { date: string }) => new Date(args.date),
  new Date()
)
```

### `useEventListener` / `useEventListenerMap` / `useDocumentListener` / `useWindowListener`

auto cleanup event listener

use [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener)

### `useDraggable`

make element draggable

```tsx
import { useDraggable } from '@solid-hooks/hooks'

const [el, setEl] = createSignal<HTMLElement>()
const [handler, setHandler] = createSignal<HTMLElement>()

const {
  position,
  resetPosition,
  enable,
  disable,
  isDragging,
  isDraggable,
} = useDraggable(el, {
  initialPosition: { x: 200, y: 80 },
  addStyle: true, // auto update el's left and top
  handleEl: handle,
})
return (
  <div
    ref={setEl}
    style={{ position: 'fixed' }}
  >
    I am at {Math.round(position().x)}, {Math.round(position().y)}
    <div
      ref={setHandler}
      style={{ position: 'fixed' }}
    >
      drag me
    </div>
  </div>
)
```

### `useResourceTag`

load external CSS/JS

```ts
import { useResourceTag } from '@solid-hooks/hooks'

const script = 'console.log(`test load script`)'
const [element, cleanup] = useResourceTag(script, {/* options */})
```

### `useCallback`

create callbacks with `runWithOwner`, auto get current owner

reference from [@solid-primitives/rootless](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createcallback)

```ts
import { useCallback } from '@solid-hooks/hooks'

const handleClick = useCallback(() => {
  console.log('after 100 ms!')
})
setTimeOut(handleClick, 100)
```
