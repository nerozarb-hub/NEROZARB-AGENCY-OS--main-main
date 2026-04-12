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
            <div className="py-4 flex items-center gap-6 flex-wrap flex-shrink-0 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="h-px w-6 bg-primary" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">Filters</span>
                </div>

                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="bg-white/5 border border-border-dark rounded-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#888] outline-none hover:border-text-muted transition-all"
                >
                    <option value="all">Status: All</option>
                    {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    value={filterPlatform}
                    onChange={e => setFilterPlatform(e.target.value as any)}
                    className="bg-white/5 border border-border-dark rounded-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#888] outline-none hover:border-text-muted transition-all"
                >
                    <option value="all">Platform: All</option>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>

                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filterOverdue}
                        onChange={e => setFilterOverdue(e.target.checked)}
                        className="w-3 h-3 accent-red-500 rounded-none border border-border-dark bg-transparent"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-red-400 transition-colors">Overdue Only</span>
                </label>

                <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.15em] text-[#555]">
                    {filtered.length} Deployment{filtered.length !== 1 ? 's' : ''} Identified
                </span>
            </div>


            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-onyx">
                        <tr className="border-b border-border-dark font-sans text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">
                            <th className="py-6 px-4 font-black cursor-pointer hover:text-text-primary transition-colors" onClick={() => setSortAsc(v => !v)}>
                                <span className="flex items-center gap-2">Target Date <ArrowUpDown size={10} /></span>
                            </th>
                            <th className="py-6 px-4 font-black">Account</th>
                            <th className="py-6 px-4 font-black">Environment</th>
                            <th className="py-6 px-4 font-black">Asset Type</th>
                            <th className="py-6 px-4 font-black">Intelligence Hook</th>
                            <th className="py-6 px-4 font-black">Deployment Status</th>
                            <th className="py-6 px-4 font-black">Operator</th>
                            <th className="py-6 px-4 font-black text-right">Reference</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map(post => {
                            const client = clients.find(c => c.id === post.clientId);
                            const isOverdue = post.scheduledDate < today && post.status !== 'PUBLISHED';
                            return (
                                <tr
                                    key={post.id}
                                    onClick={() => onPostClick(post)}
                                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-500 cursor-pointer group ${isOverdue ? 'bg-red-500/5' : ''}`}
                                >
                                    <td className="p-4">
                                        <div className={`editorial-title text-base italic ${isOverdue ? 'text-red-400' : 'text-text-primary'}`}>{post.scheduledDate}</div>
                                        <div className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#555] mt-1">{post.scheduledTime}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-primary/80">{client?.name || '—'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-text-secondary">{post.platforms.join(' + ')}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1 text-text-muted">
                                            {post.postType}
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-[280px]">
                                        <div className="editorial-title text-base text-text-primary truncate">{post.hook || <span className="italic text-[#555]">No Hook Identified</span>}</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge status={post.status}>{post.status}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-text-muted">{post.assignedTo}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="font-sans text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 hover:translate-x-1">
                                            Execute →
                                        </button>
                                    </td>
                                </tr>

                            );
                        })}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-text-muted/50 text-sm">
                                    No posts match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
