import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Task } from '../../utils/storage';
import { isToday, isPast, isThisWeek, parseISO, startOfDay } from 'date-fns';

interface MyTasksViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

interface TaskCardProps {
    task: Task;
    isOverdue?: boolean;
    onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverdue = false, onClick }) => (
    <Card
        className={`p-6 cursor-pointer hover:border-primary/40 transition-all duration-300 bg-white/[0.02] border-white/[0.06] rounded-none ${isOverdue ? 'bg-red-500/[0.02] border-red-500/20' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start mb-4">
            <Badge status="review" className="text-[10px] font-bold tracking-widest">{task.currentStage}</Badge>
            <div className={`w-1.5 h-1.5 rotate-45 shrink-0 ${task.priority === 'critical' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-yellow-500' : 'bg-primary'
                }`} />
        </div>
        <h4 className={`font-sans text-[12px] font-bold mb-2 uppercase tracking-widest transition-colors ${isOverdue ? 'text-red-500' : 'text-text-muted/80 group-hover:text-text-primary'}`}>
            {task.name}
        </h4>
        <p className="font-sans text-[10px] font-bold text-text-muted/20 mb-6 uppercase tracking-[0.2em]">{task.phase} · ARC-{task.id}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
            <span className="font-sans text-[10px] font-bold text-text-muted/40 tracking-widest uppercase">{task.category}</span>
            <span className={`font-sans text-[10px] font-bold tracking-widest uppercase ${isOverdue ? 'text-red-500' : 'text-primary'}`}>
                {task.deadline || 'PENDING'}
            </span>
        </div>
    </Card>
);


export default function MyTasksView({ tasks, onTaskClick }: MyTasksViewProps) {
    const currentUserRole = sessionStorage.getItem('nodeRole') || 'Art Director'; // Default for demo

    const myTasks = useMemo(() => {
        return tasks.filter(t => t.assignedNode === currentUserRole);
    }, [tasks, currentUserRole]);

    const categorizedTasks = useMemo(() => {
        const today = startOfDay(new Date());

        const overdue = myTasks.filter(t => {
            if (!t.deadline || t.status === 'Deployed' || t.currentStage === 'DEPLOYED') return false;
            return isPast(startOfDay(parseISO(t.deadline))) && !isToday(parseISO(t.deadline));
        });

        const dueToday = myTasks.filter(t => {
            if (!t.deadline || t.status === 'Deployed' || t.currentStage === 'DEPLOYED') return false;
            return isToday(parseISO(t.deadline));
        });

        const dueThisWeek = myTasks.filter(t => {
            if (!t.deadline || t.status === 'Deployed' || t.currentStage === 'DEPLOYED') return false;
            const date = parseISO(t.deadline);
            return isThisWeek(date) && !isToday(date) && !isPast(startOfDay(date));
        });

        const upcoming = myTasks.filter(t => {
            if (!t.deadline || t.status === 'Deployed' || t.currentStage === 'DEPLOYED') return false;
            const date = parseISO(t.deadline);
            return !isThisWeek(date) && date > today;
        }).slice(0, 5);

        const completed = myTasks.filter(t =>
            t.status === 'Deployed' || t.currentStage === 'DEPLOYED'
        ).sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
            .slice(0, 5);

        return { overdue, dueToday, dueThisWeek, upcoming, completed };
    }, [myTasks]);

    return (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-12 pb-12">
            <section className="space-y-6">
                <h3 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rotate-45" />
                    Overdue Vectors ({categorizedTasks.overdue.length})
                </h3>

                {categorizedTasks.overdue.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorizedTasks.overdue.map(t => <TaskCard key={t.id} task={t} isOverdue={true} onClick={() => onTaskClick(t)} />)}
                    </div>
                ) : (
                    <div className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.3em] border border-white/[0.04] p-10 bg-white/[0.01]">All systems cleared.</div>
                )}
            </section>


            <section className="space-y-6">
                <h3 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rotate-45" />
                    Active Pulse ({categorizedTasks.dueToday.length})
                </h3>

                {categorizedTasks.dueToday.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorizedTasks.dueToday.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                    </div>
                ) : (
                    <div className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.3em] border border-white/[0.04] p-10 bg-white/[0.01]">Daily quota maintained.</div>
                )}
            </section>


            <section className="space-y-6">
                <h3 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-primary/40 rotate-45" />
                    Weekly Forecast ({categorizedTasks.dueThisWeek.length})
                </h3>

                {categorizedTasks.dueThisWeek.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorizedTasks.dueThisWeek.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                    </div>
                ) : (
                    <div className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.3em] border border-white/[0.04] p-10 bg-white/[0.01]">No weekly anomalies.</div>
                )}
            </section>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-white/[0.06]">
                <section className="space-y-6">
                    <h3 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-text-muted/20 rotate-45" />
                        Upcoming Streams ({categorizedTasks.upcoming.length})
                    </h3>

                    {categorizedTasks.upcoming.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {categorizedTasks.upcoming.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                        </div>
                    ) : (
                        <div className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.3em]">Future sectors dormant.</div>
                    )}
                </section>

                <section className="space-y-6">
                    <h3 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45" />
                        Historical Ledger
                    </h3>

                    {categorizedTasks.completed.length > 0 ? (
                        <div className="flex flex-col gap-3 opacity-60">
                            {categorizedTasks.completed.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                        </div>
                    ) : (
                        <div className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.3em]">No recent completions.</div>
                    )}
                </section>
            </div>

        </div>
    );
}
