import { ToolSchema } from './types'

export const gobusterSchema: ToolSchema = {
  id: 'gobuster',
  name: 'Gobuster',
  icon: '📂',
  category: 'Reconnaissance',
  description: 'Directory/file/vhost/DNS brute-force tool for web enumeration.',
  command: 'gobuster',
  path: '/usr/bin/gobuster',
  args: [
    { id: 'mode', flag: '', label: 'Mode', type: 'select', required: true, options: ['dir', 'dns', 'vhost', 'fuzz'], default: 'dir', isPositional: true },
    { id: 'url', flag: '-u', label: 'Target URL', type: 'text', required: true, placeholder: 'http://10.10.10.1' },
    { id: 'wordlist', flag: '-w', label: 'Wordlist', type: 'file', required: true, placeholder: '~/thmtools/wordlist/discovery/directory_list_2.3_medium.txt' },
    { id: 'extensions', flag: '-x', label: 'Extensions', type: 'text', required: false, placeholder: 'php,html,txt' },
    { id: 'threads', flag: '-t', label: 'Threads', type: 'number', required: false, default: '50' },
    { id: 'statusCodes', flag: '-s', label: 'Status Codes', type: 'text', required: false, placeholder: '200,204,301,302' },
    { id: 'noError', flag: '--no-error', label: 'Hide Errors', type: 'boolean', required: false },
  ],
  outputFormat: 'Line-based stdout',
  parserType: 'regex',
}
