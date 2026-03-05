import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

function Placeholder({ title }: { title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
        <Construction size={24} className="text-purple-600" />
      </div>
      <h2 className="text-base font-bold text-[--p2-navy]">{title}</h2>
      <p className="text-xs text-[--p2-gray-400] mt-1">This section is under development</p>
    </motion.div>
  );
}

export { default as AdminUsers } from './P2AdminUsers';
export const AdminConsulates = () => <Placeholder title="Consulate Management" />;
export const AdminApi = () => <Placeholder title="API Monitoring" />;
export const AdminBilling = () => <Placeholder title="Billing & Subscriptions" />;
export const AdminConfig = () => <Placeholder title="System Configuration" />;
