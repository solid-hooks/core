import { useDark } from '../../src/web'

export default function TestDark() {
  const [isDark, mode, setMode] = useDark()
  return (
    <>
      <div>{isDark() ? 'dark' : 'light'} theme</div>
      <div>{mode()}</div>
      <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>click and see {'<html/>'}</button>
    </>
  )
}
