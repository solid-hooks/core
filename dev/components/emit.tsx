import { createMemo } from 'solid-js'
import type { ParseFunction } from '@subframe7536/type-utils'
import { useEmits } from '../../src'

type Emits = {
  $var: ParseFunction<number>
  /**
   * test
   */
  $update: ParseFunction<[d1: string, d2?: string, d3?: string]>
  $optional?: ParseFunction<{ test: number }>
}
function Child(prop: Emits & { num: number }) {
  const { emit, createEmitSignal } = useEmits<Emits>(prop)
  // auto emit after value changing, like `defineModel` in Vue
  const [v, setV] = createEmitSignal('var', 1)
  const handleClick = () => {
    setV(v() + 1)
    emit('update', `emit from child: ${prop.num}`, 'second param')
    emit('optional', { test: 1 })
  }
  const childValue = createMemo(() => prop.num)
  return (
    <div>
      <div>
        child prop: {childValue()}
      </div>
      <div>
        emit signal: {v()}
      </div>
      <button onClick={handleClick}>click and see console</button>
    </div>
  )
}

export default function TestEmit() {
  return (
    <>
      <h1>Test <code>useEmits</code> :</h1>
      <Child
        num={1}
        $update={(e, e1) => console.log(`[emit] $update:`, e, e1)}
        $var={e => console.log('[emit] $var:', e)}
      />
    </>
  )
}
