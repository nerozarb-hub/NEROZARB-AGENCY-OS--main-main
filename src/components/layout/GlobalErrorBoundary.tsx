import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md flex flex-col items-center bg-card p-8 border border-red-500/20 rounded-sm shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                        <AlertTriangle className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" size={48} />

                        <h1 className="font-heading text-2xl tracking-tight text-text-primary mb-2 font-black uppercase text-center">
                            SYSTEM INTEGRITY COMPROMISED
                        </h1>

                        <p className="text-text-muted text-center text-xs font-mono mb-8 uppercase tracking-widest leading-relaxed">
                            A critical rendering fault occurred. Module failed to load or experienced fatal execution error.
                        </p>

                        <div className="w-full bg-background/50 p-4 rounded-sm border border-border-dark mb-8 overflow-x-auto">
                            <p className="font-mono text-[10px] text-red-400 whitespace-pre-wrap">
                                {this.state.error?.message || 'Unknown compilation or runtime exception.'}
                            </p>
                        </div>

                        <button
                            onClick={this.handleReload}
                            className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500/50 font-mono text-xs py-4 tracking-[0.2em] transition-all uppercase rounded-sm"
                        >
                            <RefreshCw size={14} />
                            REBOOT MODULE
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
