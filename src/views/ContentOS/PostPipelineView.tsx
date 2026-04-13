import { motion } from 'motion/react';
import { Post, PostStage, Client } from '../../utils/storage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { KanbanSquare } from 'lucide-react';

interface PostPipelineViewProps {
    posts: Post[];
    clients: Client[];
    onPostClick: (post: Post) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const STAGES: PostStage[] = [
    'PLANNED',
    'BRIEF WRITTEN',
    'IN PRODUCTION',
    'REVIEW',
    'CEO APPROVAL',
    'CLIENT APPROVAL',
    'SCHEDULED',
    'PUBLISHED'
];

export default function PostPipelineView({ posts, clients, onPostClick }: PostPipelineViewProps) {
    if (posts.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/[0.04] rounded-none bg-white/[0.01]">
                <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mb-8 rotate-45">
                    <KanbanSquare className="text-text-muted/20 -rotate-45" size={24} />
                </div>
                <h3 className="font-heading text-4xl text-text-primary uppercase tracking-tighter mb-4">No Active Pipelines</h3>
                <p className="font-sans text-[11px] font-bold text-text-muted/40 uppercase tracking-[0.3em] max-w-sm text-center">
                    System scanning complete. No deployments identified in the current sector.
                </p>
            </div>
        );
    }


    return (
        <motion.div variants={itemVariants} className="flex-1 flex gap-0 h-[calc(100vh-220px)] overflow-x-auto pb-4 custom-scrollbar">

            {STAGES.map((stage) => {
                const stagePosts = posts.filter(p => p.status === stage);

                return (
                    <div key={stage} className="flex flex-col min-w-[340px] max-w-[340px] bg-white/[0.01] border-r border-white/[0.06] last:border-r-0">
                        {/* Column Header */}
                        <div className="p-6 border-b border-white/[0.06] flex justify-between items-center sticky top-0 z-10 bg-onyx/80 backdrop-blur-md">
                            <h3 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${getStageColorDot(stage)}`} />
                                {stage}
                            </h3>
                            <span className="font-sans text-[10px] font-black text-text-muted/20 tracking-widest bg-white/[0.02] px-3 py-1 border border-white/[0.04]">{stagePosts.length}</span>
                        </div>


                        {/* Column Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {stagePosts.map((post) => {
                                const client = clients.find(c => c.id === post.clientId);
                                return (
                                    <div
                                        key={post.id}
                                        className="bg-white/[0.02] border border-white/[0.06] hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-700 cursor-pointer p-6 space-y-6 group relative overflow-hidden"
                                        onClick={() => onPostClick(post)}
                                    >
                                        <div className={`absolute top-0 right-0 w-1 p-4 bg-primary rotate-45 translate-x-3 -translate-y-3 opacity-0 group-hover:opacity-100 transition-all duration-700`} />

                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex -space-x-1">
                                                {post.platforms.map((p, i) => (
                                                    <div key={p} className="w-5 h-5 border border-white/[0.1] bg-white/[0.05] flex items-center justify-center text-[8px] font-sans font-black rotate-45" style={{ zIndex: 10 - i }}>
                                                        <span className="-rotate-45">{p[0].toUpperCase()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="font-sans text-[10px] font-bold text-text-muted/20 uppercase tracking-widest shrink-0">{post.scheduledDate}</span>
                                        </div>

                                        <h4 className="font-heading text-2xl text-text-primary/90 leading-tight tracking-tight group-hover:text-text-primary transition-colors">
                                            {post.hook || <span className="text-text-muted/20 italic">INTEL_UNDEFINED</span>}
                                        </h4>

                                        <div className="flex justify-between items-end pt-6 border-t border-white/[0.06]">
                                            <div className="space-y-1">
                                                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{client?.name || 'GENERIC_ENT'}</p>
                                                <p className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/40">{post.postType}</p>
                                            </div>
                                            <div className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/20 border-l border-white/[0.06] pl-3">
                                                {post.assignedTo?.split(' ')[0]}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}


                            {stagePosts.length === 0 && (
                                <div className="aspect-[3/1] flex flex-col items-center justify-center border border-dashed border-white/[0.04] opacity-20 group hover:opacity-40 transition-all duration-700">
                                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.4em]">QUIET_COLUMN</span>
                                </div>
                            )}
                        </div>

                    </div>
                );
            })}
        </motion.div>
    );
}

function getStageColorDot(stage: PostStage) {
    switch (stage) {
        case 'PLANNED': return 'bg-white/[0.1]';
        case 'PRODUCTION': return 'bg-blue-500';
        case 'REVIEW': return 'bg-yellow-500';
        case 'CEO APPR': return 'bg-orange-500';
        case 'SCHEDULED': return 'bg-purple-500';
        case 'PUBLISHED': return 'bg-green-500';
        default: return 'bg-white/[0.05]';
    }
}

