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
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border-dark/50 rounded-sm bg-card-alt/20">
                <div className="w-16 h-16 rounded-full bg-surface  flex items-center justify-center mb-4">
                    <KanbanSquare className="text-text-muted opacity-50" size={24} />
                </div>
                <h3 className="font-heading font-black text-lg text-text-primary tracking-tight uppercase mb-2">Empty Pipeline</h3>
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest max-w-sm text-center">
                    No posts matched. Try adjusting filters or creating new content.
                </p>
            </div>
        );
    }

    return (
        <motion.div variants={itemVariants} className="flex-1 flex gap-4 h-[calc(100vh-200px)] overflow-x-auto pb-4">
            {STAGES.map((stage) => {
                const stagePosts = posts.filter(p => p.status === stage);

                return (
                    <div key={stage} className="flex flex-col min-w-[300px] max-w-[300px] bg-background  rounded-sm">

                        {/* Column Header */}
                        <div className="p-3 border-b border-border-dark flex justify-between items-center bg-card sticky top-0 z-10">
                            <h3 className="font-mono text-xs tracking-widest text-text-primary uppercase flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStageColorDot(stage)}`} />
                                {stage}
                            </h3>
                            <Badge variant="outline">{stagePosts.length}</Badge>
                        </div>

                        {/* Column Body */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {stagePosts.map((post) => {
                                const client = clients.find(c => c.id === post.clientId);
                                return (
                                    <Card
                                        key={post.id}
                                        className="cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => onPostClick(post)}
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted bg-card-alt px-1.5 py-0.5  rounded-sm capitalize">
                                                    {post.platforms[0] || 'MULTI'}
                                                </span>
                                                <span className="text-[10px] text-primary font-mono shrink-0">{post.scheduledDate}</span>
                                            </div>
                                            <CardTitle className="text-sm leading-tight text-text-primary">
                                                {post.hook || <span className="italic text-text-muted text-xs">No hook defined</span>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-end mt-2 pt-3 border-t border-border-dark/30">
                                                <div className="text-[10px] text-text-muted flex flex-col gap-0.5">
                                                    <span>{post.postType}</span>
                                                    {client && (
                                                        <span className="text-primary/60">{client.name}</span>
                                                    )}
                                                </div>
                                                <div className="px-2 py-1 rounded-sm bg-card-alt  text-[10px] font-mono text-text-primary uppercase tracking-wider">
                                                    {post.assignedTo}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
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
