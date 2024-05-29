import { useClickOutside, useHover } from '../../src/web'

export default function TestElement() {
  let containerRef: HTMLDivElement | undefined
  const isClicked = useClickOutside(() => containerRef)
  const isHovered = useHover(() => containerRef)

  return (
    <div>
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
        <div>is container clicked:{isClicked() ? 'yes' : 'no'}</div>
        <div>is container hovered:{isHovered() ? 'yes' : 'no'}</div>
      </div>
    </div>
  )
}
