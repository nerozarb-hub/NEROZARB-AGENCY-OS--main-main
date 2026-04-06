import { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, message }: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Action" width={400}>
            <div className="space-y-6">
                <p className="text-text-secondary text-sm">{message}</p>
                <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
                    <Button variant="ghost" onClick={onClose} size="sm">
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => { onConfirm(); onClose(); }} size="sm">
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
