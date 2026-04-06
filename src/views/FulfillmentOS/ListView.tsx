import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronRight } from 'lucide-react';

export default function ListView({ tasks, onTaskClick }: { tasks: any[], onTaskClick: (task: any) => void }) {
  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-card-alt border-b border-border-dark font-mono text-[10px] text-text-muted uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-4 font-normal">Task ID</th>
              <th className="p-4 font-normal">Title</th>
              <th className="p-4 font-normal">Client</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Priority</th>
              <th className="p-4 font-normal">Assignee</th>
              <th className="p-4 font-normal">Deadline</th>
              <th className="p-4 font-normal text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-text-muted">
                    <div className="w-12 h-12 rounded-full bg-surface  flex items-center justify-center mb-3">
                      <ChevronRight className="opacity-50" size={20} />
                    </div>
                    <p className="font-heading font-bold text-sm text-text-primary tracking-tight uppercase mb-1">No Tasks Found</p>
                    <p className="font-mono text-[10px] tracking-widest uppercase">This view is currently empty.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-card-alt transition-colors group cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="p-4 font-mono text-[10px] text-text-muted">TSK-{task.id}</td>
                  <td className="p-4 font-medium text-text-primary">{task.title}</td>
                  <td className="p-4 text-text-secondary">{task.client}</td>
                  <td className="p-4"><Badge>{task.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-primary'
                        }`} />
                      <span className="text-xs text-text-secondary capitalize">{task.priority}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{task.assignee}</td>
                  <td className="p-4 font-mono text-[10px] text-text-muted">{task.deadline}</td>
                  <td className="p-4 text-right">
                    <button className="text-text-muted hover:text-text-primary p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
