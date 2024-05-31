import { useColorMode } from '../../src/web'

export default function TestColorMode() {
  const [mode, setMode, isDark] = useColorMode()
  return (
    <>
      <div>{isDark() ? 'dark' : 'light'} theme</div>
      <div>{mode()}</div>
      <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>click and see {'<html/>'}</button>
    </>
  )
}
