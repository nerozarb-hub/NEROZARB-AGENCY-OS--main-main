import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
    ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronRight,
    Clock, Shield, Users, Zap, AlertTriangle, PartyPopper
} from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { Modal } from '../../components/ui/Modal';
import { OnboardingProtocol } from '../../utils/storage';
import { formatDistanceToNow } from 'date-fns';

interface OnboardingDetailViewProps {
    protocol: OnboardingProtocol;
    onBack: () => void;
    onNavigate?: (view: string, id?: string) => void;
}

export default function OnboardingDetailView({ protocol, onBack, onNavigate }: OnboardingDetailViewProps) {
    const { data, updateOnboardingStep, generateSprintTasks } = useAppData();
    const authLevel = sessionStorage.getItem('authLevel') || 'team';
    const client = data.clients.find(c => c.id === protocol.clientId);

    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [showSprintPrompt, setShowSprintPrompt] = useState(false);

    if (!client) return null;

    const completedCount = protocol.steps.filter(s => s.completed).length;
    const totalSteps = protocol.steps.length;
    const progressPercent = Math.round((completedCount / totalSteps) * 100);
    const isComplete = completedCount === totalSteps;

    const handleToggleStep = (stepId: string, currentCompleted: boolean) => {
        const step = protocol.steps.find(s => s.id === stepId);
        if (!step) return;

        // CEO gate: only CEO can toggle CEO-owned steps
        if (step.owner === 'CEO' && authLevel !== 'ceo') return;

        updateOnboardingStep(protocol.id, stepId, !currentCompleted);

        // After completing step 6 (Shadow Avatar extraction), prompt to update client profile
        if (stepId === '6' && !currentCompleted) {
            // Could navigate to client detail
        }

        // After completing all steps, prompt sprint generation
        const newCompletedCount = currentCompleted ? completedCount - 1 : completedCount + 1;
        if (newCompletedCount === totalSteps) {
            setShowSprintPrompt(true);
        }
    };

    const getStepIcon = (step: { completed: boolean; owner: string }) => {
        if (step.completed) {
            return <CheckCircle2 size={20} className="text-primary" />;
        }
        if (step.owner === 'CEO') {
            return <Shield size={20} className="text-yellow-500/70" />;
        }
        return <Circle size={20} className="text-text-muted/40" />;
    };

    const getNextActionableStep = () => {
        return protocol.steps.find(s => !s.completed);
    };

    const nextStep = getNextActionableStep();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 max-w-[1200px] mx-auto space-y-8 h-screen flex flex-col"
        >
            {/* Header */}
            <div className="flex-shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono text-[10px] tracking-widest uppercase">Back to All Protocols</span>
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="font-heading text-3xl font-black tracking-[-0.05em] text-text-primary uppercase">
                                {client.name}
                            </h2>
                            <Badge status={protocol.status === 'completed' ? 'healthy' : protocol.status === 'blocked' ? 'critical' : 'review'}>
                                {protocol.status.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
                            {client.tier} · {client.niche} · Onboarding Protocol
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-border-dark hover:border-primary text-[10px]"
                            onClick={() => onNavigate?.('client', client.id.toString())}
                        >
                            VIEW CLIENT PROFILE
                        </Button>
                        {isComplete && (
                            <Button
                                className="bg-primary hover:bg-accent-mid text-[10px]"
                                onClick={() => onNavigate?.('fulfillment', client.id.toString())}
                            >
                                <Zap size={14} />
                                OPEN SPRINT
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="p-6 border-border-dark bg-card-alt/30 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <span className="font-heading font-black text-4xl text-primary">{progressPercent}%</span>
                        <div>
                            <p className="font-heading font-bold text-sm text-text-primary uppercase tracking-tight">
                                {completedCount} of {totalSteps} Steps Complete
                            </p>
                            <p className="font-mono text-[9px] text-text-muted tracking-widest uppercase mt-0.5">
                                Last updated {formatDistanceToNow(new Date(protocol.lastUpdated), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    {nextStep && !isComplete && (
                        <div className="flex items-center gap-2 bg-surface px-4 py-2 border border-primary/20 rounded-sm">
                            <Zap size={12} className="text-primary" />
                            <span className="font-mono text-[9px] text-primary tracking-widest uppercase">
                                Next: {nextStep.label}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-1.5 h-2">
                    {protocol.steps.map((step, i) => (
                        <div
                            key={step.id}
                            className={`flex-1 rounded-[2px] transition-all duration-500 ${step.completed
                                ? 'bg-primary shadow-[0_0_8px_rgba(63,106,36,0.4)]'
                                : i === completedCount
                                    ? 'bg-primary/30 animate-pulse'
                                    : 'bg-border-dark/50'
                                }`}
                        />
                    ))}
                </div>
            </Card>

            {/* Completion Banner */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="p-6 border-primary bg-primary/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <PartyPopper size={24} className="text-primary" />
                                    <div>
                                        <p className="font-heading font-black text-lg text-primary uppercase tracking-tight">
                                            [ ONBOARDING COMPLETE ]
                                        </p>
                                        <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mt-1">
                                            Sprint officially live. All systems go.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="bg-primary hover:bg-accent-mid text-text-primary text-[10px]"
                                    onClick={() => onNavigate?.('fulfillment', client.id.toString())}
                                >
                                    <Zap size={14} />
                                    LAUNCH SPRINT
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Steps List */}
            <div className="flex-1 overflow-auto custom-scrollbar space-y-2 pb-8">
                {protocol.steps.map((step, index) => {
                    const isExpanded = expandedStep === step.id;
                    const isCeoGated = step.owner === 'CEO' && authLevel !== 'ceo';
                    const isNextStep = nextStep?.id === step.id;

                    return (
                        <motion.div
                            key={step.id}
                            layout
                            className={`border rounded-sm transition-all ${step.completed
                                ? 'border-primary/20 bg-primary/5'
                                : isNextStep
                                    ? 'border-primary/40 bg-card-alt/50 shadow-[0_0_12px_rgba(63,106,36,0.1)]'
                                    : 'border-border-dark bg-card'
                                }`}
                        >
                            {/* Step Header */}
                            <div
                                className="flex items-center gap-4 p-5 cursor-pointer group"
                                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                            >
                                {/* Step Number */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${step.completed
                                    ? 'bg-primary/20 text-primary'
                                    : isNextStep
                                        ? 'bg-primary/10 text-primary border border-primary/30'
                                        : 'bg-card-alt text-text-muted '
                                    }`}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>

                                {/* Icon */}
                                {getStepIcon(step)}

                                {/* Label */}
                                <div className="flex-1">
                                    <p className={`font-heading font-bold text-sm uppercase tracking-tight ${step.completed ? 'text-primary line-through opacity-70' : 'text-text-primary'
                                        }`}>
                                        {step.label}
                                    </p>
                                    {step.completedAt && (
                                        <p className="font-mono text-[9px] text-text-muted tracking-widest mt-0.5">
                                            Completed {formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}
                                        </p>
                                    )}
                                </div>

                                {/* Owner Badge */}
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-mono uppercase tracking-widest ${step.owner === 'CEO'
                                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                    : 'bg-card-alt text-text-muted '
                                    }`}>
                                    {step.owner === 'CEO' ? <Shield size={10} /> : <Users size={10} />}
                                    {step.owner}
                                </div>

                                {/* Expand indicator */}
                                {isExpanded
                                    ? <ChevronDown size={16} className="text-text-muted" />
                                    : <ChevronRight size={16} className="text-text-muted" />
                                }
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-0 border-t border-border-dark/50">
                                            <div className="pt-4 space-y-4">
                                                {/* Instructions */}
                                                {step.details && (
                                                    <div className="bg-surface p-4 /50 rounded-sm">
                                                        <p className="font-mono text-[9px] text-primary tracking-widest uppercase mb-2">Instructions</p>
                                                        <p className="text-sm text-text-secondary leading-relaxed">
                                                            {step.details}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* CEO Gate Warning */}
                                                {isCeoGated && (
                                                    <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-sm">
                                                        <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
                                                        <span className="font-mono text-[10px] text-yellow-500/80 tracking-widest uppercase">
                                                            CEO Gate — Only the CEO can mark this step complete
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <Clock size={12} />
                                                        <span className="font-mono text-[9px] tracking-widest uppercase">
                                                            {step.completed
                                                                ? `Marked complete ${step.completedAt ? formatDistanceToNow(new Date(step.completedAt), { addSuffix: true }) : ''}`
                                                                : 'Awaiting completion'
                                                            }
                                                        </span>
                                                    </div>

                                                    <Button
                                                        variant={step.completed ? 'outline' : 'default'}
                                                        className={`text-[10px] ${isCeoGated
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : step.completed
                                                                ? 'border-border-dark hover:border-red-500 hover:text-red-500'
                                                                : 'bg-primary hover:bg-accent-mid'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isCeoGated) {
                                                                handleToggleStep(step.id, step.completed);
                                                            }
                                                        }}
                                                        disabled={isCeoGated}
                                                    >
                                                        {step.completed ? (
                                                            <>UNDO COMPLETION</>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={14} />
                                                                MARK COMPLETE
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Sprint Generation Prompt Modal */}
            <Modal
                isOpen={showSprintPrompt}
                onClose={() => setShowSprintPrompt(false)}
                title={
                    <div className="flex items-center gap-3">
                        <PartyPopper className="w-6 h-6 text-primary" />
                        <h2 className="font-heading text-xl text-text-primary uppercase tracking-tight">Onboarding Complete!</h2>
                    </div>
                }
                footer={
                    <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                        <Button
                            variant="ghost"
                            onClick={() => setShowSprintPrompt(false)}
                            className="font-mono text-[10px] uppercase tracking-widest w-full sm:w-auto h-11"
                        >
                            LATER
                        </Button>
                        <Button
                            className="bg-primary hover:bg-accent-mid text-text-primary px-8 font-mono text-[10px] uppercase tracking-widest w-full sm:w-auto h-11"
                            onClick={() => {
                                generateSprintTasks(client.id);
                                setShowSprintPrompt(false);
                                onNavigate?.('fulfillment', client.id.toString());
                            }}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            GENERATE SPRINT
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 py-2">
                    <p className="text-sm text-text-secondary leading-relaxed font-mono uppercase">
                        All 10 onboarding steps are complete for <strong className="text-primary">{client.name.toUpperCase()}</strong>.
                    </p>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm">
                        <p className="text-[10px] text-text-muted leading-relaxed font-mono uppercase">
                            EXECUTION READY: WOULD YOU LIKE TO INITIALIZE THE STANDARD PHASE 1 SPRINT TASKS AND DEPLOY TO FULFILLMENT OS?
                        </p>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
