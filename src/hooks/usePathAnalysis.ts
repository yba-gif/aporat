import { useState, useCallback, useMemo } from 'react';
import { GraphNode, GraphLink } from '@/components/platform/NauticaGraph';

interface PathResult {
  path: string[];
  distance: number;
  nodes: GraphNode[];
  links: { source: string; target: string; edgeType: string }[];
}

export function usePathAnalysis(nodes: GraphNode[], links: GraphLink[]) {
  const [sourceNode, setSourceNode] = useState<string | null>(null);
  const [targetNode, setTargetNode] = useState<string | null>(null);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Build adjacency list for BFS
  const adjacencyList = useMemo(() => {
    const adj = new Map<string, { nodeId: string; edgeType: string }[]>();
    
    nodes.forEach(node => {
      adj.set(node.id, []);
    });
    
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      
      // Bidirectional edges for path finding
      const sourceList = adj.get(sourceId);
      const targetList = adj.get(targetId);
      
      if (sourceList) {
        sourceList.push({ nodeId: targetId, edgeType: link.edgeType });
      }
      if (targetList) {
        targetList.push({ nodeId: sourceId, edgeType: link.edgeType });
      }
    });
    
    return adj;
  }, [nodes, links]);

  // BFS to find shortest path
  const findShortestPath = useCallback((start: string, end: string): PathResult | null => {
    if (start === end) {
      const node = nodes.find(n => n.id === start);
      return node ? { path: [start], distance: 0, nodes: [node], links: [] } : null;
    }

    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[]; edges: { source: string; target: string; edgeType: string }[] }[] = [];
    
    queue.push({ nodeId: start, path: [start], edges: [] });
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacencyList.get(current.nodeId) || [];

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.nodeId)) continue;

        const newPath = [...current.path, neighbor.nodeId];
        const newEdges = [...current.edges, { 
          source: current.nodeId, 
          target: neighbor.nodeId, 
          edgeType: neighbor.edgeType 
        }];

        if (neighbor.nodeId === end) {
          const pathNodes = newPath.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
          return {
            path: newPath,
            distance: newPath.length - 1,
            nodes: pathNodes,
            links: newEdges,
          };
        }

        visited.add(neighbor.nodeId);
        queue.push({ nodeId: neighbor.nodeId, path: newPath, edges: newEdges });
      }
    }

    return null; // No path found
  }, [adjacencyList, nodes]);

  // Analyze path between two nodes
  const analyzePath = useCallback(() => {
    if (!sourceNode || !targetNode) return;
    
    setIsAnalyzing(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const result = findShortestPath(sourceNode, targetNode);
      setPathResult(result);
      setIsAnalyzing(false);
    }, 100);
  }, [sourceNode, targetNode, findShortestPath]);

  // Set node for path analysis (shift+click handling)
  const selectNodeForPath = useCallback((nodeId: string, isShiftKey: boolean) => {
    if (!isShiftKey) {
      // Regular click - set as source if no source, or clear and set new source
      if (!sourceNode) {
        setSourceNode(nodeId);
        setTargetNode(null);
        setPathResult(null);
      } else if (sourceNode === nodeId) {
        // Clicking same node - deselect
        setSourceNode(null);
        setPathResult(null);
      } else {
        // Set as target if source exists
        setTargetNode(nodeId);
      }
    } else {
      // Shift+click - always set as target for path analysis
      if (sourceNode && sourceNode !== nodeId) {
        setTargetNode(nodeId);
      } else if (!sourceNode) {
        setSourceNode(nodeId);
      }
    }
  }, [sourceNode]);

  // Clear path analysis
  const clearPath = useCallback(() => {
    setSourceNode(null);
    setTargetNode(null);
    setPathResult(null);
  }, []);

  // Check if a node is in the current path
  const isNodeInPath = useCallback((nodeId: string): boolean => {
    if (!pathResult) return false;
    return pathResult.path.includes(nodeId);
  }, [pathResult]);

  // Check if a link is in the current path
  const isLinkInPath = useCallback((sourceId: string, targetId: string): boolean => {
    if (!pathResult) return false;
    return pathResult.links.some(
      link => 
        (link.source === sourceId && link.target === targetId) ||
        (link.source === targetId && link.target === sourceId)
    );
  }, [pathResult]);

  return {
    sourceNode,
    targetNode,
    pathResult,
    isAnalyzing,
    setSourceNode,
    setTargetNode,
    selectNodeForPath,
    analyzePath,
    clearPath,
    findShortestPath,
    isNodeInPath,
    isLinkInPath,
  };
}
