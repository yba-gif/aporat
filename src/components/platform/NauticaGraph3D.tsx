import { useCallback, useRef } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';

interface GraphNode {
  id: string;
  label: string;
  nodeType: 'applicant' | 'agent' | 'company' | 'address';
  flagged: boolean;
  riskScore: number;
  x?: number;
  y?: number;
  z?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  edgeType: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface NauticaGraph3DProps {
  graphData: GraphData;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNode: string | null;
  dimensions: { width: number; height: number };
}

// More vibrant, distinct colors matching 2D graph
const NODE_COLORS: Record<string, number> = {
  applicant: 0x8b5cf6,  // Purple for people
  agent: 0x0d9488,      // Teal for agencies
  company: 0x3b82f6,    // Blue for companies
  address: 0xf59e0b,    // Amber for locations
};

const FLAGGED_RING_COLOR = 0xef4444;

export function NauticaGraph3D({
  graphData,
  onNodeSelect,
  selectedNode,
  dimensions,
}: NauticaGraph3DProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();

  // Always use node type color
  const getNodeColor = useCallback((node: GraphNode) => {
    return NODE_COLORS[node.nodeType] || 0x6b7280;
  }, []);

  const getNodeSize = useCallback((node: GraphNode) => {
    switch (node.nodeType) {
      case 'agent': return 8;
      case 'company': return 6;
      case 'address': return 5;
      default: return 4;
    }
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeSelect(selectedNode === node.id ? null : node.id);

      if (graphRef.current && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        const distance = 150;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        graphRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          { x: node.x, y: node.y, z: node.z },
          1000
        );
      }
    },
    [onNodeSelect, selectedNode]
  );

  const nodeThreeObject = useCallback(
    (node: GraphNode) => {
      const isSelected = selectedNode === node.id;
      const size = getNodeSize(node);
      const color = getNodeColor(node);

      const group = new THREE.Group();

      // Main sphere
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshLambertMaterial({
        color,
        transparent: true,
        opacity: 0.9,
      });
      const sphere = new THREE.Mesh(geometry, material);
      group.add(sphere);

      // Flagged indicator ring
      if (node.flagged) {
        const ringGeometry = new THREE.RingGeometry(size * 1.5, size * 1.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: FLAGGED_RING_COLOR,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const flagRing = new THREE.Mesh(ringGeometry, ringMaterial);
        group.add(flagRing);
      }

      // Selection ring
      if (isSelected) {
        const ringGeometry = new THREE.RingGeometry(size * 1.3, size * 1.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x0d9488,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        group.add(ring);
      }

      return group;
    },
    [selectedNode, getNodeColor, getNodeSize]
  );

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={graphData}
      width={dimensions.width}
      height={dimensions.height}
      backgroundColor="hsl(220, 15%, 8%)"
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      onNodeClick={handleNodeClick}
      linkColor={() => 'rgba(255,255,255,0.15)'}
      linkWidth={0.5}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={1}
      linkDirectionalParticleSpeed={0.005}
      linkDirectionalParticleColor={() => '#0d9488'}
      enableNodeDrag={true}
      enableNavigationControls={true}
      showNavInfo={false}
    />
  );
}
