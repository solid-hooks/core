import { describe, expect, it } from 'vitest'

import { accessProps, useProps } from '../src/props'

interface Props {
  name: string
  age: number
  role?: 'admin' | 'user'
}
describe('useProps', () => {
  it('should split props into picked and rest', () => {
    const props: Props = { name: 'John', age: 30, role: 'admin' }
    const [picked, rest] = useProps(props, ['name', 'age'])

    expect(picked.name()).toBe('John')
    expect(picked.age()).toBe(30)
    expect(rest.role?.()).toBe('admin')
  })

  it('should apply default values to picked props', () => {
    const props: Props = { name: 'John', age: 30 }
    const [picked, rest] = useProps(props, ['name', 'role'])

    expect(picked.name()).toBe('John')
    expect(picked.role?.()).toBeFalsy()
    expect(rest.age()).toBe(30)
  })

  it('should make optional props required', () => {
    const props: Props = { name: 'John', age: 30 }
    const [picked, rest] = useProps(props, ['name'], { role: 'user' })

    expect(picked.name()).toBe('John')
    expect(rest.role()).toBe('user')
    expect(rest.age()).toBe(30)
  })
})

describe('accessProps', () => {
  it('should convert Accessor-based props to plain values', () => {
    const parsedProps = { name: () => 'John', age: () => 30 }
    const result = accessProps(parsedProps)

    expect(result).toEqual({ name: 'John', age: 30 })
  })

  it('should handle nullable and optional props correctly', () => {
    const parsedProps = { name: () => null, age: () => undefined }
    const result = accessProps(parsedProps)

    expect(result).toEqual({ name: null, age: undefined })
  })

  it('should handle empty object correctly', () => {
    const parsedProps = {}
    const result = accessProps(parsedProps)

    expect(result).toEqual({})
  })
})
