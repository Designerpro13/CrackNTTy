import type { ToolSchema } from './types'

export const hydraSchema: ToolSchema = {
  id: 'hydra',
  name: 'Hydra',
  icon: '🔓',
  category: 'Exploitation',
  description: 'Online password brute-force tool supporting SSH, FTP, HTTP, SMB, and many more protocols.',
  command: 'hydra',
  path: '/usr/bin/hydra',
  args: [
    { id: 'target', flag: '', label: 'Target', type: 'text', required: true, placeholder: '10.10.10.1', isPositional: true },
    { id: 'service', flag: '', label: 'Service', type: 'select', required: true, options: ['ssh', 'ftp', 'http-get', 'http-post-form', 'smb', 'rdp', 'mysql', 'telnet'], isPositional: true },
    { id: 'username', flag: '-l', label: 'Username', type: 'text', required: false, placeholder: 'admin' },
    { id: 'userlist', flag: '-L', label: 'Username List', type: 'file', required: false },
    { id: 'password', flag: '-p', label: 'Password', type: 'text', required: false },
    { id: 'passlist', flag: '-P', label: 'Password List', type: 'file', required: false, placeholder: '~/thmtools/wordlist/passwords/rockyou.txt' },
    { id: 'threads', flag: '-t', label: 'Threads', type: 'number', required: false, default: '16' },
    { id: 'verbose', flag: '-V', label: 'Verbose', type: 'boolean', required: false },
  ],
  outputFormat: 'Line-based with [PORT][SERVICE] host login: X password: Y',
  parserType: 'regex',
}
