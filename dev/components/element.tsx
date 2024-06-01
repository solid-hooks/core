import { createRef } from '../../src/ref'
import { useClickOutside, useHover, useLongPress } from '../../src/web'

export default function TestElement() {
  const containerRef = createRef<HTMLDivElement>()
  const [isClickOutside] = useClickOutside(containerRef)
  const [isHovered] = useHover(containerRef)
  const [isLongPressed] = useLongPress(containerRef, { delay: 1000 })

  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={containerRef}
        style={{
          border: '1px solid black',
          width: '50px',
          height: '50px',
          margin: 'auto',
        }}
        tabIndex={0}
      />
      <div
        style={{
          'text-align': 'center',
          'padding-top': '20px',
        }}
      >
        <div>is container clicked outside: {isClickOutside() ? 'yes' : 'no'}</div>
        <div>is container hovered: {isHovered() ? 'yes' : 'no'}</div>
        <div>is container long pressed: {isLongPressed() ? 'yes' : 'no'}</div>
      </div>
    </div>
  )
}
