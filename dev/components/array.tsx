import { For } from 'solid-js'
import { createArray, createRef } from '../../src'

export default function TestArray() {
  const list = createRef(createArray(['a', 'b', 'c']))
  return (
    <div>
      <button onClick={() => list(l => l.push('d'))}>+</button>
      <button onClick={() => list(l => l.pop())}>-</button>
      <button onClick={() => list(['a', 'b', 'c'])}>reset</button>
      <div style={{ display: 'flex' }}>
        <For each={list()}>
          {(item) => {
            console.log(item)
            return <p>{item}</p>
          }}
        </For>
      </div>
    </div>
  )
}
