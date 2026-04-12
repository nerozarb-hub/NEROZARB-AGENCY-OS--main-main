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
        <motion.div variants={itemVariants} className="bg-transparent flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* Header row */}
            <div className="flex justify-between items-center py-6 border-b border-white/[0.04]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 text-[#555] hover:text-text-primary transition-all duration-300 border border-white/5 hover:border-text-muted"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <h3 className="editorial-title text-3xl text-text-primary tracking-tight italic min-w-[300px] text-center">{monthLabel}</h3>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 text-[#555] hover:text-text-primary transition-all duration-300 border border-white/5 hover:border-text-muted"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-end gap-3 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#555]">
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 text-[#555]">
                      <div className="w-1.5 h-1.5 rounded-none rotate-45 bg-border-dark" /> PLANNED
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 text-[#555]">
                      <div className="w-1.5 h-1.5 rounded-none rotate-45 bg-blue-500" /> PRODUCTION
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 text-[#555]">
                      <div className="w-1.5 h-1.5 rounded-none rotate-45 bg-yellow-500" /> REVIEW
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 text-[#555]">
                      <div className="w-1.5 h-1.5 rounded-none rotate-45 bg-orange-500" /> CEO APPR
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 text-[#555]">
                      <div className="w-1.5 h-1.5 rounded-none rotate-45 bg-purple-500" /> SCHEDULED
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 text-[#555]">
                       <div className="w-1.5 h-1.5 rounded-none rotate-45 bg-green-500" /> PUBLISHED
                    </span>
                </div>
            </div>


            {/* Grid Header */}
            <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-white/[0.04]">
                <div className="p-2 border-r border-white/[0.04]" /> {/* Week col header */}
                {weekDays.map(day => (
                    <div key={day} className="py-4 text-center font-sans text-[10px] font-black uppercase tracking-[0.2em] text-[#555] border-r border-white/[0.04] last:border-r-0">
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
                                        className={`p-3 border-r border-b border-white/[0.04] last:border-r-0 hover:bg-white/[0.02] transition-colors group flex flex-col relative cursor-default ${isToday ? 'bg-primary/5' : ''} ${isPast ? 'opacity-40' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <span className={`editorial-title text-base italic leading-none ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                                                {dateObj.getDate()}
                                            </span>
                                            {dayPosts.length > 0 && (
                                                <span className="font-sans text-[10px] font-bold text-[#555]">{dayPosts.length}</span>
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
                                                        className={`p-1.5 bg-white/5 border border-white/[0.02] flex items-center gap-2 cursor-pointer transition-all duration-300 pointer-events-auto truncate hover:border-text-muted/30 ${isOverdueItem ? 'border-red-500/30' : ''}`}
                                                        title={post.hook || post.postType}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-none rotate-45 shrink-0 ${getStatusColor(post.status)}`} />
                                                        <span className={`truncate font-sans text-[9px] font-bold uppercase tracking-widest ${isOverdueItem ? 'text-red-400' : 'text-text-primary'}`}>{post.platforms[0] || 'POST'}</span>
                                                        {client && (
                                                            <span className="truncate font-sans text-[8px] font-bold text-primary/60 ml-auto shrink-0 uppercase tracking-tighter">{client.name.split(' ')[0]}</span>
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
