import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Post, Client } from '../../utils/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyViewProps {
    posts: Post[];
    clients: Client[];
    onPostClick: (post: Post) => void;
    onAddPost: (date: string) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function MonthlyView({ posts, clients, onPostClick, onAddPost }: MonthlyViewProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const todayStr = today.toISOString().split('T')[0];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Build grid cells (nulls for padding before 1st)
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));

    // Group posts by date string
    const postsByDate: Record<string, Post[]> = {};
    posts.forEach(p => {
        if (!postsByDate[p.scheduledDate]) postsByDate[p.scheduledDate] = [];
        postsByDate[p.scheduledDate].push(p);
    });

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const monthLabel = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();

    // Week number helper
    const getWeekNum = (date: Date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    return (
        <motion.div variants={itemVariants} className="bg-card  rounded-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header row */}
            <div className="flex justify-between items-center p-4 border-b border-border-dark flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 text-text-muted hover:text-text-primary transition-colors  rounded-sm hover:border-text-muted/30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <h3 className="font-heading text-xl text-text-primary tracking-tight w-56 text-center">{monthLabel}</h3>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 text-text-muted hover:text-text-primary transition-colors  rounded-sm hover:border-text-muted/30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-end gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted mt-2 md:mt-0">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-border-dark/20 text-text-secondary border border-border-dark rounded-sm"><div className="w-2 h-2 rounded-full bg-border-dark" /> Planned</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-sm"><div className="w-2 h-2 rounded-full bg-blue-500" /> Production</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-sm"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Review</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-sm"><div className="w-2 h-2 rounded-full bg-orange-500" /> CEO Appr</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-sm"><div className="w-2 h-2 rounded-full bg-purple-500" /> Scheduled</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-sm"><div className="w-2 h-2 rounded-full bg-green-500" /> Published</span>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-border-dark flex-shrink-0">
                <div className="p-2 border-r border-border-dark/50" /> {/* Week col header */}
                {weekDays.map(day => (
                    <div key={day} className="p-3 text-center text-xs font-mono tracking-widest text-text-muted border-r border-border-dark/50 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Cells */}
            <div className="flex-1 overflow-y-auto">
                {/* Group cells into rows of 7 for week numbers */}
                {Array.from({ length: Math.ceil(cells.length / 7) }, (_, rowIdx) => {
                    const rowCells = cells.slice(rowIdx * 7, rowIdx * 7 + 7);
                    // Find first real date in row for week number
                    const firstRealDate = rowCells.find(c => c !== null) as Date | undefined;
                    const weekNum = firstRealDate ? getWeekNum(firstRealDate) : null;

                    return (
                        <div key={rowIdx} className="grid grid-cols-[40px_repeat(7,1fr)]" style={{ minHeight: '120px' }}>
                            {/* Week number */}
                            <div className="border-r border-b border-border-dark/50 flex items-start justify-center pt-2">
                                {weekNum && (
                                    <span className="text-[9px] font-mono text-text-muted/40 tracking-widest">W{weekNum}</span>
                                )}
                            </div>

                            {/* Day cells — ensure 7 per row with padding */}
                            {Array.from({ length: 7 }, (_, colIdx) => {
                                const dateObj = rowCells[colIdx] ?? null;
                                if (!dateObj) {
                                    return (
                                        <div key={`pad-${rowIdx}-${colIdx}`} className="border-r border-b border-border-dark/50 last:border-r-0 bg-background/30" />
                                    );
                                }

                                const dateStr = dateObj.toISOString().split('T')[0];
                                const isToday = dateStr === todayStr;
                                const isPast = dateObj < today && !isToday;
                                const dayPosts = postsByDate[dateStr] || [];

                                return (
                                    <div
                                        key={dateStr}
                                        className={`p-2 border-r border-b border-border-dark/50 last:border-r-0 hover:bg-card-alt/30 transition-colors group flex flex-col relative cursor-default ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''} ${isPast ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1 relative z-10">
                                            <span className={`text-sm font-mono leading-none ${isToday ? 'text-primary font-bold' : 'text-text-muted'}`}>
                                                {dateObj.getDate()}
                                            </span>
                                            {dayPosts.length > 0 && (
                                                <span className="text-[9px] font-mono text-text-muted/50">{dayPosts.length}</span>
                                            )}
                                        </div>

                                        {/* Hover Add Button */}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/50 cursor-pointer backdrop-blur-[1px] transition-all z-0"
                                            onClick={() => onAddPost(dateStr)}
                                        >
                                            <span className="text-3xl font-light text-text-muted/30">+</span>
                                        </div>

                                        {/* Post previews */}
                                        <div className="flex-1 space-y-1 relative z-10 pointer-events-none">
                                            {dayPosts.slice(0, 3).map(post => {
                                                const client = clients.find(c => c.id === post.clientId);
                                                const isOverdueItem = isPast && post.status !== 'PUBLISHED' && post.status !== 'SCHEDULED';
                                                return (
                                                    <div
                                                        key={post.id}
                                                        onClick={(e) => { e.stopPropagation(); onPostClick(post); }}
                                                        className={`text-xs p-1 rounded-sm bg-card-alt flex items-center gap-1.5 cursor-pointer transition-colors pointer-events-auto truncate ${isOverdueItem ? 'border border-red-500/50 bg-red-500/5 hover:border-red-500' : 'hover:border-text-muted/40'}`}
                                                        title={post.hook || post.postType}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(post.status)}`} />
                                                        <span className={`truncate text-[10px] capitalize ${isOverdueItem ? 'text-red-400 font-bold' : 'text-text-primary'}`}>{post.platforms[0]}</span>
                                                        {client && (
                                                            <span className="truncate text-[10px] text-primary/70 ml-auto shrink-0">{client.name.split(' ')[0]}</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            {dayPosts.length > 3 && (
                                                <div className="text-[9px] text-text-muted text-center py-0.5 bg-background/50 rounded-sm">
                                                    +{dayPosts.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PLANNED': return 'bg-border-dark';
        case 'BRIEF WRITTEN': return 'bg-blue-400/60';
        case 'IN PRODUCTION': return 'bg-blue-500';
        case 'REVIEW': return 'bg-yellow-500';
        case 'CEO APPROVAL': return 'bg-orange-500';
        case 'CLIENT APPROVAL': return 'bg-orange-400';
        case 'SCHEDULED': return 'bg-purple-500';
        case 'PUBLISHED': return 'bg-green-500';
        default: return 'bg-border-dark';
    }
}
