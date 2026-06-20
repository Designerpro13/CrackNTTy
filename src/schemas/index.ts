import { ToolSchema, ArgDef } from './types'
import { nmapSchema } from './nmap'
import { gobusterSchema } from './gobuster'
import { niktoSchema } from './nikto'
import { hydraSchema } from './hydra'
import { johnSchema } from './john'
import { netcatSchema } from './netcat'
import { curlSchema } from './curl'

export const toolSchemas: ToolSchema[] = [
  nmapSchema,
  gobusterSchema,
  niktoSchema,
  hydraSchema,
  johnSchema,
  netcatSchema,
  curlSchema,
]

export const toolMap = Object.fromEntries(toolSchemas.map((t) => [t.id, t]))

/**
 * Build a CLI command string from a tool schema and user-provided values.
 * Values is a Record<argId, string | boolean>.
 */
export function buildCommand(
  schema: ToolSchema,
  values: Record<string, string | boolean>,
): { command: string; args: string[] } {
  const args: string[] = []
  const positionals: string[] = []

  for (const arg of schema.args) {
    const val = values[arg.id]
    if (val === undefined || val === '' || val === false) continue

    if (arg.isPositional) {
      positionals.push(String(val))
    } else if (arg.type === 'boolean') {
      args.push(arg.flag)
    } else {
      // Scan type special case: flag IS the value (e.g. "-sS")
      if (arg.flag === '' && typeof val === 'string') {
        args.push(val)
      } else {
        args.push(arg.flag, String(val))
      }
    }
  }

  return { command: schema.command, args: [...args, ...positionals] }
}

export type { ToolSchema, ArgDef }
export * from './types'
