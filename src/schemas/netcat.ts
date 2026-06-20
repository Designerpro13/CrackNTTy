import { ToolSchema } from './types'

export const netcatSchema: ToolSchema = {
  id: 'netcat',
  name: 'Netcat',
  icon: '🐈',
  category: 'Exploitation',
  description: 'TCP/UDP Swiss army knife. Bind/reverse shells, port scanning, file transfer.',
  command: 'nc',
  path: '/usr/bin/netcat',
  args: [
    { id: 'host', flag: '', label: 'Host', type: 'text', required: false, placeholder: '10.10.10.1', isPositional: true },
    { id: 'port', flag: '', label: 'Port', type: 'number', required: true, placeholder: '4444', isPositional: true },
    { id: 'listen', flag: '-l', label: 'Listen Mode', type: 'boolean', required: false },
    { id: 'verbose', flag: '-v', label: 'Verbose', type: 'boolean', required: false },
    { id: 'udp', flag: '-u', label: 'UDP Mode', type: 'boolean', required: false },
    { id: 'execute', flag: '-e', label: 'Execute', type: 'text', required: false, placeholder: '/bin/bash' },
  ],
  outputFormat: 'Raw stream',
  parserType: 'raw',
}
