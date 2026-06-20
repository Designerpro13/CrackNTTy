import { Edge, Node } from '@xyflow/react'

/**
 * Topological sort of nodes based on edges (Kahn's algorithm).
 * Returns node IDs in execution order.
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const inDegree: Record<string, number> = {}
  const adj: Record<string, string[]> = {}

  for (const node of nodes) {
    inDegree[node.id] = 0
    adj[node.id] = []
  }

  for (const edge of edges) {
    adj[edge.source].push(edge.target)
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1
  }

  const queue: string[] = []
  for (const id of Object.keys(inDegree)) {
    if (inDegree[id] === 0) queue.push(id)
  }

  const order: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    order.push(current)
    for (const neighbor of adj[current]) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) queue.push(neighbor)
    }
  }

  // If order doesn't include all nodes, there's a cycle
  if (order.length !== nodes.length) {
    throw new Error('Cycle detected in pipeline — cannot determine execution order')
  }

  return order
}

/**
 * Get upstream node IDs for a given node.
 */
export function getUpstreamNodes(nodeId: string, edges: Edge[]): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source)
}

/**
 * Resolve $variable references in a string value.
 * Pattern: $toolId.path.to.field
 */
export function resolveVariables(
  value: string,
  resolver: (ref: string) => unknown,
): string {
  return value.replace(/\$(\w+(?:\.\w+)*)/g, (match) => {
    const resolved = resolver(match)
    return resolved !== undefined ? String(resolved) : match
  })
}
