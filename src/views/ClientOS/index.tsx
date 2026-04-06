import { useState } from 'react';
import { motion } from 'motion/react';
import RosterView from './RosterView';
import ClientDetailView from './ClientDetailView';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export default function ClientOS({ onNavigate }: { onNavigate?: (view: string, clientId?: string) => void }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {selectedClientId ? (
        <ClientDetailView clientId={selectedClientId} onBack={() => setSelectedClientId(null)} onNavigate={onNavigate} />
      ) : (
        <RosterView onSelectClient={setSelectedClientId} />
      )}
    </motion.div>
  );
}
