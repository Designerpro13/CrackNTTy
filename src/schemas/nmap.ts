import type { ToolSchema } from './types'

export const nmapSchema: ToolSchema = {
  id: 'nmap',
  name: 'Nmap',
  icon: '🔍',
  category: 'Reconnaissance',
  description: 'Network exploration tool and security/port scanner. Essential for discovering hosts and services.',
  command: 'nmap',
  path: '/usr/bin/nmap',
  args: [
    { id: 'target', flag: '', label: 'Target IP/Range', type: 'text', required: true, placeholder: '10.10.10.1 or 192.168.1.0/24', isPositional: true },
    { id: 'ports', flag: '-p', label: 'Ports', type: 'text', required: false, placeholder: '1-1000, 80,443, or -' },
    { id: 'scanType', flag: '', label: 'Scan Type', type: 'select', required: false, options: ['-sS', '-sT', '-sU', '-sV', '-sC', '-A'], default: '-sS' },
    { id: 'timing', flag: '-T', label: 'Timing', type: 'select', required: false, options: ['0', '1', '2', '3', '4', '5'], default: '4' },
    { id: 'osDetect', flag: '-O', label: 'OS Detection', type: 'boolean', required: false },
    { id: 'scripts', flag: '--script', label: 'NSE Scripts', type: 'text', required: false, placeholder: 'vuln, default, discovery' },
    { id: 'xmlOutput', flag: '-oX', label: 'XML Output', type: 'text', required: false, default: '-' },
  ],
  outputFormat: 'XML (when -oX used)',
  parserType: 'xml',
}
