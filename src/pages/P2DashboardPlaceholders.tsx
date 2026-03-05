import { EmptyState } from '@/components/p2/EmptyState';
import { AlertTriangle, Folder, GitBranch, BarChart3, FileText, Settings } from 'lucide-react';

export function P2Queue() {
  return <EmptyState icon={AlertTriangle} title="Risk Queue" description="Flagged applications requiring review will appear here." />;
}
export function P2Cases() {
  return <EmptyState icon={Folder} title="Cases" description="All case files and their statuses." />;
}
export { default as P2Graph } from './P2NetworkGraph';
export function P2Analytics() {
  return <EmptyState icon={BarChart3} title="Analytics" description="Insights and trend reports will be displayed here." />;
}
export function P2Reports() {
  return <EmptyState icon={FileText} title="Reports" description="Generate and download compliance reports." />;
}
export function P2Settings() {
  return <EmptyState icon={Settings} title="Settings" description="Account and system configuration." />;
}
