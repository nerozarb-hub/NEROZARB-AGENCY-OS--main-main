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
        <motion.div variants={itemVariants} className="bg-card  rounded-sm flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* Filter Bar */}
            <div className="p-3 border-b border-border-dark flex items-center gap-3 flex-wrap flex-shrink-0 bg-card-alt">
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                    <Filter size={12} />
                    <span className="uppercase tracking-widest">Filters</span>
                </div>

                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="bg-background  rounded-sm px-2 py-1 text-xs text-text-primary outline-none focus:border-primary"
                >
                    <option value="all">All Stages</option>
                    {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    value={filterPlatform}
                    onChange={e => setFilterPlatform(e.target.value as any)}
                    className="bg-background  rounded-sm px-2 py-1 text-xs text-text-primary outline-none focus:border-primary capitalize"
                >
                    <option value="all">All Platforms</option>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-text-muted hover:text-text-primary transition-colors">
                    <input
                        type="checkbox"
                        checked={filterOverdue}
                        onChange={e => setFilterOverdue(e.target.checked)}
                        className="accent-red-500"
                    />
                    Overdue only
                </label>

                <span className="ml-auto text-xs text-text-muted font-mono">
                    {filtered.length} post{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-border-dark bg-card-alt text-xs font-mono tracking-widest text-text-muted uppercase">
                            <th className="p-4 font-normal cursor-pointer hover:text-text-primary" onClick={() => setSortAsc(v => !v)}>
                                <span className="flex items-center gap-1">Date <ArrowUpDown size={10} /></span>
                            </th>
                            <th className="p-4 font-normal">Client</th>
                            <th className="p-4 font-normal">Platform</th>
                            <th className="p-4 font-normal">Type</th>
                            <th className="p-4 font-normal">Hook</th>
                            <th className="p-4 font-normal">Status</th>
                            <th className="p-4 font-normal">Assigned</th>
                            <th className="p-4 font-normal text-right">Actions</th>
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
                                    className={`border-b border-border-dark/50 hover:bg-card-alt/50 transition-colors cursor-pointer group ${isOverdue ? 'bg-red-500/5' : ''}`}
                                >
                                    <td className="p-4">
                                        <div className={`text-sm font-mono ${isOverdue ? 'text-red-400' : 'text-text-primary'}`}>{post.scheduledDate}</div>
                                        <div className="text-xs text-text-muted">{post.scheduledTime}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-primary/80 font-mono">{client?.name || '—'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs capitalize text-text-primary">{post.platforms.join(', ')}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs bg-card-alt px-2 py-1 rounded-sm  text-text-muted">
                                            {post.postType}
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-[280px]">
                                        <div className="text-sm text-text-primary truncate">{post.hook || <span className="italic text-text-muted">No hook</span>}</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge status={post.status}>{post.status}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-text-muted uppercase tracking-wider">{post.assignedTo}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-xs text-text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100 font-mono">
                                            Open →
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
