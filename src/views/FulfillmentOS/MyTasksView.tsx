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
        className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${isOverdue ? 'bg-red-500/5 border-red-500/30' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start mb-3">
            <Badge status="default">{task.currentStage}</Badge>
            <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'critical' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-yellow-500' : 'bg-primary'
                }`} />
        </div>
        <h4 className={`text-base font-medium mb-1 transition-colors ${isOverdue ? 'text-red-500 group-hover:text-red-400' : 'text-text-primary group-hover:text-primary'}`}>
            {task.name}
        </h4>
        <p className="font-mono text-[10px] text-text-muted mb-4 uppercase tracking-widest">{task.phase} // TSK-{task.id}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-dark/50">
            <span className="font-mono text-[10px] text-text-secondary uppercase">{task.category}</span>
            <span className={`font-mono text-[10px] uppercase font-bold ${isOverdue ? 'text-red-500' : 'text-text-primary'}`}>
                {task.deadline || 'No Deadline'}
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
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-8">
            <div>
                <h3 className="font-mono text-xs font-medium text-text-muted mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    OVERDUE ({categorizedTasks.overdue.length})
                </h3>
                {categorizedTasks.overdue.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorizedTasks.overdue.map(t => <TaskCard key={t.id} task={t} isOverdue={true} onClick={() => onTaskClick(t)} />)}
                    </div>
                ) : (
                    <div className="text-sm text-text-muted italic">No overdue tasks. Stay focused.</div>
                )}
            </div>

            <div>
                <h3 className="font-mono text-xs font-medium text-text-muted mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    DUE TODAY ({categorizedTasks.dueToday.length})
                </h3>
                {categorizedTasks.dueToday.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorizedTasks.dueToday.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                    </div>
                ) : (
                    <div className="text-sm text-text-muted italic">No tasks due today.</div>
                )}
            </div>

            <div>
                <h3 className="font-mono text-xs font-medium text-text-muted mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    DUE THIS WEEK ({categorizedTasks.dueThisWeek.length})
                </h3>
                {categorizedTasks.dueThisWeek.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorizedTasks.dueThisWeek.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                    </div>
                ) : (
                    <div className="text-sm text-text-muted italic">No tasks due the rest of this week.</div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-mono text-xs font-medium text-text-muted mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        UPCOMING ({categorizedTasks.upcoming.length})
                    </h3>
                    {categorizedTasks.upcoming.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {categorizedTasks.upcoming.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                        </div>
                    ) : (
                        <div className="text-sm text-text-muted italic">No upcoming tasks scheduled yet.</div>
                    )}
                </div>

                <div>
                    <h3 className="font-mono text-xs font-medium text-text-muted mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-border-dark rounded-full" />
                        RECENTLY COMPLETED
                    </h3>
                    {categorizedTasks.completed.length > 0 ? (
                        <div className="flex flex-col gap-3 opacity-60">
                            {categorizedTasks.completed.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
                        </div>
                    ) : (
                        <div className="text-sm text-text-muted italic">No recently completed tasks.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
