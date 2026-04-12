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
                <div className="w-12 h-12 rounded-none bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                    <KanbanSquare className="text-text-muted opacity-40" size={20} />
                </div>
                <h3 className="editorial-title text-2xl text-text-primary italic mb-3">No Active Pipelines</h3>
                <p className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] max-w-sm text-center">
                    System scanning complete. No deployments identified in the current context.
                </p>
            </div>
        );
    }


    return (
        <motion.div variants={itemVariants} className="flex-1 flex gap-6 h-[calc(100vh-220px)] overflow-x-auto pb-4 custom-scrollbar">

            {STAGES.map((stage) => {
                const stagePosts = posts.filter(p => p.status === stage);

                return (
                    <div key={stage} className="flex flex-col min-w-[320px] max-w-[320px] bg-white/[0.01] border-x border-white/[0.03]">
                        {/* Column Header */}
                        <div className="p-4 border-b border-border-dark flex justify-between items-center sticky top-0 z-10 bg-onyx">
                            <h3 className="font-sans text-[10px] font-black tracking-[0.2em] text-text-primary uppercase flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${getStageColorDot(stage)}`} />
                                {stage}
                            </h3>
                            <Badge status="none" className="bg-white/5 border-white/10 text-text-muted tracking-widest">{stagePosts.length}</Badge>
                        </div>


                        {/* Column Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {stagePosts.map((post) => {
                                const client = clients.find(c => c.id === post.clientId);
                                return (
                                    <div
                                        key={post.id}
                                        className="bg-white/[0.02] border border-white/[0.05] hover:border-text-muted/30 transition-all duration-500 cursor-pointer p-5 space-y-4 group"
                                        onClick={() => onPostClick(post)}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] bg-white/5 border border-white/5 px-2 py-0.5 group-hover:bg-primary group-hover:text-text-primary transition-all duration-500 truncate">
                                                {post.platforms.join(' + ')}
                                            </span>
                                            <span className="editorial-title text-[11px] italic text-[#555] group-hover:text-primary transition-colors shrink-0">{post.scheduledDate}</span>
                                        </div>
                                        <h4 className="editorial-title text-base italic text-text-primary leading-tight">
                                            {post.hook || <span className="text-[#555]">No intelligence hook defined</span>}
                                        </h4>
                                        <div className="flex justify-between items-end pt-4 border-t border-white/[0.04]">
                                            <div className="space-y-1">
                                                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary/80">{client?.name || 'External Account'}</p>
                                                <p className="font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-[#555]">{post.postType}</p>
                                            </div>
                                            <div className="font-sans text-[9px] font-black uppercase tracking-widest text-text-muted bg-white/5 border border-white/5 px-2 py-1">
                                                {post.assignedTo?.split(' ')[0]}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}


                            {stagePosts.length === 0 && (
                                <div className="p-4 text-center border border-dashed border-border-dark/40 rounded-sm text-xs text-text-muted/40">
                                    Empty
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
