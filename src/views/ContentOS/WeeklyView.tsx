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
        <motion.div variants={itemVariants} className="flex-1 flex gap-6 h-full overflow-x-auto pb-6 custom-scrollbar">

            {weekDays.map((dayDate, index) => {
                const dateStr = dayDate.toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                const dayPosts = postsByDate[dateStr] || [];

                return (
                return (
                    <div
                        key={dateStr}
                        className={`flex-1 min-w-[280px] flex flex-col bg-white/[0.01] border-x border-white/[0.03] ${isToday ? 'bg-primary/5' : ''}`}
                    >

                        {/* Column Header */}
                        <div className={`p-5 border-b border-border-dark flex justify-between items-center bg-onyx sticky top-0 z-10`}>
                            <div>
                                <span className={`font-sans text-[10px] font-black tracking-[0.2em] uppercase ${isToday ? 'text-primary' : 'text-[#555]'}`}>
                                    {DAY_LABELS[index]}
                                </span>
                                <div className={`editorial-title text-3xl italic mt-1 ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                                    {dayDate.getDate()}
                                </div>
                            </div>
                            <span className="font-sans text-[10px] font-bold text-[#555] uppercase tracking-widest">
                                {dayPosts.length > 0 ? `${dayPosts.length} Identify` : '—'}
                            </span>
                        </div>


                        {/* Post Cards */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                            {dayPosts.map(post => {
                                const client = clients.find(c => c.id === post.clientId);
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => onPostClick(post)}
                                        className="bg-white/[0.02] border border-white/[0.05] p-5 cursor-pointer hover:border-text-muted/30 transition-all duration-500 flex flex-col gap-4 group"
                                    >
                                        {/* Top row */}
                                        <div className="flex justify-between items-start gap-1">
                                            <Badge status={post.status}>{post.status}</Badge>
                                            <span className="font-sans text-[10px] font-bold text-[#555] tracking-widest uppercase shrink-0">{post.scheduledTime}</span>
                                        </div>

                                        {/* Platform + type */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80 truncate">{post.platforms.join(' + ')}</span>
                                            <div className="h-px w-4 bg-border-dark" />
                                            <span className="font-sans text-[9px] font-bold text-[#555] uppercase tracking-widest">{post.postType}</span>
                                        </div>

                                        {/* Hook */}
                                        <p className="editorial-title text-base italic text-text-primary line-clamp-2 leading-relaxed">
                                            {post.hook || <span className="text-[#555]">No intelligence hook defined</span>}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
                                            {client && (
                                                <span className="font-sans text-[10px] font-bold text-primary/60 truncate uppercase tracking-tighter">{client.name}</span>
                                            )}
                                            <span className="font-sans text-[10px] font-black text-text-muted uppercase tracking-widest ml-auto">{post.assignedTo?.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {dayPosts.length === 0 && (
                                <div className="font-sans text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] p-10 text-center border border-white/[0.04] rounded-none opacity-40">
                                    Quiet
                                </div>
                            )}
                        </div>

                    </div>
                );
            })}
        </motion.div>
    );
}
