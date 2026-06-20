import { ToolSchema } from './types'

export const niktoSchema: ToolSchema = {
  id: 'nikto',
  name: 'Nikto',
  icon: '🕷️',
  category: 'Reconnaissance',
  description: 'Web server vulnerability scanner. Checks for dangerous files, outdated software, and misconfigurations.',
  command: 'nikto',
  path: '/usr/bin/nikto',
  args: [
    { id: 'host', flag: '-h', label: 'Target Host', type: 'text', required: true, placeholder: 'http://10.10.10.1' },
    { id: 'port', flag: '-p', label: 'Port', type: 'text', required: false, placeholder: '80,443' },
    { id: 'ssl', flag: '-ssl', label: 'Use SSL', type: 'boolean', required: false },
    { id: 'tuning', flag: '-Tuning', label: 'Tuning', type: 'text', required: false, placeholder: '1-9, x for all' },
    { id: 'output', flag: '-o', label: 'Output File', type: 'text', required: false },
    { id: 'format', flag: '-Format', label: 'Output Format', type: 'select', required: false, options: ['csv', 'htm', 'txt', 'xml'] },
  ],
  outputFormat: 'Line-based stdout with + prefixed findings',
  parserType: 'regex',
}
