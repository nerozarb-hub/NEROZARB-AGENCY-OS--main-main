import { motion } from 'motion/react';
import { Post, Client } from '../../utils/storage';
import { Badge } from '../../components/ui/Badge';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface WeeklyViewProps {
    posts: Post[];
    clients: Client[];
    onPostClick: (post: Post) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function WeeklyView({ posts, clients, onPostClick }: WeeklyViewProps) {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Group posts by date
    const postsByDate: Record<string, Post[]> = {};
    posts.forEach(p => {
        if (!postsByDate[p.scheduledDate]) postsByDate[p.scheduledDate] = [];
        postsByDate[p.scheduledDate].push(p);
    });

    return (
        <motion.div variants={itemVariants} className="flex-1 flex gap-0 h-full overflow-x-auto pb-6 custom-scrollbar">

            {weekDays.map((date, index) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isToday = isSameDay(date, today);
                const dayPosts = postsByDate[dateStr] || [];

                return (
                    <div
                        key={dateStr}
                        className={`flex-1 min-w-[320px] flex flex-col bg-white/[0.01] border-r border-white/[0.06] last:border-r-0 ${isToday ? 'bg-primary/[0.02]' : ''}`}
                    >

                        {/* Column Header */}
                        <div className={`p-8 border-b border-white/[0.06] flex flex-col gap-1 bg-onyx/80 backdrop-blur-md sticky top-0 z-10 ${isToday ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''}`}>
                            <span className={`font-sans text-[10px] font-black tracking-[0.4em] uppercase ${isToday ? 'text-primary' : 'text-text-muted/40'}`}>
                                {format(date, 'EEEE').toUpperCase()}
                            </span>
                            <div className="flex justify-between items-end">
                                <div className={`font-heading text-6xl tracking-tighter leading-none ${isToday ? 'text-text-primary' : 'text-text-primary/80'}`}>
                                    {format(date, 'dd')}
                                </div>
                                <span className="font-sans text-[9px] font-black text-text-muted/20 uppercase tracking-[0.2em]">
                                    {dayPosts.length} ASSETS
                                </span>
                            </div>
                        </div>


                        {/* Post Cards */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            {dayPosts.map(post => {
                                const client = clients.find(c => c.id === post.clientId);
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => onPostClick(post)}
                                        className="bg-white/[0.02] border border-white/[0.06] p-6 cursor-pointer hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-500 flex flex-col gap-6 group relative overflow-hidden"
                                    >
                                        {/* Status Notch */}
                                        <div className={`absolute top-0 right-0 w-1 p-4 bg-primary rotate-45 translate-x-3 -translate-y-3 opacity-0 group-hover:opacity-100 transition-all duration-500`} />

                                        {/* Top row */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${getStatusColor(post.status)}`} />
                                                <span className="font-sans text-[10px] font-black text-text-muted/60 tracking-[0.2em] uppercase">{post.status}</span>
                                            </div>
                                            <span className="font-sans text-[10px] font-bold text-text-muted/30 tracking-widest uppercase">{post.scheduledTime}</span>
                                        </div>

                                        {/* Platform + type */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-1">
                                                {post.platforms.map((p, i) => (
                                                    <div key={p} className="w-5 h-5 border border-white/[0.1] bg-white/[0.05] flex items-center justify-center text-[8px] font-sans font-black rotate-45" style={{ zIndex: 10 - i }}>
                                                        <span className="-rotate-45">{p[0]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="font-sans text-[11px] font-black text-primary tracking-[0.15em] uppercase truncate">{post.postType}</span>
                                        </div>

                                        {/* Hook */}
                                        <p className="font-heading text-2xl text-text-primary/90 leading-tight tracking-tight group-hover:text-text-primary transition-colors">
                                            {post.hook || "INTEL UNDEFINED"}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center pt-6 border-t border-white/[0.06]">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-sans text-[8px] font-black text-text-muted/20 uppercase tracking-widest">CLIENT</span>
                                                <span className="font-sans text-[10px] font-bold text-text-muted/60 uppercase tracking-tighter truncate max-w-[120px]">{client?.name || 'GENERIC'}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-sans text-[8px] font-black text-text-muted/20 uppercase tracking-widest">NODE</span>
                                                <div className="font-sans text-[10px] font-bold text-text-primary uppercase tracking-[0.1em]">{post.assignedTo?.split(' ')[0] || 'SYSTEM'}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {dayPosts.length === 0 && (
                                <div className="aspect-[3/1] flex flex-col items-center justify-center border border-dashed border-white/[0.04] opacity-20 group hover:opacity-40 transition-all duration-700">
                                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.4em]">SILENT BLOCK</span>
                                </div>
                            )}
                        </div>

                    </div>
                );
            })}
        </motion.div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PLANNED': return 'bg-white/[0.1]';
        case 'PRODUCTION': return 'bg-blue-500';
        case 'REVIEW': return 'bg-yellow-500';
        case 'CEO APPR': return 'bg-orange-500';
        case 'SCHEDULED': return 'bg-purple-500';
        case 'PUBLISHED': return 'bg-green-500';
        default: return 'bg-white/[0.05]';
    }
}
