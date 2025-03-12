import type { defineEmits } from '../../src'

import { useEmits } from '../../src'

type Emits = defineEmits<{
  var: { id: number }
  /**
   * test comment
   */
  update: [d1: string, d2?: string, d3?: string]
  fn: (test: string[]) => void
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

export default function TestEmit() {
  return (
    <Child
      num={1}
      $var={e => console.log('[useEmit] $var:', e)}
      $update={(d, d1) => console.log(`[useEmit] $update:`, d, d1)}
      $fn={test => console.log('[useEmit] $fn:', test)}
    />
  )
}
