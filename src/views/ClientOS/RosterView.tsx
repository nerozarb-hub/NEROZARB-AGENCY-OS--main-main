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
      className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-8 h-full flex flex-col"
    >
      {/* Top Row */}
      <div className="flex justify-between items-center gap-3">
        <SectionHeader module="02" title="CLIENT OS" />
        <Button onClick={() => setIsInstallModalOpen(true)} size="sm" className="bg-primary hover:bg-accent-mid text-text-primary whitespace-nowrap">
          <Plus size={14} />
          <span className="hidden sm:inline">[ + INSTALL CLIENT ]</span>
          <span className="sm:hidden">+ NEW</span>
        </Button>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 border-b border-border-dark scroll-touch">
        <button
          onClick={() => { setActiveFilter('All'); setSelectedIds([]); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${activeFilter === 'All' ? 'border-primary bg-primary/10 text-primary' : 'border-border-dark bg-card hover:border-text-muted text-text-primary'
            }`}
        >
          <span className="font-heading font-bold text-[10px] uppercase tracking-wider">All</span>
          <span className="font-mono text-[10px] opacity-70">[{data.clients.length}]</span>
        </button>
        {LIFECYCLE_STATUSES.map(status => {
          const count = data.clients.filter(c => c.status === status).length;
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => { setActiveFilter(status); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isActive ? 'border-primary bg-primary/10' : 'border-border-dark bg-card hover:border-text-muted'
                }`}
            >
              <Badge status={status === 'Active Sprint' || status === 'Retainer' ? 'healthy' : 'review'}>{status}</Badge>
              <span className="font-mono text-[10px] text-text-muted">[{count}]</span>
            </button>
          );
        })}
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
        <div className="relative group w-full md:w-[400px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="SEARCH REGISTRY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-border-dark pl-10 pr-4 py-2 font-mono text-[10px] tracking-[0.2em] text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary transition-all rounded-sm uppercase"
          />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <div className="flex items-center gap-2 border border-border-dark bg-card px-3 py-2">
            <Filter size={12} className="text-text-muted" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent border-none text-text-primary font-mono text-[10px] tracking-wider focus:outline-none appearance-none pr-4">
              <option value="All">Filters: All Tiers</option>
              <option value="Tier 1: Active Presence">Tier 1: Active Presence</option>
              <option value="Tier 2: 60-Day Sprint">Tier 2: 60-Day Sprint</option>
              <option value="Tier 3: Market Dominance">Tier 3: Market Dominance</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border border-border-dark bg-card px-3 py-2">
            <ArrowUpDown size={12} className="text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-text-primary font-mono text-[10px] tracking-wider focus:outline-none appearance-none pr-4"
            >
              <option value="name">Sort: Name A-Z</option>
              <option value="startDate">Sort: Start Date</option>
              {authLevel === 'ceo' && <option value="ltv">Sort: LTV</option>}
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A] border border-primary/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] px-6 py-3 rounded-sm flex items-center gap-6"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-border-dark">
              <div className="text-primary font-mono text-xs font-bold">{selectedIds.length.toString().padStart(2, '0')}</div>
              <div className="text-text-muted font-mono text-[9px] uppercase tracking-widest">Clients Selected</div>
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
              <thead className="sticky top-0 z-20 bg-card-alt border-b border-border-dark">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-text-muted hover:text-primary transition-colors">
                      {selectedIds.length === processedClients.length && processedClients.length > 0 ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Client Name</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Status</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Tier</th>
                  {authLevel === 'ceo' ? (
                    <>
                      <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Revenue Gate</th>
                      <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">LTV</th>
                    </>
                  ) : (
                    <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Niche</th>
                  )}
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Health</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Last Activity</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
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
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-[13px] text-text-primary tracking-tight uppercase">{client.name}</span>
                            <span className="font-sans text-[11px] text-text-muted mt-0.5">{client.contactName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-sans text-[12px] text-accent-light">{client.tier}</span>
                        </td>
                        {authLevel === 'ceo' ? (
                          <>
                            <td className="p-4">
                              <span className="font-mono text-[10px] px-2 py-1  bg-card-alt text-text-secondary">{client.revenueGate}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-[12px] text-text-primary">{formatCurrency(client.ltv)}</span>
                            </td>
                          </>
                        ) : (
                          <td className="p-4">
                            <span className="font-sans text-[12px] text-text-secondary">{client.niche}</span>
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${health === 'healthy' ? 'bg-primary' : health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-mono text-[10px] uppercase text-text-secondary">{health}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[10px] text-text-muted uppercase">{calculateLastActivity(client)}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              className="font-mono text-[9px] uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-1.5"
                              onClick={(e) => { e.stopPropagation(); setClientToEdit(client); }}
                            >
                              <Edit2 size={10} />
                              Edit
                            </button>
                            {authLevel === 'ceo' && (
                              <button
                                className="font-mono text-[9px] uppercase tracking-widest text-text-muted hover:text-red-500 transition-colors flex items-center gap-1.5"
                                onClick={(e) => { e.stopPropagation(); setClientToDelete(client); }}
                              >
                                <Trash2 size={10} />
                                Delete
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading font-bold text-[13px] text-text-primary tracking-tight uppercase truncate">{client.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                            <span className="font-sans text-[11px] text-accent-light">{client.tier}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${health === 'healthy' ? 'bg-primary' : health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              <span className="font-mono text-[9px] text-text-secondary uppercase tracking-widest">{health}</span>
                            </div>
                            <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest">{calculateLastActivity(client)}</p>
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
          <h2 className="font-heading text-xl text-red-500 uppercase tracking-tight">Confirm Deletion</h2>
        }
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setClientToDelete(null)}
              className="font-mono text-[10px] uppercase tracking-widest w-full sm:w-auto h-11"
            >
              ABORT MISSION
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-text-primary px-8 font-mono text-[10px] uppercase tracking-widest w-full sm:w-auto h-11"
              onClick={() => {
                if (clientToDelete) {
                  deleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }
              }}
            >
              TERMINATE RECORD
            </Button>
          </div>
        }
      >
        {clientToDelete && (
          <div className="space-y-6 py-2">
            <p className="text-sm text-text-secondary leading-relaxed font-mono uppercase">
              Are you sure you want to delete <strong className="text-red-500">{clientToDelete.name.toUpperCase()}</strong>?
              <br />
              <span className="text-xs opacity-70">This action is irreversible and will permanentely purge all associated data.</span>
            </p>
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-sm">
              <p className="text-[10px] text-red-400 font-mono uppercase tracking-widest mb-3 border-b border-red-500/20 pb-2">Logical Cascade Deletion Chain:</p>
              <ul className="text-[10px] text-text-muted space-y-2 list-none font-mono uppercase">
                <li className="flex justify-between">
                  <span>Active/Completed Tasks</span>
                  <span className="text-red-500">[{data.tasks.filter(t => t.clientId === clientToDelete.id).length}]</span>
                </li>
                <li className="flex justify-between">
                  <span>Content Posts</span>
                  <span className="text-red-500">[{data.posts.filter(p => p.clientId === clientToDelete.id).length}]</span>
                </li>
                <li className="flex justify-between">
                  <span>Vault Protocols</span>
                  <span className="text-red-500">[{data.protocols.filter(p => p.clientId === clientToDelete.id).length}]</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
