import type { ToolSchema } from './types'

export const curlSchema: ToolSchema = {
  id: 'curl',
  name: 'cURL',
  icon: '🌐',
  category: 'Analysis',
  description: 'HTTP/HTTPS client for API testing, header inspection, and file download.',
  command: 'curl',
  path: '/usr/bin/curl',
  args: [
    { id: 'url', flag: '', label: 'URL', type: 'text', required: true, placeholder: 'http://10.10.10.1/api/endpoint', isPositional: true },
    { id: 'method', flag: '-X', label: 'Method', type: 'select', required: false, options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'] },
    { id: 'headers', flag: '-H', label: 'Headers', type: 'text', required: false, placeholder: 'Content-Type: application/json' },
    { id: 'data', flag: '-d', label: 'Data/Body', type: 'text', required: false, placeholder: '{"key": "value"}' },
    { id: 'includeHeaders', flag: '-i', label: 'Include Headers', type: 'boolean', required: false },
    { id: 'followRedirects', flag: '-L', label: 'Follow Redirects', type: 'boolean', required: false },
    { id: 'verbose', flag: '-v', label: 'Verbose', type: 'boolean', required: false },
    { id: 'output', flag: '-o', label: 'Output File', type: 'text', required: false },
  ],
  outputFormat: 'Raw HTTP response',
  parserType: 'raw',
}
