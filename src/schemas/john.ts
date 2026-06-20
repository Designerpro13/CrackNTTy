import type { ToolSchema } from './types'

export const johnSchema: ToolSchema = {
  id: 'john',
  name: 'John the Ripper',
  icon: '🔨',
  category: 'Exploitation',
  description: 'Offline password hash cracker with wordlist and rule-based attacks.',
  command: 'john',
  path: '/usr/sbin/john',
  args: [
    { id: 'hashfile', flag: '', label: 'Hash File', type: 'file', required: true, placeholder: '/path/to/hashes.txt', isPositional: true },
    { id: 'wordlist', flag: '--wordlist', label: 'Wordlist', type: 'file', required: false, placeholder: '~/thmtools/wordlist/passwords/rockyou.txt' },
    { id: 'format', flag: '--format', label: 'Hash Format', type: 'select', required: false, options: ['raw-md5', 'raw-sha1', 'raw-sha256', 'bcrypt', 'ntlm', 'sha512crypt', 'zip', 'rar'] },
    { id: 'rules', flag: '--rules', label: 'Rules', type: 'text', required: false, placeholder: 'best64, jumbo' },
    { id: 'show', flag: '--show', label: 'Show Cracked', type: 'boolean', required: false },
  ],
  outputFormat: 'Line-based with hash:password format',
  parserType: 'regex',
}
