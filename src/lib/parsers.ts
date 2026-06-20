import { ParsedOutput } from '../schemas/types'

/**
 * Parse nmap XML output into structured data.
 * Expects output from `nmap -oX -` (XML to stdout)
 */
export function parseNmap(raw: string): ParsedOutput {
  const structured: Record<string, unknown> = {}
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(raw, 'text/xml')
    const hosts: Array<Record<string, unknown>> = []

    doc.querySelectorAll('host').forEach((host) => {
      const addr = host.querySelector('address')?.getAttribute('addr') || ''
      const hostname = host.querySelector('hostname')?.getAttribute('name') || ''
      const ports: Array<Record<string, unknown>> = []

      host.querySelectorAll('port').forEach((port) => {
        const portId = port.getAttribute('portid') || ''
        const protocol = port.getAttribute('protocol') || ''
        const state = port.querySelector('state')?.getAttribute('state') || ''
        const service = port.querySelector('service')?.getAttribute('name') || ''
        ports.push({ port: parseInt(portId), protocol, state, service })
      })

      const os = host.querySelector('osmatch')?.getAttribute('name') || ''
      hosts.push({ ip: addr, hostname, ports, os })
    })

    // Build open_ports convenience map
    const openPorts: Record<string, string> = {}
    if (hosts.length > 0) {
      const firstHost = hosts[0]
      ;(firstHost.ports as Array<Record<string, unknown>>)
        .filter((p) => p.state === 'open')
        .forEach((p) => {
          const svc = String(p.service || `port_${p.port}`)
          openPorts[svc] = `${firstHost.ip}:${p.port}`
        })
    }

    structured.hosts = hosts
    structured.open_ports = openPorts
  } catch {
    // fallback: no structured data
  }
  return { raw, structured }
}

/**
 * Parse gobuster output (line-based: /path (Status: 200) [Size: 1234])
 */
export function parseGobuster(raw: string): ParsedOutput {
  const paths: Array<{ path: string; status: number; size: number }> = []
  const lines = raw.split('\n')
  const re = /^(\/\S+)\s+\(Status:\s*(\d+)\)\s*\[Size:\s*(\d+)\]/

  for (const line of lines) {
    const match = line.match(re)
    if (match) {
      paths.push({ path: match[1], status: parseInt(match[2]), size: parseInt(match[3]) })
    }
  }

  return {
    raw,
    structured: {
      paths,
      directories: paths.filter((p) => p.path.endsWith('/')).map((p) => p.path),
      files: paths.filter((p) => !p.path.endsWith('/')).map((p) => p.path),
    },
  }
}

/**
 * Parse hydra output (login: X password: Y)
 */
export function parseHydra(raw: string): ParsedOutput {
  const credentials: Array<{ login: string; password: string; service: string }> = []
  const re = /\[(\w+)\].*host:\s*\S+\s+login:\s*(\S+)\s+password:\s*(\S+)/

  for (const line of raw.split('\n')) {
    const match = line.match(re)
    if (match) {
      credentials.push({ service: match[1], login: match[2], password: match[3] })
    }
  }

  return { raw, structured: { credentials } }
}

/**
 * Parse nikto output (+ prefixed findings)
 */
export function parseNikto(raw: string): ParsedOutput {
  const vulnerabilities: Array<{ description: string; url?: string }> = []

  for (const line of raw.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+-')) {
      const desc = line.slice(2).trim()
      if (desc) vulnerabilities.push({ description: desc })
    }
  }

  return { raw, structured: { vulnerabilities } }
}

/**
 * Parse john output (hash:password)
 */
export function parseJohn(raw: string): ParsedOutput {
  const cracked: Array<{ hash: string; password: string }> = []
  const re = /^(.+):(.+)$/

  for (const line of raw.split('\n')) {
    const match = line.match(re)
    if (match && !line.startsWith('Using') && !line.startsWith('Loaded')) {
      cracked.push({ hash: match[1], password: match[2] })
    }
  }

  return { raw, structured: { cracked } }
}

/**
 * Raw fallback parser (netcat, curl)
 */
export function parseRaw(raw: string): ParsedOutput {
  return { raw, structured: {} }
}

/** Get appropriate parser for a tool */
export function getParser(toolId: string) {
  const parsers: Record<string, (raw: string) => ParsedOutput> = {
    nmap: parseNmap,
    gobuster: parseGobuster,
    hydra: parseHydra,
    nikto: parseNikto,
    john: parseJohn,
    netcat: parseRaw,
    curl: parseRaw,
  }
  return parsers[toolId] || parseRaw
}
