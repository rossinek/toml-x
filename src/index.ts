import { parse, stringify } from 'smol-toml'
import { createDefu } from 'defu'

export interface MergeOptions {
  numbersAsFloat?: boolean
}

const defu = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && value) {
    obj[key] = value;
    return true;
  }
});


/**
 * Merge multiple TOML file contents using deep merge strategy.
 * Later configs override earlier ones.
 *
 * @param configs - Array of TOML file contents as strings
 * @param options - Merge options
 * @returns Merged TOML as a string
 */
export function merge(configs: string[], options: MergeOptions = {}): string {
  const { numbersAsFloat = false } = options

  if (configs.length === 0) {
    throw new Error('No configs provided')
  }

  // Parse all TOML strings
  const parsed = configs.map((content, index) => {
    try {
      return parse(content)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse config at index ${index}: ${error.message}`)
      }
      throw error
    }
  })

  // Merge with defu - reverse order so last config has highest priority
  const merged = defu({}, ...parsed.reverse())

  // Stringify the result
  let output = stringify(merged, { numbersAsFloat })

  return output
}
