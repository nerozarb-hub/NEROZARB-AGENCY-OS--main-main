import { motion } from 'motion/react';
import { Post, Client } from '../../utils/storage';
import { Badge } from '../../components/ui/Badge';

interface WeeklyViewProps {
    posts: Post[];
    clients: Client[];
    onPostClick: (post: Post) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function WeeklyView({ posts, clients, onPostClick }: WeeklyViewProps) {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);

    // Build 7 day objects for this week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const todayStr = today.toISOString().split('T')[0];

    // Group posts by their exact date string
    const postsByDate: Record<string, Post[]> = {};
    posts.forEach(p => {
        if (!postsByDate[p.scheduledDate]) postsByDate[p.scheduledDate] = [];
        postsByDate[p.scheduledDate].push(p);
    });

    const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <motion.div variants={itemVariants} className="flex-1 flex gap-3 h-full overflow-x-auto pb-4">
            {weekDays.map((dayDate, index) => {
                const dateStr = dayDate.toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                const dayPosts = postsByDate[dateStr] || [];

                return (
                    <div
                        key={dateStr}
                        className={`flex-1 min-w-[240px] flex flex-col rounded-sm border ${isToday ? 'border-primary/30 bg-primary/5' : 'border-border-dark bg-background/50'}`}
                    >
                        {/* Column Header */}
                        <div className={`p-3 border-b flex justify-between items-center ${isToday ? 'border-primary/30 bg-card' : 'border-border-dark bg-card'}`}>
                            <div>
                                <span className={`font-mono text-xs tracking-widest uppercase ${isToday ? 'text-primary font-bold' : 'text-text-muted'}`}>
                                    {DAY_LABELS[index]}
                                </span>
                                <div className={`text-2xl font-heading mt-0.5 ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                                    {dayDate.getDate()}
                                </div>
                            </div>
                            <span className="text-xs text-text-muted font-mono">
                                {dayPosts.length > 0 ? `${dayPosts.length} post${dayPosts.length > 1 ? 's' : ''}` : '—'}
                            </span>
                        </div>

                        {/* Post Cards */}
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                            {dayPosts.map(post => {
                                const client = clients.find(c => c.id === post.clientId);
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => onPostClick(post)}
                                        className="bg-card  p-3 rounded-sm cursor-pointer hover:border-primary/40 transition-colors flex flex-col gap-2"
                                    >
                                        {/* Top row */}
                                        <div className="flex justify-between items-start gap-1">
                                            <Badge status={post.status}>{post.status}</Badge>
                                            <span className="text-[10px] text-text-muted font-mono shrink-0">{post.scheduledTime}</span>
                                        </div>

                                        {/* Platform + type */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wider font-mono text-primary/70">{post.platforms.join(', ')}</span>
                                            <span className="text-[10px] text-text-muted bg-card-alt px-1.5 py-0.5 rounded-sm">{post.postType}</span>
                                        </div>

                                        {/* Hook */}
                                        <p className="text-xs text-text-primary line-clamp-2 leading-relaxed">
                                            {post.hook || <span className="italic text-text-muted">No hook defined</span>}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center pt-1.5 border-t border-border-dark/50">
                                            {client && (
                                                <span className="text-[10px] text-primary/60 font-mono truncate">{client.name}</span>
                                            )}
                                            <span className="text-[10px] text-text-muted/70 uppercase tracking-wider ml-auto">{post.assignedTo}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {dayPosts.length === 0 && (
                                <div className="text-xs text-text-muted/40 p-4 text-center border border-dashed border-border-dark/40 rounded-sm mt-2">
                                    No posts
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
}
