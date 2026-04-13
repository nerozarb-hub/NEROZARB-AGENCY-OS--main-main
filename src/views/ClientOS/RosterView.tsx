import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Tag } from '../../components/ui/Tag';
import { Plus, Search, Filter, ArrowUpDown, Trash2, Archive, CheckCircle2, ChevronRight, Square, CheckSquare, Edit2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useAppData } from '../../contexts/AppDataContext';
import { Client } from '../../utils/storage';
import { formatCurrency } from '../../utils/formatCurrency';
import RevenueGateModal from './RevenueGateModal';
import ClientEditModal from './ClientEditModal';

const LIFECYCLE_STATUSES = ['Lead', 'Discovery', 'Active Sprint', 'Retainer', 'Closed'] as const;

export default function RosterView({ onSelectClient }: { onSelectClient: (id: string) => void }) {
  const { data, deleteClient, updateClient } = useAppData();
  const authLevel = sessionStorage.getItem('authLevel') || 'team';

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [tierFilter, setTierFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'ltv'>('name');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Memoized health map — only recomputes when tasks or clients change
  const healthMap = useMemo(() => {
    const map = new Map<number, 'healthy' | 'at-risk' | 'critical'>();
    data.clients.forEach(client => {
      const clientTasks = data.tasks.filter(t => t.clientId === client.id);
      const now = new Date();
      const overdueTasks = clientTasks.filter(t =>
        t.status !== 'Deployed' && t.deadline && new Date(t.deadline) < now
      );
      const daysSinceActivity = clientTasks.length > 0
        ? Math.floor((Date.now() - Math.max(...clientTasks.map(t => new Date(t.updatedAt).getTime()))) / 86400000)
        : Infinity;
      let health: 'healthy' | 'at-risk' | 'critical';
      if (overdueTasks.length >= 3 || daysSinceActivity > 14) health = 'critical';
      else if (overdueTasks.length >= 1 || daysSinceActivity > 7 || clientTasks.length === 0) health = 'at-risk';
      else health = 'healthy';
      map.set(client.id, health);
    });
    return map;
  }, [data.clients, data.tasks]);

  // Memoized last-activity map — same dependency
  const lastActivityMap = useMemo(() => {
    const map = new Map<number, string>();
    data.clients.forEach(client => {
      const clientTasks = data.tasks.filter(t => t.clientId === client.id);
      if (clientTasks.length === 0) { map.set(client.id, 'No activity'); return; }
      const lastDate = new Date(Math.max(...clientTasks.map(t => new Date(t.updatedAt).getTime())));
      const days = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
      map.set(client.id, days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`);
    });
    return map;
  }, [data.clients, data.tasks]);

  // Helpers that read from memoized maps instead of recomputing
  const calculateHealth = (client: Client) => healthMap.get(client.id) ?? 'at-risk';
  const calculateLastActivity = (client: Client) => lastActivityMap.get(client.id) ?? 'No activity';

  let processedClients = data.clients.filter(c => {
    if (activeFilter !== 'All' && c.status !== activeFilter) return false;
    if (tierFilter !== 'All' && c.tier !== tierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.niche.toLowerCase().includes(q) && !(c.contactName || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  processedClients.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'startDate') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (sortBy === 'ltv') return b.ltv - a.ltv;
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === processedClients.length && processedClients.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedClients.map(c => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} clients?`)) {
      selectedIds.forEach(id => deleteClient(id));
      setSelectedIds([]);
    }
  };

  const handleBulkClose = () => {
    if (window.confirm(`Are you sure you want to close ${selectedIds.length} accounts?`)) {
      selectedIds.forEach(id => updateClient(id, { status: 'Closed' }));
      setSelectedIds([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container h-full flex flex-col"
    >
      {/* Header */}
      <header className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-none" />
            <span className="page-header-subtitle text-primary">02</span>
          </div>
          <h1 className="page-header-title">CLIENT OS</h1>
          <p className="page-header-subtitle mt-2">Relational Logic · Tier Management</p>
        </div>
        <Button 
          onClick={() => setIsInstallModalOpen(true)} 
          className="bg-primary hover:bg-accent-mid text-text-primary"
        >
          <Plus size={16} />
          <span>+ NEW CLIENT</span>
        </Button>
      </header>

      {/* Pipeline Summary Bar */}
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 border-b border-border-dark scroll-touch">
        <button
          onClick={() => { setActiveFilter('All'); setSelectedIds([]); }}
          className={`flex items-center gap-2 px-6 py-2 border transition-all duration-300 ${activeFilter === 'All'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-white/[0.04] bg-onyx/30 hover:border-white/[0.1] text-text-muted'
          }`}
        >
          <span className="font-sans font-bold text-[10px] uppercase tracking-widest">All Records</span>
          <span className="font-sans text-[10px] font-bold opacity-40">({data.clients.length})</span>
        </button>

        {LIFECYCLE_STATUSES.map(status => {
          const count = data.clients.filter(c => c.status === status).length;
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => { setActiveFilter(status); setSelectedIds([]); }}
              className={`flex items-center gap-3 px-6 py-2 border transition-all duration-300 ${isActive
                ? 'border-primary bg-primary/10'
                : 'border-white/[0.04] bg-onyx/30 hover:border-white/[0.1]'
              }`}
            >
              <span className={`font-sans text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-text-muted'}`}>{status}</span>
              <span className="font-sans text-[10px] font-bold opacity-40">({count})</span>
            </button>
          );

        })}
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
        <div className="relative group w-full md:w-[450px]">
          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="FILTER REGISTRY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-onyx border border-white/[0.06] pl-12 pr-6 py-3 font-sans text-[11px] font-bold tracking-[0.2em] text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary/50 transition-all uppercase rounded-none"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-3 border border-white/5 bg-white/[0.02] px-4 py-3">
            <Filter size={12} className="text-[#444]" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent border-none text-text-primary font-sans text-[9px] font-black uppercase tracking-widest focus:outline-none appearance-none pr-6 cursor-pointer">
              <option value="All">All Tiers</option>
              <option value="Tier 1: Active Presence">Tier 1: Active Presence</option>
              <option value="Tier 2: 60-Day Sprint">Tier 2: 60-Day Sprint</option>
              <option value="Tier 3: Market Dominance">Tier 3: Market Dominance</option>
            </select>
          </div>
          <div className="flex items-center gap-3 border border-white/5 bg-white/[0.02] px-4 py-3">
            <ArrowUpDown size={12} className="text-[#444]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-text-primary font-sans text-[9px] font-black uppercase tracking-widest focus:outline-none appearance-none pr-6 cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="startDate">Sort: Date</option>
              {authLevel === 'ceo' && <option value="ltv">Sort: Revenue</option>}
            </select>
          </div>
        </div>

      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-sidebar/95 backdrop-blur-md border border-primary/30 px-6 py-3 rounded-none flex items-center gap-6"
          >
            <div className="flex items-center gap-4 pr-6 border-r border-[#333]">
              <div className="text-primary font-sans text-xs font-black">{selectedIds.length.toString().padStart(2, '0')}</div>
              <div className="text-[#888] font-sans text-[9px] font-black uppercase tracking-[0.2em]">Deployment Selection</div>
            </div>


            <div className="flex items-center gap-4">
              {authLevel === 'ceo' && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-text-muted hover:text-red-500 transition-colors font-mono text-[10px] uppercase tracking-wider"
                >
                  <Trash2 size={14} />
                  Terminate
                </button>
              )}
              <button
                onClick={handleBulkClose}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-mono text-[10px] uppercase tracking-wider"
              >
                <Archive size={14} />
                Close Accounts
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="ml-2 text-text-muted hover:text-text-primary font-mono text-[10px] uppercase tracking-wider"
              >
                Deselect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="flex-1 flex flex-col overflow-hidden border-border-dark bg-card">
        {processedClients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase mb-4">[ NO CLIENTS INSTALLED ]</span>
            <p className="font-sans text-sm text-text-secondary mb-6 max-w-sm">Run the Revenue Gate to install your first client.</p>
            <Button onClick={() => setIsInstallModalOpen(true)} className="bg-primary hover:bg-accent-mid text-text-primary">
              + INSTALL FIRST CLIENT
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar scroll-touch">
            <table className="hidden md:table w-full min-w-[1000px] text-left whitespace-nowrap">
              <thead className="sticky top-0 z-20 bg-onyx border-b border-white/[0.04]">
                <tr className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 w-10">
                    <button onClick={toggleSelectAll} className="text-text-muted hover:text-primary transition-colors">
                      {selectedIds.length === processedClients.length && processedClients.length > 0 ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tier</th>
                  {authLevel === 'ceo' ? (
                    <>
                      <th className="px-6 py-4">Gate</th>
                      <th className="px-6 py-4">Valuation</th>
                    </>
                  ) : (
                    <th className="px-6 py-4">Sector</th>
                  )}
                  <th className="px-6 py-4">Health</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-dark">
                <AnimatePresence>
                  {processedClients.map((client) => {
                    const health = calculateHealth(client);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={client.id}
                        className={`hover:bg-card-alt/50 transition-colors group cursor-pointer ${selectedIds.includes(client.id) ? 'bg-primary/5' : ''}`}
                        onClick={() => onSelectClient(client.id.toString())}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleSelect(client.id)} className="text-text-muted hover:text-primary transition-colors">
                            {selectedIds.includes(client.id) ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} className="opacity-50 group-hover:opacity-100" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-sans font-bold text-[13px] text-text-primary tracking-tight uppercase group-hover:text-primary transition-colors">{client.name}</span>
                            <span className="font-sans text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.1em] mt-0.5">{client.contactName}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-sans text-[11px] font-medium text-accent-light uppercase tracking-widest leading-none">{client.tier.split(':')[0]}</span>
                        </td>
                        {authLevel === 'ceo' ? (
                          <>
                            <td className="px-6 py-4">
                              <span className="font-sans text-[10px] font-bold px-2 py-1 bg-white/[0.04] text-text-muted uppercase tracking-widest">{client.revenueGate}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-[11px] text-text-primary font-bold tracking-tight">{formatCurrency(client.ltv)}</span>
                            </td>
                          </>
                        ) : (
                          <td className="p-4">
                            <span className="font-sans text-[12px] text-text-secondary">{client.niche}</span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-none ${health === 'healthy' ? 'bg-primary' : health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className={`font-sans text-[10px] uppercase font-bold tracking-widest ${health === 'healthy' ? 'text-primary' : health === 'at-risk' ? 'text-yellow-500' : 'text-red-500'}`}>{health}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-widest">{calculateLastActivity(client)}</span>
                        </td>
                        <td className="px-6 py-4 text-right pr-8">
                          <div className="flex items-center justify-end gap-6 text-text-muted">
                            <button
                              className="font-sans text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-all duration-300 flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); setClientToEdit(client); }}
                            >
                              <Edit2 size={12} />
                              Refine
                            </button>
                            {authLevel === 'ceo' && (
                              <button
                                className="font-sans text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-all duration-300 flex items-center gap-2"
                                onClick={(e) => { e.stopPropagation(); setClientToDelete(client); }}
                              >
                                <Trash2 size={12} />
                                Purge
                              </button>
                            )}
                          </div>
                        </td>

                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border-dark">
              <AnimatePresence>
                {processedClients.map((client) => {
                  const health = calculateHealth(client);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={client.id}
                      className={`p-4 active:bg-card-alt/50 transition-colors cursor-pointer ${selectedIds.includes(client.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => onSelectClient(client.id.toString())}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleSelect(client.id)} className="text-text-muted hover:text-primary transition-colors">
                            {selectedIds.includes(client.id) ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} className="opacity-50" />
                            )}
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-sans font-bold text-[14px] text-text-primary tracking-tight uppercase truncate">{client.name}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                            <span className="font-sans text-[10px] font-bold text-accent-light uppercase tracking-widest">{client.tier.split(':')[0]}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-none flex-shrink-0 ${health === 'healthy' ? 'bg-primary' : health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              <span className={`font-sans text-[10px] font-bold uppercase tracking-widest ${health === 'healthy' ? 'text-primary' : 'text-text-muted'}`}>{health}</span>
                            </div>
                            <p className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-widest">{calculateLastActivity(client)}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-text-muted" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </Card>

      <RevenueGateModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onClientCreated={(clientId) => {
          onSelectClient(clientId.toString());
        }}
      />

      {clientToEdit && (
        <ClientEditModal
          isOpen={true}
          onClose={() => setClientToEdit(null)}
          client={clientToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title={
          <h2 className="font-heading text-2xl text-red-500 tracking-tighter uppercase">Terminate Record</h2>
        }
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setClientToDelete(null)}
              className="w-full sm:w-auto h-11"
            >
              Abort Mission
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-text-primary px-8 w-full sm:w-auto h-11"
              onClick={() => {
                if (clientToDelete) {
                  deleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }
              }}
            >
              Confirm Purge
            </Button>
          </div>
        }
      >
        {clientToDelete && (
          <div className="space-y-6 py-2">
            <p className="font-sans text-[13px] text-text-secondary leading-relaxed uppercase font-bold tracking-tight">
              Are you sure you want to delete <strong className="text-red-500">{clientToDelete.name.toUpperCase()}</strong>?
              <br />
              <span className="text-[11px] opacity-50 font-medium tracking-wide">This action is irreversible and will permanentely purge all associated data.</span>
            </p>
            <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-none">
              <p className="font-sans text-[11px] text-red-400 font-bold uppercase tracking-[0.2em] mb-4 border-b border-red-500/10 pb-2">Logical Cascade Deletion Chain:</p>
              <ul className="font-sans text-[11px] text-text-muted space-y-3 list-none uppercase font-bold tracking-widest">
                <li className="flex justify-between items-center">
                  <span>Active/Completed Tasks</span>
                  <span className="text-red-500 opacity-60">[{data.tasks.filter(t => t.clientId === clientToDelete.id).length}]</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Content Posts</span>
                  <span className="text-red-500 opacity-60">[{data.posts.filter(p => p.clientId === clientToDelete.id).length}]</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Vault Protocols</span>
                  <span className="text-red-500 opacity-60">[{data.protocols.filter(p => p.clientId === clientToDelete.id).length}]</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
