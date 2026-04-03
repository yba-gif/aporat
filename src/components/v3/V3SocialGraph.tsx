import { useRef, useEffect, useState } from 'react';
// @ts-ignore -- cytoscape default export interop
import cytoscape from 'cytoscape';
// @ts-ignore
import coseBilkent from 'cytoscape-cose-bilkent';
import type { V3Case } from '@/data/v3/mockData';

// Register layout extension
(cytoscape as any).use(coseBilkent);

/* ── colour tokens ── */
const RISK_COLORS: Record<string, string> = {
  none: '#64748B',
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

const TYPE_COLORS: Record<string, string> = {
  applicant: '#06B6D4',
  social_account: '#8B5CF6',
  associate: '#F59E0B',
  organization: '#EF4444',
  phone: '#64748B',
  address: '#64748B',
};

const TYPE_SHAPES: Record<string, cytoscape.Css.NodeShape> = {
  applicant: 'ellipse',
  social_account: 'diamond',
  associate: 'ellipse',
  organization: 'round-rectangle',
  phone: 'triangle',
  address: 'hexagon',
};

/* ── graph data builder ── */
export function generateCytoscapeData(caseData: V3Case) {
  const elements: cytoscape.ElementDefinition[] = [];
  const applicantId = 'applicant-center';

  // Central applicant node
  elements.push({
    data: {
      id: applicantId,
      label: `${caseData.applicant.firstName} ${caseData.applicant.lastName}`,
      nodeType: 'applicant',
      risk: caseData.riskLevel,
    },
  });

  // Social account nodes from OSINT findings
  const socialFindings = caseData.osintFindings.filter(f => f.category === 'social_media');
  const platforms = new Set<string>();
  socialFindings.forEach(f => {
    if (platforms.has(f.source)) return;
    platforms.add(f.source);
    const nodeId = `social-${f.source}`;
    elements.push({
      data: {
        id: nodeId,
        label: `@${f.source}_user`,
        nodeType: 'social_account',
        risk: f.riskImpact || 'none',
      },
    });
    elements.push({
      data: { id: `e-${applicantId}-${nodeId}`, source: applicantId, target: nodeId, label: f.source, edgeType: 'account' },
    });
  });

  // Associate nodes
  const associateNames = ['Mehmet K.', 'Ali R.', 'Fatma Ö.', 'Hassan M.', 'Sergei V.', 'Natalia B.'];
  const networkFindings = caseData.osintFindings.filter(f => f.category === 'network');
  const assocCount = Math.min(associateNames.length, Math.max(2, networkFindings.length + 1));
  for (let i = 0; i < assocCount; i++) {
    const assocId = `assoc-${i}`;
    const risk = i === 0 ? 'high' : i < 2 ? 'medium' : 'low';
    elements.push({
      data: { id: assocId, label: associateNames[i], nodeType: 'associate', risk },
    });
    elements.push({
      data: { id: `e-${applicantId}-${assocId}`, source: applicantId, target: assocId, label: 'connected', edgeType: 'connection' },
    });
    // Cross-link some associates to social accounts
    if (i < 2) {
      const socialNodes = elements.filter(el => el.data.nodeType === 'social_account');
      if (socialNodes.length > 0) {
        const target = socialNodes[Math.min(i, socialNodes.length - 1)];
        elements.push({
          data: { id: `e-${assocId}-${target.data.id}`, source: assocId, target: target.data.id!, label: 'mutual', edgeType: 'mutual' },
        });
      }
    }
  }

  // Organization node
  if (caseData.osintFindings.some(f => f.category === 'financial' || f.source === 'linkedin')) {
    const orgId = 'org-1';
    elements.push({
      data: { id: orgId, label: 'Caspian Trading LLC', nodeType: 'organization', risk: 'high' },
    });
    elements.push({
      data: { id: `e-${applicantId}-${orgId}`, source: applicantId, target: orgId, label: 'employed', edgeType: 'employment' },
    });
    if (assocCount > 1) {
      elements.push({
        data: { id: `e-assoc0-${orgId}`, source: 'assoc-0', target: orgId, label: 'director', edgeType: 'role' },
      });
    }
  }

  // Phone node
  elements.push({
    data: { id: 'phone-1', label: '+90 5XX XXX XX', nodeType: 'phone', risk: 'none' },
  });
  elements.push({
    data: { id: `e-${applicantId}-phone1`, source: applicantId, target: 'phone-1', label: 'phone', edgeType: 'identifier' },
  });

  return elements;
}

/* ── Component ── */
interface V3SocialGraphProps {
  caseData: V3Case;
}

export function V3SocialGraph({ caseData }: V3SocialGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ label: string; type: string; risk: string } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = generateCytoscapeData(caseData);

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // ── Node styles ──
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'font-size': '9px',
            'font-family': 'Inter, system-ui, sans-serif',
            color: '#CBD5E1',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-outline-color': '#0B1120',
            'text-outline-width': 2,
            'background-color': (ele: cytoscape.NodeSingular) =>
              TYPE_COLORS[ele.data('nodeType')] || '#64748B',
            shape: (ele: cytoscape.NodeSingular) =>
              TYPE_SHAPES[ele.data('nodeType')] || 'ellipse',
            width: (ele: cytoscape.NodeSingular) =>
              ele.data('nodeType') === 'applicant' ? 48 : 28,
            height: (ele: cytoscape.NodeSingular) =>
              ele.data('nodeType') === 'applicant' ? 48 : 28,
            'border-width': (ele: cytoscape.NodeSingular) => {
              const risk = ele.data('risk');
              return risk === 'critical' || risk === 'high' ? 3 : 1;
            },
            'border-color': (ele: cytoscape.NodeSingular) =>
              RISK_COLORS[ele.data('risk')] || '#334155',
            'overlay-opacity': 0,
          } as any,
        },
        // Applicant glow
        {
          selector: 'node[nodeType="applicant"]',
          style: {
            'border-width': 3,
            'border-color': '#06B6D4',
            'background-color': '#0E7490',
            'font-size': '11px',
            'font-weight': 'bold' as any,
            'text-valign': 'bottom',
          } as any,
        },
        // ── Edge styles ──
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#1E293B',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#334155',
            'arrow-scale': 0.6,
            label: 'data(label)',
            'font-size': '7px',
            'font-family': 'Inter, system-ui, sans-serif',
            color: '#475569',
            'text-rotation': 'autorotate',
            'text-outline-color': '#0B1120',
            'text-outline-width': 1.5,
            'text-margin-y': -8,
            'overlay-opacity': 0,
          } as any,
        },
        // High-risk edges
        {
          selector: 'edge[edgeType="role"], edge[edgeType="employment"]',
          style: {
            'line-color': '#F9731650',
            'target-arrow-color': '#F97316',
            width: 2,
            'line-style': 'dashed',
          } as any,
        },
        // Hover states
        {
          selector: 'node:active, node:selected',
          style: {
            'border-color': '#A78BFA',
            'border-width': 3,
          } as any,
        },
        {
          selector: 'edge:active, edge:selected',
          style: {
            'line-color': '#A78BFA',
            width: 2.5,
          } as any,
        },
      ],
      layout: {
        name: 'cose-bilkent',
        animate: 'end',
        animationDuration: 800,
        nodeRepulsion: 6500,
        idealEdgeLength: 120,
        edgeElasticity: 0.1,
        nestingFactor: 0.1,
        gravity: 0.25,
        gravityRange: 3.8,
        numIter: 2500,
        tile: true,
        fit: true,
        padding: 40,
      } as any,
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    // Interaction handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({
        label: node.data('label'),
        type: node.data('nodeType'),
        risk: node.data('risk'),
      });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) setSelectedNode(null);
    });

    // Highlight neighbours on hover
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const neighbourhood = node.closedNeighborhood();
      cy.elements().not(neighbourhood).addClass('faded');
      neighbourhood.addClass('highlighted');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('faded').removeClass('highlighted');
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [caseData]);

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      {/* Cytoscape container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#0B1120' }}
      />

      {/* Additional stylesheet for faded/highlighted states */}
      <style>{`
        .faded { opacity: 0.15 !important; }
        .highlighted { opacity: 1 !important; }
      `}</style>

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 border rounded-md px-3 py-2 flex flex-wrap gap-x-4 gap-y-1"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
      >
        {[
          { label: 'Applicant', color: '#06B6D4', shape: '●' },
          { label: 'Social', color: '#8B5CF6', shape: '◆' },
          { label: 'Associate', color: '#F59E0B', shape: '●' },
          { label: 'Organization', color: '#EF4444', shape: '■' },
          { label: 'Phone', color: '#64748B', shape: '▲' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--v3-text-muted)' }}>
            <span style={{ color: l.color }}>{l.shape}</span> {l.label}
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-3 right-3 border rounded-md flex flex-col"
        style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
      >
        <button
          onClick={() => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) * 1.3, renderedPosition: { x: containerRef.current!.clientWidth / 2, y: containerRef.current!.clientHeight / 2 } })}
          className="px-2 py-1 text-xs hover:bg-white/5 transition-colors"
          style={{ color: 'var(--v3-text-muted)' }}
        >+</button>
        <div className="border-t" style={{ borderColor: 'var(--v3-border)' }} />
        <button
          onClick={() => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) / 1.3, renderedPosition: { x: containerRef.current!.clientWidth / 2, y: containerRef.current!.clientHeight / 2 } })}
          className="px-2 py-1 text-xs hover:bg-white/5 transition-colors"
          style={{ color: 'var(--v3-text-muted)' }}
        >−</button>
        <div className="border-t" style={{ borderColor: 'var(--v3-border)' }} />
        <button
          onClick={() => cyRef.current?.fit(undefined, 40)}
          className="px-2 py-1 text-[9px] hover:bg-white/5 transition-colors"
          style={{ color: 'var(--v3-text-muted)' }}
        >Fit</button>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div
          className="absolute top-3 right-3 border rounded-md p-3 w-52"
          style={{ background: 'var(--v3-surface)', borderColor: 'var(--v3-border)' }}
        >
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--v3-text)' }}>
            {selectedNode.label}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--v3-text-muted)' }}>
            Type: {selectedNode.type.replace('_', ' ')}
          </div>
          <div className="text-[10px]" style={{ color: RISK_COLORS[selectedNode.risk] || '#64748B' }}>
            Risk: {selectedNode.risk}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-[9px] mt-2 hover:underline"
            style={{ color: 'var(--v3-accent)' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
