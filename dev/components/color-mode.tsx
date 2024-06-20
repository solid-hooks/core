import { createRef } from '../../src'
import { useColorMode, useCopy, usePaste } from '../../src/web'

export default function TestColorModeAndClipboard() {
  const [mode, setMode, isDark] = useColorMode()
  const str = createRef('')
  const mime = createRef('')
  const { copy, isCopied } = useCopy({ legacy: true })
  const paste = usePaste({
    onPaste: (data, mimeType) => {
      typeof data === 'string' && str(data)
      mime(mimeType)
    },
  })
  return (
    <>
      <div>{isDark() ? 'dark' : 'light'} theme</div>
      <div>{mode()}</div>
      <button onClick={() => copy(setMode(m => m === 'dark' ? 'light' : 'dark'))}>click to copy and see {'<html/>'}</button>
      <div>is copied: {isCopied() ? 'true' : 'false'}</div>
      <div>
        <button onClick={paste}>paste</button>
        <div>data(string only): {str()}</div>
        <div>mime: {mime()}</div>
      </div>
    </>
  )
}
