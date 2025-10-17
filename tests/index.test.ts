import { describe, it, expect } from 'vitest'
import { merge } from '../src/index.js'
import { parse } from 'smol-toml'

const BASE_TOML = `
one = 1
oneFloat = 1.0
half = 0.5
text = "some text"
textArray = ["t1", "t2"]
numArray = [1, 2]

[obj]
value = "obj_value"
array = ["a", "b"]

[obj.nested]
value = "obj_nested_value"`

const OVERRIDES_TOML = `
one = [1, 1, 1]
text = "new text"
numArray = [10, 20, 30]

[obj]
value = "obj_value_overridden"
array = ["c", "d"]
`

const WITH_NEW_VALUES_TOML = `
half = "1/2"
three = 3

[obj.nested]
value = "new_nested_value"

[obj.nested.a.b.c.d]
value = ["obj", "nested", "a", "b", "c", "d", "value"]
`

describe('merge', () => {
  it('should return unchanged values if one file provided', () => {
    const result = merge([BASE_TOML])
    expect(parse(result)).toEqual({
      one: 1,
      oneFloat: 1.0,
      half: 0.5,
      text: "some text",
      textArray: ["t1", "t2"],
      numArray: [1, 2],
      obj: {
        value: "obj_value",
        array: ["a", "b"],
        nested: {
          value: "obj_nested_value"
        },
      },
    })
  })

  it('should return override values of the first toml', () => {
    const result = merge([BASE_TOML, OVERRIDES_TOML])
    expect(parse(result)).toEqual({
      one: [1, 1, 1],
      oneFloat: 1.0,
      half: 0.5,
      text: "new text",
      textArray: ["t1", "t2"],
      numArray: [10, 20, 30],
      obj: {
        value: "obj_value_overridden",
        array: ["c", "d"],
        nested: {
          value: "obj_nested_value"
        },
      },
    })
  })

  it('should add new values to first toml', () => {
    const result = merge([BASE_TOML, WITH_NEW_VALUES_TOML])
    expect(parse(result)).toEqual({
      one: 1,
      oneFloat: 1.0,
      half: "1/2",
      three: 3,
      text: "some text",
      textArray: ["t1", "t2"],
      numArray: [1, 2],
      obj: {
        value: "obj_value",
        array: ["a", "b"],
        nested: {
          value: "new_nested_value",
          a: {
            b: {
              c: {
                d: {
                  value: ["obj", "nested", "a", "b", "c", "d", "value"]
                }
              }
            }
          }
        },
      },
    })
  })

  it('should work with multiple overrides', () => {
    const result = merge(['value = 1', 'value = 2', 'value = 3'])
    expect(parse(result)).toEqual({ value: 3 })
  })

  it('should throw an error if no files are provided', () => {
    expect(() => merge([])).toThrow()
  })

  it('should throw an error if a file is invalid TOML', () => {
    expect(() => merge(['invalid'])).toThrow('Failed to parse config at index 0: Invalid TOML')
  })

  it('renders numbers as floats if numbersAsFloat is true', () => {
    const result = merge([BASE_TOML, OVERRIDES_TOML], { numbersAsFloat: true })
    expect(result).toContain('one = [ 1.0, 1.0, 1.0 ]')
    expect(result).toContain('oneFloat = 1.0')
    expect(result).toContain('half = 0.5')
    expect(result).toContain('numArray = [ 10.0, 20.0, 30.0 ]')
  })

  it('renders numbers as integers if numbersAsFloat is false', () => {
    const result = merge([BASE_TOML, OVERRIDES_TOML], { numbersAsFloat: false })
    expect(result).toContain('one = [ 1, 1, 1 ]')
    expect(result).toContain('oneFloat = 1')
    expect(result).toContain('half = 0.5')
    expect(result).toContain('numArray = [ 10, 20, 30 ]')
  })
})
