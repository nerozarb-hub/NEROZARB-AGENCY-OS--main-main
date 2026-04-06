import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { AppData, Client, generateOnboardingProtocol, Task, Stage, ActivityEntry, Post, PostStage, Protocol, TimelineEvent } from '../utils/storage';
import * as sync from '../utils/supabaseSync';
import { Toast, ToastContainer } from '../components/ui/Toast';

// Safe max ID helper — uses reduce instead of Math.max(...spread) to avoid stack overflow on large arrays
function safeMaxId<T extends { id: number }>(items: T[]): number {
    return items.reduce((max, item) => Math.max(max, item.id), 0);
}

interface AppDataContextType {
    data: AppData;
    setData: React.Dispatch<React.SetStateAction<AppData>>;
    updateData: (newData: Partial<AppData>) => void;
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => number;
    updateClient: (id: number, updates: Partial<Client>) => void;
    deleteClient: (id: number) => void;
    addTimelineEvent: (clientId: number, event: string, type?: 'system' | 'manual') => void;
    updateOnboardingStep: (protocolId: string, stepId: string, completed: boolean) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>) => number;
    updateTask: (id: number, updates: Partial<Task>) => void;
    advanceTaskStage: (taskId: number, newStage: Stage, author: 'ceo' | 'team', note?: string) => void;
    generateSprintTasks: (clientId: number) => void;
    addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>) => number;
    updatePost: (id: number, updates: Partial<Post>) => void;
    advancePostStage: (postId: number, newStage: PostStage, author: 'ceo' | 'team', note?: string) => void;
    generateMonthlyPosts: (clientId: number, rows: any[]) => void;
    addProtocol: (protocol: Omit<Protocol, 'id' | 'createdAt' | 'updatedAt' | 'copyCount'>) => number;
    updateProtocol: (id: number, updates: Partial<Protocol>) => void;
    deleteProtocol: (id: number) => void;
    recordPromptUsage: (id: number) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    toasts: Toast[];
    generateMagicLink: (clientId: number) => void;
    addProjectPhase: (clientId: number, title: string) => void;
    updateProjectPhase: (clientId: number, phaseId: number, status: 'pending' | 'in_progress' | 'completed') => void;
    addClientUpdate: (clientId: number, message: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({
    children,
    data,
    setData
}: {
    children: ReactNode;
    data: AppData;
    setData: React.Dispatch<React.SetStateAction<AppData>>;
}) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateData = (newData: Partial<AppData>) => {
        setData(prev => {
            const updated = { ...prev, ...newData };
            return updated;
        });
    };

    const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newId = safeMaxId(data.clients) + 1;
        const now = new Date().toISOString();
        const newClient: Client = {
            ...client,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        setData(prev => {
            const nextOnboardings = [...prev.onboardings];
            if (newClient.status === 'Active Sprint') {
                const newObs = generateOnboardingProtocol(newId);
                nextOnboardings.push(newObs);
                sync.syncOnboardingToSupabase(newObs, true);
            }
            return {
                ...prev,
                clients: [...prev.clients, newClient],
                onboardings: nextOnboardings
            };
        });
        sync.syncClientToSupabase(newClient, true);
        return newId;
    };

    const updateClient = (id: number, updates: Partial<Client>) => {
        setData(prev => {
            const nextOnboardings = [...prev.onboardings];
            const nextTasks = [...prev.tasks];
            const nextClients = [...prev.clients];
            const clientIndex = nextClients.findIndex(c => c.id === id);

            if (clientIndex === -1) return prev;

            const oldClient = nextClients[clientIndex];
            const newClient = { ...oldClient, ...updates, updatedAt: new Date().toISOString() };
            const nowDate = new Date().toISOString().split('T')[0];

            let timelineEvent: TimelineEvent | null = null;

            if (updates.status && updates.status !== oldClient.status) {
                if (updates.status === 'Active Sprint') {
                    const hasProtocol = nextOnboardings.some(obs => obs.clientId === id);
                    if (!hasProtocol) {
                        nextOnboardings.push(generateOnboardingProtocol(id));
                    }
                    timelineEvent = { id: safeMaxId(newClient.timeline) + 1, date: nowDate, event: `Sprint activated on ${nowDate}`, type: 'system' };
                } else if (updates.status === 'Retainer') {
                    timelineEvent = { id: safeMaxId(newClient.timeline) + 1, date: nowDate, event: `Converted to Tier 3 retainer on ${nowDate}`, type: 'system' };
                    // Archive active tasks
                    nextTasks.forEach(t => { if (t.clientId === id && t.status === 'active') t.status = 'deployed'; });
                } else if (updates.status === 'Closed') {
                    timelineEvent = { id: safeMaxId(newClient.timeline) + 1, date: nowDate, event: `Account closed on ${nowDate}`, type: 'system' };
                    // Archive active tasks
                    nextTasks.forEach(t => { if (t.clientId === id && t.status === 'active') t.status = 'cancelled'; });
                } else if (updates.status === 'Discovery') {
                    timelineEvent = { id: safeMaxId(newClient.timeline) + 1, date: nowDate, event: `Discovery phase started on ${nowDate}`, type: 'system' };
                }
            }

            if (timelineEvent) {
                newClient.timeline = [timelineEvent, ...newClient.timeline];
            }

            nextClients[clientIndex] = newClient;
            sync.syncClientToSupabase(newClient);

            return {
                ...prev,
                onboardings: nextOnboardings,
                clients: nextClients,
                tasks: nextTasks
            };
        });
    };

    const deleteClient = (id: number) => {
        setData(prev => ({
            ...prev,
            clients: prev.clients.filter(c => c.id !== id),
            tasks: prev.tasks.filter(t => t.clientId !== id),
            posts: prev.posts.filter(p => p.clientId !== id),
            onboardings: prev.onboardings.filter(o => o.clientId !== id),
            protocols: prev.protocols.filter(p => !(p.category === 'client-knowledge-base' && p.linkedClientId === id))
        }));
        sync.deleteClientFromSupabase(id);
    };

    const addTimelineEvent = (clientId: number, event: string, type: 'system' | 'manual' = 'system') => {
        setData(prev => ({
            ...prev,
            clients: prev.clients.map(c => {
                if (c.id !== clientId) return c;
                const newEvent: TimelineEvent = {
                    id: safeMaxId(c.timeline) + 1,
                    date: new Date().toISOString().split('T')[0],
                    event,
                    type
                };
                const updatedClient = { ...c, timeline: [newEvent, ...c.timeline], updatedAt: new Date().toISOString() };
                sync.syncClientToSupabase(updatedClient);
                return updatedClient;
            })
        }));
    };

    const updateOnboardingStep = (protocolId: string, stepId: string, completed: boolean) => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const nextOnboardings = prev.onboardings.map(obs => {
                if (obs.id !== protocolId) return obs;
                const steps = obs.steps.map(s =>
                    s.id === stepId
                        ? { ...s, completed, completedAt: completed ? new Date().toISOString() : undefined }
                        : s
                );

                const completedSteps = steps.filter(s => s.completed).length;
                const progress = Math.round((completedSteps / steps.length) * 10);
                const status = progress === 10 ? 'completed' : 'on-track';
                const nowDate = new Date().toISOString().split('T')[0];

                if (completed) {
                    const step = steps.find(s => s.id === stepId);
                    const clientIndex = nextClients.findIndex(c => c.id === obs.clientId);
                    if (clientIndex !== -1 && step) {
                        const client = nextClients[clientIndex];
                        const events: TimelineEvent[] = [{
                            id: safeMaxId(client.timeline) + 1,
                            date: nowDate,
                            event: `Onboarding Step ${stepId} completed: ${step.label} on ${nowDate}`,
                            type: 'system'
                        }];

                        if (progress === 10) {
                            events.push({
                                id: safeMaxId(client.timeline) + 2,
                                date: nowDate,
                                event: `Onboarding complete — Sprint officially live: ${nowDate}`,
                                type: 'system'
                            });
                        }

                        nextClients[clientIndex] = {
                            ...client,
                            onboardingStatus: progress === 10 ? 'complete' : 'in-progress',
                            timeline: [...events, ...client.timeline]
                        };
                    }
                }

                const updatedObs = { ...obs, steps, progress, status, lastUpdated: new Date().toISOString() };
                sync.syncOnboardingToSupabase(updatedObs);
                return updatedObs;
            });
            return { ...prev, onboardings: nextOnboardings, clients: nextClients };
        });
    };

    const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>) => {
        const newId = safeMaxId(data.tasks) + 1;
        const now = new Date().toISOString();

        // Phase 6 Trigger Group 5: Auto-suggest SOP from Vault
        let sopRef = task.sopReference;
        if (!sopRef) {
            const matchingSOP = data.protocols.find(
                p => p.category === 'sop' && p.status === 'active' && p.linkedTaskTypes.includes(task.category)
            );
            if (matchingSOP) {
                sopRef = matchingSOP.title;
            }
        }

        const newTask: Task = {
            ...task,
            id: newId,
            sopReference: sopRef,
            activityLog: [{
                timestamp: now,
                type: 'created',
                from: null,
                to: null,
                text: `Task created and assigned to ${task.assignedNode}${sopRef ? ` — [ PROTOCOL DETECTED ] ${sopRef}` : ''}`,
                author: 'team'
            }],
            createdAt: now,
            updatedAt: now,
        };
        setData(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask]
        }));
        sync.syncTaskToSupabase(newTask, true);
        return newId;
    };

    const updateTask = (id: number, updates: Partial<Task>) => {
        setData(prev => {
            const nextTasks = prev.tasks.map(t => {
                if (t.id !== id) return t;
                const updatedTask = { ...t, ...updates, updatedAt: new Date().toISOString() };
                sync.syncTaskToSupabase(updatedTask);
                return updatedTask;
            });
            return { ...prev, tasks: nextTasks };
        });
    };

    const advanceTaskStage = (taskId: number, newStage: Stage, author: 'ceo' | 'team', note?: string) => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const nextTasks = prev.tasks.map(t => {
                if (t.id !== taskId) return t;
                const now = new Date().toISOString();
                const logEntry: ActivityEntry = {
                    timestamp: now,
                    type: note ? 'note' : 'stage_advance',
                    from: t.currentStage,
                    to: newStage,
                    text: note || `Advanced from ${t.currentStage} to ${newStage}`,
                    author
                };

                if (newStage === 'DEPLOYED' && t.currentStage !== 'DEPLOYED') {
                    const clientIndex = nextClients.findIndex(c => c.id === t.clientId);
                    if (clientIndex !== -1) {
                        const client = nextClients[clientIndex];
                        const timelineEvent: TimelineEvent = {
                            id: safeMaxId(client.timeline) + 1,
                            date: now.split('T')[0],
                            event: `Task '${t.name}' deployed on ${now.split('T')[0]}`,
                            type: 'system'
                        };
                        nextClients[clientIndex] = {
                            ...client,
                            timeline: [timelineEvent, ...client.timeline]
                        };
                    }
                }

                const updatedTask = {
                    ...t,
                    currentStage: newStage,
                    activityLog: [...t.activityLog, logEntry],
                    updatedAt: now,
                    status: newStage === 'DEPLOYED' ? 'deployed' as const : t.status
                };
                sync.syncTaskToSupabase(updatedTask);
                return updatedTask;
            });

            return {
                ...prev,
                tasks: nextTasks,
                clients: nextClients
            };
        });
    };

    const generateSprintTasks = (clientId: number) => {
        const client = data.clients.find(c => c.id === clientId);
        if (!client) return;

        const now = new Date();
        const createDate = (daysOffset: number) => {
            const d = new Date(client.startDate || now);
            d.setDate(d.getDate() + daysOffset);
            return d.toISOString().split('T')[0];
        };

        const standardTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>[] = [
            { clientId, name: 'Brand & Positioning Audit', category: 'Strategy', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Art Director', priority: 'high', status: 'active', deadline: createDate(3), estimatedHours: null, brief: "Audit current brand: logo, colors, voice, content pillars. Document what exists vs. what's needed.", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null },
            { clientId, name: 'Competitor Analysis', category: 'Strategy', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Art Director', priority: 'normal', status: 'active', deadline: createDate(4), estimatedHours: null, brief: "Identify 3 direct competitors. Analyze: content strategy, offer structure, positioning. Surface the gap.", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null },
            { clientId, name: 'Website Critique', category: 'Website', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Operations Builder', priority: 'normal', status: 'active', deadline: createDate(5), estimatedHours: null, brief: "Full UX audit. Identify: friction kill points, H1 clarity, CTA quality, mobile experience, load speed.", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null },
            { clientId, name: 'Shadow Avatar Refinement', category: 'Strategy', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Art Director', priority: 'high', status: 'active', deadline: createDate(6), estimatedHours: null, brief: "Based on kickoff call notes, refine and finalize the Shadow Avatar and Bleeding Neck. Update client profile.", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null },
            { clientId, name: 'Content Pillars & First Month Plan', category: 'Content Production', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Art Director', priority: 'critical', status: 'active', deadline: createDate(10), estimatedHours: null, brief: "Define 4–5 content pillars. Map first month: 16 posts minimum. Specify format per post (Reel/Static/Carousel).", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null },
            { clientId, name: 'Brand Visual Direction', category: 'Brand Design', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Art Director', priority: 'normal', status: 'active', deadline: createDate(12), estimatedHours: null, brief: "Define visual direction for client's digital content. Includes: color palette, font choices, mood board.", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null },
            { clientId, name: 'Phase 1 Delivery + CEO Review', category: 'Client Communication', phase: 'phase1', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'CEO', priority: 'critical', status: 'active', deadline: createDate(14), estimatedHours: null, brief: "Review all Phase 1 deliverables. Present strategy to client. Lock scope for Phase 2.", assetLinks: [], sopReference: null, notes: '', deliveredOnTime: null, linkedPostId: null }
        ];

        setData(prev => {
            let nextId = safeMaxId(prev.tasks) + 1;
            const newTasks = standardTasks.map(task => {
                const id = nextId++;
                const nowIso = new Date().toISOString();
                return {
                    ...task,
                    id,
                    activityLog: [{
                        timestamp: nowIso,
                        type: 'created' as const,
                        from: null,
                        to: null,
                        text: `Auto-generated Sprint Task assigned to ${task.assignedNode}`,
                        author: 'ceo' as any
                    }],
                    createdAt: nowIso,
                    updatedAt: nowIso
                };
            });
            sync.syncTasksToSupabase(newTasks);
            return {
                ...prev,
                tasks: [...prev.tasks, ...newTasks]
            };
        });
    };

    const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>) => {
        const newId = safeMaxId(data.posts) + 1;
        const now = new Date().toISOString();
        const newPost: Post = {
            ...post,
            id: newId,
            activityLog: [{
                timestamp: now,
                type: 'created',
                from: null,
                to: null,
                text: `Post planned and assigned to ${post.assignedTo}`,
                author: 'team'
            }],
            createdAt: now,
            updatedAt: now,
        };
        setData(prev => ({
            ...prev,
            posts: [...prev.posts, newPost]
        }));
        sync.syncPostToSupabase(newPost, true);
        return newId;
    };

    const updatePost = (id: number, updates: Partial<Post>) => {
        setData(prev => {
            let nextProtocols = [...prev.protocols];
            let nextClients = [...prev.clients];

            const nextPosts = prev.posts.map(p => {
                if (p.id !== id) return p;
                const updatedPost = { ...p, ...updates, updatedAt: new Date().toISOString() };

                if (updates.performance && !p.performance) {
                    const sr = updates.performance.saves / updates.performance.reach;
                    const shr = updates.performance.shares / updates.performance.reach;
                    if (sr > 0.05 || shr > 0.03) {
                        const nowIso = new Date().toISOString();
                        const clientIndex = nextClients.findIndex(c => c.id === p.clientId);

                        nextProtocols.push({
                            id: safeMaxId(nextProtocols) + 1,
                            title: `Top Performer: ${updatedPost.hook}`,
                            category: 'client-knowledge-base',
                            pillar: updatedPost.contentPillar as any,
                            tags: ['Auto-Generated', 'High-Performance', updatedPost.postType],
                            status: 'active',
                            content: `### High-Performance Post Recorded\n\n**Format:** ${updatedPost.postType}\n**Hook:** ${updatedPost.hook}\n**Performance:**\n- Save Rate: ${(sr * 100).toFixed(1)}%\n- Share Rate: ${(shr * 100).toFixed(1)}%\n\nThis post outperformed baseline metrics. Analyze the trigger and format used here to replicate success.`,
                            promptTool: null,
                            promptVariables: [],
                            usageNotes: null,
                            exampleOutput: null,
                            linkedTaskTypes: [],
                            linkedClientId: p.clientId,
                            relatedProtocolIds: [],
                            externalReferences: [],
                            copyCount: 0,
                            createdAt: nowIso,
                            updatedAt: nowIso,
                        });

                        if (clientIndex !== -1) {
                            nextClients[clientIndex] = {
                                ...nextClients[clientIndex],
                                timeline: [{
                                    id: safeMaxId(nextClients[clientIndex].timeline) + 1,
                                    date: nowIso.split('T')[0],
                                    event: `Top performer: ${updatedPost.hook} — ${(sr * 100).toFixed(1)}% save rate`,
                                    type: 'system'
                                }, ...nextClients[clientIndex].timeline]
                            };
                        }
                    }
                }
                sync.syncPostToSupabase(updatedPost);
                return updatedPost;
            });

            return {
                ...prev,
                posts: nextPosts,
                protocols: nextProtocols,
                clients: nextClients
            };
        });
    };

    const advancePostStage = (postId: number, newStage: PostStage, author: 'ceo' | 'team', note?: string) => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const nextPosts = prev.posts.map(p => {
                if (p.id !== postId) return p;
                const now = new Date().toISOString();
                const logEntry: ActivityEntry = {
                    timestamp: now,
                    type: note ? 'note' : 'stage_advance',
                    from: p.status,
                    to: newStage,
                    text: note || `Advanced from ${p.status} to ${newStage}`,
                    author
                };

                if (newStage === 'PUBLISHED' && p.status !== 'PUBLISHED') {
                    const clientIndex = nextClients.findIndex(c => c.id === p.clientId);
                    if (clientIndex !== -1) {
                        const client = nextClients[clientIndex];
                        const timelineEvent: TimelineEvent = {
                            id: safeMaxId(client.timeline) + 1,
                            date: now.split('T')[0],
                            event: `Post '${p.hook}' published on ${p.platforms.join(', ')} on ${now.split('T')[0]}`,
                            type: 'system'
                        };
                        nextClients[clientIndex] = {
                            ...client,
                            timeline: [timelineEvent, ...client.timeline]
                        };
                    }
                }

                const updatedPost = {
                    ...p,
                    status: newStage,
                    activityLog: [...p.activityLog, logEntry],
                    updatedAt: now,
                    publishedDate: newStage === 'PUBLISHED' ? now.split('T')[0] : p.publishedDate
                };
                sync.syncPostToSupabase(updatedPost);
                return updatedPost;
            });

            return {
                ...prev,
                posts: nextPosts,
                clients: nextClients
            };
        });
    };

    const generateMonthlyPosts = (clientId: number, rows: any[]) => {
        const client = data.clients.find(c => c.id === clientId);
        if (!client) return;

        setData(prev => {
            let nextId = safeMaxId(prev.posts) + 1;
            const newPosts: Post[] = [];
            const nowIso = new Date().toISOString();

            rows.forEach((row) => {
                newPosts.push({
                    id: nextId++,
                    clientId,
                    platforms: [row.platform],
                    postType: row.postType,
                    contentPillar: row.pillar || 'Other',
                    templateType: 'Template A',
                    hook: row.hookIdea,
                    triggerUsed: null,
                    captionBody: '',
                    cta: 'Link in bio',
                    ctaType: 'Link in bio',
                    hashtags: '',
                    visualBrief: '',
                    scheduledDate: row.date,
                    scheduledTime: '10:00',
                    publishedDate: null,
                    status: 'PLANNED',
                    priority: 'normal',
                    assignedTo: row.assignedTo,
                    linkedTaskId: null,
                    assetLinks: [],
                    referencePost: null,
                    performance: null,
                    activityLog: [{
                        timestamp: nowIso,
                        type: 'created',
                        from: null,
                        to: null,
                        text: `Auto-generated from Monthly Planner`,
                        author: 'ceo'
                    }],
                    createdAt: nowIso,
                    updatedAt: nowIso
                });
            });

            sync.syncPostsToSupabase(newPosts);
            return {
                ...prev,
                posts: [...prev.posts, ...newPosts]
            };
        });
    };

    const addProtocol = (protocol: Omit<Protocol, 'id' | 'createdAt' | 'updatedAt' | 'copyCount'>) => {
        const newId = safeMaxId(data.protocols) + 1;
        const now = new Date().toISOString();
        const newProtocol: Protocol = {
            ...protocol,
            id: newId,
            createdAt: now,
            updatedAt: now,
            copyCount: 0
        };
        setData(prev => ({
            ...prev,
            protocols: [...prev.protocols, newProtocol]
        }));
        sync.syncProtocolToSupabase(newProtocol, true);
        return newId;
    };

    const updateProtocol = (id: number, updates: Partial<Protocol>) => {
        setData(prev => {
            const nextProtocols = prev.protocols.map(p => {
                if (p.id !== id) return p;
                const updatedProtocol = { ...p, ...updates, updatedAt: new Date().toISOString() };
                sync.syncProtocolToSupabase(updatedProtocol);
                return updatedProtocol;
            });
            return { ...prev, protocols: nextProtocols };
        });
    };

    const deleteProtocol = (id: number) => {
        setData(prev => ({
            ...prev,
            protocols: prev.protocols.filter(p => p.id !== id)
        }));
        sync.deleteProtocolFromSupabase(id);
    };

    const recordPromptUsage = (id: number) => {
        setData(prev => {
            const nextProtocols = prev.protocols.map(p => {
                if (p.id !== id) return p;
                const updatedProtocol = { ...p, copyCount: p.copyCount + 1 };
                sync.syncProtocolToSupabase(updatedProtocol);
                return updatedProtocol;
            });
            return { ...prev, protocols: nextProtocols };
        });
    };

    const generateMagicLink = (clientId: number) => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const clientIndex = nextClients.findIndex(c => c.id === clientId);
            if (clientIndex === -1) return prev;

            // simple UUID generation for the browser
            const token = crypto.randomUUID();

            const updatedClient = {
                ...nextClients[clientIndex],
                magicLinkToken: token,
                updatedAt: new Date().toISOString()
            };
            nextClients[clientIndex] = updatedClient;
            sync.syncClientToSupabase(updatedClient);
            return { ...prev, clients: nextClients };
        });
    };

    const addProjectPhase = (clientId: number, title: string) => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const clientIndex = nextClients.findIndex(c => c.id === clientId);
            if (clientIndex === -1) return prev;

            const client = nextClients[clientIndex];
            const phases = client.projectPhases || [];
            const newPhase = {
                id: Date.now(), // Local dev ID
                clientId,
                title,
                status: 'pending' as const,
                orderIndex: phases.length,
                createdAt: new Date().toISOString()
            };

            const updatedClient = {
                ...client,
                projectPhases: [...phases, newPhase]
            };
            nextClients[clientIndex] = updatedClient;
            sync.syncClientToSupabase(updatedClient);
            return { ...prev, clients: nextClients };
        });
    };

    const updateProjectPhase = (clientId: number, phaseId: number, status: 'pending' | 'in_progress' | 'completed') => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const clientIndex = nextClients.findIndex(c => c.id === clientId);
            if (clientIndex === -1) return prev;

            const client = nextClients[clientIndex];
            if (!client.projectPhases) return prev;

            const updatedPhases = client.projectPhases.map(p =>
                p.id === phaseId ? { ...p, status, updatedAt: new Date().toISOString() } : p
            );

            const updatedClient = {
                ...client,
                projectPhases: updatedPhases
            };
            nextClients[clientIndex] = updatedClient;
            sync.syncClientToSupabase(updatedClient);
            return { ...prev, clients: nextClients };
        });
    };

    const addClientUpdate = (clientId: number, message: string) => {
        setData(prev => {
            const nextClients = [...prev.clients];
            const clientIndex = nextClients.findIndex(c => c.id === clientId);
            if (clientIndex === -1) return prev;

            const client = nextClients[clientIndex];
            const updates = client.clientUpdates || [];
            const newUpdate = {
                id: Date.now(),
                clientId,
                message,
                createdAt: new Date().toISOString()
            };

            const updatedClient = {
                ...client,
                clientUpdates: [newUpdate, ...updates] // newer first locally
            };
            nextClients[clientIndex] = updatedClient;
            sync.syncClientToSupabase(updatedClient);
            return { ...prev, clients: nextClients };
        });
    };

    // Memoize context value — prevents creating a new object reference on every render
    const contextValue = useMemo(() => ({
        data, setData, updateData, addClient, updateClient, deleteClient, addTimelineEvent,
        updateOnboardingStep, addTask, updateTask, advanceTaskStage, generateSprintTasks,
        addPost, updatePost, advancePostStage, generateMonthlyPosts, addProtocol, updateProtocol,
        deleteProtocol, recordPromptUsage, showToast, toasts,
        generateMagicLink, addProjectPhase, updateProjectPhase, addClientUpdate
    }), [data, setData, showToast, toasts]);

    return (
        <AppDataContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} onClose={hideToast} />
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
}
