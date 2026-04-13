import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Post, Client, PostStage, Platform } from '../../utils/storage';
import { Badge } from '../../components/ui/Badge';
import { Filter, ArrowUpDown } from 'lucide-react';

interface PostListViewProps {
    posts: Post[];
    clients: Client[];
    onPostClick: (post: Post) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const ALL_STAGES: PostStage[] = ['PLANNED', 'BRIEF WRITTEN', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'SCHEDULED', 'PUBLISHED'];
const ALL_PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter'];

export default function PostListView({ posts, clients, onPostClick }: PostListViewProps) {
    const [filterStatus, setFilterStatus] = useState<PostStage | 'all'>('all');
    const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
    const [filterOverdue, setFilterOverdue] = useState(false);
    const [sortAsc, setSortAsc] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    const filtered = useMemo(() => {
        let result = [...posts];

        if (filterStatus !== 'all') result = result.filter(p => p.status === filterStatus);
        if (filterPlatform !== 'all') result = result.filter(p => p.platforms.includes(filterPlatform));
        if (filterOverdue) result = result.filter(p => p.scheduledDate < today && p.status !== 'PUBLISHED');

        result.sort((a, b) => {
            const diff = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
            return sortAsc ? diff : -diff;
        });

        return result;
    }, [posts, filterStatus, filterPlatform, filterOverdue, sortAsc, today]);

    return (
        <motion.div variants={itemVariants} className="bg-transparent flex-1 flex flex-col min-h-0 overflow-hidden">


            {/* Filter Bar */}
            <div className="py-8 flex items-center gap-8 flex-wrap flex-shrink-0 border-b border-white/[0.06]">
                <div className="flex items-center gap-4">
                    <div className="h-px w-8 bg-primary" />
                    <span className="font-sans text-[11px] font-black uppercase tracking-[0.4em] text-text-muted/40">OPERATIONAL FILTERS</span>
                </div>

                <div className="flex items-center gap-4">
                  <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value as any)}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 outline-none hover:border-primary/40 focus:border-primary transition-all cursor-pointer appearance-none"
                  >
                      <option value="all">STATE: ALL</option>
                      {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select
                      value={filterPlatform}
                      onChange={e => setFilterPlatform(e.target.value as any)}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 outline-none hover:border-primary/40 focus:border-primary transition-all cursor-pointer appearance-none"
                  >
                      <option value="all">ENV: ALL</option>
                      {ALL_PLATFORMS.map(p => <option key={p} value={p} className="capitalize">{p.toUpperCase()}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group px-4 py-2 hover:bg-white/[0.02] transition-colors">
                    <input
                        type="checkbox"
                        checked={filterOverdue}
                        onChange={e => setFilterOverdue(e.target.checked)}
                        className="w-4 h-4 accent-primary rounded-none border border-white/[0.1] bg-transparent"
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 group-hover:text-red-400 transition-colors">CRITICAL OVERDUE</span>
                </label>

                <div className="ml-auto flex items-center gap-4">
                  <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/20">
                      {filtered.length} ASSETS REGISTERED
                  </span>
                </div>
            </div>


            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-onyx/90 backdrop-blur-md">
                        <tr className="border-b border-white/[0.06]">
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 cursor-pointer hover:text-text-primary transition-colors border-b border-white/[0.1]" onClick={() => setSortAsc(v => !v)}>
                                <span className="flex items-center gap-2">DEPLOYMENT DATE <ArrowUpDown size={12} className="opacity-20" /></span>
                            </th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1]">ENTITY</th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1]">PLATFORMS</th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1]">TYPE</th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1]">INTEL HOOK</th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1]">STATUS</th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1]">NODE</th>
                            <th className="py-6 px-6 font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 border-b border-white/[0.1] text-right">ACTION</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.04]">
                        {filtered.map(post => {
                            const client = clients.find(c => c.id === post.clientId);
                            const isOverdue = post.scheduledDate < today && post.status !== 'PUBLISHED';
                            return (
                                <tr
                                    key={post.id}
                                    onClick={() => onPostClick(post)}
                                    className={`hover:bg-primary/[0.02] transition-all duration-500 cursor-pointer group ${isOverdue ? 'bg-red-500/[0.03]' : ''}`}
                                >
                                    <td className="py-8 px-6">
                                        <div className={`font-heading text-2xl tracking-tight ${isOverdue ? 'text-red-400' : 'text-text-primary'}`}>{post.scheduledDate}</div>
                                        <div className="font-sans text-[10px] uppercase font-black tracking-widest text-text-muted/20 mt-1">{post.scheduledTime}</div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-primary">{client?.name || '—'}</div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className="flex -space-x-1">
                                            {post.platforms.map((p, i) => (
                                                <div key={p} className="w-6 h-6 border border-white/[0.1] bg-white/[0.05] flex items-center justify-center text-[9px] font-sans font-black rotate-45" style={{ zIndex: 10 - i }}>
                                                    <span className="-rotate-45">{p[0].toUpperCase()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <span className="font-sans text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/60">
                                            {post.postType}
                                        </span>
                                    </td>
                                    <td className="py-8 px-6 max-w-[320px]">
                                        <div className="font-heading text-xl text-text-primary/80 group-hover:text-text-primary transition-colors truncate">
                                            {post.hook || <span className="text-text-muted/20">NO INTEL DEFINED</span>}
                                        </div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${getStatusColor(post.status)}`} />
                                          <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/60">{post.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-6">
                                        <div className="font-sans text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/40">{post.assignedTo?.split(' ')[0]}</div>
                                    </td>
                                    <td className="py-8 px-6 text-right">
                                        <button className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-primary opacity-20 group-hover:opacity-100 transition-all duration-700 hover:translate-x-1 bg-primary/5 px-4 py-2 border border-primary/10 hover:border-primary/40">
                                            VIEW_ASSET
                                        </button>
                                    </td>
                                </tr>

                            );
                        })}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-24 px-6 text-center">
                                    <div className="font-heading text-4xl text-text-muted/10 uppercase tracking-tighter">No assets matching parameters</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>

    );
}

function getStatusColor(status: PostStage) {
    switch (status) {
        case 'PLANNED': return 'bg-white/[0.1]';
        case 'BRIEF WRITTEN': return 'bg-blue-400/60';
        case 'IN PRODUCTION': return 'bg-blue-500';
        case 'REVIEW': return 'bg-yellow-500';
        case 'CEO APPROVAL': return 'bg-orange-500';
        case 'CLIENT APPROVAL': return 'bg-orange-400';
        case 'SCHEDULED': return 'bg-purple-500';
        case 'PUBLISHED': return 'bg-green-500';
        default: return 'bg-white/[0.05]';
    }
}
